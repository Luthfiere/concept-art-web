import db from '../db/connection.js';

class DevLogMedia {
  static async getByLogId(log_id) {
    const result = await db.query(`
      SELECT *
      FROM core_dev_log_media
      WHERE log_id = $1
      ORDER BY created_at ASC
    `, [log_id]);
    return result.rows;
  }

  static async create({ log_id, media }) {
    const result = await db.query(`
      INSERT INTO core_dev_log_media (log_id, media)
      VALUES ($1, $2)
      RETURNING *
    `, [log_id, media]);
    return result.rows[0];
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT * FROM core_dev_log_media WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_dev_log_media
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }
}

export default DevLogMedia;