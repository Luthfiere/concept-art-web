import Subscription from '../model/SubscriptionModel.js';

export async function requireActiveSubscription(req, res, next) {
  try {
    const { user_id, role } = req.user;

    if (role === 'member') {
      return res.status(403).json({ message: 'Upgrade required to post jobs' });
    }

    const sub = await Subscription.getActiveForUser(user_id);
    if (!sub) {
      return res.status(402).json({ message: 'No active subscription — please renew' });
    }

    if (sub.plan === 'single_post') {
      req._perPostSub = sub;
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
