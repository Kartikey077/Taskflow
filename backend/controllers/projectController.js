import db from '../config/database.js';

export const getProjects = async (req, res) => {
  try {
    let query = 'SELECT * FROM projects';
    let params = [];
    
    // Admin can see all projects
    // Regular users can see their own projects AND projects created by admin (ownerId = 1)
    if (req.user.role !== 'admin') {
      query += ' WHERE ownerId = ? OR ownerId = 1';
      params = [req.user.id];
    }
    
    query += ' ORDER BY created_at DESC';
    
    const projects = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    res.json(projects);
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
    const result = await new Promise((resolve, reject) => {
      db.run('INSERT INTO projects (name, description, ownerId) VALUES (?, ?, ?)',
        [name.trim(), description || null, req.user.id],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID });
        });
    });
    
    const newProject = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [result.id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  try {
    const project = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await new Promise((resolve, reject) => {
      db.run('UPDATE projects SET name = ?, description = ? WHERE id = ?',
        [name, description, id], (err) => {
          if (err) reject(err);
          resolve();
        });
    });
    
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;
  
  try {
    const project = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Only admin can delete projects
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete projects' });
    }
    
    // First delete all tasks in this project
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM tasks WHERE projectId = ?', [id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
    
    // Then delete the project
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM projects WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};