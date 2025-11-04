# FREE Deployment Guide - $0/month

Deploy your RuuviTag Test Drive Tracker completely free using Railway, Vercel, and Supabase!

## Why This Approach?

- **Cost:** $0/month (stays within free tiers)
- **Time:** 10 minutes total setup
- **Simplicity:** No complex AWS configuration
- **Perfect for:** Hackathons, demos, MVPs

## Free Services We'll Use

| Service | What For | Free Tier |
|---------|----------|-----------|
| **Railway** | API hosting | $5 credit/month (500 hours) |
| **Railway** | PostgreSQL database | Included in $5 credit |
| **Vercel** | Dashboard hosting | Unlimited (hobby plan) |
| **GitHub** | Code repository | Unlimited public repos |

---

## Step 1: Push Code to GitHub (2 minutes)

1. **Create GitHub repository:**
   - Go to https://github.com/new
   - Repository name: `ruuvitag-test-drive-tracker`
   - Keep it Public (for free tier)
   - **DO NOT** initialize with README
   - Click "Create repository"

2. **Push your code:**
   ```bash
   cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership

   # Remove old AWS CodeCommit remote
   git remote remove origin

   # Add GitHub remote (replace YOUR-USERNAME)
   git remote add origin https://github.com/YOUR-USERNAME/ruuvitag-test-drive-tracker.git

   # Push code
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy API to Railway (3 minutes)

1. **Sign up for Railway:**
   - Go to https://railway.app/
   - Click "Login" → "Login with GitHub"
   - Authorize Railway

2. **Create new project:**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select `ruuvitag-test-drive-tracker`
   - Railway will detect the monorepo

3. **Configure API service:**
   - Click on the deployed service
   - Go to **Settings**
   - Set **Root Directory:** `api`
   - Set **Start Command:** `npm start`
   - Click "Save"

4. **Add PostgreSQL database:**
   - In your project, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway automatically creates `DATABASE_URL` variable!

5. **Set environment variables:**
   - Click on API service → **Variables** tab
   - Add these variables:
     ```
     NODE_ENV=production
     JWT_SECRET=your-random-secret-here
     CORS_ORIGIN=*
     PORT=3001
     ```
   - `DATABASE_URL` is already set by Railway automatically!

6. **Generate domain for API:**
   - Click API service → **Settings** → **Networking**
   - Click "Generate Domain"
   - **COPY THIS URL** (e.g., `https://ruuvitag-api-production.up.railway.app`)

7. **Run database migration:**
   - Wait for deployment to finish (~2 minutes)
   - Go to API service → Click "⋮" → "Service Logs"
   - Once running, open "Shell" tab
   - Run: `npx prisma db push`
   - You should see "✔ Generated Prisma Client"

---

## Step 3: Deploy Dashboard to Vercel (3 minutes)

1. **Sign up for Vercel:**
   - Go to https://vercel.com/
   - Click "Sign Up" → "Continue with GitHub"
   - Authorize Vercel

2. **Import project:**
   - Click "Add New..." → "Project"
   - Import `ruuvitag-test-drive-tracker`

3. **Configure project:**
   - **Framework Preset:** Vite
   - **Root Directory:** Click "Edit" → Select `dashboard`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add environment variable:**
   - Expand "Environment Variables"
   - Add:
     - **Name:** `VITE_API_URL`
     - **Value:** Your Railway URL from Step 2.6
     - Example: `https://ruuvitag-api-production.up.railway.app`

5. **Deploy:**
   - Click "Deploy"
   - Wait ~2 minutes
   - Vercel gives you a URL like: `https://ruuvitag-test-drive-tracker.vercel.app`

---

## Step 4: Test Your Deployment (2 minutes)

### Test API

```bash
# Health check (replace with your Railway URL)
curl https://your-railway-url.up.railway.app/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2025-11-04...",
  "uptime": 123
}

# Get test drives
curl https://your-railway-url.up.railway.app/api/testdrives

# Should return:
{
  "success": true,
  "data": []
}
```

### Test Dashboard

1. Open your Vercel URL in browser
2. You should see the RuuviTag dashboard
3. It will show "No test drives yet" (correct!)

---

## Step 5: Add Sample Data (Optional)

### Option A: Via API

```bash
# Create a test vehicle (replace YOUR-RAILWAY-URL)
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
```

### Option B: Via Railway Database UI

1. Go to Railway → PostgreSQL database
2. Click "Data" tab
3. Use built-in SQL editor to insert data

---

