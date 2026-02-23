const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 10000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/ideas', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, content, created_at FROM ideas ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching ideas:', err);
    res.status(500).json({ error: 'Failed to fetch ideas' });
  }
});

app.post('/ideas', async (req, res) => {
  const { content } = req.body;
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Content is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO ideas (content) VALUES ($1) RETURNING id, content, created_at',
      [content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting idea:', err);
    res.status(500).json({ error: 'Failed to create idea' });
  }
});

app.listen(PORT, () => {
  console.log(`Anonymous Idea Wall API running on http://localhost:${PORT}`);
});
