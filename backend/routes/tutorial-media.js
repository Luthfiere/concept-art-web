import express from 'express';
const router = express.Router();

import authToken from '../middlewares/authMiddleware.js';
import TutorialMediaController from '../controllers/TutorialMediaController.js';
import upload from '../middlewares/multerTutorialMedia.js';
import multerErrorHandler from '../middlewares/multerErrorHandler.js';

router.get('/tutorial/:tutorial_id', TutorialMediaController.getByTutorialId);

router.post(
  '/tutorial/:tutorial_id',
  authToken,
  upload.array('media', 8),
  multerErrorHandler(5),
  TutorialMediaController.create
);

router.delete('/:id', authToken, TutorialMediaController.delete);

export default router;