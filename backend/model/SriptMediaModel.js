import db from '../db/connection.js';

class ScriptingMedia {
  static async getByQuestionId(question_id) {
    const result = await db.query(`
      SELECT *
      FROM core_scripting_media
      WHERE question_id = $1
      ORDER BY created_at ASC
    `, [question_id]);
    return result.rows;
  }

  static async create({ question_id, media, original_name }) {
    const result = await db.query(`
      INSERT INTO core_scripting_media (question_id, media, original_name)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [question_id, media, original_name]);
    return result.rows[0];
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT * FROM core_scripting_media WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_scripting_media
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }
}

export default ScriptingMedia;