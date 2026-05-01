import express from 'express';
const router = express.Router();

import ContentReportController from '../controllers/ContentReportController.js';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken);

router.post('/', ContentReportController.create);

export default router;
