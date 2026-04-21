import express from 'express';
const router = express.Router();

import SubscriptionController from '../controllers/SubscriptionController.js';
import authToken from '../middlewares/authMiddleware.js';

// Public
router.get('/plans', SubscriptionController.getPlans);

// Authenticated user routes
router.get('/', authToken, SubscriptionController.getMine);
router.post('/checkout', authToken, SubscriptionController.checkout);

export default router;