import express from 'express';
const router = express.Router();

import AuthController from '../controllers/AuthController.js';
import authToken from '../middlewares/authMiddleware.js';


router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/refresh', authToken, AuthController.refresh);

export default router;