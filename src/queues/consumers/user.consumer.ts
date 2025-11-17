import {EXCHANGES, MessageQueue} from '@hiep20012003/joblance-shared';
import {AppLogger} from '@auth/utils/logger';

import {consumerChannel} from '../connection';
import {handleUserMessage} from '../handlers/user.handler';

export async function consumeUserMessage(messageQueue: MessageQueue) {
  const exchange = EXCHANGES.USERS.name;
  const queue = 'auth.users';

  await messageQueue.consume({
    channelName: consumerChannel,
    exchange,
    queue,
    handler: handleUserMessage,
    handlerRetryError: (operation: string, context) => {
      AppLogger.error(`Exceeded max retries`, {
        operation,
        context
      });
    },
    maxRetries: 5
  });

  AppLogger.info('User message consumer listening to queue', {
    operation: 'consumer:init',
    context: {queue, exchange}
  });
}
