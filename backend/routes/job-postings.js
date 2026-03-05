import express from 'express';
const router = express.Router();

import JobPostingController from '../controllers/JobPostingController.js';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken);

router.get('/', JobPostingController.getAll);
router.get('/user/:user_id', JobPostingController.getByUser);
router.get('/status/:status', JobPostingController.getByStatus);
router.get('/:id', JobPostingController.getById);

router.post('/', JobPostingController.create);

router.put('/:id', JobPostingController.update);

router.delete('/:id', JobPostingController.delete);

export default router;
