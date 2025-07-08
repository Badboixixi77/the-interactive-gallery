import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import type { Request, Response } from 'express';

// Load environment variables from .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'https://the-interactive-gallery-j2aa.vercel.app'

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

// Function to create comments table if it doesn't exist
async function createCommentsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      image_id VARCHAR(100) NOT NULL,
      author VARCHAR(100) NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('Comments table is ready.');
  } catch (err) {
    console.error('Error creating comments table:', err);
  }
}

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

// Post a new comment for a specific image
app.post('/api/comments/:imageId', async (req, res) => {
  const { imageId } = req.params;
  const { author, text } = req.body;

  // Basic validation
  if (!author || !text || text.length < 2) {
    return res.status(400).json({ error: 'Author and comment text (min 2 chars) are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO comments (image_id, author, text) VALUES ($1, $2, $3) RETURNING *',
      [imageId, author, text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// Start server and ensure table exists
app.listen(port, () => {
  createCommentsTable().then(() => {
    console.log('Comments table is ready.');
    console.log(`Server is running on port ${port}`);
  }).catch((err) => {
    console.error('Error creating comments table:', err);
    console.log(`Server is running on port ${port}`);
  });
});

// Export pool for use in other modules
export { pool }; 