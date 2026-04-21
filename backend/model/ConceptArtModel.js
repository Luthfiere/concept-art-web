import db from '../db/connection.js';

class ConceptArt {
  static async getAll() {
    const result = await db.query(`
      SELECT ca.*, u.username,
        (SELECT COUNT(*) FROM core_likes WHERE entity_type = 'art' AND entity_id = ca.id) AS likes
      FROM core_concept_art ca
      LEFT JOIN master_users u ON ca.user_id = u.id
      ORDER BY ca.created_at DESC
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT ca.*, u.username
      FROM core_concept_art ca
      LEFT JOIN master_users u ON ca.user_id = u.id
      WHERE ca.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getByCategory(category) {
    const result = await db.query(`
      SELECT ca.*, u.username,
        (SELECT COUNT(*) FROM core_likes WHERE entity_type = 'art' AND entity_id = ca.id) AS likes
      FROM core_concept_art ca
      LEFT JOIN master_users u ON ca.user_id = u.id
      WHERE ca.category = $1
      ORDER BY ca.created_at DESC
    `, [category]);
    return result.rows;
  }

  static async getByUser(user_id) {
    const result = await db.query(`
      SELECT *
      FROM core_concept_art
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [user_id]);
    return result.rows;
  }

  static async create({ user_id, title, description, status, tag, category }) {
    const result = await db.query(`
      INSERT INTO core_concept_art
      (user_id, title, description, status, tag, category)
      VALUES ($1, $2, $3, COALESCE($4, 'Open')::status_type, $5, COALESCE($6, 'art')::art_category)
      RETURNING *
    `, [user_id, title, description, status, tag, category]);

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
      UPDATE core_concept_art
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `, [...values, id]);

    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_concept_art
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }

  static async incrementViews(id) {
    const result = await db.query(`
      UPDATE core_concept_art
      SET views = COALESCE(views, 0) + 1
      WHERE id = $1
      RETURNING views
    `, [id]);
    return result.rows[0];
  }
}

export default ConceptArt;
