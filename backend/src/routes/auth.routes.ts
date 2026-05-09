import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register — create new account
router.post('/register', register);

// POST /api/auth/login — login with username + password
router.post('/login', login);

// GET /api/auth/me — get current logged-in user (requires valid JWT)
router.get('/me', requireAuth, getMe);

export default router;