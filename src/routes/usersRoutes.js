import express from 'express';
import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All user management routes are restricted to Admin
router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);

router
    .route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

export default router;
