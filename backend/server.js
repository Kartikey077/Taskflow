import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import db from './config/database.js';
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
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL, 'https://taskflow-frontend.vercel.app', 'https://taskflow-backend.onrender.com']
  : ['http://localhost:5000', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
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

// Create default admin account if it doesn't exist
const createDefaultAdmin = async () => {
  try {
    const adminExists = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          ['admin', 'admin@taskflow.com', hashedPassword, 'admin'],
          (err) => {
            if (err) reject(err);
            resolve();
          });
      });
      console.log('✅ Default admin account created: admin / admin123');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

// Initialize database and create admin
setTimeout(() => {
  createDefaultAdmin();
}, 1000);

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
  console.log(`   User:   (Register your own account)`);
  console.log(`\n💡 Make sure to register a user account first!\n`);
});