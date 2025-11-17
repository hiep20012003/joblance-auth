import {
  AuthenticationFailedError,
  BadRequestError,
  ConflictError,
  CooldownError,
  EmailNotVerifiedError,
  ErrorCode,
  EXCHANGES,
  IAuthDocument,
  IAuthMessageQueue,
  IUserAgent,
  maskEmail,
  MessageQueueType,
  NotFoundError,
  ROUTING_KEYS
} from '@hiep20012003/joblance-shared';
import {AppLogger} from '@auth/utils/logger';
import {AuthResponseDTO, TokenDTO} from '@auth/schemas/auth/auth-response.dto';
import {config} from '@auth/config';
import bcrypt from 'bcrypt';
import {SignUpDTO} from '@auth/schemas/auth/sign-up.schema';
import {SignInDTO} from '@auth/schemas/auth/sign-in.schema';
import {ChangePasswordDTO} from '@auth/schemas/auth/change-password.schema';
import {ResendEmailVerificationDTO} from '@auth/schemas/auth/resend-email-verification.schema';
import {ForgotPasswordDTO} from '@auth/schemas/auth/forgot-password.schema';
import {ResetPasswordDTO} from '@auth/schemas/auth/reset-password.schema';
import {userRepository} from '@auth/repositories/user.repository';
import {roleRepository} from '@auth/repositories/role.repository';
import {emailTokenRepository} from '@auth/repositories/email-token.repository';
import {refreshTokenRepository} from '@auth/repositories/refresh-token.repository';
import {messageQueue, publishChannel} from '@auth/queues/connection';
import {cacheStore} from '@auth/cache/redis.connection';

import {tokenService} from './token.service';

export class AuthService {
  public async getAuthUserById(userId: string): Promise<IAuthDocument | null> {
    const user = await userRepository.findById(userId);

    if (!user) {
      return null;
    }

    const userDTO: IAuthDocument = {
      id: user.id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      status: user.status,
      roles: user.roles ? user.roles.map((role) => role.name) : [],
      profilePicture: user.profilePicture,
    };

    return userDTO;
  }

  public async signUp(payload: SignUpDTO): Promise<IAuthDocument> {
    if (payload.password !== payload.confirmPassword)
      throw new BadRequestError({
        clientMessage: 'Passwords do not match',
        operation: 'auth:signup',
        errorCode: ErrorCode.BAD_REQUEST,
        context: {email: payload.email}
      });

    const user =
      (await userRepository.findByEmail(payload.email)) || (await userRepository.findByUsername(payload.username));
    if (user) {
      throw new ConflictError({
        clientMessage: 'User already exists',
        operation: 'auth:signup',
        errorCode: ErrorCode.RESOURCE_CONFLICT,
        context: {email: payload.email, username: payload.username}
      });
    }

    const newUser = await userRepository.create(payload);

    const defaultRole = await roleRepository.findByName('buyer');
    if (defaultRole) {
      await userRepository.addRole(newUser, defaultRole);
    }

    const emailVerificationToken = await tokenService.generateEmailVerificationToken(
      newUser.id,
      +config.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN
    );

    const userDTO: IAuthDocument = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isVerified: newUser.isVerified,
      status: newUser.status,
      roles: [defaultRole?.name as string],
      profilePicture: newUser.profilePicture,
    };

    AppLogger.info(`User created successfully with id: ${newUser.id}`, {
      operation: 'auth:signup',
      metadata: {userId: newUser.id, email: maskEmail(newUser.email), username: newUser.username}
    });

    // TODO: AUTH:PUBLISH_MESSAGE:SIGNUP
    const exchange = EXCHANGES.AUTH.name;
    const routingKey = ROUTING_KEYS.AUTH.USER_CREATED;

    const message: IAuthMessageQueue = {
      type: MessageQueueType.USER_CREATED,
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      country: payload.country,
      sex: payload.sex,
      verificationLink: `${config.CLIENT_URL}/verify-email?token=${emailVerificationToken}`
    };

    console.log(message.verificationLink);

