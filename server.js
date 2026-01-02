
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// DATABASE CONFIGURATION
// These are standard placeholders. Hostinger users should update these in their environment or .env
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'spendwise_db'
};

let pool;

async function initDb() {
  try {
    pool = mysql.createPool(dbConfig);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(50) NOT NULL,
        type ENUM('expense', 'income') NOT NULL,
        description TEXT
      )
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.warn('MySQL connection failed. Using mock response for API.', err.message);
  }
}

initDb();

// API ROUTES
app.get('/api/transactions', async (req, res) => {
  try {
    if (!pool) throw new Error('DB not connected');
    const [rows] = await pool.query('SELECT * FROM transactions ORDER BY date DESC, id DESC');
    res.json(rows);
  } catch (err) {
    res.status(503).json({ error: 'Database unavailable', fallback: true });
  }
});

app.post('/api/transactions', async (req, res) => {
  const { id, title, amount, date, category, type, description } = req.body;
  try {
    if (!pool) throw new Error('DB not connected');
    await pool.query(`
      INSERT INTO transactions (id, title, amount, date, category, type, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      amount = VALUES(amount),
      date = VALUES(date),
      category = VALUES(category),
      type = VALUES(type),
      description = VALUES(description)
    `, [id, title, amount, date, category, type, description || null]);
    res.json({ success: true });
  } catch (err) {
    res.status(503).json({ error: 'Save failed' });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    if (!pool) throw new Error('DB not connected');
    await pool.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(503).json({ error: 'Delete failed' });
  }
});

// FRONTEND ROUTING
// Serve static files from the project root
app.use(express.static(__dirname));

// For all other routes, serve index.html to support SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).send('Not Found');
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
