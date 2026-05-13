import db from '../db/connection.js';

class Subscription {
  static async create({ user_id, plan, amount, currency, posts_remaining }) {
    const result = await db.query(
      `
      INSERT INTO core_subscriptions
      (user_id, plan, amount, currency, status, posts_remaining)
      VALUES ($1, $2, $3, COALESCE($4, 'IDR')::currency_type, 'pending', $5)
      RETURNING *
    `,
      [user_id, plan, amount, currency, posts_remaining]
    );
    return result.rows[0];
  }

  static async getActiveForUser(user_id) {
    const result = await db.query(
      `
      SELECT * FROM core_subscriptions
      WHERE user_id = $1
        AND status = 'paid'
        AND (
          (active_until IS NOT NULL AND active_until > NOW())
          OR (posts_remaining IS NOT NULL AND posts_remaining > 0)
        )
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [user_id]
    );
    return result.rows[0];
  }

  static async getLatestForUser(user_id) {
    const result = await db.query(
      `
      SELECT * FROM core_subscriptions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [user_id]
    );
    return result.rows[0];
  }

  static async markPaid(id, durationDays) {
    const result = await db.query(
      `
      UPDATE core_subscriptions
      SET status = 'paid',
          active_from = NOW(),
          active_until = NOW() + ($1 || ' days')::interval,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
      [String(durationDays), id]
    );
    return result.rows[0];
  }

  static async expireById(id) {
    const result = await db.query(
      `
      UPDATE core_subscriptions
      SET status = 'expired',
          posts_remaining = 0,
          updated_at = NOW()
      WHERE id = $1 AND status = 'paid'
      RETURNING *
    `,
      [id]
    );
    return result.rows[0];
  }

  static async getHistoryForUser(user_id) {
    const result = await db.query(
      `
      SELECT id, plan, status, amount, currency,
             active_from, active_until, posts_remaining,
             created_at, updated_at
      FROM core_subscriptions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `,
      [user_id]
    );
    return result.rows;
  }

  static async decrementPostsRemaining(id) {
    const result = await db.query(
      `
      UPDATE core_subscriptions
      SET posts_remaining = GREATEST(posts_remaining - 1, 0),
          status = CASE WHEN posts_remaining <= 1 THEN 'expired'::payment_status ELSE status END,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
      [id]
    );
    return result.rows[0];
  }

  static async expireLapsed() {
    const result = await db.query(`
      UPDATE core_subscriptions
      SET status = 'expired', updated_at = NOW()
      WHERE status = 'paid'
        AND (
          (active_until IS NOT NULL AND active_until <= NOW())
          OR (
            plan IN ('pro_per_post', 'corporate_per_post')
            AND (posts_remaining IS NULL OR posts_remaining = 0)
          )
        )
      RETURNING user_id, id
    `);
    return result.rows;
  }
}

export default Subscription;
