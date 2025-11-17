import {keyController} from '@auth/controllers/key.controller';
import express, {Router} from 'express';
import {handleAsyncError} from '@hiep20012003/joblance-shared';
import rateLimit from 'express-rate-limit';

class KeyRoute {
  private readonly router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    const jwksLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 30,
      message: 'Too many requests to JWKS endpoint'
    });
    this.router.get('/.well-known/jwks.json', jwksLimiter, handleAsyncError(keyController.getJwks)); // Added JWKS endpoint
    return this.router;
  }
}

export const keyRoute: KeyRoute = new KeyRoute();
