# Environment Variables Setup

Create a `.env` file in the Backend directory with the following variables:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/fishlink"

# Security Keys
SECRET_KEY="your-super-secret-aes-key-change-this-in-production-min-32-chars"
JWT_SECRET="your-jwt-secret-key-change-this-in-production-min-32-chars"

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Important Notes:

1. **DATABASE_URL**: Replace `username`, `password`, and `localhost:5432` with your PostgreSQL credentials and connection details.

2. **SECRET_KEY**: Used for AES-256 encryption of QR codes. Must be at least 32 characters for security.

3. **JWT_SECRET**: Used for signing JWT tokens. Must be at least 32 characters for security.

4. **Security Warning**: Never commit the `.env` file to version control. It's already in `.gitignore`.

## Generating Secure Keys:

You can generate secure keys using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to generate both SECRET_KEY and JWT_SECRET.

