import db from '../db/connection.js';

class ArtComment {

  static async getByArtId(art_id) {
    const result = await db.query(`
      SELECT 
        c.id,
        c.art_id,
        c.comment,
        u.id AS user_id,
        u.username
      FROM core_art_comments c
      JOIN master_users u ON u.id = c.user_id
      WHERE c.art_id = $1
      ORDER BY c.id ASC
    `, [art_id]);

    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT 
        c.id,
        c.art_id,
        c.comment,
        u.id AS user_id,
        u.username
      FROM core_art_comments c
      JOIN master_users u ON u.id = c.user_id
      WHERE c.id = $1
    `, [id]);

    return result.rows[0];
  }

  static async create({ art_id, user_id, comment }) {
    const result = await db.query(`
      INSERT INTO core_art_comments (art_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [art_id, user_id, comment]);

    return await this.getById(result.rows[0].id);
  }  

  static async update(id, user_id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    if (keys.length === 0) return null;

    const setClause = keys
      .map((k, i) => `${k} = $${i + 1}`)
      .join(', ');

    const result = await db.query(`
      UPDATE core_art_comments
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2}
      RETURNING *
    `, [...values, id, user_id]);

    if (!result.rows[0]) return null;

    // Return the updated comment with user info
    return await this.getById(result.rows[0].id);
  }

  static async delete(id, user_id) {
    const result = await db.query(`
      DELETE FROM core_art_comments
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [id, user_id]);

    return result.rows[0];
  }

}

export default ArtComment;