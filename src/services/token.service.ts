import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';

import jwt, { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { ErrorCode, JsonWebTokenError } from '@hiep20012003/joblance-shared';
import { config } from '@auth/config';
import { EmailVerificationToken } from '@auth/db/models/email-verification-token.model';
import { RefreshToken } from '@auth/db/models/refresh-token.model';
import { User } from '@auth/db/models/user.model';
import { EmailTokenRepository } from '@auth/repositories/email-token.repository';
import { RefreshTokenRepository } from '@auth/repositories/refresh-token.repository';
import { AppLogger } from '@auth/utils/logger';

const privateKey = fs.readFileSync(path.join(__dirname, `../../${config.JWT_PRIVATE_KEY_PATH}`), 'utf8');
const publicKey = fs.readFileSync(path.join(__dirname, `../../${config.JWT_PUBLIC_KEY_PATH}`), 'utf8');

export class TokenService {
  constructor(
    private readonly emailVerifyRepository: EmailTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  generateAndSaveAuthTokens = async (
    user: User
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> => {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username
    };

    const signOptions: SignOptions = {
      algorithm: config.JWT_ALGORITHM as jwt.Algorithm,
      expiresIn: config.JWT_ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      keyid: config.JWT_KEY_ID
    };

    const accessToken = jwt.sign(payload, privateKey, signOptions);

    const refreshTokenSignOptions: SignOptions = {
      ...signOptions,
      expiresIn: config.JWT_REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn']
    };

    const refreshToken = jwt.sign(payload, privateKey, refreshTokenSignOptions);

    AppLogger.info(`Generated authentication tokens successfully`, {
      operation: 'auth-generate-auth-tokens',
      metadata: {
        userId: user.id,
        keyId: config.JWT_KEY_ID
      }
    });

    const decodedToken = this.verifyToken<{ exp: number }>(refreshToken);
    const expiresAt = new Date(decodedToken.exp * 1000);

    const refreshTokenEntity = new RefreshToken({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
      revoked: false
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken };
  };

  public generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username
    };

    const signOptions: SignOptions = {
      algorithm: config.JWT_ALGORITHM as jwt.Algorithm,
      expiresIn: config.JWT_ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      keyid: config.JWT_KEY_ID
    };

    return jwt.sign(payload, privateKey, signOptions);
  }

  verifyToken = <T>(token: string): T => {
    try {
      const decoded = jwt.verify(token, publicKey, {
        algorithms: [config.JWT_ALGORITHM as jwt.Algorithm]
      }) as T;
      return decoded;
    } catch (error) {

      if (error instanceof TokenExpiredError) {
        throw new JsonWebTokenError({
          clientMessage: 'Token has expired. Please sign in again.',
          errorCode: ErrorCode.TOKEN_EXPIRED,
          cause: error
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new JsonWebTokenError({
          clientMessage: 'Invalid or malformed token.',
          errorCode: ErrorCode.TOKEN_INVALID,
          cause: error
        });
      }

      throw new JsonWebTokenError({
        clientMessage: 'Could not verify token.',
        cause: error
      });
    }
  };

  // Email token
  generateEmailVerificationToken = async (user_id: string, exprisesInSeconds: number): Promise<EmailVerificationToken> => {
    const token = randomBytes(32).toString('hex');
    const emailVerificationToken = await this.emailVerifyRepository.save(
      new EmailVerificationToken({
        user_id,
        token,
        expires_at: new Date(Date.now() + exprisesInSeconds * 1000)
      })
    );

    AppLogger.info(`Generated verification email token successfully`, {
      operation: 'auth-generate-email-verification-token',
      metadata: {
        user_id,
        expiresAt: emailVerificationToken.expires_at.toISOString(),
        tokenLength: token.length
      }
    });

    return emailVerificationToken;
  };
}
