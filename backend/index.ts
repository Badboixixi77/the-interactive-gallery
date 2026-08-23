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

    // Collections table — named groups of favorite images per user
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, name)
      );
    `);

    // Images inside collections (denormalized display data from Unsplash)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collection_images (
        id SERIAL PRIMARY KEY,
        collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
        image_id VARCHAR(100) NOT NULL,
        image_url TEXT NOT NULL,
        image_alt TEXT,
        author_name VARCHAR(100),
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (collection_id, image_id)
      );
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

// ===== Collection routes =====

// List the current user's collections (with image counts).
// Optional ?imageId= flags which collections contain that image.
app.get('/api/collections', authMiddleware, async (req: AuthRequest, res) => {
  const { imageId } = req.query;
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.created_at, COUNT(ci.id)::int AS image_count
       FROM collections c
       LEFT JOIN collection_images ci ON ci.collection_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [req.userId]
    );
    let contains: number[] = [];
    if (imageId) {
      const containsResult = await pool.query(
        `SELECT ci.collection_id FROM collection_images ci
         JOIN collections c ON c.id = ci.collection_id
         WHERE c.user_id = $1 AND ci.image_id = $2`,
        [req.userId, imageId]
      );
      contains = containsResult.rows.map(r => r.collection_id);
    }
    res.json({ collections: result.rows, contains });
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ error: 'Failed to fetch collections.' });
  }
});

// Get a single collection with its images (owner only)
app.get('/api/collections/:collectionId', authMiddleware, async (req: AuthRequest, res) => {
  const { collectionId } = req.params;
  try {
    const colResult = await pool.query(
      'SELECT id, name, created_at FROM collections WHERE id = $1 AND user_id = $2',
      [collectionId, req.userId]
    );
    if (colResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found.' });
    }
    const imagesResult = await pool.query(
      'SELECT id, image_id, image_url, image_alt, author_name, added_at FROM collection_images WHERE collection_id = $1 ORDER BY added_at DESC',
      [collectionId]
    );
    res.json({ collection: colResult.rows[0], images: imagesResult.rows });
  } catch (err) {
    console.error('Error fetching collection:', err);
    res.status(500).json({ error: 'Failed to fetch collection.' });
  }
});

// Create a collection
app.post('/api/collections', authMiddleware, async (req: AuthRequest, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 1) {
    return res.status(400).json({ error: 'Collection name is required.' });
  }
  if (name.trim().length > 100) {
    return res.status(400).json({ error: 'Collection name is too long (max 100 chars).' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO collections (user_id, name) VALUES ($1, $2) RETURNING id, name, created_at',
      [req.userId, name.trim()]
    );
    res.status(201).json({ collection: result.rows[0] });
  } catch (err: any) {
    if (err?.code === '23505') {
      return res.status(409).json({ error: 'You already have a collection with that name.' });
    }
    console.error('Error creating collection:', err);
    res.status(500).json({ error: 'Failed to create collection.' });
  }
});

// Delete a collection (owner only)
app.delete('/api/collections/:collectionId', authMiddleware, async (req: AuthRequest, res) => {
  const { collectionId } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM collections WHERE id = $1 AND user_id = $2 RETURNING id',
      [collectionId, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting collection:', err);
    res.status(500).json({ error: 'Failed to delete collection.' });
  }
});

// Add an image to a collection (owner only)
app.post('/api/collections/:collectionId/images', authMiddleware, async (req: AuthRequest, res) => {
  const { collectionId } = req.params;
  const { image_id, image_url, image_alt, author_name } = req.body;
  if (!image_id || !image_url) {
    return res.status(400).json({ error: 'image_id and image_url are required.' });
  }
  try {
    // Verify ownership first
    const colResult = await pool.query(
      'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
      [collectionId, req.userId]
    );
    if (colResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found.' });
    }
    const result = await pool.query(
      `INSERT INTO collection_images (collection_id, image_id, image_url, image_alt, author_name)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (collection_id, image_id) DO NOTHING
       RETURNING id`,
      [collectionId, image_id, image_url, image_alt || null, author_name || null]
    );
    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Image is already in this collection.' });
    }
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error adding image to collection:', err);
    res.status(500).json({ error: 'Failed to add image to collection.' });
  }
});

// Remove an image from a collection (owner only)
app.delete('/api/collections/:collectionId/images/:imageId', authMiddleware, async (req: AuthRequest, res) => {
  const { collectionId, imageId } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM collection_images
       WHERE collection_id = $1 AND image_id = $2
         AND collection_id IN (SELECT id FROM collections WHERE user_id = $3)
       RETURNING id`,
      [collectionId, imageId, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found in this collection.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing image from collection:', err);
    res.status(500).json({ error: 'Failed to remove image from collection.' });
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
