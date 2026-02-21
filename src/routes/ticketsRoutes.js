import express from 'express';
import {
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket
} from '../controllers/ticketController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all ticket routes
router.use(protect);

router
    .route('/')
    .get(getTickets)
    .post(createTicket);

router
    .route('/:id')
    .get(getTicket)
    .put(updateTicket)
    .delete(deleteTicket);

// Comments nested routes
import { addComment, getComments } from '../controllers/commentController.js';

router
    .route('/:id/comments')
    .post(addComment)
    .get(getComments);

export default router;
