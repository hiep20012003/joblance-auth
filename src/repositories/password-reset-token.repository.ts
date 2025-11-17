import { PasswordResetToken } from '@auth/database/models/password-reset-token.model';

export class PasswordResetTokenRepository {
  public async save(passwordResetToken: PasswordResetToken): Promise<PasswordResetToken> {
    return passwordResetToken.save();
  }

  public async findByToken(token: string): Promise<PasswordResetToken | null> {
    return PasswordResetToken.findOne({ where: { token } });
  }

  public async markTokenAsUsed(id: string): Promise<void> {
    await PasswordResetToken.update({ used: true }, { where: { id } });
  }
}

export const passwordResetTokenRepository: PasswordResetTokenRepository = new PasswordResetTokenRepository();
