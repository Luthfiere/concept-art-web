import express from 'express';
const router = express.Router();

import TutorialController from '../controllers/TutorialController.js';
import authToken from '../middlewares/authMiddleware.js';

router.get('/', TutorialController.getAll);
router.get('/user/:user_id', TutorialController.getByUser);
router.get('/:id', TutorialController.getById);

router.post('/:id/view', TutorialController.incrementView);

router.post('/', authToken, TutorialController.create);
router.put('/:id', authToken, TutorialController.update);
router.delete('/:id', authToken, TutorialController.delete);

export default router;