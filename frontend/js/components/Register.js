// Register.js
import { register } from '../api.js';

export function renderRegister() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="auth-page">
            <div class="auth-bg-animation"></div>
            <div class="auth-glow-1" id="auth-glow-1"></div>
            <div class="auth-glow-2" id="auth-glow-2"></div>
            <div class="auth-glow-3" id="auth-glow-3"></div>
            <div class="auth-particles" id="auth-particles"></div>
            <div class="auth-container">
                <div class="auth-card">
                    <h1>✨ TaskFlow</h1>
                    <p class="auth-subtitle">Join TaskFlow today</p>
                    <div id="error-message" class="error-message" style="display: none;"></div>
                    <div id="success-message" class="success-message" style="display: none;"></div>
                    <form id="register-form" autocomplete="off">
                        <div class="input-group">
                            <label>Username</label>
                            <input type="text" id="username" placeholder="Choose a username" required autocomplete="off">
                        </div>
                        <div class="input-group">
                            <label>Email</label>
                            <input type="email" id="email" placeholder="Enter your email" required autocomplete="off">
                        </div>
                        <div class="input-group">
                            <label>Password</label>
                            <input type="password" id="password" placeholder="Create a password (min 6 characters)" required autocomplete="off">
                        </div>
                        <button type="submit" class="auth-btn">🚀 Register</button>
                    </form>
                    <div class="auth-footer">
                        Already have an account? <a href="#" id="show-login">Login here</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Create floating particles
    const particlesContainer = document.getElementById('auth-particles');
    if (particlesContainer) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 15}s`;
            particle.style.animationDuration = `${12 + Math.random() * 10}s`;
            particlesContainer.appendChild(particle);
        }
    }
    
    // Responsive cursor tracking
    const glow1 = document.getElementById('auth-glow-1');
    const glow2 = document.getElementById('auth-glow-2');
    const glow3 = document.getElementById('auth-glow-3');
    
    if (glow1 && glow2 && glow3) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let currentX1 = mouseX - 300, currentY1 = mouseY - 300;
        let currentX2 = mouseX - 225, currentY2 = mouseY - 225;
        let currentX3 = mouseX - 175, currentY3 = mouseY - 175;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches[0]) {
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
            }
        });
        
        function animateGlows() {
            currentX1 += (mouseX - 300 - currentX1) * 0.08;
            currentY1 += (mouseY - 300 - currentY1) * 0.08;
            currentX2 += (mouseX - 225 - currentX2) * 0.12;
            currentY2 += (mouseY - 225 - currentY2) * 0.12;
            currentX3 += (mouseX - 175 - currentX3) * 0.18;
            currentY3 += (mouseY - 175 - currentY3) * 0.18;
            
            glow1.style.transform = `translate(${currentX1}px, ${currentY1}px)`;
            glow2.style.transform = `translate(${currentX2}px, ${currentY2}px)`;
            glow3.style.transform = `translate(${currentX3}px, ${currentY3}px)`;
            
            requestAnimationFrame(animateGlows);
        }
        animateGlows();
    }
    
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        
        if (password.length < 6) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Password must be at least 6 characters long.';
            return;
        }
        
        try {
            const data = await register({ username, email, password });
            successDiv.style.display = 'block';
            successDiv.textContent = '🎉 Registration successful! Redirecting to login...';
            setTimeout(() => {
                import('./Login.js').then(module => {
                    module.renderLogin();
                });
            }, 2000);
        } catch (err) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = err.message || 'Registration failed. Please try again.';
        }
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        import('./Login.js').then(module => {
            module.renderLogin();
        });
    });
}