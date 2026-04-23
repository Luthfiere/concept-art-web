import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import Subscription from '../model/SubscriptionModel.js';
import User from '../model/UserModel.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV = process.env.NODE_ENV || 'development';
const envFile = ENV === 'development' ? '.env.dev' : `.env.${ENV}`;
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

const SUBSCRIPTION_DURATION_DAYS = 180;

const PLAN_CATALOG = {
  pro_monthly:       { amount: 49000,  role: 'pro',       postsRemaining: null },
  corporate_monthly: { amount: 249000, role: 'corporate', postsRemaining: null },
  pro_per_post:      { amount: 25000,  role: 'pro',       postsRemaining: 1 },
  corporate_per_post:{ amount: 75000,  role: 'corporate', postsRemaining: 1 },
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
    try {
      const { user_id } = req.user;
      const { plan } = req.body;

      if (!plan || !PLAN_CATALOG[plan]) {
        return res.status(400).json({ message: 'Invalid plan' });
      }

      const { amount, role, postsRemaining } = PLAN_CATALOG[plan];

      const createdSub = await Subscription.create({
        user_id,
        plan,
        amount,
        currency: 'IDR',
        posts_remaining: postsRemaining,
      });

      const paidSub = await Subscription.markPaid(createdSub.id, SUBSCRIPTION_DURATION_DAYS);
      await User.update(user_id, { role });

      logger.info(`Demo subscription ${paidSub.id} granted — user ${user_id} upgraded to ${role} until ${paidSub.active_until}`);

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
      logger.error(`Demo checkout failed: ${err.message}`);
      return res.status(500).json({ message: err.message });
    }
  }
}

export default SubscriptionController;
