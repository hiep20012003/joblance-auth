import { Application } from 'express';
import { healthRoutes } from '@auth/routes/health.route';
import { authRoutes } from '@auth/routes/auth.route';

const BASE_PATH = '/api/v1/auth';

export const appRoutes = (app: Application) => {
  app.use('', healthRoutes.routes());
  app.use(BASE_PATH, authRoutes.routes());
};
