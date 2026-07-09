import db from '../db/connection.js';

class ScriptingQuestion {
  static async getAll() {
    const result = await db.query(`
      SELECT sq.*, u.username
      FROM core_scripting_questions sq
      LEFT JOIN master_users u ON sq.user_id = u.id
      ORDER BY sq.created_at DESC
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT sq.*, u.username
      FROM core_scripting_questions sq
      LEFT JOIN master_users u ON sq.user_id = u.id
      WHERE sq.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getByUser(user_id) {
    const result = await db.query(`
      SELECT *
      FROM core_scripting_questions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [user_id]);
    return result.rows;
  }

  static async create({ user_id, title, content, code_snippet, tag }) {
    const result = await db.query(`
      INSERT INTO core_scripting_questions (user_id, title, content, code_snippet, tag)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [user_id, title, content, code_snippet, tag]);
    return result.rows[0];
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    if (keys.length === 0) return null;

    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

    const result = await db.query(`
      UPDATE core_scripting_questions
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `, [...values, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_scripting_questions
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }

  static async incrementViews(id) {
    const result = await db.query(`
      UPDATE core_scripting_questions
      SET views = COALESCE(views, 0) + 1
      WHERE id = $1
      RETURNING views
    `, [id]);
    return result.rows[0];
  }
}

export default ScriptingQuestion;