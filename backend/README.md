# SCHS FBLA Backend

A secure Node.js backend API for the SCHS FBLA login system.

## Features

- 🔐 JWT-based authentication
- 🔒 Password hashing with bcrypt
- 📊 SQLite database
- 🛡️ Rate limiting and security middleware
- 👥 User management (admin/student roles)
- 🔄 Password change functionality

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a `.env` file in the backend directory:
```env
JWT_SECRET=your-super-secret-key-here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Initialize Database
```bash
npm run init-db
```

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### User Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Health Check
- `GET /api/health` - Server health status

## Default Users

The database is initialized with these users:
- **Username:** `SethD` | **Password:** `VIII` | **Role:** `admin`
- **Username:** `JosiahB` | **Password:** `Bread25!` | **Role:** `student`

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with 24-hour expiration
- Rate limiting (5 login attempts per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation

## Deployment

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Deploy: `vercel --prod`
4. Set environment variables in Vercel dashboard:
   - `JWT_SECRET=your-super-secret-key-here`
   - `NODE_ENV=production`

### Local Development
- Backend runs on `http://localhost:3001`
- Frontend should be configured to connect to this URL

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password_hash` - Hashed password
- `email` - User email
- `role` - User role (admin/student)
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp
- `is_active` - Account status

### Sessions Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `token_hash` - Hashed JWT token
- `expires_at` - Token expiration
- `created_at` - Session creation timestamp 