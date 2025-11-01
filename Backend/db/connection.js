import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Determine SSL based on environment and DATABASE_URL
const url = process.env.DATABASE_URL || ''
const isLocalhost = /localhost|127\.0\.0\.1/i.test(url)
const requiresSSL = /sslmode=require/i.test(url) || /neon\.tech/i.test(url)

const pool = new Pool({
  connectionString: url,
  ssl: requiresSSL && !isLocalhost ? { rejectUnauthorized: false } : false
})

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err)
  process.exit(-1)
})

export default pool

