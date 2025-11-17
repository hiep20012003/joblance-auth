import {RefreshToken} from '@auth/database/models/refresh-token.model';
import {AppLogger} from '@auth/utils/logger';
import cron from 'node-cron';
import {Op} from 'sequelize';

export function startRefreshTokenCleanupJob() {
  cron.schedule('0 2 * * *', async () => {
    try {
      const deleted = await RefreshToken.destroy({
        where: {
          [Op.or]: [{revoked: true}, {expireAt: {[Op.lt]: new Date()}}]
        }
      });

      AppLogger.info(`Cleanup job: deleted ${deleted} expired/ revoked refresh tokens`, {
        operation: 'jobs:refresh-token-cleanup'
      });
    } catch (err) {
      AppLogger.error('Cleanup job failed', {operation: 'jobs:refresh-token-cleanup', error: err});
    }
  });
}
