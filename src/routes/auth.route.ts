import {authController} from '@auth/controllers/auth.controller';
import {handleAsyncError, validate} from '@hiep20012003/joblance-shared';
import express, {Router} from 'express';
import {signUpSchema} from '@auth/schemas/auth/sign-up.schema';
import {resendEmailVerificationSchema} from '@auth/schemas/auth/resend-email-verification.schema';
import {signInSchema} from '@auth/schemas/auth/sign-in.schema';
import {forgotPasswordSchema} from '@auth/schemas/auth/forgot-password.schema';
import {resetPasswordSchema} from '@auth/schemas/auth/reset-password.schema';
import {changePasswordSchema} from '@auth/schemas/auth/change-password.schema';

class AuthRoutes {
  private readonly router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/users/:userId', handleAsyncError(authController.getAuthUserById));
    this.router.post('/users', validate(signUpSchema), handleAsyncError(authController.signUp));
    this.router.post('/login', validate(signInSchema), handleAsyncError(authController.signIn));
    this.router.post('/refresh', handleAsyncError(authController.refreshToken));
    this.router.post('/logout', handleAsyncError(authController.logout));
    this.router.post('/users/password/change', validate(changePasswordSchema), handleAsyncError(authController.changePassword));
    this.router.post('/tokens/password', validate(forgotPasswordSchema), handleAsyncError(authController.forgotPassword));
    this.router.post('/tokens/password/validate', handleAsyncError(authController.validateResetPasswordToken));
    this.router.post(
      '/users/password/reset',
      validate(resetPasswordSchema),
      handleAsyncError(authController.resetPassword)
    );
    this.router.post(
      '/tokens/email/resend',
      validate(resendEmailVerificationSchema),
      handleAsyncError(authController.resendEmailVerification)
    );
    this.router.post(
      '/users/email/verify',
      handleAsyncError(authController.verifyEmail)
    );

    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
