import express from 'express';
const router = express.Router();

import JobApplicationController from '../controllers/JobApplicationController.js';
import authToken from '../middlewares/authMiddleware.js';
import authorizeRole from '../middlewares/roleMiddleware.js';
import uploadResume from '../middlewares/multerResume.js';
import multerErrorHandler from '../middlewares/multerErrorHandler.js';

router.use(authToken);

router.get('/job/:job_id', authorizeRole('pro', 'corporate'), JobApplicationController.getByJobId);
router.get('/user/:user_id', JobApplicationController.getByUserId);
router.get('/', JobApplicationController.getByApplicant);

router.patch('/:id/status', authorizeRole('pro', 'corporate'), JobApplicationController.updateStatus);

router.post(
  '/job/:job_id',
  uploadResume.single('cv'),
  multerErrorHandler(2),
  JobApplicationController.create
);
router.delete('/:id', JobApplicationController.delete);

export default router;
