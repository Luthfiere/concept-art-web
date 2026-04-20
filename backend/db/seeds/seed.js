import db from '../../db/connection.js';
// data
import usersData from '../data/users.js';
import { conceptArtsData } from '../data/concept-arts.js';
import { artMediaData } from '../data/art-media.js';
import { likesData } from '../data/likes.js';
import { commentsData } from '../data/comments.js';
import { jobPostingsData } from '../data/job-postings.js';


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

    // 4. likes
    for (const like of likesData) {
      await db.query(
        `INSERT INTO core_likes (id, entity_type, entity_id, user_id)
         VALUES ($1, $2, $3, $4)`,
        [like.id, like.entity_type, like.entity_id, like.user_id]
      );
    }

    // 5. comments
    for (const comment of commentsData) {
      await db.query(
        `INSERT INTO core_comments (id, entity_type, entity_id, user_id, comment)
         VALUES ($1, $2, $3, $4, $5)`,
        [comment.id, comment.entity_type, comment.entity_id, comment.user_id, comment.comment]
      );
    }

    // 6. job postings
    for (const job of jobPostingsData) {
      await db.query(
        `INSERT INTO core_job_posting
         (id, user_id, title, description, job_location, work_option, work_type, salary_min, salary_max, salary_currency, status, expired_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          job.id,
          job.user_id,
          job.title,
          job.description,
          job.job_location,
          job.work_option,
          job.work_type,
          job.salary_min,
          job.salary_max,
          job.salary_currency,
          job.status,
          job.expired_at,
        ]
      );
    }

    // 7. survey subscriptions — auto-provision 2-year 'paid' plans for any user seeded
    // as pro/corporate so invited thesis testers can post immediately without Midtrans.
    for (const user of usersData) {
      if (user.role === 'pro' || user.role === 'corporate') {
        const plan = user.role === 'pro' ? 'pro_monthly' : 'corporate_monthly';
        const amount = user.role === 'pro' ? 49000 : 249000;
        await db.query(
          `INSERT INTO core_subscriptions
           (user_id, plan, amount, currency, midtrans_order_id, status, active_from, active_until)
           VALUES ($1, $2::subscription_plan, $3, 'IDR', $4, 'paid', NOW(), NOW() + INTERVAL '2 years')`,
          [user.id, plan, amount, `survey-seed-${user.id}`]
        );
      }
    }

    // Reset sequences so new inserts don't collide with seed IDs
    await db.query(`SELECT setval('master_users_id_seq', (SELECT MAX(id) FROM master_users))`);
    await db.query(`SELECT setval('core_concept_art_id_seq', (SELECT MAX(id) FROM core_concept_art))`);
    await db.query(`SELECT setval('core_art_media_id_seq', (SELECT MAX(id) FROM core_art_media))`);
    await db.query(`SELECT setval('core_likes_id_seq', (SELECT MAX(id) FROM core_likes))`);
    await db.query(`SELECT setval('core_comments_id_seq', (SELECT MAX(id) FROM core_comments))`);
    await db.query(`SELECT setval('core_job_posting_id_seq', (SELECT MAX(id) FROM core_job_posting))`);
    await db.query(`SELECT setval('core_subscriptions_id_seq', COALESCE((SELECT MAX(id) FROM core_subscriptions), 1))`);

    await db.query('COMMIT');
    console.log('Seed completed successfully');

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Seed failed:', err);
    throw err;
  }
};


export default seed;
