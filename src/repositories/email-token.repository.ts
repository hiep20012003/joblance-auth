import { EmailVerificationToken } from '@auth/db/models/email-verification-token.model';
export class EmailTokenRepository {

  findByToken = async (token: string): Promise<EmailVerificationToken | null> => {
    return await EmailVerificationToken.findOne({ where: { token } });
  };

  markTokenAsUsed = async (id: string): Promise<void> => {
    await EmailVerificationToken.update({ used: true }, { where: { id } });
  };

  save = async (emailVerificationToken: EmailVerificationToken): Promise<EmailVerificationToken> =>{
    return await emailVerificationToken.save();
  };
}
