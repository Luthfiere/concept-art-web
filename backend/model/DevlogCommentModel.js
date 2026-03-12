import db from '../db/connection.js';

class DevLogComment {
  static async getByLogId(log_id) {
    const result = await db.query(`
      SELECT 
        dlc.*,
        u.username
      FROM core_dev_log_comments dlc
      LEFT JOIN master_users u ON dlc.user_id = u.id
      WHERE dlc.log_id = $1
      ORDER BY dlc.created_at ASC
    `, [log_id]);
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT 
        dlc.*,
        u.username
      FROM core_dev_log_comments dlc
      LEFT JOIN master_users u ON dlc.user_id = u.id
      WHERE dlc.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async create({ log_id, user_id, comment }) {
    const result = await db.query(`
      INSERT INTO core_dev_log_comments (log_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [log_id, user_id, comment]);
    return result.rows[0];
  }

  static async update(id, comment) {
    const result = await db.query(`
      UPDATE core_dev_log_comments
      SET comment = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [comment, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_dev_log_comments
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }
}

export default DevLogComment;