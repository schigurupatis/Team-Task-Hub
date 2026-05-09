import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userStore } from '../models/user.model';
import { RegisterSchema, LoginSchema } from '../validators/auth.validator';
import { AuthResponse } from '../types/auth.types';
import { ApiResponse } from '../types/task.types';

const JWT_SECRET  = process.env.JWT_SECRET  || 'team-task-hub-jwt-secret-2026';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  // Step 1: Validate with Zod
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      error:   'Validation failed',
      message: parsed.error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', '),
    } satisfies ApiResponse);
    return;
  }

  const { firstName, lastName, username, email, phone, password } = parsed.data;

  // Step 2: Check username not taken
  if (userStore.isUsernameTaken(username)) {
    res.status(409).json({
      success: false,
      error:   'Conflict',
      message: 'Username is already taken. Please choose a different one.',
    } satisfies ApiResponse);
    return;
  }

  // Step 3: Check email not taken
  if (userStore.isEmailTaken(email)) {
    res.status(409).json({
      success: false,
      error:   'Conflict',
      message: 'This email is already registered. Please login instead.',
    } satisfies ApiResponse);
    return;
  }

  // Step 4: Hash password — NEVER store plain text
  const hashedPassword = await bcrypt.hash(password, 10);

  // Step 5: Create user — pass ALL fields including both password and hashedPassword
  const user = userStore.create({
    firstName,
    lastName,
    username,
    email,
    phone,
    password,           // ← original plain password (required by RegisterDto type)
    hashedPassword,     // ← bcrypt hash (what actually gets stored)
  });

  // Step 6: Generate JWT
  const payload = { userId: user.id, username: user.username, email: user.email };
  const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  // Step 7: Respond with safe user + token
  res.status(201).json({
    success: true,
    data: {
      user:  userStore.toSafeUser(user),
      token,
    } as AuthResponse,
    message: 'Account created successfully!',
  } satisfies ApiResponse<AuthResponse>);
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  // Step 1: Validate with Zod
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      error:   'Validation failed',
      message: parsed.error.errors.map(e => e.message).join(', '),
    } satisfies ApiResponse);
    return;
  }

  const { username, password } = parsed.data;

  // Step 2: Find user by username
  const user = userStore.findByUsername(username);
  if (!user) {
    // Vague message — don't reveal if username exists
    res.status(401).json({
      success: false,
      error:   'Unauthorized',
      message: 'Invalid username or password.',
    } satisfies ApiResponse);
    return;
  }

  // Step 3: Compare password with bcrypt hash
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    res.status(401).json({
      success: false,
      error:   'Unauthorized',
      message: 'Invalid username or password.',
    } satisfies ApiResponse);
    return;
  }

  // Step 4: Generate fresh JWT
  const payload = { userId: user.id, username: user.username, email: user.email };
  const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  // Step 5: Respond with safe user + token
  res.status(200).json({
    success: true,
    data: {
      user:  userStore.toSafeUser(user),
      token,
    } as AuthResponse,
    message: `Welcome back, ${user.firstName}!`,
  } satisfies ApiResponse<AuthResponse>);
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
export const getMe = (
  req: Request & { user?: { userId: string } },
  res: Response
): void => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
    } satisfies ApiResponse);
    return;
  }

  const user = userStore.findById(userId);
  if (!user) {
    res.status(404).json({
      success: false,
      error: 'User not found',
    } satisfies ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    data: userStore.toSafeUser(user),
  } satisfies ApiResponse);
};