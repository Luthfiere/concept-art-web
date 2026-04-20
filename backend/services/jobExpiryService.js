import db from '../db/connection.js';
import logger from '../utils/logger.js';
import Subscription from '../model/SubscriptionModel.js';

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

    const downgradeResult = await db.query(
      `
      UPDATE master_users
      SET role = 'member'
      WHERE id = ANY($1::int[])
        AND role IN ('pro', 'corporate')
        AND NOT EXISTS (
          SELECT 1 FROM core_subscriptions
          WHERE user_id = master_users.id
            AND status = 'paid'
            AND (
              (active_until IS NOT NULL AND active_until > NOW())
              OR (posts_remaining IS NOT NULL AND posts_remaining > 0)
            )
        )
      RETURNING id
    `,
      [lapsedUserIds]
    );

    const downgradedIds = downgradeResult.rows.map((r) => r.id);

    if (downgradedIds.length > 0) {
      const postResult = await db.query(
        `
        UPDATE core_job_posting
        SET status = 'Expired', updated_at = NOW()
        WHERE user_id = ANY($1::int[])
          AND status = 'Active'
        RETURNING id
      `,
        [downgradedIds]
      );

      logger.info(
        `Subscription lapse: expired ${expired.length} subscription(s), downgraded users [${downgradedIds.join(', ')}], expired ${postResult.rowCount} Active posting(s)`
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
