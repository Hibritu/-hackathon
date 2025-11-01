import dotenv from 'dotenv';
import pool from '../db/connection.js';

dotenv.config();

async function reset() {
  try {
    if (process.env.ALLOW_DB_RESET !== 'true') {
      console.error('❌ Refusing to reset DB. Set ALLOW_DB_RESET=true in .env to proceed.');
      process.exit(1);
    }

    console.log('⚠️  RESETTING DATABASE OBJECTS ON NEON...');

    const statements = `
      -- Drop dependent tables first
      DROP TABLE IF EXISTS deliveries CASCADE;
      DROP TABLE IF EXISTS ledger_entries CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS catches CASCADE;
      DROP TABLE IF EXISTS representatives CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      -- Drop legacy enum types if present
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
          EXECUTE 'DROP TYPE enum_users_role';
        END IF;
      END$$;
    `;

    await pool.query(statements);
    console.log('✅ Dropped existing tables and legacy enum types');

    // Run migrations to recreate schema
    process.env.AUTO_EXIT = 'false';
    const { default: migrate } = await import('./migrate.js');
    await migrate();

    console.log('✅ Recreated schema successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
  }
}

reset();
