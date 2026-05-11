export const showLoading = () => {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading...</p></div>';
};

export const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

export const getPriorityColor = (priority) => {
    const colors = {
        high: 'priority-high',
        medium: 'priority-medium',
        low: 'priority-low'
    };
    return colors[priority] || 'priority-medium';
};