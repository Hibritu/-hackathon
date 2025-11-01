# FishLink Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the Backend directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/fishlink"
SECRET_KEY="your-super-secret-aes-key-change-this-in-production"
JWT_SECRET="your-jwt-secret-key-change-this-in-production"
PORT=5000
NODE_ENV=development
```

3. Create PostgreSQL database:
```bash
# Create database using psql or pgAdmin
createdb fishlink
# OR using psql:
psql -U postgres
CREATE DATABASE fishlink;
```

4. Run database migrations:
```bash
npm run db:migrate
```
This will create all necessary tables, indexes, and triggers.

5. Start the server:
```bash
npm run dev
```

The server will run on http://localhost:5000

## Database

This backend uses `pg` (node-postgres) for PostgreSQL database access instead of Prisma. The database schema is defined in `db/schema.sql`.

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations

