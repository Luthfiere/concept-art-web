import db from '../db/connection.js';

class MessageAttachment {
  static async getByMessageId(message_id) {
    const result = await db.query(`
      SELECT *
      FROM core_message_attachments
      WHERE message_id = $1
      ORDER BY created_at ASC
    `, [message_id]);
    return result.rows;
  }

  static async create({ message_id, attachment_type, media }) {
    const result = await db.query(`
      INSERT INTO core_message_attachments (message_id, attachment_type, media)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [message_id, attachment_type, media]);
    return result.rows[0];
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT * FROM core_message_attachments WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM core_message_attachments
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }
}

export default MessageAttachment;