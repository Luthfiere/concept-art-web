import express from 'express';
const router = express.Router();

import MessageController from '../controllers/MessageController.js';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken);

router.get('/unread-count', MessageController.getUnreadCount);
router.get('/conversation/:conversation_id', MessageController.getByConversationId);
router.get('/:id', MessageController.getById);

router.post('/conversation/:conversation_id', MessageController.create);

router.delete('/:id', MessageController.delete);

export default router;