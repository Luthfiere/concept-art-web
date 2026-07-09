import express from 'express';
const router = express.Router();

import ScriptingQuestionController from '../controllers/ScriptController.js';
import authToken from '../middlewares/authMiddleware.js';

router.get('/', ScriptingQuestionController.getAll);
router.get('/user/:user_id', ScriptingQuestionController.getByUser);
router.get('/:id', ScriptingQuestionController.getById);

router.post('/:id/view', ScriptingQuestionController.incrementView);

router.post('/', authToken, ScriptingQuestionController.create);
router.put('/:id', authToken, ScriptingQuestionController.update);
router.delete('/:id', authToken, ScriptingQuestionController.delete);

export default router;