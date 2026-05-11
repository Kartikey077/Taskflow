import { renderLogin } from './components/Login.js';
import { renderDashboard } from './components/Dashboard.js';
import { getCurrentUser } from './api.js';

async function init() {
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
        try {
            const data = await getCurrentUser();
            renderDashboard(data.user);
        } catch (err) {
            localStorage.removeItem('user');
            renderLogin();
        }
    } else {
        renderLogin();
    }
}

init();