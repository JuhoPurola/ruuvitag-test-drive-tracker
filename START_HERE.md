# Deploy Your RuuviTag Test Drive Tracker - FREE

Your app is ready to deploy! Follow these 3 simple steps (takes 5 minutes total):

---

## Step 1: Push to GitHub (2 minutes)

### A. Create GitHub Repository

1. Go to: **https://github.com/new**
2. Repository name: `ruuvitag-test-drive-tracker`
3. Make it **Public** (required for free tier)
4. **DO NOT** check any initialization boxes
5. Click **"Create repository"**

### B. Push Your Code

After creating the repository, edit and run this script:

```bash
# 1. Open the script
open /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership/PUSH_TO_GITHUB.sh

# 2. Replace YOUR-USERNAME with your actual GitHub username

# 3. Run the script
bash /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership/PUSH_TO_GITHUB.sh
```

---

## Step 2: Deploy API to Railway (2 minutes)

1. **Go to:** https://railway.app/
2. Click **"Login with GitHub"**
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select `ruuvitag-test-drive-tracker`
5. Click the deployed service → **Settings**:
   - Root Directory: `api`
   - Start Command: `npm start`
   - Click **Save**
6. Add PostgreSQL:
   - Click **"+ New"** → **"Database"** → **"PostgreSQL"**
7. Add environment variables (Variables tab):
   ```
   NODE_ENV=production
   JWT_SECRET=hackathon-secret-2025
   CORS_ORIGIN=*
   PORT=3001
   ```
8. Generate domain:
   - Settings → Networking → **"Generate Domain"**
   - **COPY THIS URL** (e.g., `https://ruuvitag-api-production.up.railway.app`)
9. Initialize database:
   - Wait for deployment (~2 min)
   - Service → "..." → **"Shell"**
   - Run: `npx prisma db push`

---

## Step 3: Deploy Dashboard to Vercel (1 minute)

1. **Go to:** https://vercel.com/
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Click **"Add New..."** → **"Project"**
4. Import `ruuvitag-test-drive-tracker`
5. Configure:
   - Framework: **Vite**
   - Root Directory: **`dashboard`** (click Edit to select)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variable:
   - Expand **"Environment Variables"**
   - Name: `VITE_API_URL`
   - Value: Your Railway URL from Step 2.8
7. Click **"Deploy"**

---

## You're Live!

After deployment completes (~3 minutes):

- **Dashboard:** `https://ruuvitag-test-drive-tracker.vercel.app`
- **API:** Your Railway URL

### Test It:

```bash
# Test API (replace with your Railway URL)
curl https://YOUR-RAILWAY-URL.up.railway.app/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":123}
```

### Open Dashboard:

Just open your Vercel URL in a browser!

---

## Cost: $0/month

- Railway: $5 credit/month (enough for 500 hours)
- Vercel: Unlimited (hobby plan)
- GitHub: Free for public repos

**Total: FREE!**

---

## Need More Details?

See the complete guide: [DEPLOY_NOW_FREE.md](DEPLOY_NOW_FREE.md)

---

**Ready?** Start with Step 1 above!
