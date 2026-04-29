import db from '../db/connection.js';

class ModerationAction {
  static async create({ moderator_id, target_user_id, entity_type, entity_id, entity_title_snapshot, reason, note }) {
    const result = await db.query(
      `
      INSERT INTO core_moderation_actions
        (moderator_id, target_user_id, entity_type, entity_id, entity_title_snapshot, reason, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [moderator_id, target_user_id, entity_type, entity_id, entity_title_snapshot, reason, note]
    );
    return result.rows[0];
  }

  static async getUndismissedByUser(target_user_id) {
    const result = await db.query(
      `
      SELECT a.*, u.username AS moderator_username
      FROM core_moderation_actions a
      LEFT JOIN master_users u ON a.moderator_id = u.id
      WHERE a.target_user_id = $1 AND a.dismissed_at IS NULL
      ORDER BY a.created_at DESC
    `,
      [target_user_id]
    );
    return result.rows;
  }

  static async dismiss(id, target_user_id) {
    const result = await db.query(
      `
      UPDATE core_moderation_actions
      SET dismissed_at = NOW()
      WHERE id = $1 AND target_user_id = $2 AND dismissed_at IS NULL
      RETURNING *
    `,
      [id, target_user_id]
    );
    return result.rows[0];
  }
}

export default ModerationAction;
