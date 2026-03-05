import db from '../db/connection.js';

class JobPosting {
  static async getAll() {
    const result = await db.query(`
      SELECT *
      FROM core_job_posting
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT *
      FROM core_job_posting
      WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getByUser(user_id) {
    const result = await db.query(`
      SELECT *
      FROM core_job_posting
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [user_id]);
    return result.rows;
  }

  static async getByStatus(status) {
    const result = await db.query(`
      SELECT *
      FROM core_job_posting
      WHERE status = $1
      ORDER BY created_at DESC
    `, [status]);
    return result.rows;
  }

  static async create({ user_id, art_id, title, description, job_location, work_option, work_type, salary_min, salary_max, salary_currency, status, expired_at }) {
    const result = await db.query(`
      INSERT INTO core_job_posting
      (user_id, art_id, title, description, job_location, work_option, work_type, salary_min, salary_max, salary_currency, status, expired_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, 'IDR')::currency_type, COALESCE($11, 'Draft')::job_status_type, $12)
      RETURNING *
    `, [user_id, art_id, title, description, job_location, work_option, work_type, salary_min, salary_max, salary_currency, status, expired_at]);
    return result.rows[0];
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    if (keys.length === 0) return null;

    const setClause = keys
      .map((k, index) => `${k} = $${index + 1}`)
      .join(', ');

    const result = await db.query(`
      UPDATE core_job_posting
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `, [...values, id]);

    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_job_posting
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }
}

export default JobPosting;
