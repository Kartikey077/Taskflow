import db from '../config/database.js';

export const getTasks = async (req, res) => {
  const { projectId } = req.query;
  
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }
  
  try {
    const project = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Allow access if: user owns project OR user is admin OR project is from admin (visible to all)
    const isAdminProject = project.ownerId === 1; // Assuming admin has ID 1
    const canAccess = (project.ownerId === req.user.id) || req.user.role === 'admin' || isAdminProject;
    
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const tasks = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE projectId = ? ORDER BY created_at DESC', [projectId], (err, rows) => {
        if (err) reject(err);
        const tasksWithStatus = rows.map(task => ({
          ...task,
          status: task.status || 'pending'
        }));
        resolve(tasksWithStatus);
      });
    });
    
    res.json(tasks);
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
  
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }
  
  try {
    const project = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Allow access if: user owns project OR user is admin OR project is from admin
    const isAdminProject = project.ownerId === 1;
    const canAccess = (project.ownerId === req.user.id) || req.user.role === 'admin' || isAdminProject;
    
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run(`INSERT INTO tasks (title, description, projectId, priority, assignedTo, status) 
              VALUES (?, ?, ?, ?, ?, 'pending')`,
        [title.trim(), description || null, projectId, priority || 'medium', assignedTo || null],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID });
        });
    });
    
    const newTask = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM tasks WHERE id = ?', [result.id], (err, row) => {
        if (err) reject(err);
        resolve({ ...row, status: row.status || 'pending' });
      });
    });
    
    res.status(201).json(newTask);
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
    return res.status(400).json({ error: 'Invalid status. Must be pending, in-progress, or done' });
  }
  
  try {
    const task = await new Promise((resolve, reject) => {
      db.get(`SELECT t.*, p.ownerId FROM tasks t 
              JOIN projects p ON t.projectId = p.id 
              WHERE t.id = ?`, [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Allow access if: user owns project OR user is admin OR project is from admin
    const isAdminProject = task.ownerId === 1;
    const canAccess = (task.ownerId === req.user.id) || req.user.role === 'admin' || isAdminProject;
    
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await new Promise((resolve, reject) => {
      db.run('UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id], (err) => {
          if (err) reject(err);
          resolve();
        });
    });
    
    res.json({ message: 'Task status updated', status });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  
  try {
    const task = await new Promise((resolve, reject) => {
      db.get(`SELECT t.*, p.ownerId FROM tasks t 
              JOIN projects p ON t.projectId = p.id 
              WHERE t.id = ?`, [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Only admin or project owner can delete tasks
    if (task.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM tasks WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};