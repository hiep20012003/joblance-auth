import {AuthResponseDTO} from '@auth/schemas/auth/auth-response.dto';
import {ForgotPasswordDTO} from '@auth/schemas/auth/forgot-password.schema';
import {ResendEmailVerificationDTO} from '@auth/schemas/auth/resend-email-verification.schema';
import {ResetPasswordDTO} from '@auth/schemas/auth/reset-password.schema';
import {SignInDTO} from '@auth/schemas/auth/sign-in.schema';
import {SignUpDTO} from '@auth/schemas/auth/sign-up.schema';
import {ChangePasswordDTO} from '@auth/schemas/auth/change-password.schema';
import {IAuthDocument, SuccessResponse} from '@hiep20012003/joblance-shared';
import {Request, Response} from 'express';
import {ReasonPhrases, StatusCodes} from 'http-status-codes';
import {authService} from '@auth/services/auth.service';

export class AuthController {
  public getCurrentAuthUser = async (req: Request, res: Response): Promise<void> => {
    const user = await authService.getAuthUserById(req.currentUser?.sub as string);
    new SuccessResponse({
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      data: user
    }).send(res);
  };

  public getAuthUserById = async (req: Request, res: Response): Promise<void> => {
    const user = await authService.getAuthUserById(req.params.userId);
    new SuccessResponse({
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      data: user
    }).send(res);
  };

  public signUp = async (req: Request, res: Response): Promise<void> => {
    const payload: SignUpDTO = req.body as SignUpDTO;
    const user: IAuthDocument = await authService.signUp(payload);
    new SuccessResponse({
      statusCode: StatusCodes.CREATED,
      reasonPhrase: ReasonPhrases.CREATED,
      data: user
    }).send(res);
  };

  public signIn = async (req: Request, res: Response): Promise<void> => {
    const payload: SignInDTO = req.body as SignInDTO;
    const auth: AuthResponseDTO = await authService.signIn(`${req.ip}`, payload);
    new SuccessResponse({
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      data: auth
    }).send(res);
  };

  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    const {token} = req.body as { token: string };
    const result = await authService.refreshAccessToken(token);
    new SuccessResponse({
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      data: result
    }).send(res);
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    await authService.logout(req.currentUser!.sub);
    new SuccessResponse({
      message: 'Logout successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK
    }).send(res);
  };

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const payload: ForgotPasswordDTO = req.body as ForgotPasswordDTO;
    await authService.forgotPassword(payload);
    new SuccessResponse({
      message: 'Send email reset password successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK
    }).send(res);
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as ResetPasswordDTO;
    await authService.resetPassword(payload);
    new SuccessResponse({
      message: 'Reset password successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK
    }).send(res);
  };

  public validateResetPasswordToken = async (req: Request, res: Response): Promise<void> => {
    const {token} = req.body as { token: string };
    await authService.validateResetPasswordToken(token);
    new SuccessResponse({
      message: 'Reset password token valid',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
    }).send(res);
  };

  public changePassword = async (req: Request, res: Response): Promise<void> => {
    const payload: ChangePasswordDTO = req.body as ChangePasswordDTO;
    await authService.changePassword(payload);
    new SuccessResponse({
      message: 'Email verified successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK
    }).send(res);
  };

  public resendEmailVerification = async (req: Request, res: Response): Promise<void> => {
    const payload: ResendEmailVerificationDTO = req.body as ResendEmailVerificationDTO;
    await authService.resendEmailVerification(payload);
    new SuccessResponse({
      message: 'Resend verification email successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK
    }).send(res);
  };

  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const {token} = req.body as { token: string };
    await authService.verifyEmail(token);
    new SuccessResponse({
      message: 'Email verified successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK
    }).send(res);
  };
}

export const authController: AuthController = new AuthController();
