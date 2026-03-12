import db from '../db/connection.js';

class DevLogLike {
  static async getByLogId(log_id) {
    const result = await db.query(`
      SELECT dll.*, u.username
      FROM core_dev_log_likes dll
      LEFT JOIN master_users u ON dll.user_id = u.id
      WHERE dll.log_id = $1
    `, [log_id]);
    return result.rows;
  }

  static async isLiked(log_id, user_id) {
    const result = await db.query(`
      SELECT id FROM core_dev_log_likes
      WHERE log_id = $1 AND user_id = $2
    `, [log_id, user_id]);
    return result.rows[0] || null;
  }

  static async like({ log_id, user_id }) {
    const result = await db.query(`
      INSERT INTO core_dev_log_likes (log_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (log_id, user_id) DO NOTHING
      RETURNING *
    `, [log_id, user_id]);
    return result.rows[0];
  }

  static async unlike({ log_id, user_id }) {
    const result = await db.query(`
      DELETE FROM core_dev_log_likes
      WHERE log_id = $1 AND user_id = $2
      RETURNING *
    `, [log_id, user_id]);
    return result.rows[0];
  }
}

export default DevLogLike;