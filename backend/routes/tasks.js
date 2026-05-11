import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getTasks, createTask, updateTaskStatus, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

export default router;