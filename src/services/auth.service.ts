import { ConflictError, ErrorCode, IUserResponse, SignUpRequest } from '@hiep20012003/joblance-shared';
import { User } from '@auth/db/models/user.model';
import { AppLogger } from '@auth/utils/logger';

import { UserService } from './user.service';
import { EmailService } from './email.service';

export class AuthService {
  private readonly userService: UserService;
  private readonly emailService: EmailService;
  constructor(userService: UserService, emailService: EmailService) {
    this.userService = userService;
    this.emailService = emailService;
  }

  public async createUser(payload: SignUpRequest): Promise<IUserResponse> {
    const exists = await this.userService.findByEmail(payload.email);
    if (exists) {
      throw new ConflictError({
        clientMessage: 'Email already exists',
        logMessage: `Attempted to create duplicate email: ${payload.email}`,
        operation: 'auth-signup',
        errorCode: ErrorCode.USER_ALREADY_EXISTS
      });
    }

    const user: User = await User.create({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });

    await this.emailService.sendEmailVeritication(user.id, user.username, user.email);

    AppLogger.info(`User created successfully with id: ${user.id}`, {
      operation: 'auth-signup',
      metadata: {
        userId: user.id,
        email: user.email,
      }
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      is_verified: user.is_verified
    } as IUserResponse;
  }

  // public async signInUser(_req: Request, res: Response): Promise<void> {
  //   res.status(StatusCodes.OK).send('User signed in successfully');
  // }

  // public async updateUser(_req: Request, res: Response): Promise<void> {
  //   res.status(StatusCodes.OK).send('User updated successfully');
  // }

  // public async deleteUser(_req: Request, res: Response): Promise<void> {
  //   res.status(StatusCodes.NO_CONTENT).send();
  // }

  // public async fetchUserDetails(_req: Request, res: Response): Promise<void> {
  //   res.status(StatusCodes.OK).send('User details fetched successfully');
  // }

  // public async fetchAllUsers(_req: Request, res: Response): Promise<void> {
  //   res.status(StatusCodes.OK).send('All users fetched successfully');
  // }
}
