import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

//initialization of App:
const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 3001;

// Middleware (working Frontend with Backend)
app.use(cors());
//parsing
app.use(express.json());

// Postgre Conn Config: 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});


// Routes
// GET /tasks     (get all tasks)
app.get('/tasks', async (req, res) => {
  try {
    console.log("> GET all Tasks");
    const result = await pool.query('SELECT * FROM Tasks ORDER BY created_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetch data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tasks/:id       (get task by ID)
app.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`> GET task by ID: ${id}`);
    const result = await pool.query('SELECT * FROM Tasks WHERE ID = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found!' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetch data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//POST /tasks     (add new task)
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
      return res.status(400).json({ error: 'Title of Task - required!' });
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
    
    console.log('Success!');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//PUT /tasks/:id      (update task)
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
      return res.status(400).json({ error: 'Title of Task - required!' });
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

    console.log('Success!');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetch data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//DELETE /tasks/:id     (delete task)
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`> DELETE Task by ID - ${id}`);
    const result = await pool.query('DELETE FROM Tasks WHERE ID = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log('Success!');
    res.status(204).send();
  } catch (error) {
    console.error('Error fetch data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//Start Server
app.listen(port, () => {
  console.log(`SERVER Started on http://localhost:${port}`);
});
