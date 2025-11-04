# Deployment Guide

## Quick Deployment for Hackathon (15 minutes)

### Option 1: Railway (Recommended - Easiest)

#### Backend API on Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy API**
   ```bash
   cd api

   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Initialize project
   railway init

   # Add PostgreSQL database
   railway add postgresql

   # Deploy
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   # Railway will auto-set DATABASE_URL
   railway variables set JWT_SECRET="your-secret-key-here"
   railway variables set NODE_ENV="production"
   ```

4. **Get your API URL**
   ```bash
   railway domain
   # Returns: https://your-app-name.up.railway.app
   ```

5. **Run Database Migration**
   ```bash
   railway run npm run db:push
   ```

#### Dashboard on Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Dashboard**
   ```bash
   cd dashboard

   # Install Vercel CLI
   npm install -g vercel

   # Login
   vercel login

   # Deploy
   vercel
   ```

3. **Set Environment Variable**
   ```bash
   vercel env add VITE_API_URL
   # Enter: https://your-railway-api-url.up.railway.app

   # Redeploy with env
   vercel --prod
   ```

**Done! Your app is live in ~15 minutes.**

---

## Option 2: Render (Good Free Tier)

### Backend API on Render

1. **Create Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `ruuvitag-db`
   - Plan: Free
   - Create Database
   - Copy the "Internal Database URL"

3. **Deploy API**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     - **Name:** `ruuvitag-api`
     - **Root Directory:** `api`
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`
     - **Plan:** Free

4. **Environment Variables**
   Add in Render dashboard:
   ```
   DATABASE_URL=<your-internal-db-url>
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   PORT=3001
   ```

5. **Run Migration**
   - In Render dashboard, go to Shell
   - Run: `npm run db:push`

### Dashboard on Render

1. **Deploy Dashboard**
   - Click "New +" → "Static Site"
   - Connect repo
   - Settings:
     - **Name:** `ruuvitag-dashboard`
     - **Root Directory:** `dashboard`
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** `dist`

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-api-name.onrender.com
   ```

---

## Option 3: All on Heroku (Classic)

### Backend API

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku

   # Windows/Linux
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd api
   heroku create ruuvitag-api
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:essential-0
   ```

4. **Configure Environment**
   ```bash
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set NODE_ENV="production"
   ```

5. **Create Procfile**
   ```bash
   echo "web: npm start" > Procfile
   ```

6. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main

   # Run migration
   heroku run npm run db:push
   ```

### Dashboard

Deploy to Vercel (same as Option 1) or Netlify:

```bash
cd dashboard
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

## Option 4: Docker + DigitalOcean (Advanced)

If you have a DigitalOcean/AWS account and want full control:

### 1. Create Dockerfile for API

```dockerfile
# api/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: ruuvitag
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: ./api
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/ruuvitag
      JWT_SECRET: your-secret-key
      PORT: 3001
    depends_on:
      - db

volumes:
  postgres_data:
```

### 3. Deploy

```bash
# Build and run locally
docker-compose up -d

# Or push to DigitalOcean App Platform
doctl apps create --spec .do/app.yaml
```

---

## Quick Comparison

| Platform | Backend | Database | Dashboard | Free Tier | Setup Time |
|----------|---------|----------|-----------|-----------|------------|
| **Railway + Vercel** | ✅ | ✅ | ✅ | 500hrs/month | **5 min** |
| **Render** | ✅ | ✅ | ✅ | Always free (limited) | 10 min |
| **Heroku + Vercel** | ✅ | ✅ | ✅ | 1000hrs/month | 15 min |
| **Docker + DO** | ✅ | ✅ | ✅ | $5/month | 30 min |

---

## My Recommendation for Hackathon

**Use Railway + Vercel** - Here's why:

1. **Fastest setup** (literally 5 minutes)
2. **Automatic PostgreSQL** (no manual config)
3. **Free tier is generous** (500 hours/month)
4. **Auto-deploy from GitHub** (push to deploy)
5. **Built-in monitoring** (logs, metrics)
6. **No credit card required** for initial setup

---

## Step-by-Step: Railway + Vercel (Detailed)

### Part 1: Deploy API to Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Go to API directory
cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership/api

# 4. Initialize Railway project
railway init
# Choose: "Create new project"
# Name it: "ruuvitag-api"

# 5. Add PostgreSQL
railway add
# Select: "PostgreSQL"

# 6. Link to your project
railway link

# 7. Deploy
railway up

# 8. Set environment variables
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set NODE_ENV="production"

# 9. Run database migration
railway run npm run db:push

# 10. Generate domain
railway domain
# Save this URL - you'll need it for the dashboard!
```

