# Database Setup Guide

## The Problem
The login is failing because we're using SQLite, which doesn't work on Vercel's serverless platform. We need to switch to PostgreSQL.

## Quick Fix - Vercel Postgres (Recommended)

### Step 1: Add Vercel Postgres to your project
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your `ecommerce-admin-dashboard` project
3. Go to the "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose a database name (e.g., `ecommerce-admin-db`)
7. Select your region
8. Click "Create"

### Step 2: Connect the database
1. After creation, click "Connect"
2. Copy the environment variables shown
3. In your Vercel project settings, go to "Environment Variables"
4. Add these variables:
   - `DATABASE_URL` (the PostgreSQL connection string)
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL` 
   - `POSTGRES_URL_NON_POOLING`

### Step 3: Update your local environment
Create a `.env.local` file with your database URL:
```
DATABASE_URL="your-postgres-connection-string-from-vercel"
```

### Step 4: Deploy the updated schema
The code is already updated for PostgreSQL. Just push to trigger a new deployment:

```bash
git add .
git commit -m "Switch to PostgreSQL for production compatibility"
git push origin main
```

### Step 5: Initialize the database
After deployment, visit:
`https://your-app-url.vercel.app/api/init-db`

This will create the admin user and sample data.

### Step 6: Test login
Try logging in with:
- Email: `admin@ecommerce.com`
- Password: `admin123456`

## Alternative Options

### Option 2: Supabase (Free PostgreSQL)
1. Go to https://supabase.com
2. Create a new project
3. Get the database URL from Settings > Database
4. Add it to your Vercel environment variables

### Option 3: PlanetScale (Free MySQL)
1. Go to https://planetscale.com
2. Create a new database
3. Update Prisma schema to use MySQL
4. Get connection string and add to Vercel

### Option 4: Railway (Free PostgreSQL)
1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Get connection string and add to Vercel

## Why This Fixes the Login Issue

SQLite stores data in a local file, but Vercel's serverless functions are stateless and don't have persistent file storage. Each request runs in a fresh container, so the database file doesn't exist.

PostgreSQL runs as a separate service that all your serverless functions can connect to, solving the persistence issue.