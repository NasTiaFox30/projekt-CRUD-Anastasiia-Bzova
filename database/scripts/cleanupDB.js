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

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function cleanupDatabase(environment, databaseUrl = null) {
  let pool;
  let config;
  
  try {
    console.log(`🧹 Przygotowanie do wyczyszczenia bazy danych (${environment})...`);
    
    if (environment === 'local') {
      config = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
      };
      
      if (!config.password) {
        throw new Error('Hasło do bazy danych nie jest ustawione w pliku .env (DB_PASSWORD)');
      }
    } 
    else if (environment === 'remote') {
      // Dla remote używamy przekazanego URL
      const finalDatabaseUrl = databaseUrl;
      
      if (!finalDatabaseUrl) {
        throw new Error('DATABASE_URL nie został podany. Wprowadź go ręcznie');
      }
      
      config = {
        connectionString: finalDatabaseUrl,
        ssl: { rejectUnauthorized: false }
      };
    }
    else {
      throw new Error(`Nieznane środowisko: ${environment}`);
    }

    // Connect, Check connection & fetch info
    pool = new Pool(config);
    console.log('⏳ Sprawdzanie połączenia...');
    await pool.query('SELECT 1');
    console.log('✅ Połączenie powiodło się!');

    const dbInfo = await pool.query('SELECT current_database(), current_user');
    console.log(`📊 Baza danych: ${dbInfo.rows[0].current_database}`);
    console.log(`👤 Użytkownik: ${dbInfo.rows[0].current_user}`);

    // Check existing tables
    const existingTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    console.log('\n📋 Znalezione tabele w bazie danych:');
    existingTables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    if (existingTables.rows.length === 0) {
      console.log('ℹ️  W bazie danych nie ma tabel do usunięcia');
      return;
    }

    const confirmation = await askQuestion(
      `\n⚠️  CZY NA PEWNO CHCESZ CAŁKOWICIE USUNĄĆ WSZYSTKIE TABELE?\n` +
      `   Ta operacja usunie WSZYSTKIE tabele i wszystkie dane! (y/N): `
    );

    if (confirmation.toLowerCase() !== 'y') {
      console.log('❌ Operacja anulowana');
      return;
    }

    console.log('\n🔄 Rozpoczynanie usuwania tabel...');

    // Delete tables (Avoid errors - foreign key)
    console.log('\n🗑️  Usuwanie tabeli Tasks...');
    try {
      await pool.query('DROP TABLE IF EXISTS Tasks CASCADE');
      console.log('✅ Tabela Tasks została usunięta');
    } catch (error) {
      console.log('❌ Błąd usuwania Tasks:', error.message);
    }

    console.log('🗑️  Usuwanie tabeli Users...');
    try {
      await pool.query('DROP TABLE IF EXISTS Users CASCADE');
      console.log('✅ Tabela Users została usunięta');
    } catch (error) {
      console.log('❌ Błąd usuwania Users:', error.message);
    }

    // Usuwamy indeksy, jeśli pozostały
    console.log('🗑️  Usuwanie indeksów...');
    try {
      await pool.query('DROP INDEX IF EXISTS idx_tasks_user_id CASCADE');
      console.log('✅ Indeksy zostały usunięte');
    } catch (error) {
      console.log('ℹ️  Indeksy już usunięte lub nie istnieją');
    }

    // Sprawdzamy wyniki
    const remainingTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);
    
    console.log('\n📊 Wyniki czyszczenia:');
    console.log(`   Pozostało tabel: ${remainingTables.rows.length}`);
    
    if (remainingTables.rows.length > 0) {
      console.log('\n📋 Pozostałe tabele:');
      remainingTables.rows.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
    console.log(`\n🎉 Baza danych została pomyślnie oczyszczona! Wszystkie tabele zostały usunięte.`);
    console.log(`💡 Teraz możesz uruchomić migracje, aby utworzyć nowe tabele.`);
    
  } catch (error) {
    console.error('\n❌ Błąd podczas czyszczenia:', error.message);
    
    if (error.code === '28P01') {
      console.log('💡 Sprawdź poprawność hasła/loginu do bazy danych');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Sprawdź:');
      console.log('   - Czy PostgreSQL jest uruchomiony');
      console.log('   - Poprawność hosta/portu');
    } else if (error.code === '3D000') {
      console.log('💡 Baza danych nie istnieje');
    }
    
  } finally {
    if (pool) {
      await pool.end();
      console.log('\n === Połączenie z bazą danych zostało zamknięte ===');
    }
  }
}

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

    await cleanupDatabase(environment, databaseUrl);
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  } finally {
    rl.close();
    console.log('\n === Skrypt zakończony ===');
  }
}

main();