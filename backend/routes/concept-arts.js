import express from 'express';
const router = express.Router();

import ConceptArtController from '../controllers/ConceptArtController';
import authToken from '../middlewares/authMiddleware.js';

router.use(authToken)

router.get('/', ConceptArtController.getAll);
router.get('/:id', ConceptArtController.getById);
router.get('/user/:user_id', ConceptArtController.getByUser);

router.post('/', ConceptArtController.create);

router.put('/:id', ConceptArtController.update);

router.delete('/:id', ConceptArtController.delete);

export default router;