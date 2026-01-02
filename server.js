
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// FORCE MIME TYPE FOR TSX/TS FILES
// This prevents the "Strict MIME type checking" error in browsers
app.use((req, res, next) => {
  const ext = path.extname(req.path);
  if (ext === '.tsx' || ext === '.ts') {
    res.type('application/javascript');
  }
  next();
});

// DATABASE CONFIGURATION
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
    console.error('Database initialization failed:', err);
  }
}

initDb();

app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transactions ORDER BY date DESC, id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  const { id, title, amount, date, category, type, description } = req.body;
  try {
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({error: 'Not found'});
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
