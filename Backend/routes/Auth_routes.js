import express from 'express';
import {
    login
    //register,
    //updateProfile
} from '../controller/Auth_controller.js';
//import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

//outer.post('/register', register);
router.post('/login', login);

//router.get('/me', protect, getMe);
//router.put('/profile', protect, updateProfile);

export default router;