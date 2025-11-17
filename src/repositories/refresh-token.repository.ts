import { RefreshToken } from '@auth/database/models/refresh-token.model';

export class RefreshTokenRepository {
  public async save(refreshToken: RefreshToken): Promise<RefreshToken> {
    return refreshToken.save();
  }

  public async findByToken(token: string): Promise<RefreshToken | null> {
    return RefreshToken.findOne({ where: { token } });
  }

  public async revokeToken(userId: string): Promise<void> {
    await RefreshToken.update({ revoked: true }, { where: { userId } });
  }

  public async findByUserId(userId: string): Promise<RefreshToken[]> {
    return RefreshToken.findAll({ where: { userId: userId } });
  }
}

export const refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository();
