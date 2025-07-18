import { randomBytes } from 'crypto';

import { EmailVerificationToken } from '@auth/db/models/email-verification-token.model';

export class TokenService {
  constructor() {

  }

  // Email token
  createEmailVerificationToken = async (user_id: string, exprisesInSeconds: number): Promise<EmailVerificationToken> => {
    const token = randomBytes(32).toString('hex');
    return await EmailVerificationToken.create({
      user_id,
      token,
      expires_at: new Date(Date.now() + exprisesInSeconds * 1000)
    });
  };
}
