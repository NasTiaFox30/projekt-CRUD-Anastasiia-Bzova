import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// GET all tasks
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET task by ID
app.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new task
app.post('/tasks', async (req, res) => {
  try {
    const {
      title_name,
      description,
      deadline_date,
      priority,
      status,
      category,
      assigned_to,
      estimated_time,
      notes
    } = req.body;

    if (!title_name || title_name.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const result = await pool.query(
      `INSERT INTO tasks
        (title_name, description, deadline_date, priority, status,
         category, assigned_to, estimated_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        title_name.trim(),
        description?.trim(),
        deadline_date,
        priority,
        status,
        category,
        assigned_to,
        estimated_time,
        notes?.trim()
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update task
app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title_name,
      description,
      deadline_date,
      priority,
      status,
      category,
      assigned_to,
      estimated_time,
      notes
    } = req.body;

    if (!title_name || title_name.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title_name = $1,
           description = $2,
           deadline_date = $3,
           priority = $4,
           status = $5,
           category = $6,
           assigned_to = $7,
           estimated_time = $8,
           notes = $9,
           update_date = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        title_name.trim(),
        description?.trim(),
        deadline_date,
        priority,
        status,
        category,
        assigned_to,
        estimated_time,
        notes?.trim(),
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`SERVER running at http://localhost:${port}`);
});
