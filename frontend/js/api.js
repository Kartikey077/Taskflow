const API_BASE = '/api';

export const api = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }
    
    return data;
};

// Auth APIs
export const register = (userData) => api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
});

export const login = (credentials) => api('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
});

export const logout = () => api('/auth/logout', { method: 'POST' });

export const getCurrentUser = () => api('/auth/me');

// Project APIs
export const getProjects = () => api('/projects');
export const createProject = (data) => api('/projects', {
    method: 'POST',
    body: JSON.stringify(data)
});
export const updateProject = (id, data) => api(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
});
export const deleteProject = (id) => api(`/projects/${id}`, { method: 'DELETE' });

// Task APIs
export const getTasks = (projectId) => api(`/tasks?projectId=${projectId}`);
export const createTask = (data) => api('/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
});
export const updateTaskStatus = (id, status) => api(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
});
export const deleteTask = (id) => api(`/tasks/${id}`, { method: 'DELETE' });