## Your Deployment URLs

Once everything is deployed:

- **Dashboard:** https://your-project.vercel.app
- **API:** https://your-api.up.railway.app
- **Database:** Managed by Railway (internal connection)

---

## Free Tier Limits

| Service | Limit | Good For |
|---------|-------|----------|
| Railway | $5 credit/month (~500 hours) | Demos, hackathons, low traffic |
| Vercel | 100 GB bandwidth/month | Personal projects |
| GitHub | Unlimited public repos | Everything |

**Real-world usage:** Your hackathon project will use ~5-10% of these limits.

---

## Updating Your Deployment

### Update API

```bash
# Make changes to api/
git add .
git commit -m "Update API"
git push

# Railway auto-deploys!
```

### Update Dashboard

```bash
# Make changes to dashboard/
git add .
git commit -m "Update dashboard"
git push

# Vercel auto-deploys!
```

Both services have **automatic deployments** enabled by default!

---

## Monitoring & Logs

### Railway Logs
- Railway Dashboard → API service → "View Logs"
- Real-time logs, errors, and deployment status

### Vercel Logs
- Vercel Dashboard → Your project → "Deployments"
- Build logs and runtime logs

### Database Access
- Railway Dashboard → PostgreSQL → "Data" tab
- Query database directly in browser

---

## Troubleshooting

### API Won't Start

1. Check Railway logs: Service → View Logs
2. Common issues:
   - `DATABASE_URL` not set → Railway should set this automatically
   - Build failed → Check `package.json` in `api/` folder
   - Port conflict → Ensure `PORT` env var is set to 3001

**Fix:**
```bash
# In Railway, check Variables tab has:
DATABASE_URL=postgresql://... (auto-set)
PORT=3001
NODE_ENV=production
```

### Dashboard Shows "Cannot connect to API"

1. Check browser console (F12) for errors
2. Verify `VITE_API_URL` in Vercel environment variables
3. Check CORS settings in API

**Fix:**
```bash
# Update Vercel environment variable:
VITE_API_URL=https://your-correct-railway-url.up.railway.app

# Redeploy: Vercel Dashboard → Deployments → "Redeploy"
```

### Database Connection Fails

1. Check Railway logs for Prisma errors
2. Verify `DATABASE_URL` is set
3. Make sure you ran `npx prisma db push`

**Fix:**
```bash
# Open Railway shell for API service
npx prisma db push
npx prisma generate
```

### "Out of Memory" on Railway

Railway free tier has limited memory. If you hit limits:

1. Reduce concurrent connections
2. Optimize database queries
3. Use Railway's paid plan ($5/month for more resources)

---

## Cost Comparison

| Deployment | Monthly Cost | Notes |
|-----------|--------------|-------|
| **This (Free)** | **$0** | Perfect for hackathons |
| AWS (previous) | $23-30 | Production-grade |
| Heroku | $7-25 | Deprecated free tier |
| DigitalOcean | $12-20 | Requires server management |

---

## Scaling Beyond Free Tier

When your project grows:

### Railway ($5-10/month)
- 500+ concurrent users
- Remove hobby restrictions
- Better performance

### Vercel Pro ($20/month)
- Custom domains with SSL
- Team collaboration
- Priority support

### Upgrade Path
1. Start with free tier (hackathon)
2. Monitor usage in dashboards
3. Upgrade only what you need

---

## Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a strong random value:
  ```bash
  # Generate strong secret:
  openssl rand -base64 32
  ```
- [ ] Restrict `CORS_ORIGIN` to your Vercel URL
- [ ] Enable Railway environment variable encryption
- [ ] Use GitHub branch protection
- [ ] Add `.env` files to `.gitignore` (already done)

---

## Bonus: Custom Domain (Optional)

### Vercel Custom Domain (Free)
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records (Vercel provides instructions)

### Railway Custom Domain ($0 with Cloudflare)
1. Railway → Settings → Networking
2. Add custom domain
3. Configure DNS with Cloudflare (free SSL)

---

## Need Help?

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Project README:** [README.md](README.md)

---

## Quick Reference Commands

```bash
# Check Railway deployment status
railway status

# View Railway logs
railway logs

# Connect to Railway database
railway run psql $DATABASE_URL

# Redeploy Vercel
vercel --prod

# View Vercel logs
vercel logs
```

---

**Deployment Time:** ~10 minutes
**Monthly Cost:** $0
**Perfect For:** Hackathons, MVPs, Demos

🎉 **You're ready to ship!**
