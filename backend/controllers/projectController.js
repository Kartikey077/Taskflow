import pool from '../config/database.js';

export const getProjects = async (req, res) => {
    try {
        let query = 'SELECT * FROM projects';
        let params = [];
        
        if (req.user.role !== 'admin') {
            query += ' WHERE "ownerId" = $1 OR "ownerId" = 1';
            params = [req.user.id];
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

export const createProject = async (req, res) => {
    const { name, description } = req.body;
    
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Project name is required' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO projects (name, description, "ownerId") VALUES ($1, $2, $3) RETURNING *',
            [name.trim(), description || null, req.user.id]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
};

export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    
    try {
        const project = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
        
        if (project.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        if (project.rows[0].ownerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        await pool.query(
            'UPDATE projects SET name = $1, description = $2 WHERE id = $3',
            [name, description, id]
        );
        
        res.json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
};

export const deleteProject = async (req, res) => {
    const { id } = req.params;
    
    try {
        const project = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
        
        if (project.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete projects' });
        }
        
        await pool.query('DELETE FROM projects WHERE id = $1', [id]);
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
};