import { getProjects, createProject, deleteProject, getTasks, createTask, updateTaskStatus, logout } from '../api.js';
import { escapeHtml } from '../utils.js';

let currentUser = null;
let projects = [];
let tasks = [];
let selectedProject = null;

export async function renderDashboard(user) {
    currentUser = user;
    await loadProjects();
    render();
}

async function loadProjects() {
    try {
        const fetchedProjects = await getProjects();
        projects = fetchedProjects;
        console.log('Loaded projects:', projects); // Debug log
        
        if (projects.length > 0 && !selectedProject) {
            selectedProject = projects[0];
            await loadTasks(selectedProject.id);
        } else if (selectedProject) {
            // Check if selected project still exists
            const stillExists = projects.find(p => p.id === selectedProject.id);
            if (!stillExists && projects.length > 0) {
                selectedProject = projects[0];
                await loadTasks(selectedProject.id);
            } else if (stillExists) {
                await loadTasks(selectedProject.id);
            }
        }
        render();
    } catch (err) {
        console.error('Load projects error:', err);
        projects = [];
        render();
    }
}

async function loadTasks(projectId) {
    try {
        const fetchedTasks = await getTasks(projectId);
        tasks = fetchedTasks.map(task => ({
            ...task,
            status: task.status || 'pending'
        }));
        console.log('Loaded tasks:', tasks);
        render();
    } catch (err) {
        console.error('Load tasks error:', err);
        tasks = [];
        render();
    }
}

async function handleCreateProject(name) {
    if (!name.trim()) return;
    try {
        await createProject({ name });
        // Reload projects after creating new one
        await loadProjects();
        // Auto-select the newly created project (it will be first in list)
        if (projects.length > 0) {
            selectedProject = projects[0];
            await loadTasks(selectedProject.id);
        }
    } catch (err) {
        alert(err.message);
    }
}

async function handleDeleteProject(id) {
    if (currentUser.role !== 'admin') {
        alert('Only administrators can delete projects');
        return;
    }
    
    if (confirm('Are you sure you want to delete this project? This will delete all tasks in this project.')) {
        try {
            await deleteProject(id);
            // Reload projects after deletion
            await loadProjects();
            if (selectedProject?.id === id) {
                if (projects.length > 0) {
                    selectedProject = projects[0];
                    await loadTasks(selectedProject.id);
                } else {
                    selectedProject = null;
                    tasks = [];
                    render();
                }
            }
        } catch (err) {
            alert(err.message);
        }
    }
}

async function handleCreateTask(title, priority) {
    if (!title.trim() || !selectedProject) return;
    try {
        await createTask({ title, projectId: selectedProject.id, priority });
        await loadTasks(selectedProject.id);
    } catch (err) {
        alert(err.message);
    }
}

async function handleUpdateStatus(taskId, currentStatus) {
    let newStatus;
    switch(currentStatus) {
        case 'pending':
            newStatus = 'in-progress';
            break;
        case 'in-progress':
            newStatus = 'done';
            break;
        case 'done':
            newStatus = 'pending';
            break;
        default:
            newStatus = 'pending';
    }
    
    console.log(`Updating task ${taskId} from ${currentStatus} to ${newStatus}`);
    
    try {
        await updateTaskStatus(taskId, newStatus);
        await loadTasks(selectedProject.id);
    } catch (err) {
        console.error('Update status error:', err);
        alert(err.message);
    }
}

async function handleLogout() {
    await logout();
    localStorage.removeItem('user');
    window.location.reload();
}

