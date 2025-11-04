# Deploy FREE in 3 Clicks - Start Here!

Your RuuviTag Test Drive Tracker is ready to deploy for FREE ($0/month).

## What You Need (Takes 3 Minutes Total)

1. GitHub account (free)
2. Railway account (free)
3. Vercel account (free)

All can be created with "Continue with GitHub" - no credit card needed!

---

## Step 1: Push to GitHub (1 minute)

First, create a GitHub repo and push your code:

### A. Create GitHub Repo

1. Go to: https://github.com/new
2. Repository name: `ruuvitag-test-drive-tracker`
3. Make it **Public** (required for free tier)
4. **DO NOT** check any initialization boxes
5. Click "Create repository"

### B. Push Your Code

Copy your GitHub username from the URL, then run:

```bash
cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership

# Remove old remote
git remote remove origin 2>/dev/null || true

# Add GitHub (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/ruuvitag-test-drive-tracker.git

# Push
git branch -M main
git push -u origin main
```

✅ **Done!** Your code is now on GitHub.

---

## Step 2: Deploy API to Railway (1 minute)

### One-Click Deploy:

1. **Click this button:**

   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

2. Choose "Deploy from GitHub repo"

3. Select `ruuvitag-test-drive-tracker`

4. Railway auto-detects your monorepo!

5. Click on the deployed service → **Settings**:
   - Root Directory: `api`
   - Start Command: `npm start`
   - Save

6. Add PostgreSQL database:
   - In your project, click **"+ New"**
   - Select **"Database"** → **"PostgreSQL"**
   - Done! Railway auto-connects it

7. Add environment variables:
   - Click API service → **"Variables"** tab
   - Add these:
     ```
     NODE_ENV=production
     JWT_SECRET=hackathon-secret-2025
     CORS_ORIGIN=*
     PORT=3001
     ```
   - `DATABASE_URL` is already set by Railway!

8. Generate public URL:
   - API service → **Settings** → **Networking**
   - Click **"Generate Domain"**
   - **COPY THIS URL!** (e.g., `ruuvitag-api-production.up.railway.app`)

9. Initialize database:
   - Wait for deployment to complete (~2 min)
   - Go to API service → Click "..." → **"Shell"**
   - Run: `npx prisma db push`
   - Should see: "✔ Generated Prisma Client"

✅ **API is live!** Test it:
```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/health
```

---

## Step 3: Deploy Dashboard to Vercel (1 minute)

### One-Click Deploy:

1. **Click this button:**

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

2. Click **"Add New..."** → **"Project"**

3. Import `ruuvitag-test-drive-tracker`

4. Configure:
   - Framework Preset: **Vite**
   - Root Directory: Click "Edit" → Select **`dashboard`**
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Add environment variable:
   - Expand **"Environment Variables"**
   - Name: `VITE_API_URL`
   - Value: `https://YOUR-RAILWAY-URL.up.railway.app` (from Step 2.8)

6. Click **"Deploy"**

7. Wait ~1 minute, get your URL!

✅ **Dashboard is live!** URL looks like: `ruuvitag-test-drive-tracker.vercel.app`

---

## 🎉 You're Live! Here's How to Access Everything:

### Your URLs:

- **Dashboard:** `https://your-project.vercel.app`
- **API:** `https://your-api.up.railway.app`
- **Database:** Managed by Railway (internal)

### Test Your Deployment:

```bash
# Test API health
curl https://your-railway-url.up.railway.app/health

# Test getting test drives (should be empty array)
curl https://your-railway-url.up.railway.app/api/testdrives
```

### Open Dashboard:

Just open your Vercel URL in a browser! You should see:

- "RuuviTag Test Drive Tracker" title
- Stats cards showing zeros (no data yet)
- "No test drives yet" message

---

## Add Sample Data (Optional)

To see the dashboard with data:

```bash
# Create a test vehicle
curl -X POST https://YOUR-RAILWAY-URL.up.railway.app/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Tesla",
    "model": "Model 3",
    "year": 2024,
    "vin": "TEST123456789",
    "color": "Blue",
    "ruuviTagMac": "AA:BB:CC:DD:EE:FF"
  }'

# Create a test customer
curl -X POST https://YOUR-RAILWAY-URL.up.railway.app/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

Refresh your dashboard - you should now see the data!

---

## Troubleshooting

### "Cannot connect to API" in dashboard

1. Check Railway logs: API service → View Logs
2. Verify `VITE_API_URL` is correct in Vercel
3. Redeploy Vercel if you updated the env var

### API not starting

1. Check Railway deployment logs
2. Verify `DATABASE_URL` exists in Variables
3. Make sure you ran `npx prisma db push`

### Database errors

Run in Railway shell:
```bash
npx prisma db push
npx prisma generate
```

---

## Cost Breakdown

| Service | What | Free Tier | Your Usage |
|---------|------|-----------|------------|
| Railway | API + DB | $5 credit/month (~500 hrs) | ~10-20% |
| Vercel | Dashboard | 100 GB bandwidth | ~1% |
| GitHub | Code | Unlimited public repos | ✓ |
| **Total** | | **$0/month** | **FREE!** |

---

## What's Next?

### Update Your Deployment

Everything auto-deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Both Railway and Vercel auto-deploy!
```

### Add Custom Domain (Optional)

- **Vercel:** Settings → Domains (free SSL)
- **Railway:** Settings → Networking → Custom Domain

### Monitor Your App

- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## Quick Reference

```bash
# Your project location
cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership

# Test API locally
cd api
npm install
npm run dev
# API at http://localhost:3001

# Test dashboard locally
cd dashboard
npm install
npm run dev
# Dashboard at http://localhost:5173
```

---

## Need Help?

If something doesn't work:

1. Check Railway logs (real-time deployment logs)
2. Check Vercel logs (build and runtime logs)
3. Verify all environment variables are set
4. Make sure database was initialized with Prisma

Common issues are usually:
- Forgot to set `VITE_API_URL` in Vercel
- Forgot to run `npx prisma db push` in Railway
- Root directory not set correctly

---

**Ready?** Start with Step 1 above! Takes 3 minutes total.

After deployment, come back and tell me your URLs so I can help you test them!
