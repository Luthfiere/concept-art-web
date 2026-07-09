import express from 'express';
const router = express.Router();

import authToken from '../middlewares/authMiddleware.js';
import ScriptingMediaController from '../controllers/ScriptMediaController.js';
import upload from '../middlewares/multerScriptingMedia.js';
import multerErrorHandler from '../middlewares/multerErrorHandler.js';

router.get('/question/:question_id', ScriptingMediaController.getByQuestionId);

router.post(
  '/question/:question_id',
  authToken,
  upload.array('media', 3),
  multerErrorHandler(2),
  ScriptingMediaController.create
);

router.delete('/:id', authToken, ScriptingMediaController.delete);

export default router;