# Deploy Right Now - Step by Step

Your project is ready! Follow these exact steps:

## ✅ What I've Already Done For You

- ✅ Created complete project structure
- ✅ Initialized git repository
- ✅ Created initial commit
- ✅ Added .gitignore
- ✅ Wrote all documentation

## 🚀 What YOU Need to Do (10 minutes)

### Step 1: Push to GitHub (2 minutes)

1. **Go to GitHub** in your browser: https://github.com/new

2. **Create a new repository:**
   - Repository name: `ruuvitag-test-drive-tracker`
   - Description: "RuuviTag-based test drive tracking system for automotive dealerships"
   - Keep it **Public** (or Private if you prefer)
   - **DO NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

3. **Push your code** (run these commands in your terminal):
   ```bash
   cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership

   # Add GitHub as remote (replace YOUR-USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR-USERNAME/ruuvitag-test-drive-tracker.git

   # Push code
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy API to Railway (3 minutes)

1. **Go to Railway:** https://railway.app/

2. **Sign up/Login** with GitHub

3. **Create new project:**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select `ruuvitag-test-drive-tracker`
   - Railway will detect it's a monorepo

4. **Configure the API service:**
   - Click on the deployed service
   - Go to Settings
   - **Root Directory:** Enter `api`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

5. **Add PostgreSQL:**
   - Click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway automatically connects it!

6. **Set environment variables:**
   - Go to your API service → Variables tab
   - Add:
     - `JWT_SECRET` = `your-random-secret-key-here`
     - `NODE_ENV` = `production`
   - `DATABASE_URL` is auto-set by Railway

7. **Run database migration:**
   - Wait for deployment to finish
   - Click on the service → "⋮" menu → "Open Shell"
   - Run: `npm run db:push`
   - Close shell

8. **Generate a domain:**
   - Go to Settings → Networking
   - Click "Generate Domain"
   - **COPY THIS URL** - you'll need it for the dashboard!
   - Example: `https://ruuvitag-api-production.up.railway.app`

### Step 3: Deploy Dashboard to Vercel (3 minutes)

1. **Go to Vercel:** https://vercel.com/

2. **Sign up/Login** with GitHub

3. **Import your project:**
   - Click "Add New..." → "Project"
   - Import `ruuvitag-test-drive-tracker`

4. **Configure the project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `dashboard`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Add environment variable:**
   - Before deploying, expand "Environment Variables"
   - Add:
     - **Name:** `VITE_API_URL`
     - **Value:** Your Railway URL from Step 2.8
     - Example: `https://ruuvitag-api-production.up.railway.app`

6. **Deploy:**
   - Click "Deploy"
   - Wait ~2 minutes
   - Vercel will give you a URL like: `https://ruuvitag-test-drive-tracker.vercel.app`

### Step 4: Test Your Deployment (2 minutes)

1. **Test the API:**
   ```bash
   curl https://your-railway-url.up.railway.app/health
   ```

   Should return:
   ```json
   {
     "status": "healthy",
     "timestamp": "...",
     "uptime": 123
   }
   ```

2. **Open your dashboard:**
   - Go to your Vercel URL
   - You should see the RuuviTag dashboard!
   - It will show "No test drives yet" (this is correct)

3. **Seed some test data:**
   - Go to Railway dashboard
   - Click your API service → Shell
   - Create a test vehicle:
     ```bash
     npx ts-node -e "
     import { PrismaClient } from '@prisma/client';
     const prisma = new PrismaClient();

     prisma.vehicle.create({
       data: {
         make: 'Tesla',
         model: 'Model 3',
         year: 2024,
         vin: 'TEST123456789',
         color: 'Blue',
         ruuviTagMac: 'AA:BB:CC:DD:EE:FF'
       }
     }).then(() => console.log('Done!'));
     "
     ```

## 🎉 You're Live!

Your URLs:
- **API:** https://your-railway-url.up.railway.app
- **Dashboard:** https://your-vercel-url.vercel.app

## 📱 Optional: Mobile App

The mobile app requires React Native setup. For the hackathon, you can:
1. Use the API endpoints directly with curl/Postman to simulate test drives
2. Or follow [mobile/README.md](mobile/README.md) for full setup

## 🐛 Troubleshooting

### "Cannot connect to API"
- Check CORS in `api/src/index.ts`
- Verify `VITE_API_URL` is set correctly in Vercel
- Check Railway logs: Service → Deployments → View Logs

### "Database connection failed"
- Ensure PostgreSQL is added in Railway
- Check `DATABASE_URL` is set automatically
- Try re-deploying the API

### "Build failed"
- Check Railway/Vercel build logs
- Ensure correct Root Directory is set
- Verify all dependencies are in package.json

## 💡 Next Steps

1. **Custom domain:**
   - Railway: Settings → Networking → Custom Domain
   - Vercel: Settings → Domains

2. **Add more features:**
   - See [README.md](README.md) for feature ideas
   - Check [GETTING_STARTED.md](GETTING_STARTED.md) for local development

3. **Share your hackathon project:**
   - Add a demo video
   - Update README with your deployed URLs
   - Share on social media!

## 🆘 Need Help?

If you get stuck, here's what to check:
1. Railway logs (for API issues)
2. Vercel logs (for dashboard issues)
3. Browser console (for frontend errors)
4. Check all environment variables are set

---

**Remember:** Your code is ready, git is initialized, and everything is set up. You just need to:
1. Push to GitHub
2. Connect Railway (API)
3. Connect Vercel (Dashboard)

Total time: ~10 minutes. You got this! 🚀
