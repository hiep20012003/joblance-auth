import { AuthService } from '@auth/services/auth.service';
import { AppLogger } from '@auth/utils/logger';
import { IUserResponse, SignUpRequest, SuccessResponse } from '@hiep20012003/joblance-shared';
import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export class AuthController {
  private readonly authService: AuthService;
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    AppLogger.info(`SignUpRequest Params:`, {
      operation: 'sign-up',
      context: { ...req.body }
    });
    const payload: SignUpRequest = req.body as SignUpRequest;
    const user: IUserResponse = await this.authService.createUser(payload);
    new SuccessResponse({
      message: 'User created successfully',
      statusCode: StatusCodes.CREATED,
      reasonPhrase: ReasonPhrases.CREATED,
      metadata: user
    }).send(res);
  };

  // public read = async (_req: Request, res: Response): Promise<void> => {
  //   res.status(StatusCodes.OK).send('User signed in successfully');
  // };

  // public refreshTokens = async (_req: Request, res: Response): Promise<void> => {
  //   res.status(StatusCodes.OK).send('Tokens refreshed successfully');
  // };
}
