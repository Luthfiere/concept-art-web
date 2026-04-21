import db from '../db/connection.js';

class DevLog {
  static async getAll() {
    const result = await db.query(`
      SELECT 
        dl.*,
        u.username,
        u.id AS author_id,
        COUNT(DISTINCT dll.id) AS like_count,
        COUNT(DISTINCT dlc.id) AS comment_count
      FROM core_dev_log dl
      LEFT JOIN master_users u ON dl.user_id = u.id
      LEFT JOIN core_likes dll ON dl.id = dll.entity_id AND dll.entity_type = 'devlog'
      LEFT JOIN core_comments dlc ON dl.id = dlc.entity_id AND dlc.entity_type = 'devlog'
      WHERE dl.status = 'Published'
      GROUP BY dl.id, u.username, u.id
      ORDER BY dl.created_at DESC
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT 
        dl.*,
        u.username,
        u.id AS author_id,
        COUNT(DISTINCT dll.id) AS like_count,
        COUNT(DISTINCT dlc.id) AS comment_count
      FROM core_dev_log dl
      LEFT JOIN master_users u ON dl.user_id = u.id
      LEFT JOIN core_likes dll ON dl.id = dll.entity_id AND dll.entity_type = 'devlog'
      LEFT JOIN core_comments dlc ON dl.id = dlc.entity_id AND dlc.entity_type = 'devlog'
      WHERE dl.id = $1
      GROUP BY dl.id, u.username, u.id
    `, [id]);
    return result.rows[0];
  }

  static async getByUser(user_id) {
    const result = await db.query(`
      SELECT 
        dl.*,
        u.username,
        u.id AS author_id,
        COUNT(DISTINCT dll.id) AS like_count,
        COUNT(DISTINCT dlc.id) AS comment_count
      FROM core_dev_log dl
      LEFT JOIN master_users u ON dl.user_id = u.id
      LEFT JOIN core_likes dll ON dl.id = dll.entity_id AND dll.entity_type = 'devlog'
      LEFT JOIN core_comments dlc ON dl.id = dlc.entity_id AND dlc.entity_type = 'devlog'
      WHERE dl.user_id = $1
      GROUP BY dl.id, u.username, u.id
      ORDER BY dl.created_at DESC
    `, [user_id]);
    return result.rows;
  }

  static async getByUserPublic(user_id) {
    const result = await db.query(`
      SELECT
        dl.*,
        u.username,
        u.id AS author_id,
        COUNT(DISTINCT dll.id) AS like_count,
        COUNT(DISTINCT dlc.id) AS comment_count
      FROM core_dev_log dl
      LEFT JOIN master_users u ON dl.user_id = u.id
      LEFT JOIN core_likes dll ON dl.id = dll.entity_id AND dll.entity_type = 'devlog'
      LEFT JOIN core_comments dlc ON dl.id = dlc.entity_id AND dlc.entity_type = 'devlog'
      WHERE dl.user_id = $1 AND dl.status = 'Published'
      GROUP BY dl.id, u.username, u.id
      ORDER BY dl.created_at DESC
    `, [user_id]);
    return result.rows;
  }

  static async getByCategory(category) {
    const result = await db.query(`
      SELECT 
        dl.*,
        u.username,
        u.id AS author_id,
        COUNT(DISTINCT dll.id) AS like_count,
        COUNT(DISTINCT dlc.id) AS comment_count
      FROM core_dev_log dl
      LEFT JOIN master_users u ON dl.user_id = u.id
      LEFT JOIN core_likes dll ON dl.id = dll.entity_id AND dll.entity_type = 'devlog'
      LEFT JOIN core_comments dlc ON dl.id = dlc.entity_id AND dlc.entity_type = 'devlog'
      WHERE dl.category = $1 AND dl.status = 'Published'
      GROUP BY dl.id, u.username, u.id
      ORDER BY dl.created_at DESC
    `, [category]);
    return result.rows;
  }

  static async create({ user_id, title, content, cover_image, category, genre, tag, status }) {
    const result = await db.query(`
      INSERT INTO core_dev_log
        (user_id, title, content, cover_image, category, genre, tag, status)
      VALUES
        ($1, $2, $3, $4,
         COALESCE($5, 'devlog')::dev_log_category,
         $6,
         $7,
         COALESCE($8, 'Draft')::dev_log_status)
      RETURNING *
    `, [user_id, title, content, cover_image, category, genre, tag, status]);
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
      UPDATE core_dev_log
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `, [...values, id]);

    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_dev_log
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }

  static async incrementViews(id) {
    const result = await db.query(`
      UPDATE core_dev_log
      SET views = COALESCE(views, 0) + 1
      WHERE id = $1
      RETURNING views
    `, [id]);
    return result.rows[0];
  }
}

export default DevLog;