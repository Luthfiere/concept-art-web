import express from 'express';
const router = express.Router();

import ConversationController from '../controllers/ConversationController.js';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken);

router.get('/', ConversationController.getAll);
router.get('/:id', ConversationController.getById);

router.post('/', ConversationController.create);

router.delete('/:id', ConversationController.delete);

export default router;