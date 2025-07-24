import { ResendEmailVerificationDTO, SignUpDTO, VerifyEmailDTO } from '@auth/dtos/auth/auth-request.schema';
import { AuthResponseDTO, UserResponseDTO as UserDTO } from '@auth/dtos/auth/auth-response.dto';
import { AuthService } from '@auth/services/auth.service';
import { SuccessResponse } from '@hiep20012003/joblance-shared';
import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export class AuthController {
  private readonly authService: AuthService;
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public signUp = async (req: Request, res: Response): Promise<void> => {
    const payload: SignUpDTO = req.body as SignUpDTO;
    const user: UserDTO = await this.authService.signUp(payload);
    new SuccessResponse({
      message: 'User created successfully',
      statusCode: StatusCodes.CREATED,
      reasonPhrase: ReasonPhrases.CREATED,
      metadata: user
    }).send(res);
  };

  public signIn = async (req: Request, res: Response): Promise<void> => {
    const payload: SignUpDTO = req.body as SignUpDTO;
    const auth: AuthResponseDTO = await this.authService.signIn(payload);
    new SuccessResponse({
      message: 'Sign in successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      metadata: auth
    }).send(res);
  };

  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await this.authService.refreshAccessToken(refreshToken);
    new SuccessResponse({
      message: 'Token refreshed successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      metadata: result
    }).send(res);
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body as { refreshToken: string };
    await this.authService.logout(refreshToken);
    new SuccessResponse({
      message: 'Logged out successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
    }).send(res);
  };

  public resendEmailVerification = async (req: Request, res: Response): Promise<void> => {
    const payload: ResendEmailVerificationDTO = req.body as ResendEmailVerificationDTO;
    await this.authService.resendEmailVerification(payload);
    new SuccessResponse({
      message: 'Verification email sent successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
    }).send(res);
  };

  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const payload: VerifyEmailDTO = req.body as VerifyEmailDTO;
    await this.authService.verifyEmail(payload);
    new SuccessResponse({
      message: 'Email verified successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
    }).send(res);
  };
}