function render() {
    const app = document.getElementById('app');
    const isAdmin = currentUser.role === 'admin';
    
    app.innerHTML = `
        <div class="dashboard">
            <nav class="navbar">
                <h1>✨ TaskFlow</h1>
                <div class="user-info">
                    <div class="user-name-wrapper">
                        <span class="user-name">👤 ${escapeHtml(currentUser.username)}</span>
                        <span class="user-role-tooltip">${isAdmin ? '👑 Administrator' : '👤 Regular User'}</span>
                    </div>
                    <button class="logout-btn" id="logout-btn">🚪 Logout</button>
                </div>
            </nav>
            
            <div class="main-content">
                <div class="dashboard-grid">
                    <div class="sidebar">
                        <h2>📁 Projects</h2>
                        <div class="add-project-form">
                            <input type="text" id="project-name" placeholder="New project name..." autocomplete="off">
                            <button id="add-project-btn">+ Add</button>
                        </div>
                        <div id="project-list" class="project-list">
                            ${projects.length === 0 ? '<div class="empty-state">✨ No projects yet. Create your first project!</div>' : 
                                projects.map(project => {
                                    // Show crown for admin projects (ownerId === 1)
                                    const isAdminProject = project.ownerId === 1;
                                    const isUserProject = project.ownerId === currentUser.id;
                                    const projectIcon = isAdminProject ? '👑 ' : (isUserProject ? '📌 ' : '📋 ');
                                    
                                    return `
                                        <div class="project-item ${selectedProject?.id === project.id ? 'active' : ''}" data-id="${project.id}">
                                            <span class="project-name">${projectIcon}${escapeHtml(project.name)}</span>
                                            ${isAdmin ? `<button class="delete-project-btn" data-id="${project.id}">🗑️</button>` : ''}
                                        </div>
                                    `;
                                }).join('')
                            }
                        </div>
                        ${isAdmin ? 
                            '<div class="admin-note">👑 Admin: You can delete any project. Projects with 👑 are visible to all users.</div>' : 
                            '<div class="admin-note">💡 Note: Projects with 👑 are created by admin and shared with everyone</div>'
                        }
                    </div>
                    
                    <div class="task-board">
                        ${selectedProject ? `
                            <div class="board-header">
                                <h2>
                                    ${selectedProject.ownerId === 1 ? '👑 ' : ''}${escapeHtml(selectedProject.name)}
                                    <span class="current-project-badge">Current Project</span>
                                </h2>
                                <p class="project-description">Manage tasks for ${escapeHtml(selectedProject.name)} project</p>
                            </div>
                            <div class="add-task-form">
                                <input type="text" id="task-title" placeholder="What needs to be done in ${escapeHtml(selectedProject.name)}?" autocomplete="off">
                                <select id="task-priority">
                                    <option value="low">🟢 Low Priority</option>
                                    <option value="medium" selected>🟡 Medium Priority</option>
                                    <option value="high">🔴 High Priority</option>
                                </select>
                                <button id="add-task-btn">+ Add Task</button>
                            </div>
                            <div class="task-columns">
                                <div class="column">
                                    <div class="column-header">
                                        <span>📋 Pending</span>
                                        <span class="task-count">${tasks.filter(t => t.status === 'pending').length}</span>
                                    </div>
                                    <div class="task-list" id="pending-tasks"></div>
                                </div>
                                <div class="column">
                                    <div class="column-header">
                                        <span>⚡ In Progress</span>
                                        <span class="task-count">${tasks.filter(t => t.status === 'in-progress').length}</span>
                                    </div>
                                    <div class="task-list" id="progress-tasks"></div>
                                </div>
                                <div class="column">
                                    <div class="column-header">
                                        <span>✅ Done</span>
                                        <span class="task-count">${tasks.filter(t => t.status === 'done').length}</span>
                                    </div>
                                    <div class="task-list" id="done-tasks"></div>
                                </div>
                            </div>
                        ` : `
                            <div class="empty-state">
                                🎯 Select a project to start managing tasks
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Event listeners
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    
    const addProjectBtn = document.getElementById('add-project-btn');
    const projectNameInput = document.getElementById('project-name');
    
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', async () => {
            const name = projectNameInput.value;
            if (name.trim()) {
                await handleCreateProject(name);
                projectNameInput.value = '';
            }
        });
    }
    
    if (projectNameInput) {
        projectNameInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const name = projectNameInput.value;
                if (name.trim()) {
                    await handleCreateProject(name);
                    projectNameInput.value = '';
                }
            }
        });
    }
    
    document.querySelectorAll('.project-item').forEach(el => {
        el.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-project-btn')) return;
            const id = parseInt(el.dataset.id);
            const project = projects.find(p => p.id === id);
            if (project) {
                selectedProject = project;
                await loadTasks(selectedProject.id);
            }
        });
    });
    
    if (isAdmin) {
        document.querySelectorAll('.delete-project-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                handleDeleteProject(id);
            });
        });
    }
    
    if (selectedProject) {
        const addTaskBtn = document.getElementById('add-task-btn');
        const taskTitleInput = document.getElementById('task-title');
        const taskPrioritySelect = document.getElementById('task-priority');
        
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                const title = taskTitleInput.value;
                const priority = taskPrioritySelect.value;
                if (title.trim()) {
                    handleCreateTask(title, priority);
                    taskTitleInput.value = '';
                }
            });
        }
        
        if (taskTitleInput) {
            taskTitleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const title = taskTitleInput.value;
                    const priority = taskPrioritySelect.value;
                    if (title.trim()) {
                        handleCreateTask(title, priority);
                        taskTitleInput.value = '';
                    }
                }
            });
        }
        
        // Render tasks for each column
        const pendingTasks = tasks.filter(t => t.status === 'pending');
        const progressTasks = tasks.filter(t => t.status === 'in-progress');
        const doneTasks = tasks.filter(t => t.status === 'done');
        
        const pendingContainer = document.getElementById('pending-tasks');
        if (pendingContainer) {
            if (pendingTasks.length === 0) {
                pendingContainer.innerHTML = '<div class="empty-state">✨ No pending tasks</div>';
            } else {
                pendingContainer.innerHTML = pendingTasks.map(task => `
                    <div class="task-card">
                        <div class="task-title">📌 ${escapeHtml(task.title)}</div>
                        <div class="task-meta">
                            <span class="task-priority priority-${task.priority || 'medium'}">
                                ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} ${(task.priority || 'MEDIUM').toUpperCase()}
                            </span>
                            <button class="task-status-btn" data-task-id="${task.id}" data-current-status="pending">
                                → Start
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        const progressContainer = document.getElementById('progress-tasks');
        if (progressContainer) {
            if (progressTasks.length === 0) {
                progressContainer.innerHTML = '<div class="empty-state">⚡ No tasks in progress</div>';
            } else {
                progressContainer.innerHTML = progressTasks.map(task => `
                    <div class="task-card">
                        <div class="task-title">📌 ${escapeHtml(task.title)}</div>
                        <div class="task-meta">
                            <span class="task-priority priority-${task.priority || 'medium'}">
                                ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} ${(task.priority || 'MEDIUM').toUpperCase()}
                            </span>
                            <button class="task-status-btn" data-task-id="${task.id}" data-current-status="in-progress">
                                ✓ Complete
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        const doneContainer = document.getElementById('done-tasks');
        if (doneContainer) {
            if (doneTasks.length === 0) {
                doneContainer.innerHTML = '<div class="empty-state">✅ No completed tasks</div>';
            } else {
                doneContainer.innerHTML = doneTasks.map(task => `
                    <div class="task-card">
                        <div class="task-title">📌 ${escapeHtml(task.title)}</div>
                        <div class="task-meta">
                            <span class="task-priority priority-${task.priority || 'medium'}">
                                ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} ${(task.priority || 'MEDIUM').toUpperCase()}
                            </span>
                            <button class="task-status-btn" data-task-id="${task.id}" data-current-status="done">
                                ↺ Reopen
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        document.querySelectorAll('.task-status-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const taskId = parseInt(btn.dataset.taskId);
                const currentStatus = btn.dataset.currentStatus;
                await handleUpdateStatus(taskId, currentStatus);
            });
        });
    }
}