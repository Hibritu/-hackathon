import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const { Pool } = pg;

async function createDatabase() {
  // Check if .env file exists
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ No .env file found!');
    console.log('\n📝 Please create a .env file in the Backend directory with:');
    console.log('DATABASE_URL="postgresql://username:password@localhost:5432/fishlink"');
    console.log('SECRET_KEY="your-secret-key-here"');
    console.log('JWT_SECRET="your-jwt-secret-here"');
    console.log('PORT=5000');
    console.log('\nSee Backend/ENV_SETUP.md for details.');
    process.exit(1);
  }

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
    console.error('❌ DATABASE_URL is not set in .env file!');
    console.log('\n📝 Please add DATABASE_URL to your .env file:');
    console.log('DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fishlink"');
    console.log('\nReplace YOUR_PASSWORD with your PostgreSQL password.');
    process.exit(1);
  }

  // Get database name from DATABASE_URL
  const dbNameMatch = process.env.DATABASE_URL.match(/\/([^/]+)(\?|$)/);
  if (!dbNameMatch) {
    console.error('❌ Invalid DATABASE_URL format!');
    console.log('\n📝 DATABASE_URL should be in format:');
    console.log('postgresql://username:password@host:port/database');
    console.log('\nExample: postgresql://postgres:password@localhost:5432/fishlink');
    process.exit(1);
  }
  
  const dbName = dbNameMatch[1];
  
  // Build connection string for admin database (postgres)
  // Replace the database name with 'postgres' to connect to default database
  const adminConnectionString = process.env.DATABASE_URL.replace(/\/[^/]+(\?.*)?$/, '/postgres$1');

  // Connect to default postgres database to create our database
  const adminPool = new Pool({
    connectionString: adminConnectionString
  });

  try {
    console.log(`🔄 Connecting to PostgreSQL...`);
    console.log(`🔄 Creating database: ${dbName}...`);
    
    // Check if database exists
    const checkResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`✅ Database "${dbName}" already exists.`);
    } else {
      // Create database
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully!`);
    }

    await adminPool.end();
    
    // Now run migrations
    console.log('\n🔄 Running migrations...');
    process.env.AUTO_EXIT = 'false';
    const { default: migrate } = await import('./migrate.js');
    await migrate();
    console.log('\n✅ Database setup completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    // Provide helpful error messages based on error type
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. Make sure:');
      console.log('1. PostgreSQL is installed and running');
      console.log('2. PostgreSQL is listening on the correct host and port');
    } else if (error.code === '3D000') {
      console.log('\n💡 Database not found. This is expected - it will be created.');
    } else if (error.message.includes('password authentication')) {
      console.log('\n💡 Password authentication failed. Make sure:');
      console.log('1. Your PostgreSQL password in DATABASE_URL is correct');
      console.log('2. The user in DATABASE_URL has permissions to create databases');
    } else {
      console.log('\n💡 Make sure:');
      console.log('1. PostgreSQL is installed and running');
      console.log('2. Your .env file has DATABASE_URL configured correctly');
      console.log('3. DATABASE_URL format: postgresql://user:password@host:port/database');
    }
    
    console.log('\n💡 Alternative: Create database manually using one of these methods:');
    console.log('1. Using psql: psql -U postgres -c "CREATE DATABASE fishlink;"');
    console.log('2. Using pgAdmin: Right-click Databases > Create > Database');
    console.log('3. Then run: npm run db:migrate');
    
    try {
      await adminPool.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
}

createDatabase();
