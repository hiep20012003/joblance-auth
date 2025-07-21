import { AuthController } from '@auth/controllers/auth.controller';
import { AuthService } from '@auth/services/auth.service';
import { handleAsyncError } from '@hiep20012003/joblance-shared';
import express, { Router } from 'express';
import { EmailService } from '@auth/services/email.service';
import { UserService } from '@auth/services/user.service';
import { TokenService } from '@auth/services/token.service';
import { validate } from '@auth/middlewares/validate.middleware';
import { signUpSchema } from '@auth/validators/auth.schemas';

class AuthRoutes {
  private router: Router;
  private authController: AuthController;
  constructor() {
    this.router = express.Router();

    const userService = new UserService();
    const tokenService = new TokenService();
    const emailSerivice = new EmailService(tokenService);
    const authService = new AuthService(userService, emailSerivice);

    this.authController = new AuthController(authService);
  }

  public routes(): Router {
    this.router.post('/signup', validate(signUpSchema), handleAsyncError((this.authController.create)));
    // this.router.post('/signin', this.authController.read);
    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
