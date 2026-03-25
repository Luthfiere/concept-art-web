import db from '../../db/connection.js';
// data
import usersData from '../data/users.js';
import { conceptArtsData, artMediaData } from '../data/concept-arts.js';


const seed = async () => {
  await db.query('BEGIN');

  try {
    await db.query('DELETE FROM master_users');

    // 1. users
    for (const user of usersData) {
      await db.query(
        `INSERT INTO master_users (id, email, username, password, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, user.email, user.username, user.password, user.role]
      );
    }

    // 2. concept arts
    for (const art of conceptArtsData) {
      await db.query(
        `INSERT INTO core_concept_art (id, user_id, title, description, status, tag, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [art.id, art.user_id, art.title, art.description, art.status, art.tag, art.category]
      );
    }

    // 3. art media
    for (const media of artMediaData) {
      await db.query(
        `INSERT INTO core_art_media (id, art_id, media)
         VALUES ($1, $2, $3)`,
        [media.id, media.art_id, media.media]
      );
    }

    await db.query('COMMIT');
    console.log('Seed completed successfully');

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Seed failed:', err);
    throw err;
  }
};


export default seed;
