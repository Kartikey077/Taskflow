import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import pool from './config/database.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
    'https://taskflow-backend-ifdd.onrender.com',
    'https://taskflow-frontend.vercel.app',
    'http://localhost:5000',
    'http://localhost:3000'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle all other routes - serve index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Create default admin account using PostgreSQL
const createDefaultAdmin = async () => {
    try {
        const adminCheck = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
        
        if (adminCheck.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(
                'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
                ['admin', 'admin@taskflow.com', hashedPassword, 'admin']
            );
            console.log('✅ Default admin account created: admin / admin123');
        }
    } catch (error) {
        console.error('Error creating admin:', error.message);
    }
};

// Initialize database and create admin after connection
setTimeout(() => {
    createDefaultAdmin();
}, 2000);

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API endpoints:`);
    console.log(`   POST /api/auth/register - Register new user`);
    console.log(`   POST /api/auth/login - Login user`);
    console.log(`   GET /api/projects - Get projects`);
    console.log(`   POST /api/projects - Create project`);
    console.log(`\n🔐 Demo Accounts:`);
    console.log(`   Admin:  admin / admin123`);
    console.log(`\n💡 Your app is live at https://taskflow-backend-ifdd.onrender.com\n`);
});