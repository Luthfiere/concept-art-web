import db from '../db/connection.js';
import logger from '../utils/logger.js';

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

export function startJobExpiryService() {
  // run once on startup
  expireJobs();
  // then run on interval
  setInterval(expireJobs, INTERVAL_MS);
}
