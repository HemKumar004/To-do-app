const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Hemkumar@2004', // Change if needed
  database: 'todo_app'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL connected');
});


// 🔹 GET all tasks
app.get('/tasks', (req, res) => {
  db.query('SELECT * FROM tasks', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});


// 🔹 POST a new task
app.post('/tasks', (req, res) => {
  const {
    title,
    description,
    reminderDate,
    reminderTime,
    priority = 'Medium',
    isFinished = false
  } = req.body;

  const sql = `
    INSERT INTO tasks (title, description, reminderDate, reminderTime, priority, isFinished)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, description, reminderDate || null, reminderTime || null, priority, isFinished],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({
        id: result.insertId,
        title,
        description,
        reminderDate,
        reminderTime,
        priority,
        isFinished
      });
    }
  );
});


// 🔹 DELETE a task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tasks WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});


// 🔹 PUT update task (any fields: reminder, priority, isFinished, etc.)
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    reminderDate,
    reminderTime,
    priority,
    isFinished
  } = req.body;

  // Dynamically construct fields to update
  const fields = [];
  const values = [];

  if (title !== undefined) {
    fields.push('title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    fields.push('description = ?');
    values.push(description);
  }
  if (reminderDate !== undefined) {
    fields.push('reminderDate = ?');
    values.push(reminderDate);
  }
  if (reminderTime !== undefined) {
    fields.push('reminderTime = ?');
    values.push(reminderTime);
  }
  if (priority !== undefined) {
    fields.push('priority = ?');
    values.push(priority);
  }
  if (isFinished !== undefined) {
    fields.push('isFinished = ?');
    values.push(isFinished);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields provided to update.' });
  }

  values.push(id);
  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;

  db.query(sql, values, (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});


// 🔹 Start the server
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
