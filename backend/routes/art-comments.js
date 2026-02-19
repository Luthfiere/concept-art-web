import express from 'express';
const router = express.Router();

import ArtCommentController from '../controllers/ArtCommentController.js';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken)

router.get('/art/:art_id', ArtCommentController.getByArtId);
router.get('/:id', ArtCommentController.getById);

router.post('/art/:art_id', ArtCommentController.create);

router.put('/:id', ArtCommentController.update);

router.delete('/:id', ArtCommentController.delete);


export default router;