// import { randomBytes } from 'crypto';

import { randomBytes } from 'node:crypto';

import jwt, { TokenExpiredError } from 'jsonwebtoken';
import {
  AuthenticationFailedError,
  ErrorCode,
  ExpiredTokenError,
  hashToken,
  InvalidTokenError,
  IUserAgent,
  JwtPayload
} from '@hiep20012003/joblance-shared';
import { config } from '@auth/config';
import { EmailVerificationToken } from '@auth/database/models/email-verification-token.model';
import { PasswordResetToken } from '@auth/database/models/password-reset-token.model';
import { RefreshToken } from '@auth/database/models/refresh-token.model';
import { User } from '@auth/database/models/user.model';
import { AppLogger } from '@auth/utils/logger';
import { TokenDTO } from '@auth/schemas/auth/auth-response.dto';
import { refreshTokenRepository } from '@auth/repositories/refresh-token.repository';
import { emailTokenRepository } from '@auth/repositories/email-token.repository';
import { passwordResetTokenRepository } from '@auth/repositories/password-reset-token.repository';
import { v4 as uuidv4 } from 'uuid';
import { InferCreationAttributes } from 'sequelize';

import { keyService } from './key.service';

export class TokenService {
  generateAndSaveAuthTokens = async (
    user: User, userAgent: IUserAgent
  ): Promise<{
    accessToken: TokenDTO;
    refreshToken: TokenDTO;
  }> => {
    const operation = 'token:generate-auth-tokens';

    try {
      // === Payload Access Token (RS256) ===
      const accessPayload = {
        iss: 'auth',
        sub: user.id,
        aud: 'gateway',
        email: user.email,
        username: user.username,
        roles: user.roles?.map((role) => role.name),
        jti: uuidv4()
      };

      const accessToken = await keyService.signJwtAccessToken(accessPayload, config.ACCESS_TOKEN_EXPIRES_IN);

      // === Payload Refresh Token (HS256) ===
      const refreshTokenId = uuidv4();
      const refreshPayload = {
        iss: 'auth-service',
        sub: user.id,
        jti: refreshTokenId
      };

      const refreshToken = keyService.signJwtRefreshToken(refreshPayload, config.REFRESH_TOKEN_EXPIRES_IN);

      AppLogger.info('Generated authentication tokens successfully', {
        operation,
        context: { userId: user.id, payloadKeys: Object.keys(accessPayload) }
      });

      const refreshTokenEntity = RefreshToken.build({
        id: refreshTokenId,
        userId: user.id,
        token: hashToken(refreshToken),
        browserName: userAgent?.browserName ?? 'unknown',
        deviceType: userAgent?.deviceType ?? 'unknown',
        ipAddress: userAgent?.ipAddress ?? 'unknown',
        expireAt: new Date(Date.now() + +config.REFRESH_TOKEN_EXPIRES_IN * 1000),
        revoked: false
      } as InferCreationAttributes<RefreshToken>);

      await refreshTokenRepository.save(refreshTokenEntity);

      return {
        accessToken: { token: accessToken, exp: Math.floor(Date.now() / 1000) + +config.ACCESS_TOKEN_EXPIRES_IN },
        refreshToken: { token: refreshToken, exp: Math.floor(Date.now() / 1000) + +config.REFRESH_TOKEN_EXPIRES_IN }
      };
    } catch (error) {
      throw new AuthenticationFailedError({
        clientMessage: 'Failed to generate authentication tokens',
        operation,
        cause: error
      });
    }
  };

  validateRefreshToken = async (token: string): Promise<RefreshToken> => {
    try {

      jwt.verify(token, `${config.REFRESH_TOKEN_SECRET}`, {
        algorithms: ['HS256']
      }) as JwtPayload;

      const oldRefreshToken = await refreshTokenRepository.findByToken(hashToken(token));
      if (!oldRefreshToken || oldRefreshToken.revoked) {
        throw new InvalidTokenError({
          clientMessage: 'Invalid or revoked refresh token.',
          errorCode: ErrorCode.TOKEN_INVALID
        });
      }

      await refreshTokenRepository.revokeToken(token);

      return oldRefreshToken;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ExpiredTokenError({
          clientMessage: 'Token has expired. Please sign in again.',
          errorCode: ErrorCode.TOKEN_EXPIRED,
          operation: 'token:verify-jwt-expired',
          cause: error
        });
      }

      throw new InvalidTokenError({
        clientMessage: 'Invalid token.',
        errorCode: ErrorCode.TOKEN_INVALID,
        operation: 'token:verify-jwt-invalid',
        cause: error
      });
    }
  };

  // Email token
  generateEmailVerificationToken = async (
    userId: string,
    expireInSeconds: number
  ): Promise<string> => {
    const token = randomBytes(32).toString('hex');
    const emailVerificationToken = (await emailTokenRepository.save(
      EmailVerificationToken.build({
        id: uuidv4(), // Explicitly provide id
        userId,
        token: hashToken(token),
        expireAt: new Date(Date.now() + expireInSeconds * 1000)
      } as InferCreationAttributes<EmailVerificationToken>)
    ));

    AppLogger.info(`Generated verification email token successfully`, {
      operation: 'token:generate-email-verification',
      metadata: {
        userId,
        expireAt: emailVerificationToken.expireAt.toISOString(),
        tokenLength: token.length
      }
    });

    return token;
  };

  // Password reset token
  generatePasswordResetToken = async (userId: string, expireAt_seconds: number): Promise<string> => {
    const token = randomBytes(32).toString('hex');

    const passwordResetToken = (await passwordResetTokenRepository.save(
      PasswordResetToken.build({
        id: uuidv4(), // Explicitly provide id
        userId,
        token: hashToken(token),
        expireAt: new Date(Date.now() + expireAt_seconds * 1000),
        used: false, // Explicitly set used to false as it's CreationOptional
      } as InferCreationAttributes<PasswordResetToken>)
    ));

    AppLogger.info(`Generated password reset token successfully`, {
      operation: 'token:generate-password-reset',
      metadata: {
        userId,
        expireAt: passwordResetToken.expireAt.toISOString(),
        tokenLength: token.length
      }
    });

    return token;
  };

  validatePasswordResetToken = async (token: string): Promise<PasswordResetToken> => {
    const passwordResetToken = await passwordResetTokenRepository.findByToken(hashToken(token));
    if (!passwordResetToken || passwordResetToken.used || passwordResetToken.expireAt < (new Date())) {
      console.log(passwordResetToken);
      throw new InvalidTokenError({
        clientMessage: 'Invalid or expired password reset token.',
        operation: 'token:validate-password-reset',
        errorCode: ErrorCode.TOKEN_INVALID
      });
    }
    return passwordResetToken;
  };

  validateEmailVerificationToken = async (token: string): Promise<EmailVerificationToken> => {
    const emailVerificationToken = await emailTokenRepository.findByToken(hashToken(token));
    console.log(emailVerificationToken);
    if (!emailVerificationToken || emailVerificationToken.used || emailVerificationToken.expireAt < new Date()) {
      throw new InvalidTokenError({
        clientMessage: 'Invalid or expired token.',
        operation: 'token:validate-email',
        errorCode: ErrorCode.TOKEN_INVALID
      });
    }
    return emailVerificationToken;
  };

  markPasswordResetTokenAsUsed = async (id: string): Promise<void> => {
    await passwordResetTokenRepository.markTokenAsUsed(id);
  };

  markEmailVerificationTokenAsUsed = async (id: string): Promise<void> => {
    await emailTokenRepository.markTokenAsUsed(id);
  };
}

export const tokenService: TokenService = new TokenService();
