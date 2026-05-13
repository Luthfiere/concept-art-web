import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import db from '../db/connection.js';
import Subscription from '../model/SubscriptionModel.js';
import User from '../model/UserModel.js';
import JobPosting from '../model/JobPostingModel.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV = process.env.NODE_ENV || 'development';
const envFile = ENV === 'development' ? '.env.dev' : `.env.${ENV}`;
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

const MONTHLY_DURATION_DAYS = 30;
const PER_POST_TTL_DAYS = 90;

const DURATION_BY_PLAN = {
  pro_monthly:        MONTHLY_DURATION_DAYS,
  corporate_monthly:  MONTHLY_DURATION_DAYS,
  pro_per_post:       PER_POST_TTL_DAYS,
  corporate_per_post: PER_POST_TTL_DAYS,
};

const PLAN_CATALOG = {
  pro_monthly:        { amount: 49000,  role: 'pro',       postsRemaining: null },
  corporate_monthly:  { amount: 249000, role: 'corporate', postsRemaining: null },
  pro_per_post:       { amount: 25000,  role: 'pro',       postsRemaining: 1 },
  corporate_per_post: { amount: 75000,  role: 'corporate', postsRemaining: 1 },
};

class SubscriptionController {

  static async getPlans(req, res) {
    return res.status(200).json({
      message: 'Subscription plans',
      data: Object.entries(PLAN_CATALOG).map(([key, v]) => ({
        plan: key,
        amount: v.amount,
        currency: 'IDR',
        role: v.role,
        posts_remaining: v.postsRemaining,
      })),
    });
  }

  static async getMine(req, res) {
    try {
      const { user_id } = req.user;
      const active = await Subscription.getActiveForUser(user_id);
      const latest = active || await Subscription.getLatestForUser(user_id);
      return res.status(200).json({
        message: 'Your subscription',
        data: latest ? {
          id: latest.id,
          plan: latest.plan,
          status: latest.status,
          active_from: latest.active_from,
          active_until: latest.active_until,
          posts_remaining: latest.posts_remaining,
          is_active: !!active,
        } : null,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async checkout(req, res) {
    const client = await db.connect();
    try {
      const { user_id } = req.user;
      const { plan } = req.body;

      if (!plan || !PLAN_CATALOG[plan]) {
        return res.status(400).json({ message: 'Invalid plan' });
      }

      const { amount, role, postsRemaining } = PLAN_CATALOG[plan];

      await client.query('BEGIN');

      const existing = await Subscription.getActiveForUser(user_id);
      if (existing) {
        if (existing.plan === plan) {
          await client.query('ROLLBACK');
          return res.status(409).json({
            message: 'You already have this plan active',
            data: { subscription_id: existing.id, active_until: existing.active_until },
          });
        }
        // Different plan — auto-expire the old one so we never have two paid rows for one user
        await Subscription.expireById(existing.id);
      }

      const createdSub = await Subscription.create({
        user_id,
        plan,
        amount,
        currency: 'IDR',
        posts_remaining: postsRemaining,
      });

      const paidSub = await Subscription.markPaid(createdSub.id, DURATION_BY_PLAN[plan]);
      await User.update(user_id, { role });

      await client.query('COMMIT');

      logger.info(`Demo subscription ${paidSub.id} granted — user ${user_id} → ${role} until ${paidSub.active_until}`);

      return res.status(201).json({
        message: 'Subscription activated',
        data: {
          subscription_id: paidSub.id,
          plan: paidSub.plan,
          role,
          active_until: paidSub.active_until,
          posts_remaining: paidSub.posts_remaining,
        },
      });
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch {}
      logger.error(`Demo checkout failed: ${err.message}`);
      return res.status(500).json({ message: err.message });
    } finally {
      client.release();
    }
  }

  static async cancel(req, res) {
    try {
      const { user_id } = req.user;
      const active = await Subscription.getActiveForUser(user_id);
      if (!active) {
        return res.status(404).json({ message: 'No active subscription to cancel' });
      }
      const expired = await Subscription.expireById(active.id);
      const demotedIds = await User.demoteIfNoActiveSub([user_id]);
      if (demotedIds.length > 0) {
        await JobPosting.expireActiveByUsers(demotedIds);
      }
      logger.info(`Subscription ${expired.id} cancelled by user ${user_id}; demoted=${demotedIds.length > 0}`);
      return res.status(200).json({
        message: 'Subscription canceled',
        data: { subscription_id: expired.id, demoted: demotedIds.length > 0 },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async history(req, res) {
    try {
      const { user_id } = req.user;
      const rows = await Subscription.getHistoryForUser(user_id);
      return res.status(200).json({ message: 'Subscription history', total: rows.length, data: rows });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default SubscriptionController;
