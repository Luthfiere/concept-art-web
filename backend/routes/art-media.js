import express from 'express';
const router = express.Router();

import ArtMediaController from '../controllers/ArtMediaController';

import upload from '../middlewares/multerArtMedia';

router.get('/art/:art_id', ArtMediaController.getByArtId);

router.post('/', upload.array('media', 6), ArtMediaController.create);

router.delete('/:id', ArtMediaController.delete);

export default router;