import http from 'http';

import { AppLogger } from '@auth/utils/logger';
import { Application, json, NextFunction, urlencoded, Request, Response } from 'express';
import { config } from '@auth/config';
import {
  ApplicationError,
  DependencyError,
  ErrorResponse,
  NotFoundError,
  ResponseOptions,
  ServerError
} from '@hiep20012003/joblance-shared';
import hpp from 'hpp';
import cors from 'cors';
import compression from 'compression';
import { appRoutes } from '@auth/routes';
import { Channel } from 'amqplib';
import { createConnection } from '@auth/queues/connection';
import helmet from 'helmet';

const SERVER_PORT = config.PORT || 4003;
export let authChannel: Channel;

export class AuthServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public async start(): Promise<void> {
    const operation = 'auth-server-start';

    this.securityMiddleware(this.app);
    this.standarMiddleware(this.app);
    this.routesMiddleware(this.app);
    await this.startQueues();
    this.errorHandler(this.app);
    this.startServer(this.app, operation);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.API_GATEWAY_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standarMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ extended: true, limit: '200mb' }));
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  private async startQueues(): Promise<void> {
    authChannel = (await createConnection()) as Channel;
  }

  private errorHandler(app: Application): void {
    app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
      const operation = 'auth-server-handle-error';

      AppLogger.error(
        `API ${req.originalUrl} unexpected error`,
        {
          req,
          operation,
          error: err instanceof ApplicationError ? err.serialize() : {
            name: (err as Error).name,
            message: (err as Error).message,
            stack: (err as Error).stack,
          }
        }
      );

      if (err instanceof ApplicationError) {
        new ErrorResponse({
          ...err.serializeForClient() as ResponseOptions
        }).send(res);
      } else {
        const serverError = new ServerError({
          clientMessage: 'Internal server error',
          cause: err,
          operation
        });
        new ErrorResponse({
          ...serverError.serializeForClient() as ResponseOptions
        }).send(res);
      }
    });

    app.use('/*splat', (req: Request, res: Response, _next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const operation = 'auth-server-route-not-found';

      const err = new NotFoundError({
        clientMessage: `Endpoint not found: ${fullUrl}`,
        operation
      });

      AppLogger.error(
        `API ${req.originalUrl} route not found`,
        {
          req,
          operation,
          error: err instanceof ApplicationError ? err.serialize() : {
            name: (err as Error).name,
            message: (err as Error).message,
            stack: (err as Error).stack,
          }
        }
      );
      new ErrorResponse({
        ...err.serializeForClient() as ResponseOptions
      }).send(res);
    });
  }

  private startServer(app: Application, operation: string): void {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHttpServer(httpServer, operation);
    } catch (error) {
      throw new ServerError({
        clientMessage: 'Failed to start Auth Service server',
        cause: error,
        operation: 'auth-server-error'
      });
    }
  }

  private startHttpServer(httpServer: http.Server, operation: string): void {
    try {
      AppLogger.info(`Auth server started with process id ${process.pid}`, { operation });

      httpServer.listen(SERVER_PORT, () => {
        AppLogger.info(`Auth server is running on port ${SERVER_PORT}`, { operation });
      });
    } catch (error) {
      throw new DependencyError({
        clientMessage: 'Failed to bind HTTP port',
        cause: error,
        operation: 'auth-server-bind-error'
      });
    }
  }
}
