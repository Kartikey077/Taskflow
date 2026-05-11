================================================================================
                            TASKFLOW - TASK MANAGEMENT SYSTEM
================================================================================

Version: 1.0.0
License: MIT
Node Version: 18.0 or higher

================================================================================
                                LIVE DEMO
================================================================================

Application URL: https://taskflow-backend-ifdd.onrender.com

Demo Login Credentials:
- Username: admin
- Password: admin123
- Role: Administrator

================================================================================
                                 FEATURES
================================================================================

1. User Authentication - Secure login and registration with JWT
2. Role-Based Access - Admin and User roles with different permissions
3. Project Management - Create, view, and manage multiple projects
4. Task Management - Create, update, and track tasks with status
5. Priority Levels - High, Medium, Low priorities with visual indicators
6. Task Board - Kanban-style board with Pending, In Progress, and Done columns
7. Responsive Design - Works on desktop, tablet, and mobile
8. Real-time Updates - Instant updates without page refresh

================================================================================
                                TECH STACK
================================================================================

Backend:
- Node.js - JavaScript runtime
- Express.js - Web framework
- PostgreSQL - Production database
- JWT - Authentication
- bcryptjs - Password hashing

Frontend:
- HTML5 - Structure
- CSS3 - Styling
- Vanilla JavaScript - No frameworks
- Fetch API - HTTP requests

DevOps:
- Render - Backend hosting and PostgreSQL
- Git - Version control
- GitHub - Code repository

================================================================================
                              GETTING STARTED
================================================================================

Prerequisites:
- Node.js (version 18 or higher)
- npm or yarn
- PostgreSQL (for production) or SQLite (for development)

Installation Steps:

1. Clone the repository
   git clone https://github.com/Kartikey077/Taskflow.git
   cd Taskflow

2. Install backend dependencies
   cd backend
   npm install

3. Set up environment variables
   Create a .env file in the backend directory with:
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your-super-secret-key-here
   DATABASE_URL=postgresql://user:password@localhost:5432/taskflow

4. Start the application
   Development mode:
   npm run dev
   
   Production mode:
   npm start

5. Open your browser
   http://localhost:5000

================================================================================
                              PROJECT STRUCTURE
================================================================================

Taskflow/
+-- backend/
    +-- config/
    |   +-- database.js
    +-- controllers/
    |   +-- authController.js
    |   +-- projectController.js
    |   +-- taskController.js
    +-- middleware/
    |   +-- auth.js
    +-- routes/
    |   +-- auth.js
    |   +-- projects.js
    |   +-- tasks.js
    +-- server.js
    +-- package.json
+-- frontend/
    +-- js/
    |   +-- components/
    |   |   +-- Login.js
    |   |   +-- Register.js
    |   |   +-- Dashboard.js
    |   +-- api.js
    |   +-- app.js
    |   +-- config.js
    |   +-- utils.js
    +-- index.html
    +-- style.css
+-- .gitignore
+-- package.json
+-- render.yaml
+-- vercel.json
+-- README.md

================================================================================
                                API ENDPOINTS
================================================================================

Authentication:
POST   /api/auth/register  - Register new user
POST   /api/auth/login     - Login user
POST   /api/auth/logout    - Logout user
GET    /api/auth/me        - Get current user

Projects:
GET    /api/projects       - Get all projects
POST   /api/projects       - Create new project
PUT    /api/projects/:id   - Update project
DELETE /api/projects/:id   - Delete project

Tasks:
GET    /api/tasks?projectId=:id  - Get tasks by project
POST   /api/tasks                - Create new task
PATCH  /api/tasks/:id/status     - Update task status
DELETE /api/tasks/:id            - Delete task

================================================================================
                                DEPLOYMENT
================================================================================

Deploy Backend to Render:

1. Push your code to GitHub
2. Create a new Web Service on Render.com
3. Connect your GitHub repository
4. Configure:
   - Build Command: cd backend && npm install
   - Start Command: cd backend && node server.js
5. Add environment variables:
   - DATABASE_URL (PostgreSQL connection string)
   - JWT_SECRET (Your secret key)
   - NODE_ENV = production
6. Create a PostgreSQL database on Render
7. Deploy

Deploy Frontend to Vercel (Optional):

1. Push your code to GitHub
2. Import project to Vercel.com
3. Add environment variable:
   - API_URL = Your Render backend URL
4. Deploy

================================================================================
                              TESTING COMMANDS
================================================================================

Test API endpoints with curl:

Health check:
curl https://taskflow-backend-ifdd.onrender.com/api/health

Login:
curl -X POST https://taskflow-backend-ifdd.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

Get projects:
curl https://taskflow-backend-ifdd.onrender.com/api/projects \
  -H "Cookie: token=your-jwt-token"

================================================================================
                              SECURITY FEATURES
================================================================================

- HTTP-only Cookies for secure JWT storage
- Password Hashing with bcryptjs
- CORS Protection configured for specific origins
- SQL Injection Prevention with parameterized queries
- Role-Based Access Control (Admin/User permissions)

================================================================================
                              DEPLOYMENT URLS
================================================================================

Primary Application URL:
https://taskflow-backend-ifdd.onrender.com

Backend API URL:
https://taskflow-backend-ifdd.onrender.com/api

Health Check URL:
https://taskflow-backend-ifdd.onrender.com/api/health

================================================================================
                                CONTRIBUTING
================================================================================

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

================================================================================
                                 LICENSE
================================================================================

This project is licensed under the MIT License.

================================================================================
                                 AUTHOR
================================================================================

Kartikey
GitHub: https://github.com/Kartikey077

================================================================================
                             ACKNOWLEDGMENTS
================================================================================

- Express.js - Backend framework
- PostgreSQL - Production database
- Render.com - Free hosting platform
- Vercel.com - Frontend hosting

================================================================================
                                ROADMAP
================================================================================

Planned features for future releases:

- Email notifications
- Task comments
- File attachments
- Due dates and reminders
- Team collaboration features
- Dark mode
- Mobile app (React Native)
- Export data (CSV/PDF)
- API documentation (Swagger)
- Unit tests

================================================================================
                            QUICK START COMMANDS
================================================================================

Clone the repository:
git clone https://github.com/Kartikey077/Taskflow.git

Install dependencies:
cd Taskflow/backend && npm install

Run development server:
npm run dev

Build for production:
npm start

================================================================================
                        ENVIRONMENT VARIABLES REFERENCE
================================================================================

Variable Name      | Description                    | Required | Default Value
------------------|--------------------------------|----------|---------------
NODE_ENV          | Environment (development/prod) | No       | development
PORT              | Server port                    | No       | 5000
JWT_SECRET        | JWT signing secret             | Yes      | -
DATABASE_URL      | PostgreSQL connection string   | Yes      | -

================================================================================
                                SUPPORT
================================================================================

For support, please open an issue on GitHub:
https://github.com/Kartikey077/Taskflow/issues

================================================================================
                            MADE WITH CARE BY KARTIKEY
================================================================================

Happy Project/Task Managing!
================================================================================