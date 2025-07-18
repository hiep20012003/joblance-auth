import { Database } from '@auth/db/database';
import express, { Express } from 'express';
import { AuthServer } from '@auth/server';
import { AppLogger } from '@auth/utils/logger';

class Application {
  private app: Express;
  private server: AuthServer;
  private database: Database;

  constructor() {
    this.app = express();
    this.server = new AuthServer(this.app);
    this.database = new Database();
  }

  public async initialize(): Promise<void> {
    const operation = 'auth-service-init';

    try {
      await this.database.connect();
      await this.server.start();
      AppLogger.info('Auth Service initialized', { operation });
    } catch (error) {
      AppLogger.error('', { operation, error });
      process.exit(1);
    }
  }
}

async function bootstrap(): Promise<void> {
  const application = new Application();
  await application.initialize();
}

// ---- Global error handlers ---- //
process.on('uncaughtException', (error) => {
  AppLogger.error('', { operation: 'auth-service-uncaught-exception', error });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  AppLogger.error('', { operation: 'auth-service-unhandled-rejection', error: reason });
  process.exit(1);
});

// ---- App Entry Point ---- //
bootstrap().catch((error) => {
  AppLogger.error('', { operation: 'auth-service-bootstrap-failed', error });
  process.exit(1);
});
