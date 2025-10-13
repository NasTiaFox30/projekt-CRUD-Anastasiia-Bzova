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

