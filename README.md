# TaskFlow - Task Management System

A full-stack task management application with role-based access control.

## Live Demo

**URL:** https://taskflow-backend-ifdd.onrender.com

**Demo Login:**
- Username: `admin`
- Password: `admin123`

## Features

- User authentication (Login/Register)
- Role-based access (Admin/User)
- Create and manage projects
- Create tasks with priority levels (High/Medium/Low)
- Task board with columns: Pending, In Progress, Done
- Responsive design for mobile and desktop

## Tech Stack

**Backend:** Node.js, Express, PostgreSQL, JWT, bcryptjs

**Frontend:** HTML5, CSS3, Vanilla JavaScript

**Hosting:** Render (Backend + Database)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Kartikey077/Taskflow.git
cd Taskflow

# Install dependencies
cd backend
npm install

# Create .env file
echo "JWT_SECRET=your-secret-key" > .env

# Start the server
npm start
```
Open http://localhost:5000

##Environment Variables
Create a .env file in the backend folder:

```
JWT_SECRET=your-secret-key-here
NODE_ENV=production
PORT=5000
DATABASE_URL=your-postgresql-url
```

##Author
Kartikey
GitHub: @Kartikey077
