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

// UUID validation middleware — uses generic Request (no IdParam) to satisfy Express types
const validateId = (req: Request, res: Response, next: NextFunction): void => {
  const idParam = req.params['id'];
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    const response: ApiResponse = { success: false, error: 'Invalid task ID format' };
    res.status(400).json(response);
    return;
  }
  next();
};

// Collection routes
router.get('/', getAllTasks);
router.post('/', createTask);

// Individual resource routes
router.get('/:id', validateId, getTaskById);
router.patch('/:id', validateId, updateTask);
router.delete('/:id', validateId, deleteTask);

export default router;