import db from '../db/connection.js';
import logger from '../utils/logger.js';
import Subscription from '../model/SubscriptionModel.js';
import User from '../model/UserModel.js';
import JobPosting from '../model/JobPostingModel.js';

const INTERVAL_MS = 60 * 60 * 1000; // check every 1 hour

async function expireJobs() {
  try {
    const result = await db.query(`
      UPDATE core_job_posting
      SET status = 'Expired', updated_at = NOW()
      WHERE status = 'Active'
        AND expired_at IS NOT NULL
        AND expired_at <= NOW()
      RETURNING id, title
    `);

    if (result.rows.length > 0) {
      logger.info(`Expired ${result.rows.length} job posting(s): ${result.rows.map(j => j.id).join(', ')}`);
    }
  } catch (err) {
    logger.error(`Job expiry check failed: ${err.message}`);
  }
}

async function expireLapsedSubscriptions() {
  try {
    const expired = await Subscription.expireLapsed();
    if (expired.length === 0) return;

    const lapsedUserIds = [...new Set(expired.map((r) => r.user_id))];
    const downgradedIds = await User.demoteIfNoActiveSub(lapsedUserIds);

    if (downgradedIds.length > 0) {
      const expiredPostIds = await JobPosting.expireActiveByUsers(downgradedIds);
      logger.info(
        `Subscription lapse: expired ${expired.length} subscription(s), downgraded users [${downgradedIds.join(', ')}], expired ${expiredPostIds.length} Active posting(s)`
      );
    } else {
      logger.info(`Subscription lapse: expired ${expired.length} subscription(s), no downgrades needed`);
    }
  } catch (err) {
    logger.error(`Subscription lapse check failed: ${err.message}`);
  }
}

async function runHourlyTick() {
  await expireJobs();
  await expireLapsedSubscriptions();
}

export function startJobExpiryService() {
  // run once on startup
  runHourlyTick();
  // then run on interval
  setInterval(runHourlyTick, INTERVAL_MS);
}

// Named exports for testing / manual triggers
export { expireJobs, expireLapsedSubscriptions };
