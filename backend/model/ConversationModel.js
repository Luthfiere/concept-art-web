import db from '../db/connection.js';

class Conversation {

  static async getAll(user_id, { limit = 20, offset = 0 }) {
    const result = await db.query(`
      SELECT
        c.id,
        c.user_a_id,
        c.user_b_id,
        c.created_at,
        c.updated_at,
        CASE WHEN c.user_a_id = $1 THEN user_b.id ELSE user_a.id END AS other_user_id,
        CASE WHEN c.user_a_id = $1 THEN user_b.username ELSE user_a.username END AS other_user_username,
        CASE WHEN c.user_a_id = $1 THEN user_b.profile_image ELSE user_a.profile_image END AS other_user_profile_image,
        CASE WHEN c.user_a_id = $1 THEN user_b.collaboration_status ELSE user_a.collaboration_status END AS other_user_collaboration_status,
        (
          SELECT message
          FROM core_messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT created_at
          FROM core_messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
        ) AS last_message_time,
        (
          SELECT COUNT(*)
          FROM core_messages
          WHERE conversation_id = c.id
          AND sender_id != $1
          AND is_read = FALSE
        ) AS unread_count
      FROM core_conversations c
      JOIN master_users user_a ON user_a.id = c.user_a_id
      JOIN master_users user_b ON user_b.id = c.user_b_id
      WHERE c.user_a_id = $1 OR c.user_b_id = $1
      ORDER BY COALESCE(
        (SELECT created_at FROM core_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1),
        c.created_at
      ) DESC
      LIMIT $2 OFFSET $3
    `, [user_id, limit, offset]);

    return result.rows;
  }

  static async getById(id, user_id) {
    const result = await db.query(`
      SELECT
        c.id,
        c.user_a_id,
        c.user_b_id,
        c.created_at,
        c.updated_at,
        CASE WHEN c.user_a_id = $2 THEN user_b.id ELSE user_a.id END AS other_user_id,
        CASE WHEN c.user_a_id = $2 THEN user_b.username ELSE user_a.username END AS other_user_username,
        CASE WHEN c.user_a_id = $2 THEN user_b.profile_image ELSE user_a.profile_image END AS other_user_profile_image,
        CASE WHEN c.user_a_id = $2 THEN user_b.collaboration_status ELSE user_a.collaboration_status END AS other_user_collaboration_status
      FROM core_conversations c
      JOIN master_users user_a ON user_a.id = c.user_a_id
      JOIN master_users user_b ON user_b.id = c.user_b_id
      WHERE c.id = $1 AND (c.user_a_id = $2 OR c.user_b_id = $2)
    `, [id, user_id]);

    return result.rows[0];
  }

  static async getByUsers(user_a_id, user_b_id) {
    const result = await db.query(`
      SELECT *
      FROM core_conversations
      WHERE user_a_id = $1 AND user_b_id = $2
    `, [user_a_id, user_b_id]);

    return result.rows[0];
  }

  static async create({ user_a_id, user_b_id }) {
    const result = await db.query(`
      INSERT INTO core_conversations (user_a_id, user_b_id)
      VALUES ($1, $2)
      RETURNING *
    `, [user_a_id, user_b_id]);

    const conversationId = result.rows[0].id;
    return await this.getById(conversationId, user_a_id);
  }

  static async updateTimestamp(id) {
    const result = await db.query(`
      UPDATE core_conversations
      SET updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    return result.rows[0];
  }

  static async delete(id, user_id) {
    const result = await db.query(`
      DELETE FROM core_conversations
      WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2)
      RETURNING *
    `, [id, user_id]);

    return result.rows[0];
  }

}

export default Conversation;
