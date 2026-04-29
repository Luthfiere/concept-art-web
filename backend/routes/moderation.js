import express from 'express';
const router = express.Router();

import ModerationController from '../controllers/ModerationController.js';
import authToken from '../middlewares/authMiddleware.js';
import authorizeRole from '../middlewares/roleMiddleware.js';

router.use(authToken);
router.use(authorizeRole('moderator'));

router.get('/queue', ModerationController.getQueue);
router.delete('/:entity_type/:entity_id', ModerationController.deleteEntity);

export default router;
