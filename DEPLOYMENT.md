# Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
1. GitHub account
2. Vercel account (free)

### Steps

#### 1. Push to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial deployment"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/ecommerce-admin-dashboard
git push -u origin main
```

#### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `JWT_SECRET`: Generate a secure random string
   - `DATABASE_URL`: Use SQLite for now: `file:./prod.db`
6. Click "Deploy"

#### 3. Environment Variables for Production
In Vercel dashboard, add these environment variables:

```
JWT_SECRET=your-super-secure-jwt-secret-here
DATABASE_URL=file:./prod.db
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

#### 4. Database Setup
The app will automatically create the SQLite database on first run.

### Post-Deployment
- Your app will be live at: `https://your-app-name.vercel.app`
- Every git push will automatically redeploy
- Check logs in Vercel dashboard if issues occur

### Default Admin Account
After deployment, create an admin account by visiting:
`https://your-app-name.vercel.app/api/auth/setup`

## Alternative: Railway Deployment

If you prefer Railway:
1. Connect your GitHub repo to Railway
2. Add the same environment variables
3. Railway will auto-deploy on git push

## Database Upgrade (Optional)
For production, consider upgrading to:
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL) 
- **Railway PostgreSQL**

Update `DATABASE_URL` accordingly and run `npm run db:push`