import db from '../db/connection.js';

class Like {
  static async getByEntityId(entityType, entityId) {
    const result = await db.query(`
      SELECT l.*, u.username
      FROM core_likes l
      LEFT JOIN master_users u ON l.user_id = u.id
      WHERE l.entity_type = $1 AND l.entity_id = $2
    `, [entityType, entityId]);
    return result.rows;
  }

  static async isLiked(entityType, entityId, userId) {
    const result = await db.query(`
      SELECT id FROM core_likes
      WHERE entity_type = $1 AND entity_id = $2 AND user_id = $3
    `, [entityType, entityId, userId]);
    return result.rows[0] || null;
  }

  static async like(entityType, entityId, userId) {
    const result = await db.query(`
      INSERT INTO core_likes (entity_type, entity_id, user_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (entity_type, entity_id, user_id) DO NOTHING
      RETURNING *
    `, [entityType, entityId, userId]);
    return result.rows[0];
  }

  static async unlike(entityType, entityId, userId) {
    const result = await db.query(`
      DELETE FROM core_likes
      WHERE entity_type = $1 AND entity_id = $2 AND user_id = $3
      RETURNING *
    `, [entityType, entityId, userId]);
    return result.rows[0];
  }

  static async getCount(entityType, entityId) {
    const result = await db.query(`
      SELECT COUNT(*) AS count FROM core_likes
      WHERE entity_type = $1 AND entity_id = $2
    `, [entityType, entityId]);
    return parseInt(result.rows[0].count);
  }
}

export default Like;
