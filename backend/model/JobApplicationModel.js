import db from '../db/connection.js';

class JobApplication {
  static async getById(id) {
    const result = await db.query(`
      SELECT *
      FROM core_job_applications
      WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getByJobId(job_id) {
    const result = await db.query(`
      SELECT *
      FROM core_job_applications
      WHERE job_id = $1
      ORDER BY applied_at DESC
    `, [job_id]);
    return result.rows;
  }

  static async getByApplicant(applicant_id) {
    const result = await db.query(`
      SELECT *
      FROM core_job_applications
      WHERE applicant_id = $1
      ORDER BY applied_at DESC
    `, [applicant_id]);
    return result.rows;
  }

  static async getByJobAndApplicant({ job_id, applicant_id }) {
    const result = await db.query(`
      SELECT *
      FROM core_job_applications
      WHERE job_id = $1 AND applicant_id = $2
    `, [job_id, applicant_id]);
    return result.rows[0];
  }

  static async create({ job_id, applicant_id, cover_letter, cv }) {
    const result = await db.query(`
      INSERT INTO core_job_applications
      (job_id, applicant_id, cover_letter, cv)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [job_id, applicant_id, cover_letter, cv]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await db.query(`
      UPDATE core_job_applications
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_job_applications
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }
}

export default JobApplication;
