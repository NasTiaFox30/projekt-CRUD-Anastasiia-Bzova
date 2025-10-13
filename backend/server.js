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
