import { Channel } from 'amqplib';
import { AppLogger } from '@auth/utils/logger';
import { DependencyError } from '@hiep20012003/joblance-shared';

import { createConnection } from './connection';

export const publishDirectMessage = async (
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  log: Record<string, unknown>
): Promise<void> => {
  try {
    if (!channel) {
      channel = await createConnection() as Channel;
    }
    await channel.assertExchange(exchangeName, 'direct');
    channel.publish(exchangeName, routingKey, Buffer.from(message));
    AppLogger.info(log.message as string, { operation: 'queue-publish', context: log.context });
  }
  catch(error) {
    throw new DependencyError({
      logMessage: `Failed to publish message to exchange "${exchangeName}" with routingKey "${routingKey}"`,
      cause: error,
      operation: 'queue-publish'
    });
  }
};
