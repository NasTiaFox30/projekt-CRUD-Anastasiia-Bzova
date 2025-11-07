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

    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  } finally {
    rl.close();
    console.log('\n === Skrypt zakończony ===');
  }
}

main();