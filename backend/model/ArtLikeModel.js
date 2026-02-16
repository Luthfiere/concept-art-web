import db from '../db/connection.js';

class ArtLike {

  static async getByUserIdAndArtId({ art_id, user_id }) {
    const result = await db.query(`
      SELECT *
      FROM core_art_likes
      WHERE art_id = $1 AND user_id = $2
    `, [art_id, user_id]);

    return result.rows[0];
  }

  static async getByArtId(art_id) {
    const result = await db.query(`
      SELECT *
      FROM core_art_likes
      WHERE art_id = $1
    `, [art_id]);

    return result.rows;
  }

  static async getCountByArtId(art_id) {
    const result = await db.query(`
      SELECT COUNT(*) as count
      FROM core_art_likes
      WHERE art_id = $1
    `, [art_id]);

    return parseInt(result.rows[0].count);
  }

  static async create({ art_id, user_id }) {
    const result = await db.query(`
      INSERT INTO core_art_likes (art_id, user_id)
      VALUES ($1, $2)
      RETURNING *
    `, [art_id, user_id]);

    return result.rows[0];
  }  

  static async delete({ art_id, user_id }) {
    const result = await db.query(`
      DELETE FROM core_art_likes
      WHERE art_id = $1 AND user_id = $2
      RETURNING *
    `, [art_id, user_id]);

    return result.rows[0];
  }

}

export default ArtLike;