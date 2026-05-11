import pg from 'pg';
const { Pool } = pg;

// IMPORTANT: Use DATABASE_URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    process.exit(1);
}

console.log('📡 Connecting to PostgreSQL...');

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Add connection timeout
    connectionTimeoutMillis: 10000,
});

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        return;
    }
    console.log('✅ PostgreSQL connected successfully');
    release();
});

// Initialize database tables
const initDatabase = async () => {
    try {
        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table ready');
        
        // Create projects table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                "ownerId" INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY("ownerId") REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Projects table ready');
        
        // Create tasks table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'pending',
                priority TEXT DEFAULT 'medium',
                "projectId" INTEGER NOT NULL,
                "assignedTo" INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY("projectId") REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY("assignedTo") REFERENCES users(id)
            )
        `);
        console.log('✅ Tasks table ready');
        
        // Create default admin account if not exists
        const adminCheck = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
        if (adminCheck.rows.length === 0) {
            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(
                'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
                ['admin', 'admin@taskflow.com', hashedPassword, 'admin']
            );
            console.log('✅ Default admin account created: admin / admin123');
        }
    } catch (error) {
        console.error('Database initialization error:', error.message);
    }
};

// Run initialization
initDatabase();

export default pool;