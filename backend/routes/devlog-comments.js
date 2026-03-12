import express from 'express';
const router = express.Router();

import DevLogCommentController from '../controllers/DevlogCommentController.js';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken);

router.get('/log/:log_id', DevLogCommentController.getByLogId);
router.get('/:id', DevLogCommentController.getById);

router.post('/log/:log_id', DevLogCommentController.create);

router.put('/:id', DevLogCommentController.update);

router.delete('/:id', DevLogCommentController.delete);

export default router;