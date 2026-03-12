import express from 'express';
const router = express.Router();

import JobPostingController from '../controllers/JobPostingController.js';
import authToken from '../middlewares/authMiddleware.js';
import authorizeRole from '../middlewares/roleMiddleware.js';

router.use(authToken);

router.get('/', JobPostingController.getAll);
router.get('/user/:user_id', JobPostingController.getByUser);
router.get('/status/:status', JobPostingController.getByStatus);
router.get('/:id', JobPostingController.getById);

router.post('/', authorizeRole('pro', 'corporate'), JobPostingController.create);

router.put('/:id', authorizeRole('pro', 'corporate'), JobPostingController.update);

router.delete('/:id', authorizeRole('pro', 'corporate'), JobPostingController.delete);

export default router;
