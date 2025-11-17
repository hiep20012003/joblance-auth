import {Request, Response} from 'express';
import {userService} from '@auth/services/user.service';
import {SuccessResponse} from '@hiep20012003/joblance-shared';
import {ReasonPhrases, StatusCodes} from 'http-status-codes';
import {User} from '@auth/database/models/user.model';
import {pickExclude} from '@auth/utils/pick.util';

export class UserController {
  public getAllUsers = async (_req: Request, res: Response): Promise<void> => {
    const users: User[] = await userService.getAllUsers();
    new SuccessResponse({
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      data: users.map((user) => pickExclude(user, ['password']))
    }).send(res);
  };

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    const {userId} = req.params;
    const user: User = await userService.getUserById(userId);
    new SuccessResponse({
      message: 'User retrieved successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      data: pickExclude(user, ['password'])
    }).send(res);
  };

  public updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    const {userId} = req.params;
    const {status} = req.body as { status: string };
    const updatedUser: User = await userService.updateUserStatus(userId, status);
    new SuccessResponse({
      message: 'User status updated successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      data: updatedUser
    }).send(res);
  };

  public updateUserVerifiedStatus = async (req: Request, res: Response): Promise<void> => {
    const {userId} = req.params;
    const {isVerified} = req.body as { isVerified: boolean };
    const updatedUser: User = await userService.updateUserVerifiedStatus(userId, isVerified);
    new SuccessResponse({
      message: 'User verification status updated successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      data: updatedUser
    }).send(res);
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    const {userId} = req.params;
    await userService.deleteUser(userId);
    new SuccessResponse({
      message: 'User deleted successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK
    }).send(res);
  };
}

export const userController: UserController = new UserController();