    const log = {
      message: `Published ${routingKey} to ${exchange} successfully`,
      context: {
        userId: newUser.id,
        username: newUser.username,
        email: maskEmail(newUser.email),
        type: MessageQueueType.USER_CREATED,
        status: 'published',
        exchange,
        routingKey
      }
    };

    await messageQueue.publish({channelName: publishChannel, exchange, routingKey, message: JSON.stringify(message)});
    AppLogger.info(log.message, {operation: 'queue:publish', context: log.context});

    return userDTO;
  }

  public async signIn(ipAddress: string, payload: SignInDTO): Promise<AuthResponseDTO> {
    const user = await userRepository.findByEmail(payload.email);
    if (!user) {
      throw new NotFoundError({
        clientMessage: 'User not exists',
        logMessage: `User not exist with email: ${payload.email}`,
        operation: 'auth:signin',
        errorCode: ErrorCode.NOT_FOUND,
        context: {email: payload.email}
      });
    }

    const isMatch = await bcrypt.compare(payload.password, user.password);

    if (!isMatch) {
      throw new AuthenticationFailedError({
        clientMessage: 'Invalid email or password',
        logMessage: `Failed login attempt for email: ${payload.email}`,
        operation: 'auth:signin',
        errorCode: ErrorCode.AUTHENTICATION_FAILED,
        context: {email: payload.email}
      });
    }

    if (!user.isVerified) {
      throw new EmailNotVerifiedError({
        clientMessage: 'Please verify your email before signing in',
        context: {userId: user.id, email: user.email},
        operation: 'auth:signin',
      });
    }

    AppLogger.info(`User signed in successfully with id: ${user.id}`, {
      operation: 'auth:signin',
      metadata: {userId: user.id, email: user.email}
    });

    const userAgent: IUserAgent = {
      browserName: payload.browserName ?? 'unknown',
      deviceType: payload.deviceType ?? 'unknown',
      ipAddress
    };

    const {accessToken, refreshToken} = await tokenService.generateAndSaveAuthTokens(user, userAgent);

    const userDTO: IAuthDocument = {
      id: user.id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      status: user.status,
      roles: user.roles ? user.roles.map((role) => role.name) : [],
      profilePicture: user.profilePicture,
    };

    const authResponseDTO: AuthResponseDTO = {
      accessToken,
      refreshToken,
      user: userDTO
    };

    AppLogger.info(`User signin completed successfully with user id: ${user.id}`, {
      operation: 'auth:signin',
      context: {userId: user.id}
    });

    return authResponseDTO;
  }

  public async refreshAccessToken(token: string): Promise<{
    user: IAuthDocument,
    accessToken: TokenDTO;
    refreshToken: TokenDTO
  }> {
    const oldRefreshToken = await tokenService.validateRefreshToken(token);
    const user = await userRepository.findById(oldRefreshToken.userId);
    if (!user) {
      throw new NotFoundError({
        clientMessage: 'User for this token not found.',
        errorCode: ErrorCode.NOT_FOUND
      });
    }

    const userAgent: IUserAgent = {
      browserName: oldRefreshToken.browserName ?? 'unknown',
      deviceType: oldRefreshToken.deviceType ?? 'unknown',
      ipAddress: oldRefreshToken.ipAddress ?? 'unknown',
    };

    const {accessToken, refreshToken: newRefreshToken} = await tokenService.generateAndSaveAuthTokens(user, userAgent);

    const userDTO: IAuthDocument = {
      id: user.id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      status: user.status,
      roles: user.roles ? user.roles.map((role) => role.name) : [],
      profilePicture: user.profilePicture,
    };

    AppLogger.info(`Access token refreshed successfully for user id: ${user.id}`, {
      operation: 'auth:refresh-access-token',
      context: {userId: user.id}
    });

    return {user: userDTO, accessToken, refreshToken: newRefreshToken};
  }

  public async forgotPassword(payload: ForgotPasswordDTO): Promise<void> {
    const user = await userRepository.findByEmail(payload.email);
    if (!user) {
      throw new NotFoundError({
        clientMessage: 'User not found.',
        operation: 'auth:forgot-password',
        errorCode: ErrorCode.NOT_FOUND,
        context: {email: payload.email}
      });
    }


    const RESEND_COOLDOWN = 180; // seconds

    const cooldownKey = `resetPasswordEmailCooldown:${user.id}`;
    const nextAvailable = await cacheStore.get(cooldownKey);

    if (nextAvailable && new Date(nextAvailable) > new Date()) {
      const waitSeconds = Math.ceil((new Date(nextAvailable).getTime() - Date.now()) / 1000);
      throw new CooldownError({
        clientMessage: `Please wait ${waitSeconds} seconds before resending.`,
        error: {
          waitSeconds
        }
      });
    }

    await cacheStore.setEx(cooldownKey, RESEND_COOLDOWN, new Date(Date.now() + RESEND_COOLDOWN * 1000).toISOString());

    const passwordResetToken = await tokenService.generatePasswordResetToken(user.id, 600); // 10m expiration

    // TODO: AUTH:PUBLISH_MESSAGE:USER_PASSWORD_RESET_REQUESTED
    const message: IAuthMessageQueue = {
      email: user.email,
      username: user.username,
      type: MessageQueueType.USER_PASSWORD_RESET_REQUESTED,
      resetLink: `${config.CLIENT_URL}/reset-password?token=${passwordResetToken}`
    };


    const exchange = EXCHANGES.AUTH.name;
    const routingKey = ROUTING_KEYS.AUTH.PASSWORD_RESET_REQUESTED;

    const log = {
      message: `Published ${routingKey} to ${exchange} SUCCESSFULLY`,
      context: {
        userId: user.id,
        email: maskEmail(user.email),
        type: MessageQueueType.USER_PASSWORD_RESET_REQUESTED,
        status: 'published',
        exchange,
        routingKey
      }
    };
    await messageQueue.publish({channelName: publishChannel, exchange, routingKey, message: JSON.stringify(message)});

    AppLogger.info(log.message, {operation: 'queue:publish', context: log.context});
  }

  public async resetPassword(payload: ResetPasswordDTO): Promise<void> {
    if (payload.password !== payload.confirmPassword)
      throw new BadRequestError({
        clientMessage: 'Passwords do not match.',
        operation: 'auth:reset-password',
        errorCode: ErrorCode.BAD_REQUEST,
      });

    const passwordResetToken = await tokenService.validatePasswordResetToken(payload.token);
    const user = await userRepository.findById(passwordResetToken.userId);
    if (!user) {
      throw new NotFoundError({
        clientMessage: 'User not found.',
        operation: 'auth:reset-password',
        errorCode: ErrorCode.NOT_FOUND,
      });
    }

    user.password = payload.password;
    await userRepository.save(user);
    await tokenService.markPasswordResetTokenAsUsed(passwordResetToken.id);

    AppLogger.info(`Password reset successfully for user id: ${user.id}`, {
      operation: 'auth:reset-password',
      context: {userId: user.id}
    });
  }

  public async validateResetPasswordToken(token: string): Promise<void> {
    const passwordResetToken = await tokenService.validatePasswordResetToken(token);
    const user = await userRepository.findById(passwordResetToken.userId);
    if (!user) {
      throw new NotFoundError({
        clientMessage: 'User not found.',
        operation: 'auth:reset-password',
        errorCode: ErrorCode.NOT_FOUND,
        context: {token: token}
      });
    }
  }

  public async logout(userId: string): Promise<void> {
    await refreshTokenRepository.revokeToken(userId);

    AppLogger.info(`User with id ${userId} logged out successfully`, {
      operation: 'auth:logout',
      context: {userId}
    });
  }

  public async changePassword(payload: ChangePasswordDTO): Promise<void> {
    const user = await userRepository.findById(payload.id);
    if (!user) {
      throw new NotFoundError({
        clientMessage: 'User not found.',
        operation: 'auth:change-password',
        errorCode: ErrorCode.NOT_FOUND,
        context: {userId: payload.id}
      });
    }

    const isMatch = await bcrypt.compare(payload.currentPassword, user.password);
    if (!isMatch) {
      throw new AuthenticationFailedError({
        clientMessage: 'Invalid old password.',
        operation: 'auth:change-password',
        errorCode: ErrorCode.AUTHENTICATION_FAILED,
        context: {userId: payload.id}
      });
    }

    user.password = payload.newPassword;
    await userRepository.save(user);

    AppLogger.info(`Password changed successfully for user id: ${user.id}`, {
      operation: 'auth:change-password',
      context: {userId: user.id}
    });
  }

  public async resendEmailVerification(payload: ResendEmailVerificationDTO): Promise<void> {
    const user = await userRepository.findByEmail(payload.email);
    if (!user) {
      throw new NotFoundError({
        clientMessage: 'User not found',
        logMessage: `User not found with email: ${payload.email}`,
        operation: 'auth:resend-email-verification',
        errorCode: ErrorCode.NOT_FOUND,
        context: {email: payload.email}
      });
    }

    if (user.isVerified) {
      throw new ConflictError({
        clientMessage: 'Email has already been verified',
        logMessage: `Email ${payload.email} has already been verified`,
        operation: 'auth:resend-email-verification',
        errorCode: ErrorCode.RESOURCE_CONFLICT,
        context: {userId: user.id, email: user.email}
      });
    }

    const RESEND_COOLDOWN = 180; // seconds

    const cooldownKey = `resendEmailVerificationCooldown:${user.id}`;
    const nextAvailable = await cacheStore.get(cooldownKey);

    if (nextAvailable && new Date(nextAvailable) > new Date()) {
      const waitSeconds = Math.ceil((new Date(nextAvailable).getTime() - Date.now()) / 1000);
      throw new CooldownError({
        clientMessage: `Please wait ${waitSeconds} seconds before resending.`,
        error: {
          waitSeconds
        }
      });
    }

    await cacheStore.setEx(cooldownKey, RESEND_COOLDOWN, new Date(Date.now() + RESEND_COOLDOWN * 1000).toISOString());

    const emailVerificationToken = await tokenService.generateEmailVerificationToken(
      user.id,
      300
    );

    const exchange = EXCHANGES.AUTH.name;
    const routingKey = ROUTING_KEYS.AUTH.USER_RESEND_VERIFICATION_EMAIL_REQUESTED;

    const message: IAuthMessageQueue = {
      type: MessageQueueType.USER_RESEND_VERIFICATION_EMAIL_REQUESTED,
      userId: user.id,
      email: user.email,
      username: user.username,
      verificationLink: `${config.CLIENT_URL}/verify-email?token=${emailVerificationToken}`
    };

    console.log(message.verificationLink);

    const log = {
      message: `Published ${routingKey} to ${exchange} successfully`,
      context: {
        userId: user.id,
        username: user.username,
        email: maskEmail(user.email),
        type: MessageQueueType.USER_RESEND_VERIFICATION_EMAIL_REQUESTED,
        status: 'published',
        exchange,
        routingKey
      }
    };

    await messageQueue.publish({channelName: publishChannel, exchange, routingKey, message: JSON.stringify(message)});
    AppLogger.info(log.message, {operation: 'queue:publish', context: log.context});
  }

  public async verifyEmail(token: string): Promise<void> {
    const emailVerificationToken = await tokenService.validateEmailVerificationToken(token);

    const user = await userRepository.findById(emailVerificationToken.userId);

    if (!user) {
      throw new NotFoundError({
        clientMessage: 'User not found',
        operation: 'auth:verify-email',
        errorCode: ErrorCode.NOT_FOUND,
        context: {userId: emailVerificationToken.userId}
      });
    }

    if (user.isVerified) return;

    await emailTokenRepository.markTokenAsUsed(emailVerificationToken.id);
    await userRepository.updateEmailVerified(user.id, true);

    AppLogger.info(`Verify email successfully with user id: ${user.id}`, {
      operation: 'auth:verify-email',
      context: {userId: user.id, email: maskEmail(user.email)}
    });
  }
}

export const authService: AuthService = new AuthService();
