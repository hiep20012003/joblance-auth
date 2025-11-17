import {User} from '@auth/database/models/user.model';
import {ErrorCode, NotFoundError} from '@hiep20012003/joblance-shared';
import {AppLogger} from '@auth/utils/logger';
import {userRepository} from '@auth/repositories/user.repository';

export class UserService {
  public async getAllUsers(): Promise<User[]> {
    const operation = 'user:get-all';
    AppLogger.info('Retrieving all users for admin.', {operation});
    return await userRepository.findAll();
  }

  public async getUserById(userId: string): Promise<User> {
    const operation = 'user:get-by-id';
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError({
        clientMessage: `User with ID '${userId}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: {userId}
      });
    }
    AppLogger.info(`User with ID '${userId}' retrieved for admin.`, {operation, metadata: {userId}});
    return user;
  }

  public async updateUserStatus(userId: string, status: string): Promise<User> {
    const operation = 'user:update-status';
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError({
        clientMessage: `User with ID '${userId}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: {userId}
      });
    }
    user.status = status;
    AppLogger.info(`User with ID '${userId}' status updated to '${status}'.`, {
      operation,
      metadata: {userId, status}
    });
    return await userRepository.save(user);
  }

  public async updateUserVerifiedStatus(userId: string, isVerified: boolean): Promise<User> {
    const operation = 'user:update-verified-status';
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError({
        clientMessage: `User with ID '${userId}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: {userId}
      });
    }
    user.isVerified = isVerified;
    AppLogger.info(`User with ID '${userId}' verification status updated to '${isVerified}'.`, {
      operation,
      metadata: {userId, isVerified}
    });
    return await userRepository.save(user);
  }

  public async deleteUser(userId: string): Promise<void> {
    const operation = 'user:delete';
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError({
        clientMessage: `User with ID '${userId}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: {userId}
      });
    }
    await userRepository.delete(userId);
    AppLogger.info(`User with ID '${userId}' deleted by admin.`, {operation, metadata: {userId}});
  }

  public async updateUserProfilePicture(id: string, profilePicture: string): Promise<void> {
    const operation = 'user:delete';
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError({
        clientMessage: `User with ID '${id}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: {id}
      });
    }
    await userRepository.updateProfilePicture(id, profilePicture);
    AppLogger.info(`User with ID '${id}' updated profile picture.`, {operation, metadata: {id}});
  }
}

export const userService: UserService = new UserService();
