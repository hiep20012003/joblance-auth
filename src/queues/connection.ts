import {config} from '@auth/config';
import {AppLogger} from '@auth/utils/logger';
import {
  EXCHANGES,
  IServerMessageQueue,
  MessageQueue,
  MessageQueueType,
  ROUTING_KEYS,
  setupAllQueues
} from '@hiep20012003/joblance-shared';
import {buildGrantsObject} from '@auth/utils/helper';
import {cacheStore} from '@auth/cache/redis.connection';

import {consumeUserMessage} from './consumers/user.consumer';

export const messageQueue = MessageQueue.getInstance(`${config.RABBITMQ_URL}`);
export const publishChannel: string = 'auth-publish-channel';
export const consumerChannel: string = 'auth-consumer-channel';

export async function initQueue() {
  await messageQueue.connect();
  AppLogger.info('RabbitMQ connection established successfully', {operation: 'queue:connect'});
  await setupAllQueues(messageQueue, (error: Error, queueName?: string) => {
    AppLogger.error(`[Setup] Failed to setup queue${queueName ? ` "${queueName}"` : ''}`, {
      operation: 'queue:setup-all',
      error: error
    });
  });

  const exchange = EXCHANGES.SERVER.name;
  const routingKey = ROUTING_KEYS.SERVER.PERMISSION_SYNCED;

  const message: IServerMessageQueue = {
    type: MessageQueueType.PERMISSION_SYNCED,
    permissions: await buildGrantsObject()
  };

  await cacheStore.set('app:permissions', JSON.stringify(message.permissions));

  await messageQueue.publish({
    channelName: publishChannel, exchange, routingKey, message: JSON.stringify(message),
  });

  await consumeUserMessage(messageQueue);
}
