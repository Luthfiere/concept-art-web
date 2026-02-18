import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js'
const router = express.Router();

import ArtLikeController from '../controllers/ArtLikeController.js';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken)

router.get('/user-art/:art_id', ArtLikeController.getByArtId);
router.get('/art/:art_id', ArtLikeController.getByArtId);

router.post('/',  ArtLikeController.create);

router.delete('/',  ArtLikeController.delete);


export default router;