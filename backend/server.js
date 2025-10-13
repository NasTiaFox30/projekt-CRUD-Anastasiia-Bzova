import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

//initialization of App:
const { Pool } = pkg;
const app = express();
const port = process.env.PORT;

// Middleware (working Frontend with Backend)
app.use(cors());
//parsing
app.use(express.json());

// Postgre Conn Config: 
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});


// Routes
// GET /tasks 
app.get('/tasks', async (req, res) => {
  try {
    console.log("> GET all Tasks");
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetch data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tasks/:id 
app.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`> GET task by ID: ${id}`);
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found!' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetch data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//POST /tasks
