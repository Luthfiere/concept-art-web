import express from 'express';
const router = express.Router();

import DevLogLikeController from '../controllers/DevlogLikeController.js';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken);

router.get('/log/:log_id', DevLogLikeController.getByLogId);
router.get('/log/:log_id/status', DevLogLikeController.isLiked);

router.post('/', DevLogLikeController.like);

router.delete('/', DevLogLikeController.unlike);

export default router;