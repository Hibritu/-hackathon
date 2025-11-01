import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from '../db/connection.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function migrate() {
  try {
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('🔄 Running database migrations...')
    
    await pool.query(schema)
    
    console.log('✅ Database migrations completed successfully!')
    await pool.end()
    
    if (process.env.AUTO_EXIT !== 'false') {
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    await pool.end()
    
    if (process.env.AUTO_EXIT !== 'false') {
      process.exit(1)
    }
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
}

export default migrate

