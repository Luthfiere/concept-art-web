import express from 'express';
const router = express.Router();

import SubscriptionController from '../controllers/SubscriptionController.js';
import authToken from '../middlewares/authMiddleware.js';

// Public
router.get('/plans', SubscriptionController.getPlans);

// Authenticated user routes
router.get('/', authToken, SubscriptionController.getMine);
router.get('/history', authToken, SubscriptionController.history);
router.post('/checkout', authToken, SubscriptionController.checkout);
router.post('/cancel', authToken, SubscriptionController.cancel);

export default router;