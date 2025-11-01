import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found!');
  console.log('\n📝 Creating .env file with default values...\n');
  
  const defaultEnv = `# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fishlink"

# Security Keys (CHANGE THESE IN PRODUCTION!)
SECRET_KEY="change-this-to-a-random-32-character-string-in-production"
JWT_SECRET="change-this-to-a-random-32-character-string-in-production"

# Server Configuration
PORT=5000
NODE_ENV=development
`;
  
  fs.writeFileSync(envPath, defaultEnv);
  console.log('✅ Created .env file with default values.');
  console.log('⚠️  IMPORTANT: Please update DATABASE_URL with your actual PostgreSQL credentials!');
  console.log('⚠️  IMPORTANT: Change SECRET_KEY and JWT_SECRET to secure random strings!\n');
} else {
  console.log('✅ .env file exists');
}

