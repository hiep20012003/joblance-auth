import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { config } from '@auth/config';
import { AuthEmailMessage, EmailTemplate } from '@hiep20012003/joblance-shared';
import { AppLogger } from '@auth/utils/logger';


export class EmailService {
  constructor()
  {}

  sendEmailVerification = async(user_id: string, username: string, email: string, token: string): Promise<void> => {

    AppLogger.info('Sending verification email...', {
      operation: 'send-email', context: {
        userId: user_id,
        email,
      }
    });

    const message: AuthEmailMessage = {
      to: email,
      template: EmailTemplate.VERIFY_EMAIL,
      username,
      verificationLink: `${config.CLIENT_URL}/verify_email?v_token=${token}`
    };

    const log = {
      message: 'Sent verification email successfully',
      context: {
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
