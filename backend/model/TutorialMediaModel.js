import db from '../db/connection.js';

class TutorialMedia {
  static async getByTutorialId(tutorial_id) {
    const result = await db.query(`
      SELECT *
      FROM core_tutorial_media
      WHERE tutorial_id = $1
      ORDER BY created_at ASC
    `, [tutorial_id]);
    return result.rows;
  }

  static async create({ tutorial_id, media }) {
    const result = await db.query(`
      INSERT INTO core_tutorial_media (tutorial_id, media)
      VALUES ($1, $2)
      RETURNING *
    `, [tutorial_id, media]);
    return result.rows[0];
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT * FROM core_tutorial_media WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_tutorial_media
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }
}

export default TutorialMedia;