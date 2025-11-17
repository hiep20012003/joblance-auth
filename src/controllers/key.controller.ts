import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { keyService } from '@auth/services/key.service';

export class KeyController {
  public getJwks = async (_req: Request, res: Response): Promise<void> => {
    const jwks = await keyService.getJWKS();
    res.status(StatusCodes.OK).json(jwks);
    //   new SuccessResponse({
    //     message: 'Public keys retrieved successfully',
    //     statusCode: StatusCodes.OK,
    //     reasonPhrase: ReasonPhrases.OK,
    //     metadata: { jwks }
    //   }).send(res);
  };
}

export const keyController: KeyController = new KeyController();
