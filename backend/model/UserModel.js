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
