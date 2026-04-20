import db from '../db/connection.js';

class JobReport {
  static async create({ job_id, reporter_id, reason, note }) {
    const result = await db.query(
      `
      INSERT INTO core_job_reports (job_id, reporter_id, reason, note)
      VALUES ($1, $2, $3, $4)
      RETURNING id, job_id, reason, note, created_at
    `,
      [job_id, reporter_id, reason, note]
    );
    return result.rows[0];
  }

  static async countByJobId(job_id) {
    const result = await db.query(
      `SELECT COUNT(*)::int AS count FROM core_job_reports WHERE job_id = $1`,
      [job_id]
    );
    return result.rows[0].count;
  }

  static async existsForReporter(job_id, reporter_id) {
    const result = await db.query(
      `SELECT 1 FROM core_job_reports WHERE job_id = $1 AND reporter_id = $2 LIMIT 1`,
      [job_id, reporter_id]
    );
    return result.rowCount > 0;
  }

  static async reasonBreakdown(job_id) {
    const result = await db.query(
      `
      SELECT reason, COUNT(*)::int AS count
      FROM core_job_reports
      WHERE job_id = $1
      GROUP BY reason
      ORDER BY count DESC
    `,
      [job_id]
    );
    return result.rows;
  }
}

export default JobReport;
