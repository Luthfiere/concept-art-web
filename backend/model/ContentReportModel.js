import db from '../db/connection.js';

class ContentReport {
  static async create({ entity_type, entity_id, reporter_id, reason, note }) {
    const result = await db.query(
      `
      INSERT INTO core_content_reports (entity_type, entity_id, reporter_id, reason, note)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, entity_type, entity_id, reason, note, created_at
    `,
      [entity_type, entity_id, reporter_id, reason, note]
    );
    return result.rows[0];
  }

  static async deleteByEntity(entity_type, entity_id) {
    await db.query(
      `DELETE FROM core_content_reports WHERE entity_type = $1 AND entity_id = $2`,
      [entity_type, entity_id]
    );
  }

  // Returns one row per reported entity, with report count, distinct reasons, the
  // entity's title + author. Joins LATERAL on the right entity table by type.
  static async getQueueGrouped() {
    const result = await db.query(`
      WITH reports AS (
        SELECT
          entity_type::text AS entity_type,
          entity_id,
          COUNT(*)::int AS report_count,
          MAX(created_at) AS last_reported_at,
          ARRAY_AGG(reason::text) AS reasons,
          ARRAY_AGG(note ORDER BY created_at DESC) FILTER (WHERE note IS NOT NULL AND note <> '') AS notes
        FROM core_content_reports
        GROUP BY entity_type, entity_id
      )
      SELECT r.entity_type, r.entity_id, r.report_count, r.last_reported_at, r.reasons, r.notes,
             COALESCE(ca.title, dl.title, jp.title) AS title,
             COALESCE(ca.user_id, dl.user_id, jp.user_id) AS author_id,
             COALESCE(ca_u.username, dl_u.username, jp_u.username) AS author_username,
             ca.category AS art_category,
             (SELECT m.media FROM core_art_media m WHERE m.art_id = ca.id ORDER BY m.id ASC LIMIT 1) AS art_thumbnail,
             dl.cover_image AS devlog_cover
      FROM reports r
      LEFT JOIN core_concept_art ca ON r.entity_type = 'art'    AND ca.id = r.entity_id
      LEFT JOIN master_users    ca_u ON ca.user_id = ca_u.id
      LEFT JOIN core_dev_log    dl ON r.entity_type = 'devlog' AND dl.id = r.entity_id
      LEFT JOIN master_users    dl_u ON dl.user_id = dl_u.id
      LEFT JOIN core_job_posting jp ON r.entity_type = 'job'    AND jp.id = r.entity_id
      LEFT JOIN master_users    jp_u ON jp.user_id = jp_u.id
      ORDER BY r.report_count DESC, r.last_reported_at DESC
    `);
    return result.rows;
  }
}

export default ContentReport;
