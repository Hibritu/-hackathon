import pool from '../db/connection.js';
import dotenv from 'dotenv';

dotenv.config();

async function addNationalIdColumn() {
  try {
    console.log('🔄 Adding national_id column to catches table...');
    
    const query = `
      ALTER TABLE IF EXISTS catches 
      ADD COLUMN IF NOT EXISTS national_id VARCHAR(50);
    `;
    
    await pool.query(query);
    console.log('✅ Column "national_id" added successfully to catches table.');
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding column:');
    console.error(err.message);
    await pool.end();
    process.exit(1);
  }
}

addNationalIdColumn();
