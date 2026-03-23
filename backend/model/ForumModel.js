import db from '../db/connection.js';

class Forum {
  static async getAll() {
    const result = await db.query(`
      SELECT
        fp.*,
        u.username,
        u.id AS author_id,
        COUNT(DISTINCT l.id) AS like_count,
        COUNT(DISTINCT c.id) AS comment_count
      FROM core_community_page fp
      LEFT JOIN master_users u ON fp.user_id = u.id
      LEFT JOIN core_likes l ON fp.id = l.entity_id AND l.entity_type = 'forum'
      LEFT JOIN core_comments c ON fp.id = c.entity_id AND c.entity_type = 'forum'
      GROUP BY fp.id, u.username, u.id
      ORDER BY fp.created_at DESC
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT
        fp.*,
        u.username,
        u.id AS author_id,
        COUNT(DISTINCT l.id) AS like_count,
        COUNT(DISTINCT c.id) AS comment_count
      FROM core_community_page fp
      LEFT JOIN master_users u ON fp.user_id = u.id
      LEFT JOIN core_likes l ON fp.id = l.entity_id AND l.entity_type = 'forum'
      LEFT JOIN core_comments c ON fp.id = c.entity_id AND c.entity_type = 'forum'
      WHERE fp.id = $1
      GROUP BY fp.id, u.username, u.id
    `, [id]);
    return result.rows[0];
  }

  static async getByUser(userId) {
    const result = await db.query(`
      SELECT
        fp.*,
        u.username,
        u.id AS author_id,
        COUNT(DISTINCT l.id) AS like_count,
        COUNT(DISTINCT c.id) AS comment_count
      FROM core_community_page fp
      LEFT JOIN master_users u ON fp.user_id = u.id
      LEFT JOIN core_likes l ON fp.id = l.entity_id AND l.entity_type = 'forum'
      LEFT JOIN core_comments c ON fp.id = c.entity_id AND c.entity_type = 'forum'
      WHERE fp.user_id = $1
      GROUP BY fp.id, u.username, u.id
      ORDER BY fp.created_at DESC
    `, [userId]);
    return result.rows;
  }

  static async create({ user_id, title, description, type, image }) {
    const result = await db.query(`
      INSERT INTO core_community_page (user_id, title, description, type, image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [user_id, title, description, type, image]);
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
      UPDATE core_community_page
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `, [...values, id]);

    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_community_page
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }
}

export default Forum;
