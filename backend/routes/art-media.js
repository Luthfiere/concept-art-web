import express from 'express';
const router = express.Router();

import authToken from '../middlewares/authMiddleware.js';
import ArtMediaController from '../controllers/ArtMediaController.js'
import upload from '../middlewares/multerArtMedia.js'

router.get('/art/:art_id', ArtMediaController.getByArtId);

router.post('/art/:art_id', authToken, (req, res, next) => {
  upload.array('media', 6)(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, ArtMediaController.create);

router.delete('/:id', authToken, ArtMediaController.delete);

export default router;