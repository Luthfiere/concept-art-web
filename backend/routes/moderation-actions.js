import express from 'express';
const router = express.Router();

import ModerationActionController from '../controllers/ModerationActionController.js';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken);

router.get('/me', ModerationActionController.getMine);
router.patch('/:id/dismiss', ModerationActionController.dismiss);

export default router;
