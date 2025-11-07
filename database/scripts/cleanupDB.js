import pkg from 'pg';
import dotenv from 'dotenv';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ENV
dotenv.config({ path: join(__dirname, '../../backend/.env') });

const { Pool } = pkg;

// Readline interface (console input)
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


async function main() {
  console.log('🗑️ Skrypt pełnego czyszczenia bazy danych');
  console.log('='.repeat(50));
  
}

main();