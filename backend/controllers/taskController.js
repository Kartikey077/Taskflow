import pool from '../config/database.js';

export const getTasks = async (req, res) => {
    const { projectId } = req.query;
    
    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }
    
    try {
        const project = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
        
        if (project.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const tasks = await pool.query(
            'SELECT * FROM tasks WHERE "projectId" = $1 ORDER BY created_at DESC',
            [projectId]
        );
        
        res.json(tasks.rows);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const createTask = async (req, res) => {
    const { title, description, projectId, priority, assignedTo } = req.body;
    
    if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'Task title is required' });
    }
    
    try {
        const result = await pool.query(
            `INSERT INTO tasks (title, description, "projectId", priority, "assignedTo", status) 
             VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
            [title.trim(), description || null, projectId, priority || 'medium', assignedTo || null]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

export const updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    try {
        await pool.query(
            'UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [status, id]
        );
        
        res.json({ message: 'Task status updated', status });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

export const deleteTask = async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};