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

async function runMigrations(environment, databaseUrl = null) {
  let pool;
  let config;
  
  try {
    
  } catch (error) {
    console.error('\n❌ Błąd migracji:', error.message);
    
  } finally {
    if (pool) {
      await pool.end();
      console.log('\n === Połączenie z bazą danych zamknięte ===');
    }
  }
}

async function main() {
  console.log('✈️ Skrypt migracji bazy danych');
  console.log('='.repeat(50));
  
  try {
    let environment;
    let databaseUrl = null;

    const args = process.argv.slice(2);
    
    if (args.length > 0) {
      environment = args[0].toLowerCase();
      
      // Jeśli URL został przekazany jako drugi argument lub jako jedyny argument
      if (args.length > 1 && args[1].startsWith('postgresql://')) {
        databaseUrl = args[1];
      } else if (args[0].startsWith('postgresql://')) {
        environment = 'remote';
        databaseUrl = args[0];
      }
    } else {
      // Interactive mode:
      environment = await askQuestion(
        'Wybierz środowisko (local/remote): '
      ).then(answer => answer.toLowerCase().trim());
    }

    if (!['local', 'remote'].includes(environment)) {
      console.log('❌ Nieprawidłowy wybór. Dostępne opcje: local, remote');
      return;
    }

    // Dla remote pytamy o URL, jeśli nie został podany
    if (environment === 'remote' && !databaseUrl) {
      databaseUrl = await askQuestion(
        'Wprowadź DATABASE_URL (postgresql://...): '
      );
      
      if (!databaseUrl.startsWith('postgresql://')) {
        console.log('❌ Nieprawidłowy format DATABASE_URL');
        return;
      }
    }

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