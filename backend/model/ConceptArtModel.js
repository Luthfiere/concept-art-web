import db from '../db/connection.js';

class ConceptArt {
  static async getAll() {
    const result = await db.query(`
      SELECT *
      FROM core_concept_art
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT *
      FROM core_concept_art
      WHERE id = $1
    `, [id]);
    return result.rows[0];
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

  static async create({ user_id, title, description, status, tag }) {
    const result = await db.query(`
      INSERT INTO core_concept_art
      (user_id, title, description, status, tag)
      VALUES ($1, $2, $3, COALESCE($4, 'Open')::status_type, $5)
      RETURNING *
    `, [user_id, title, description, status, tag]);

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
}

export default ConceptArt;
