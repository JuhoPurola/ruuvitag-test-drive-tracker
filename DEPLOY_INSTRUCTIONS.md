# Complete This Deployment - 5 Minutes

I've prepared everything for FREE deployment. You just need to complete these 3 quick web steps:

## Current Status

✅ Code is ready and committed
✅ Railway config created
✅ Vercel config created
✅ AWS resources cleaned up

**What's left:** Connect to Railway & Vercel (web-based, 5 minutes)

---

## Step 1: Create GitHub Repo (2 minutes)

**Option A - Via GitHub Website (Easiest):**

1. Go to https://github.com/new
2. Repository name: `ruuvitag-test-drive-tracker`
3. Make it **Public** (required for free tier)
4. **DO NOT** check any boxes (no README, no .gitignore)
5. Click "Create repository"
6. Copy the repository URL (e.g., `https://github.com/yourname/ruuvitag-test-drive-tracker.git`)

7. Run these commands:
```bash
cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership

# Remove CodeCommit remote
git remote remove origin

# Add GitHub remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/ruuvitag-test-drive-tracker.git

# Push code
git push -u origin main
```

**Option B - Keep CodeCommit:**

If you prefer to stay with CodeCommit, Railway can connect to it via manual upload:
- Export your project as ZIP
- Upload to Railway manually

For now, GitHub is simpler for free deployment.

---

## Step 2: Deploy to Railway (2 minutes)

1. **Go to https://railway.app/**
2. Click "Login with GitHub"
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `ruuvitag-test-drive-tracker`

6. **Railway detects your project automatically!**
   - Click on the service that appears
   - Go to Settings
   - Set **Root Directory:** `api`
   - Save

7. **Add PostgreSQL database:**
   - Click "+ New" in your project
   - Select "Database" → "PostgreSQL"
   - Railway auto-connects it!

8. **Set environment variables:**
   - Click API service → Variables
   - Add these (DATABASE_URL is already set):
     ```
     NODE_ENV=production
     JWT_SECRET=hackathon-2025-secret-key
     CORS_ORIGIN=*
     PORT=3001
     ```

9. **Generate public URL:**
   - API service → Settings → Networking
   - Click "Generate Domain"
   - **COPY THIS URL** (like: `https://ruuvitag-api-production.up.railway.app`)

10. **Initialize database:**
    - Wait for deploy to finish (check Deployments tab)
    - Once running, open deployment logs
    - Click into the service
    - Look for "✓ Deployment successful"
    - Then manually trigger: Settings → Deploy

---

## Step 3: Deploy to Vercel (1 minute)

1. **Go to https://vercel.com/**
2. Click "Sign Up" → "Continue with GitHub"
3. Click "Add New..." → "Project"
4. Import `ruuvitag-test-drive-tracker`

5. **Configure:**
   - Framework: Vite
   - Root Directory: `dashboard` (click Edit to select)
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. **Environment Variables:**
   - Click "Environment Variables"
   - Add:
     - Name: `VITE_API_URL`
     - Value: Your Railway URL from Step 2.9
     - Example: `https://ruuvitag-api-production.up.railway.app`

7. Click "Deploy"

**Done!** Your dashboard will be at: `https://ruuvitag-test-drive-tracker.vercel.app`

---

## Alternative: CLI Deployment (If You Prefer)

If you want to use command line instead:

### Install CLIs:
```bash
# Install Railway CLI
brew install railway

# Install Vercel CLI
npm install -g vercel
```

### Deploy with CLI:
```bash
cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership

# Login to Railway
railway login

# Deploy API
cd api
railway up

# Add PostgreSQL
railway add postgres

# Deploy dashboard
cd ../dashboard
vercel --prod
```

---

## What Happens Next?

After you complete the 3 steps above:

1. **Railway builds your API** (~2 minutes)
   - Installs dependencies
   - Builds TypeScript
   - Generates Prisma client
   - Starts server

2. **Vercel builds your dashboard** (~1 minute)
   - Installs dependencies
   - Builds React app
   - Deploys to CDN

3. **Your app is live!**
   - API: `https://your-api.up.railway.app`
   - Dashboard: `https://your-project.vercel.app`

---

## Initialize Database Schema

After Railway deployment is complete:

1. Go to Railway → Your API service
2. Click on deployment
3. Open "View Logs"
4. Look for successful deployment
5. Then in Settings → add a new deploy trigger, or:

**Manual init via Railway shell:**
1. Railway Dashboard → API service
2. Click "⋮" menu → "Shell"
3. Run: `npx prisma db push`

---

## Test Your Deployment

```bash
# Test API (replace with your Railway URL)
curl https://your-railway-url.up.railway.app/health

# Should return:
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 123
}

# Test getting test drives
curl https://your-railway-url.up.railway.app/api/testdrives

# Should return:
{
  "success": true,
  "data": []
}
```

Open your Vercel URL in browser - you should see the dashboard!

---

## Total Cost: $0/month

- Railway: $5 credit/month (enough for 500 hours)
- Vercel: Unlimited on hobby plan
- GitHub: Free for public repos

---

## Need Help?

If you run into issues:

1. **Railway not building:**
   - Check logs in Deployments tab
   - Verify Root Directory is set to `api`
   - Check all environment variables are set

2. **Vercel not building:**
   - Check build logs
   - Verify Root Directory is `dashboard`
   - Check VITE_API_URL is set correctly

3. **Dashboard shows "Cannot connect to API":**
   - Verify Railway URL in Vercel environment variables
   - Check CORS is set to `*` in Railway
   - Check Railway deployment is successful

---

## Summary

You've got everything ready. Just:

1. ✅ Create GitHub repo (2 min) → Push code
2. ✅ Deploy to Railway (2 min) → Get API URL
3. ✅ Deploy to Vercel (1 min) → Use API URL

**Total: 5 minutes to free deployment!**

All configuration files are already created:
- ✅ `api/railway.json`
- ✅ `vercel.json`
- ✅ Code committed and ready

Let me know if you want me to walk through any specific step in more detail!
