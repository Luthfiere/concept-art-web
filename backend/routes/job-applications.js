import express from 'express';
const router = express.Router();

import JobApplicationController from '../controllers/JobApplicationController.js';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken);

router.get('/job/:job_id', JobApplicationController.getByJobId);
router.get('/mine', JobApplicationController.getByApplicant);

router.post('/job/:job_id', JobApplicationController.create);

router.patch('/:id/status', JobApplicationController.updateStatus);

router.delete('/:id', JobApplicationController.delete);

export default router;
