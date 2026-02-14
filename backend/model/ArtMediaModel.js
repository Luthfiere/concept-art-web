import db from '../db/connection.js';

class ArtMedia {

  static async getByArtId(art_id) {
    const result = await db.query(`
      SELECT *
      FROM core_art_media
      WHERE art_id = $1
      ORDER BY created_at ASC
    `, [art_id]);
    return result.rows;
  }

  static async create({ art_id, media }) {
    const result = await db.query(`
      INSERT INTO core_art_media (art_id, media)
      VALUES ($1, $2)
      RETURNING *
    `, [art_id, media]);

    return result.rows[0];
  }

  static async deleteByArtId(art_id) {
    const result = await db.query(`
      DELETE FROM core_art_media
      WHERE art_id = $1
      RETURNING *
    `, [art_id]);
    return result.rows;
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_art_media
      WHERE id = $1
      RETURNING *
    `, [id]);
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
      UPDATE core_art_media
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `, [...values, id]);

    return result.rows[0];
  }

}

export default ArtMedia;
