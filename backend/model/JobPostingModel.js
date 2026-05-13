import db from '../db/connection.js';

class JobPosting {
  static async getAll() {
    const result = await db.query(`
      SELECT jp.*, u.username, u.profile_image
      FROM core_job_posting jp
      LEFT JOIN master_users u ON jp.user_id = u.id
      ORDER BY jp.created_at DESC
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT jp.*, u.username, u.profile_image
      FROM core_job_posting jp
      LEFT JOIN master_users u ON jp.user_id = u.id
      WHERE jp.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getByUser(user_id) {
    const result = await db.query(`
      SELECT jp.*, u.username, u.profile_image
      FROM core_job_posting jp
      LEFT JOIN master_users u ON jp.user_id = u.id
      WHERE jp.user_id = $1
      ORDER BY jp.created_at DESC
    `, [user_id]);
    return result.rows;
  }

  static async getByUserPublic(user_id) {
    const result = await db.query(`
      SELECT jp.*, u.username, u.profile_image
      FROM core_job_posting jp
      LEFT JOIN master_users u ON jp.user_id = u.id
      WHERE jp.user_id = $1 AND jp.status = 'Active'
      ORDER BY jp.created_at DESC
    `, [user_id]);
    return result.rows;
  }

  static async getByStatus(status) {
    const result = await db.query(`
      SELECT jp.*, u.username, u.profile_image
      FROM core_job_posting jp
      LEFT JOIN master_users u ON jp.user_id = u.id
      WHERE jp.status = $1
      ORDER BY jp.created_at DESC
    `, [status]);
    return result.rows;
  }

  static async create({ user_id, title, description, job_location, work_option, work_type, salary_min, salary_max, salary_currency, status, expired_at }) {
    const result = await db.query(`
      INSERT INTO core_job_posting
      (user_id, title, description, job_location, work_option, work_type, salary_min, salary_max, salary_currency, status, expired_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'IDR')::currency_type, COALESCE($10, 'Draft')::job_status_type, $11)
      RETURNING *
    `, [user_id, title, description, job_location, work_option, work_type, salary_min, salary_max, salary_currency, status, expired_at]);
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

  static async expireActiveByUsers(userIds) {
    if (!userIds || userIds.length === 0) return [];
    const result = await db.query(`
      UPDATE core_job_posting
      SET status = 'Expired', updated_at = NOW()
      WHERE user_id = ANY($1::int[])
        AND status = 'Active'
      RETURNING id
    `, [userIds]);
    return result.rows.map((r) => r.id);
  }

  static async countActiveByUser(user_id) {
    const result = await db.query(`
      SELECT COUNT(*)::int AS count
      FROM core_job_posting
      WHERE user_id = $1 AND status = 'Active'
    `, [user_id]);
    return result.rows[0].count;
  }
}

export default JobPosting;
