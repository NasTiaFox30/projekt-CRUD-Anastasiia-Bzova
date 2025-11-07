import pkg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

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

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}


async function main() {
  console.log('✈️ Skrypt migracji bazy danych');
  console.log('='.repeat(50));
  
  try {
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  } finally {
    rl.close();
    console.log('\n === Skrypt zakończony ===');
  }
}

main();