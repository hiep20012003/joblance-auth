import { HealthController } from '@auth/controllers/health.controller';
import express, { Router } from 'express';

class HealthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/gateway-health', new HealthController().health);
    return this.router;
  }
}

export const healthRoutes: HealthRoutes = new HealthRoutes();
