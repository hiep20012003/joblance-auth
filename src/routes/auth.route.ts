import { AuthController } from '@auth/controllers/auth.controller';
import { AuthService } from '@auth/services/auth.service';
import { handleAsyncError } from '@hiep20012003/joblance-shared';
import express, { Router } from 'express';
import { EmailService } from '@auth/services/email.service';
import { TokenService } from '@auth/services/token.service';
import { validate } from '@auth/middlewares/validate.middleware';
import { resendEmailVerificationSchema, signInSchema, signUpSchema, verifyEmailSchema } from '@auth/dtos/auth/auth-request.schema';
import { UserRepository } from '@auth/repositories/user.repository';
import { EmailTokenRepository } from '@auth/repositories/email-token.repository';
import { RefreshTokenRepository } from '@auth/repositories/refresh-token.repository';

class AuthRoutes {
  private router: Router;
  private authController: AuthController;
  constructor() {
    this.router = express.Router();

    const userRepository = new UserRepository();
    const emailTokenRepository = new EmailTokenRepository();
    const refreshTokenRepository = new RefreshTokenRepository();

    const emailSerivice = new EmailService();
    const tokenService = new TokenService(emailTokenRepository, refreshTokenRepository);
    const authService = new AuthService(emailSerivice, tokenService, userRepository, emailTokenRepository, refreshTokenRepository);

    this.authController = new AuthController(authService);
  }

  public routes(): Router {
    this.router.post('/signup', validate(signUpSchema), handleAsyncError((this.authController.signUp)));
    this.router.post('/signin', validate(signInSchema), handleAsyncError((this.authController.signIn)));
    this.router.post('/refresh-token', handleAsyncError(this.authController.refreshToken));
    this.router.post('/logout', handleAsyncError(this.authController.logout));
    this.router.post('/resend-verification', validate(resendEmailVerificationSchema), handleAsyncError((this.authController.resendEmailVerification)));
    this.router.post('/verify-email', validate(verifyEmailSchema), handleAsyncError((this.authController.verifyEmail)));
    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
