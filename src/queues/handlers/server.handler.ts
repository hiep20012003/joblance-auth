import {IServerMessageQueue, MessageQueueType} from '@hiep20012003/joblance-shared';

// import { cacheStore } from '@auth//cache/redis.connection';

export async function handleServerMessage<T extends Required<IServerMessageQueue>>(payload: T): Promise<void> {
  const {type} = payload;
  switch (type) {
    case MessageQueueType.PERMISSION_SYNCED:
    case MessageQueueType.PERMISSION_UPDATED:
      // await cacheStore.setEx('app:permissions', 0, JSON.stringify(permissions));
      await Promise.all([]);
      break;
  }
}
