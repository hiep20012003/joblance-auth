import {config} from '@auth/config';
import {AppLogger} from '@auth/utils/logger';
import {RedisClient} from '@hiep20012003/joblance-shared';

export class CacheStore extends RedisClient {
}

export const cacheStore = new CacheStore(config.REDIS_URL, AppLogger);
