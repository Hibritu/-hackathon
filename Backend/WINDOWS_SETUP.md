# Windows Setup Guide

On Windows, the PostgreSQL `createdb` command might not be in your PATH. Here are several ways to set up the database:

## Method 1: Use the Setup Script (Recommended)

This will automatically create the database and run migrations:

```bash
npm run db:setup
```

## Method 2: Use psql (if PostgreSQL is installed)

If you have PostgreSQL installed and `psql` is in your PATH:

```powershell
# Connect to PostgreSQL
psql -U postgres

# Then run:
CREATE DATABASE fishlink;

# Exit psql
\q
```

Then run migrations:
```bash
npm run db:migrate
```

## Method 3: Use pgAdmin (GUI)

1. Open **pgAdmin**
2. Right-click on **Databases** in the left sidebar
3. Select **Create > Database**
4. Name it `fishlink`
5. Click **Save**

Then run migrations:
```bash
npm run db:migrate
```

## Method 4: Create Database Manually in .env

If you already have a PostgreSQL database, just update your `.env` file:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_existing_db"
```

Then run migrations:
```bash
npm run db:migrate
```

## Troubleshooting

### If you get "connection refused" errors:
- Make sure PostgreSQL service is running
- Check if PostgreSQL is listening on port 5432
- Verify your credentials in `.env`

### If psql is not recognized:
- Add PostgreSQL bin directory to your PATH, OR
- Use the full path to psql: `C:\Program Files\PostgreSQL\14\bin\psql.exe -U postgres`

### If you don't have PostgreSQL installed:
- Download and install from: https://www.postgresql.org/download/windows/
- During installation, remember the password you set for the `postgres` user
- Update your `.env` file with the correct password

