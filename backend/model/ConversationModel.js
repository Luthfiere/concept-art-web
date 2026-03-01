import db from '../db/connection.js';

class Conversation {

  static async getAll(user_id, { limit = 20, offset = 0 }) {
    const result = await db.query(`
      SELECT 
        c.id,
        c.art_id,
        c.sender_id,
        c.receiver_id,
        c.created_at,
        c.updated_at,
        ca.title AS art_title,
        ca.category AS art_category,
        CASE 
          WHEN c.sender_id = $1 THEN receiver_user.id
          ELSE sender_user.id
        END AS other_user_id,
        CASE 
          WHEN c.sender_id = $1 THEN receiver_user.username
          ELSE sender_user.username
        END AS other_user_username,
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
      JOIN master_users sender_user ON sender_user.id = c.sender_id
      JOIN master_users receiver_user ON receiver_user.id = c.receiver_id
      JOIN core_concept_art ca ON ca.id = c.art_id
      WHERE c.sender_id = $1 OR c.receiver_id = $1
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
        c.art_id,
        c.sender_id,
        c.receiver_id,
        c.created_at,
        c.updated_at,
        ca.title AS art_title,
        ca.category AS art_category,
        sender_user.username AS sender_username,
        receiver_user.username AS receiver_username,
        CASE 
          WHEN c.sender_id = $2 THEN receiver_user.id
          ELSE sender_user.id
        END AS other_user_id,
        CASE 
          WHEN c.sender_id = $2 THEN receiver_user.username
          ELSE sender_user.username
        END AS other_user_username
      FROM core_conversations c
      JOIN master_users sender_user ON sender_user.id = c.sender_id
      JOIN master_users receiver_user ON receiver_user.id = c.receiver_id
      JOIN core_concept_art ca ON ca.id = c.art_id
      WHERE c.id = $1 AND (c.sender_id = $2 OR c.receiver_id = $2)
    `, [id, user_id]);

    return result.rows[0];
  }

  static async getByArtAndUsers({ art_id, sender_id, receiver_id }) {
    const result = await db.query(`
      SELECT *
      FROM core_conversations
      WHERE art_id = $1 
      AND (
        (sender_id = $2 AND receiver_id = $3) OR 
        (sender_id = $3 AND receiver_id = $2)
      )
    `, [art_id, sender_id, receiver_id]);

    return result.rows[0];
  }

  static async create({ art_id, sender_id, receiver_id }) {
    const result = await db.query(`
      INSERT INTO core_conversations (art_id, sender_id, receiver_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [art_id, sender_id, receiver_id]);

    const conversationId = result.rows[0].id;
    return await this.getById(conversationId, sender_id);
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
      WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)
      RETURNING *
    `, [id, user_id]);

    return result.rows[0];
  }

}

export default Conversation;