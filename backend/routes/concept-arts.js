import express from 'express';
const router = express.Router();

import ConceptArtController from '../controllers/ConceptArtController.js';
import authToken from '../middlewares/authMiddleware.js';

router.get('/', ConceptArtController.getAll);
router.get('/category/:category', ConceptArtController.getByCategory);
router.get('/user/:user_id', ConceptArtController.getByUser);
router.get('/:id', ConceptArtController.getById);

router.post('/:id/view', ConceptArtController.incrementView);

router.post('/', authToken, ConceptArtController.create);

router.put('/:id', authToken, ConceptArtController.update);

router.delete('/:id', authToken, ConceptArtController.delete);

export default router;