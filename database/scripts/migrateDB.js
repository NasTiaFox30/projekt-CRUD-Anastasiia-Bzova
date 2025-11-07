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
    console.log(`🚀 Uruchamianie migracji dla ${environment} bazy danych...`);
    
    if (environment === 'local') {
      config = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
      };
      
      if (!config.password) {
        throw new Error('Hasło Bazy Danych nie zostało podane w pliku .env (DB_PASSWORD)');
      }
    } 
    else if (environment === 'remote') {
      // Dla remote używamy przekazanego URL
      const finalDatabaseUrl = databaseUrl;
      
      if (!finalDatabaseUrl) {
        throw new Error('DATABASE_URL nie zostało podane. Wprowadź je ręcznie');
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

    // Actual state of DB:
    console.log('\n📊 Aktualny stan bazy danych:');
    console.log(`   Znaleziono tabel: ${existingTables.rows.length}`);
    
    // Process if tables exist
    if (existingTables.rows.length > 0) {
      console.log('\n📋 Istniejące tabele:');
      existingTables.rows.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
      console.log('\n⚠️  Uwaga: Migracje będą dodawać tabele do istniejących');
      
      // Pytamy o potwierdzenie
      const confirmation = await askQuestion(
        `\n❓ Kontynuować migrację? Istniejące tabele mogą zostać nadpisane (y/N): `
      );

      if (confirmation.toLowerCase() !== 'y') {
        console.log('❌ Migracja anulowana');
        return;
      }
    }

    // === Migration process ===
    // Czytamy plik migracji
    const migrationPath = join(__dirname, '../migration.sql');
    console.log(`\n📖 Odczytywanie pliku migracji: ${migrationPath}`);
    
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Wykonywanie migracji...');
    
    // Wykonujemy migracje po jednym zapytaniu (avoid errors)
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await pool.query(statement + ';');
          console.log(`   ✅ Wykonano zapytanie ${i + 1}/${statements.length}`);
        } catch (error) {
          // Ignorujemy błędy "tabela już istnieje" dla CREATE TABLE IF NOT EXISTS
          if (error.code === '42P07' && statement.toUpperCase().includes('CREATE TABLE')) {
            console.log(`   ℹ️  Tabela już istnieje (zapytanie ${i + 1})`);
          } else {
            throw error;
          }
        }
      }
    }

    // === Dodatkowe informacje o tabelach ===
    console.log('\n📈 Szczegółowe informacje:');
    
    // Liczba użytkowników
    try {
      const usersCount = await pool.query('SELECT COUNT(*) FROM Users');
      console.log(`   👥 Użytkownicy: ${usersCount.rows[0].count}`);
    } catch (error) {
      console.log('   👥 Użytkownicy: tabela nie została utworzona lub jest pusta');
    }

    // Liczba zadań
    try {
      const tasksCount = await pool.query('SELECT COUNT(*) FROM Tasks');
      console.log(`   📝 Zadania: ${tasksCount.rows[0].count}`);
    } catch (error) {
      console.log('   📝 Zadania: tabela nie została utworzona lub jest pusta');
    }

    // Sprawdzamy indeksy
    try {
      const indexes = await pool.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND tablename IN ('tasks', 'users')
      `);
      console.log(`   🔍 Indeksy: ${indexes.rows.length} znaleziono`);
    } catch (error) {
      console.log('   🔍 Indeksy: nie udało się sprawdzić');
    }
    
  } catch (error) {
    console.error('\n❌ Błąd migracji:', error.message);
    
    if (error.code === '28P01') {
      console.log('💡 Sprawdź poprawność hasła/nazwy użytkownika Bazy Danych');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Sprawdź:');
      console.log('   - Czy PostgreSQL jest uruchomione');
      console.log('   - Poprawność hosta/portu');
    } else if (error.code === '3D000') {
      console.log('💡 Baza danych nie istnieje');
    } else if (error.code === '42P07') {
      console.log('💡 Tabela już istnieje. Może powinieneś najpierw wyczyścić bazę danych.');
    } else if (error.code === '23505') {
      console.log('💡 Błąd unikalności: możliwe, że dane już istnieją');
    }
    
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