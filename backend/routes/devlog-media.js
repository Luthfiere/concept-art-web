import express from 'express';
const router = express.Router();

import DevLogMediaController from '../controllers/DevlogMediaController.js';
import authToken from '../middlewares/authMiddleware.js';
import uploadDevLogMedia from '../middlewares/multerDevlogMedia.js';
import multerErrorHandler from '../middlewares/multerErrorHandler.js';

router.use(authToken);

router.get('/log/:log_id', DevLogMediaController.getByLogId);

router.post(
  '/log/:log_id',
  uploadDevLogMedia.array('media', 8),
  multerErrorHandler(30),
  DevLogMediaController.create
);

router.delete('/:id', DevLogMediaController.delete);

export default router;
