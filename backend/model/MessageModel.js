import db from '../db/connection.js';

class Message {

  static async getByConversationId(conversation_id, { limit = 50, offset = 0 }) {
    const result = await db.query(`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.message,
        m.is_read,
        m.created_at,
        u.username AS sender_username
      FROM core_messages m
      JOIN master_users u ON u.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      LIMIT $2 OFFSET $3
    `, [conversation_id, limit, offset]);

    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.message,
        m.is_read,
        m.created_at,
        u.username AS sender_username
      FROM core_messages m
      JOIN master_users u ON u.id = m.sender_id
      WHERE m.id = $1
    `, [id]);

    return result.rows[0];
  }

  static async create({ conversation_id, sender_id, message }) {
    const result = await db.query(`
      INSERT INTO core_messages (conversation_id, sender_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [conversation_id, sender_id, message]);

    const messageId = result.rows[0].id;
    return await this.getById(messageId);
  }

  static async markAsRead(conversation_id, user_id) {
    const result = await db.query(`
      UPDATE core_messages
      SET is_read = TRUE
      WHERE conversation_id = $1 
      AND sender_id != $2 
      AND is_read = FALSE
      RETURNING *
    `, [conversation_id, user_id]);

    return result.rows;
  }

  static async markSingleAsRead(id, user_id) {
    const result = await db.query(`
      UPDATE core_messages
      SET is_read = TRUE
      WHERE id = $1 AND sender_id != $2
      RETURNING *
    `, [id, user_id]);

    return result.rows[0];
  }

  static async getUnreadCount(user_id) {
    const result = await db.query(`
      SELECT COUNT(*) as count
      FROM core_messages m
      JOIN core_conversations c ON c.id = m.conversation_id
      WHERE (c.user_a_id = $1 OR c.user_b_id = $1)
      AND m.sender_id != $1
      AND m.is_read = FALSE
    `, [user_id]);

    return parseInt(result.rows[0].count);
  }

  static async delete(id, sender_id) {
    const result = await db.query(`
      DELETE FROM core_messages
      WHERE id = $1 AND sender_id = $2
      RETURNING *
    `, [id, sender_id]);

    return result.rows[0];
  }

}

export default Message;