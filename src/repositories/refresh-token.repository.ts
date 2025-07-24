import { RefreshToken } from '@auth/db/models/refresh-token.model';

export class RefreshTokenRepository {
  public async save(refreshToken: RefreshToken): Promise<RefreshToken> {
    return refreshToken.save();
  }

  public async findByToken(token: string): Promise<RefreshToken | null> {
    return RefreshToken.findOne({ where: { token } });
  }

  public async revokeToken(token: string): Promise<void> {
    await RefreshToken.update({ revoked: true }, { where: { token } });
  }

  public async findByUserId(userId: string): Promise<RefreshToken[]> {
    return RefreshToken.findAll({ where: { user_id: userId } });
  }
}
