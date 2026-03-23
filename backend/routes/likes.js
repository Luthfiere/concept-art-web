import express from 'express';
const router = express.Router();

import LikeController from '../controllers/LikeController.js';
import authToken from '../middlewares/authMiddleware.js';

router.get('/:entity_type/:entity_id', LikeController.getByEntityId);
router.get('/:entity_type/:entity_id/status', authToken, LikeController.isLiked);

router.post('/', authToken, LikeController.like);

router.delete('/', authToken, LikeController.unlike);

export default router;
