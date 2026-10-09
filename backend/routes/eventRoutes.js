import { Router } from 'express';
import {
  createEvent, getEvents, getMyEvents, getEvent, updateEvent, deleteEvent,
  registerForEvent, cancelRegistration, getParticipants,
  getSavedEvents, saveEvent, unsaveEvent,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadPoster } from '../middleware/upload.js';

const router = Router();
router.use(protect);

router.route('/')
  .get(getEvents)
  .post(authorize('admin', 'organizer'), uploadPoster, createEvent);

router.get('/mine', getMyEvents); // must come before '/:id'
router.get('/saved', authorize('student'), getSavedEvents);

router.route('/:id')
  .get(getEvent)
  .put(authorize('admin', 'organizer'), uploadPoster, updateEvent)
  .delete(authorize('admin', 'organizer'), deleteEvent);

router.route('/:id/register')
  .post(authorize('student'), registerForEvent)
  .delete(authorize('student'), cancelRegistration);

router.route('/:id/save')
  .post(authorize('student'), saveEvent)
  .delete(authorize('student'), unsaveEvent);

router.get('/:id/participants', authorize('admin', 'organizer'), getParticipants);

export default router;
