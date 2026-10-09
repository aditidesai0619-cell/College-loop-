import { Router } from 'express';
import { getClubs, createClub, updateClub, deleteClub } from '../controllers/clubController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.get('/', getClubs); // public: needed by the registration/event forms
router.post('/', protect, authorize('admin'), createClub);
router.route('/:id').put(protect, authorize('admin'), updateClub).delete(protect, authorize('admin'), deleteClub);

export default router;
