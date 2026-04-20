import express from 'express';
const router = express.Router();

import JobReportController from '../controllers/JobReportController.js';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken);

router.post('/', JobReportController.create);
router.get('/job/:job_id', JobReportController.getByJobId);

export default router;
