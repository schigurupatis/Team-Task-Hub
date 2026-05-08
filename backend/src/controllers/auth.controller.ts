import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userStore } from '../models/user.model';
import { RegisterSchema, LoginSchema } from '../validators/auth.validator';
import { ApiResponse, AuthResponse } from '../types/auth.types';

// JWT secret — in production use a long random string in .env
const JWT_SECRET  = process.env.JWT_SECRET  || 'team-task-hub-jwt-secret-2026';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d'; // token valid for 7 days

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  // Step 1: Validate request body with Zod
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      error:   'Validation failed',
      message: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
    });
    return;
  }

  const { firstName, lastName, username, email, phone, password } = parsed.data;

  // Step 2: Check username is not already taken
  if (userStore.isUsernameTaken(username)) {
    res.status(409).json({
      success: false,
      error:   'Conflict',
      message: 'Username is already taken. Please choose a different one.',
    });
    return;
  }

  // Step 3: Check email is not already registered
  if (userStore.isEmailTaken(email)) {
    res.status(409).json({
      success: false,
      error:   'Conflict',
      message: 'This email is already registered. Please login instead.',
    });
    return;
  }

  // Step 4: Hash password — bcrypt with 10 salt rounds
  // Never store plain text passwords — this is non-negotiable
  const hashedPassword = await bcrypt.hash(password, 10);

  // Step 5: Create user in store
  const user = userStore.create({
    firstName, lastName, username, email, phone,
    hashedPassword,
  });

  // Step 6: Generate JWT token
  const payload = { userId: user.id, username: user.username, email: user.email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  // Step 7: Return user (without password) + token
  res.status(201).json({
    success: true,
    data: {
      user:  userStore.toSafeUser(user),
      token,
    } as AuthResponse,
    message: 'Account created successfully!',
  });
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  // Step 1: Validate request body with Zod
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      error:   'Validation failed',
      message: parsed.error.errors.map(e => e.message).join(', '),
    });
    return;
  }

  const { username, password } = parsed.data;

  // Step 2: Find user by username
  const user = userStore.findByUsername(username);
  if (!user) {
    // Intentionally vague — don't reveal whether username exists or not
    res.status(401).json({
      success: false,
      error:   'Unauthorized',
      message: 'Invalid username or password.',
    });
    return;
  }

  // Step 3: Compare password with bcrypt hash
  // bcrypt.compare is async and timing-safe — prevents timing attacks
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    res.status(401).json({
      success: false,
      error:   'Unauthorized',
      message: 'Invalid username or password.',
    });
    return;
  }

  // Step 4: Generate fresh JWT token on every login
  const payload = { userId: user.id, username: user.username, email: user.email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  // Step 5: Return user (without password) + token
  res.status(200).json({
    success: true,
    data: {
      user:  userStore.toSafeUser(user),
      token,
    } as AuthResponse,
    message: `Welcome back, ${user.firstName}!`,
  });
};

// ─── GET CURRENT USER (me) ────────────────────────────────────────────────────
// Called by frontend on app load to verify token is still valid
export const getMe = (req: Request & { user?: { userId: string } }, res: Response): void => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const user = userStore.findById(userId);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  res.status(200).json({
    success: true,
    data: userStore.toSafeUser(user),
  });
};