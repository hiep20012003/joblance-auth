import {EmailVerificationToken} from '@auth/database/models/email-verification-token.model';
import {AppLogger} from '@auth/utils/logger';
import cron from 'node-cron';
import {Op} from 'sequelize';

export function startEmailTokenCleanupJob() {
  cron.schedule('0 2 * * *', async () => {
    try {
      const deleted = await EmailVerificationToken.destroy({
        where: {
          [Op.or]: [{used: true}, {expireAt: {[Op.lt]: new Date()}}]
        }
      });

      AppLogger.info(`Cleanup job: deleted ${deleted} expired/ revoked email tokens`, {
        operation: 'jobs:email-token-cleanup'
      });
    } catch (err) {
      AppLogger.error('Cleanup job failed', {operation: 'jobs:email-token-cleanup', error: err});
    }
  });
}
