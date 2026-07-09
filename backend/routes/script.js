import express from 'express';
const router = express.Router();

import ScriptController from '../controllers/ScriptController.js';
import authToken from '../middlewares/authMiddleware.js';

router.get('/', ScriptController.getAll);
router.get('/user/:user_id', ScriptController.getByUser);
router.get('/:id', ScriptController.getById);

router.post('/:id/view', ScriptController.incrementView);

router.post('/', authToken, ScriptController.create);
router.put('/:id', authToken, ScriptController.update);
router.delete('/:id', authToken, ScriptController.delete);

export default router;