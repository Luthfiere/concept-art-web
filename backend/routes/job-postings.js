import express from 'express';
const router = express.Router();

import JobPostingController from '../controllers/JobPostingController.js';
import authToken from '../middlewares/authMiddleware.js';
import authorizeRole from '../middlewares/roleMiddleware.js';
import { requireActiveSubscription } from '../middlewares/subscriptionMiddleware.js';

// Public reads — anyone can browse job postings without logging in
router.get('/', JobPostingController.getAll);
router.get('/user/:user_id', JobPostingController.getByUser);
router.get('/status/:status', JobPostingController.getByStatus);
router.get('/:id', JobPostingController.getById);

// Writes require auth + role + active subscription
router.post('/', authToken, authorizeRole('pro', 'corporate'), requireActiveSubscription, JobPostingController.create);

router.put('/:id', authToken, authorizeRole('pro', 'corporate'), JobPostingController.update);

router.delete('/:id', authToken, authorizeRole('pro', 'corporate'), JobPostingController.delete);

export default router;
