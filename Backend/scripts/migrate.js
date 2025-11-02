import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from '../db/connection.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function migrate() {
  const client = await pool.connect()
  try {
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('🔄 Running database migrations...')
    
    // Execute the entire schema as a single transaction
    await client.query(schema)
    
    console.log('✅ Database migrations completed successfully!')
    client.release()
    await pool.end()
    
    if (process.env.AUTO_EXIT !== 'false') {
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.error('Error details:', error.message)
    client.release()
    await pool.end()
    
    if (process.env.AUTO_EXIT !== 'false') {
      process.exit(1)
    }
  }
}

// Only run if called directly
const isMainModule = import.meta.url.endsWith('migrate.js') && 
                     process.argv[1] && process.argv[1].includes('migrate.js');
if (isMainModule) {
  migrate()
}

export default migrate

