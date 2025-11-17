import { Application } from 'express';
import { createVerifyGatewayRequest } from '@hiep20012003/joblance-shared';
import { config } from '@auth/config';

import { healthRoutes } from './health.route';
import { authRoutes } from './auth.route';
import { adminRoutes } from './admin.route';
import { keyRoute } from './key.route';
import seedRoutes from './seed.route';

const BASE_PATH = '/api/v1';
const ADMIN_BASE_PATH = '/api/v1/admin';

export const appRoutes = (app: Application) => {
  app.use('', healthRoutes.routes());
  app.use('', keyRoute.routes());
  app.use(BASE_PATH, createVerifyGatewayRequest(config.GATEWAY_SECRET_KEY), authRoutes.routes());
  app.use(ADMIN_BASE_PATH, createVerifyGatewayRequest(config.GATEWAY_SECRET_KEY), adminRoutes.routes());
  app.use('/seed', seedRoutes);
};
