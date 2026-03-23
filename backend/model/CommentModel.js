import db from '../db/connection.js';

class Comment {
  static async getByEntityId(entityType, entityId) {
    const result = await db.query(`
      SELECT c.*, u.username
      FROM core_comments c
      LEFT JOIN master_users u ON c.user_id = u.id
      WHERE c.entity_type = $1 AND c.entity_id = $2
      ORDER BY c.created_at ASC
    `, [entityType, entityId]);
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT c.*, u.username
      FROM core_comments c
      LEFT JOIN master_users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async create(entityType, entityId, userId, comment) {
    const result = await db.query(`
      INSERT INTO core_comments (entity_type, entity_id, user_id, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [entityType, entityId, userId, comment]);
    return result.rows[0];
  }

  static async update(id, comment) {
    const result = await db.query(`
      UPDATE core_comments
      SET comment = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [comment, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_comments
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }
}

export default Comment;
