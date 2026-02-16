import express from 'express';
const router = express.Router();

import ArtCommentController from '../controllers/ArtCommentController.js';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken)

router.get('/user-art/:art_id', ArtCommentController.getByArtId);
router.get('/:id', ArtCommentController.getById);

router.post('/', ArtCommentController.create);

router.put('/:id', ArtCommentController.update);

router.delete('/', ArtCommentController.delete);


export default router;