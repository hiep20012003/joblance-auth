import { EmailVerificationToken } from '@auth/database/models/email-verification-token.model';

export class EmailTokenRepository {
  findByToken = async (token: string): Promise<EmailVerificationToken | null> => {
    return await EmailVerificationToken.findOne({ where: { token } });
  };

  findByTokenAndUserId = async (userId: string, token: string): Promise<EmailVerificationToken | null> => {
    return await EmailVerificationToken.findOne({ where: { token, userId } });
  };

  markTokenAsUsed = async (id: string): Promise<void> => {
    await EmailVerificationToken.update({ used: true }, { where: { id } });
  };

  save = async (emailVerificationToken: EmailVerificationToken): Promise<EmailVerificationToken> => {
    return await emailVerificationToken.save();
  };
}

export const emailTokenRepository: EmailTokenRepository = new EmailTokenRepository();
