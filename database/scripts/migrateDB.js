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
    let environment;
    let databaseUrl = null;

    const args = process.argv.slice(2);
    
    console.log('\n' + '='.repeat(50));
    
    if (environment === 'local') {
      console.log('📍 Wybrano lokalną bazę danych');
      console.log('   Host: ', process.env.DB_HOST);
      console.log('   Baza danych: ', process.env.DB_NAME);
    } else {
      console.log('🌐 Wybrano zdalną bazę danych');
      const urlToShow = databaseUrl;
      if (urlToShow) {
        const maskedUrl = urlToShow.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
        console.log('   URL:', maskedUrl);
      }
    }
    
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  } finally {
    rl.close();
    console.log('\n === Skrypt zakończony ===');
  }
}

main();