### Part 2: Deploy Dashboard to Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Go to dashboard directory
cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership/dashboard

# 3. Login
vercel login

# 4. Deploy (first time - staging)
vercel

# 5. Add environment variable
vercel env add VITE_API_URL production
# When prompted, enter your Railway API URL (from step 10 above)
# Example: https://ruuvitag-api-production.up.railway.app

# 6. Deploy to production
vercel --prod
```

### Part 3: Test Your Deployment

```bash
# Get your dashboard URL from Vercel output
# Example: https://ruuvitag-dashboard.vercel.app

# Test API health
curl https://your-railway-url.up.railway.app/health

# Visit dashboard
open https://your-vercel-url.vercel.app
```

---

## Environment Variables Summary

### Railway (API)
```bash
DATABASE_URL=<auto-set-by-railway>
JWT_SECRET=<your-secret>
NODE_ENV=production
PORT=3001  # Railway auto-detects
CORS_ORIGIN=https://your-vercel-dashboard.vercel.app
```

### Vercel (Dashboard)
```bash
VITE_API_URL=https://your-railway-api.up.railway.app
```

---

## Troubleshooting

### API won't start on Railway
```bash
# Check logs
railway logs

# Common fix: ensure package.json has correct start script
# api/package.json should have:
{
  "scripts": {
    "start": "node dist/index.js"
  }
}
```

### Dashboard can't connect to API
1. Check CORS is enabled in API
2. Verify `VITE_API_URL` is set correctly in Vercel
3. Check API is actually running: `curl https://your-api-url/health`

### Database migration fails
```bash
# Run manually via Railway CLI
railway run npx prisma db push

# Or via Railway dashboard: Shell tab
npx prisma db push
```

### CORS errors
Add your Vercel URL to API CORS config:

```typescript
// api/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    process.env.CORS_ORIGIN
  ].filter(Boolean)
}));
```

---

## Post-Deployment: Seed Sample Data

```bash
# Connect to Railway and seed database
railway run npx ts-node prisma/seed.ts

# Or create a seed script and run it via Railway dashboard Shell
```

---

## Custom Domain (Optional)

### Railway API
```bash
# Add custom domain in Railway dashboard
# Settings → Networking → Custom Domain
# Example: api.yourdomain.com
```

### Vercel Dashboard
```bash
# Add custom domain in Vercel dashboard
# Settings → Domains
# Example: app.yourdomain.com
```

---

## Monitoring & Logs

### Railway
- **Logs:** `railway logs`
- **Dashboard:** https://railway.app/project/your-project/logs
- **Metrics:** Built-in CPU, memory, network monitoring

### Vercel
- **Logs:** `vercel logs`
- **Dashboard:** https://vercel.com/dashboard
- **Analytics:** Built-in web analytics

---

## Cost Estimate

### Free Tier Limits

**Railway:**
- 500 execution hours/month
- 512MB RAM, 1GB disk
- $5 credit/month
- Great for hackathons and MVPs

**Vercel:**
- Unlimited websites
- 100GB bandwidth/month
- 6000 build minutes/month
- Perfect for frontend apps

**Total Cost for Hackathon:** **$0** ✅

---

## Need Help?

- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- Render docs: https://render.com/docs
- Heroku docs: https://devcenter.heroku.com

## Quick Links
- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Actions CI/CD: See `.github/workflows/` (optional)
