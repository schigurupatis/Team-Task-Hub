import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { ApiResponse } from '../types/task.types';

const router = Router();

// UUID validation — only for routes with :id param
const validateId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    const response: ApiResponse = { success: false, error: 'Invalid task ID format' };
    res.status(400).json(response);
    return;
  }
  next();
};

// Collection routes — no ID validation needed
router.get('/', getAllTasks);
router.post('/', createTask);

// Individual resource routes — validate UUID first
router.get('/:id', validateId, getTaskById);
router.patch('/:id', validateId, updateTask);
router.delete('/:id', validateId, deleteTask);

export default router;