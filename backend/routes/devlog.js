import express from 'express';
const router = express.Router();

import DevLogController from '../controllers/DevlogController.js';
import authToken from '../middlewares/authMiddleware.js';
import uploadDevLogCover from '../middlewares/multerDevlogCover.js';
import multerErrorHandler from '../middlewares/multerErrorHandler.js';

router.use(authToken);

router.get('/', DevLogController.getAll);
router.get('/category/:category', DevLogController.getByCategory);
router.get('/user/:user_id', DevLogController.getByUser);
router.get('/:id', DevLogController.getById);

router.post(
  '/',
  uploadDevLogCover.single('cover_image'),
  multerErrorHandler(5),
  DevLogController.create
);

router.put(
  '/:id',
  uploadDevLogCover.single('cover_image'),
  multerErrorHandler(5),
  DevLogController.update
);

router.delete('/:id', DevLogController.delete);

export default router;
