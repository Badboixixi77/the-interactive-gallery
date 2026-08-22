import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import type { Request, Response, NextFunction } from 'express';

// Load environment variables from .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
const JWT_EXPIRES_IN = '7d';

// Middleware
// CORS origins — supports local dev, Vercel, and Render deployments
const allowedOrigins: (string | RegExp)[] = [
  'http://localhost:3000',
  'https://the-interactive-gallery-j2aa.vercel.app',
];

// Add Render frontend URL if set via environment variable
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(`https://${process.env.FRONTEND_URL}`);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman, curl, server-to-server)
    if (!origin || allowedOrigins.some(o => {
      if (typeof o === 'string') return o === origin;
      return o.test(origin);
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test route
app.get('/', (req, res) => {
  res.send('The Interactive Gallery backend is running!');
});

// ===== Database initialization =====
async function initDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        image_id VARCHAR(100) NOT NULL,
        author VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration: link comments to users (nullable for guest/legacy comments)
    await pool.query(`
      ALTER TABLE comments
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    `);

    console.log('Database tables are ready.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// ===== Auth middleware =====
interface AuthRequest extends Request {
  userId?: number;
  username?: string;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    req.userId = payload.userId;
    req.username = payload.username;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function signToken(userId: number, username: string): string {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

// ===== Auth routes =====

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }
  if (username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username.trim(), email.trim().toLowerCase(), passwordHash]
    );
    const user = result.rows[0];
    const token = signToken(user.id, user.username);
    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err: any) {
    if (err?.code === '23505') {
      const field = err.constraint?.includes('email') ? 'email' : 'username';
      return res.status(409).json({ error: `That ${field} is already taken.` });
    }
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, email, password_hash FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = signToken(user.id, user.username);
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Failed to log in.' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// ===== Comment routes =====

// Get all comments for a specific image
app.get('/api/comments/:imageId', async (req, res) => {
  const { imageId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM comments WHERE image_id = $1 ORDER BY created_at DESC',
      [imageId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Post a new comment — guests allowed, but authenticated users are linked to their account
app.post('/api/comments/:imageId', async (req: AuthRequest, res) => {
  const { imageId } = req.params;
  const { author, text } = req.body;

  // Basic validation
  if (!text || text.length < 2) {
    return res.status(400).json({ error: 'Comment text (min 2 chars) is required.' });
  }

  // Optional auth: attach user if valid token provided
  let userId: number | null = null;
  let authorName = author;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: number; username: string };
      userId = payload.userId;
      authorName = payload.username; // authenticated username always wins
    } catch {
      // invalid token — fall through as guest
    }
  }

  if (!authorName && !userId) {
    return res.status(400).json({ error: 'Author name is required for guest comments.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO comments (image_id, author, text, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [imageId, authorName || 'Anonymous', text, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// Delete a comment — only the authenticated owner can delete
app.delete('/api/comments/:commentId', authMiddleware, async (req: AuthRequest, res) => {
  const { commentId } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id',
      [commentId, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or you are not the owner.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

// Start server and ensure tables exist
app.listen(port, () => {
  initDatabase().then(() => {
    console.log(`Server is running on port ${port}`);
  });
});

// Export pool for use in other modules
export { pool };
