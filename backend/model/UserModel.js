import db from '../db/connection.js';

class User {

  static async getAll() {
    const result = await db.query(`
      SELECT * 
      FROM master_users
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(`
      SELECT * 
      FROM master_users 
      WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getByEmail(email) {
    const result = await db.query(`
      SELECT * 
      FROM master_users 
      WHERE email = $1
    `, [email]);
    return result.rows[0];
  }

  static async getByUsername(username) {
    const result = await db.query(`
      SELECT *
      FROM master_users
      WHERE username = $1
    `, [username]);
    return result.rows[0];
  }

  static async getProfile(id) {
    const result = await db.query(`
      SELECT id, username, role, profile_image, collaboration_status
      FROM master_users
      WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  static async create({ email, username, password }) {
    const result = await db.query(`
      INSERT INTO master_users (email, username, password)
      VALUES ($1, $2, $3)
      RETURNING id, email, username, role, profile_image
    `, [email, username, password]);

    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(`
      DELETE FROM master_users 
      WHERE id = $1 
      RETURNING *
    `, [id]);
    return result.rows[0];
  }

  static async demoteIfNoActiveSub(userIds) {
    if (!userIds || userIds.length === 0) return [];
    const result = await db.query(`
      UPDATE master_users
      SET role = 'member'
      WHERE id = ANY($1::int[])
        AND role IN ('pro', 'corporate')
        AND NOT EXISTS (
          SELECT 1 FROM core_subscriptions
          WHERE user_id = master_users.id
            AND status = 'paid'
            AND (
              (active_until IS NOT NULL AND active_until > NOW())
              OR (posts_remaining IS NOT NULL AND posts_remaining > 0)
            )
        )
      RETURNING id
    `, [userIds]);
    return result.rows.map((r) => r.id);
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    if (keys.length === 0) return null;

    const setClause = keys
      .map((k, index) => `${k} = $${index + 1}`)
      .join(', ');

    const result = await db.query(`
      UPDATE master_users 
      SET ${setClause} 
      WHERE id = $${keys.length + 1} 
      RETURNING *
    `, [...values, id]);

    return result.rows[0];
  }
}

export default User;
