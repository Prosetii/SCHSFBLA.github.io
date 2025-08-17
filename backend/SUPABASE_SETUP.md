# Supabase Setup Guide

## 🔧 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be ready

## 🔑 Step 2: Get Your Credentials

1. Go to your project dashboard
2. Click on "Settings" → "API"
3. Copy your:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## 📝 Step 3: Set Environment Variables

Create a `.env` file in your backend directory with:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3001
NODE_ENV=development
```

## 🗄️ Step 4: Create Database Table

1. Go to your Supabase dashboard
2. Click on "SQL Editor"
3. Run the SQL from `supabase-setup.sql`:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
```

## 👤 Step 5: Create Admin User

Run this command to create the admin user:

```bash
npm run setup-admin
```

This will create:
- **Username:** `SethD`
- **Password:** `VIII`
- **Role:** `admin`

## 🚀 Step 6: Deploy

1. Commit and push your changes
2. Redeploy to Vercel: `vercel --prod`

## ✅ What's Fixed

- ✅ No more "readonly database" errors
- ✅ Works in production (Vercel)
- ✅ Proper async/await database operations
- ✅ Better error handling
- ✅ Scalable cloud database

## 🔍 Troubleshooting

If you get errors:
1. Check your environment variables are set correctly
2. Verify the database table was created
3. Check the Supabase dashboard for any errors
4. Look at the backend logs in Vercel
