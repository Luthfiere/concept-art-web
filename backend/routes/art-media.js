import express from 'express';
const router = express.Router();

import authToken from '../middlewares/authMiddleware.js';
import ArtMediaController from '../controllers/ArtMediaController.js'
import upload from '../middlewares/multerArtMedia.js'
import multerErrorHandler from '../middlewares/multerErrorHandler.js';

router.get('/art/:art_id', ArtMediaController.getByArtId);

router.post(
  '/art/:art_id',
  authToken,
  upload.array('media', 6),
  multerErrorHandler(30),
  ArtMediaController.create
);

router.delete('/:id', authToken, ArtMediaController.delete);

export default router;
