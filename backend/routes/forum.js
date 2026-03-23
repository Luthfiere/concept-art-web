import express from 'express';
const router = express.Router();

import ForumController from '../controllers/ForumController.js';
import authToken from '../middlewares/authMiddleware.js';

router.get('/', ForumController.getAll);
router.get('/user/:user_id', ForumController.getByUser);
router.get('/:id', ForumController.getById);

router.post('/', authToken, ForumController.create);

router.put('/:id', authToken, ForumController.update);

router.delete('/:id', authToken, ForumController.delete);

export default router;
