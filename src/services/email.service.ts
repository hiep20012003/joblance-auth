import { EmailVerificationToken } from '@auth/db/models/email-verification-token.model';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { config } from '@auth/config';
import { AuthEmailMessage, EmailTemplate } from '@hiep20012003/joblance-shared';

import { TokenService } from './token.service';

export class EmailService {
  private readonly tokenService: TokenService;
  constructor(tokenService: TokenService) {
    this.tokenService = tokenService;
  }

  sendEmailVeritication = async(user_id: string, username: string, email: string): Promise<void> => {
    const emailVerificationToken: EmailVerificationToken = await this.tokenService.createEmailVerificationToken(user_id, 300);

    const message: AuthEmailMessage = {
      to: email,
      template: EmailTemplate.VERIFY_EMAIL,
      username,
      verificationLink: `${config.CLIENT_URL}/verify_email?v_token=${emailVerificationToken.token}`
    };

    const log = {
      message: 'Sent verification email successfully',
      context: {
        action: 'SendEmailVerification',
        userId: user_id,
        email,
        template: EmailTemplate.VERIFY_EMAIL,
        status: 'published',
        exchange: config.RABBITMQ_AUTH_EXCHANGE,
        routingKey: config.RABBITMQ_AUTH_ROUTINGKEY,
      }
    };
    await publishDirectMessage(authChannel, `${config.RABBITMQ_AUTH_EXCHANGE}`, `${config.RABBITMQ_AUTH_ROUTINGKEY}`, JSON.stringify(message), log);
  };
}
