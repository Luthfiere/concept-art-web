import express from 'express';
const router = express.Router();

import CommentController from '../controllers/CommentController.js';
import authToken from '../middlewares/authMiddleware.js';

router.get('/:entity_type/:entity_id', CommentController.getByEntityId);
router.get('/detail/:id', CommentController.getById);

router.post('/:entity_type/:entity_id', authToken, CommentController.create);

router.put('/:id', authToken, CommentController.update);

router.delete('/:id', authToken, CommentController.delete);

export default router;
