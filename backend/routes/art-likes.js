import express from 'express';
const router = express.Router();

import ArtLikeController from '../controllers/ArtLikeController';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken)

router.get('/user-art/:art_id', ArtLikeController.getByArtId);
router.get('/art/:art_id', ArtLikeController.getByArtId);

router.post('/', ArtLikeController.create);

router.delete('/', ArtLikeController.delete);


export default router;