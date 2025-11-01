import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from '../db/connection.js';

dotenv.config();

async function ensureUsersSchema() {
  // Create users table if not exists and add required columns idempotently
  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id              SERIAL PRIMARY KEY,
      name            VARCHAR(150) NOT NULL,
      phone           VARCHAR(30),
      email           VARCHAR(255) UNIQUE,
      password        VARCHAR(255),
      role            VARCHAR(30) NOT NULL DEFAULT 'BUYER',
      email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
      created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS name VARCHAR(150);
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'BUYER';
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  `;
  await pool.query(ddl);
}

async function seedAdmin() {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_NAME = process.env.ADMIN_NAME || 'System Admin';
    const ADMIN_PHONE = process.env.ADMIN_PHONE || null;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || null;

    if (!ADMIN_EMAIL) {
      console.error('❌ ADMIN_EMAIL is required in .env to seed admin');
      process.exit(1);
    }

    // Ensure schema exists even if migrations were not applied
    await ensureUsersSchema();

    // Check if an admin with this email already exists
    const existing = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (existing.rows.length > 0) {
      console.log(`✅ Admin already exists: ${existing.rows[0].email} (role=${existing.rows[0].role})`);
      process.exit(0);
    }

    // Create password
    let passwordToUse = ADMIN_PASSWORD;
    if (!passwordToUse) {
      // Generate a random strong password if not provided
      passwordToUse = Math.random().toString(36).slice(-10) + 'A!9';
      console.log(`ℹ️  ADMIN_PASSWORD not set. Generating temporary password: ${passwordToUse}`);
    }

    const hashed = await bcrypt.hash(passwordToUse, 10);

    const insert = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, created_at`,
      [ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, hashed, 'ADMIN', true]
    );

    const admin = insert.rows[0];
    console.log('✅ Seeded ADMIN user:');
    console.log({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
