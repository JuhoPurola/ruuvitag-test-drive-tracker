# Production Deployment - Final Status

## 🎉 Completed Deployments

### 1. AWS CodeCommit Repository ✅
- **Repository:** `ruuvitag-test-drive-tracker`
- **Region:** `eu-north-1`
- **URL:** https://git-codecommit.eu-north-1.amazonaws.com/v1/repos/ruuvitag-test-drive-tracker
- **Status:** ✅ All code pushed successfully

### 2. AWS Amplify Dashboard ✅
- **App ID:** `dete97jasypwk`
- **URL:** https://dete97jasypwk.amplifyapp.com
- **Branch:** `main`
- **Status:** 🔄 Building/Deployed
- **Console:** https://eu-north-1.console.aws.amazon.com/amplify/home?region=eu-north-1#/dete97jasypwk

Check status:
```bash
aws amplify get-job --app-id dete97jasypwk --branch-name main --job-id 1 --region eu-north-1
```

### 3. RDS PostgreSQL Database 🔄
- **Identifier:** `ruuvitag-db`
- **Engine:** PostgreSQL 17.6
- **Instance:** db.t3.micro
- **Status:** 🔄 Creating (5-10 minutes)
- **Username:** `postgres`
- **Password:** Saved in `/tmp/ruuvitag-db-password.txt`
- **Publicly Accessible:** Yes

Check status:
```bash
aws rds describe-db-instances --db-instance-identifier ruuvitag-db --region eu-north-1
```

Get endpoint when ready:
```bash
aws rds describe-db-instances \
  --db-instance-identifier ruuvitag-db \
  --region eu-north-1 \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

## ⏳ Next Steps (Once RDS is Available)

### Step 1: Get Database Endpoint (~5 more minutes)

Wait for RDS to be available, then get the endpoint:
```bash
DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier ruuvitag-db \
  --region eu-north-1 \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "Database endpoint: $DB_ENDPOINT"
```

### Step 2: Build and Push Docker Image to ECR

```bash
# Create ECR repository
aws ecr create-repository \
  --repository-name ruuvitag-api \
  --region eu-north-1

# Get ECR login
aws ecr get-login-password --region eu-north-1 | \
  docker login --username AWS --password-stdin 865097414780.dkr.ecr.eu-north-1.amazonaws.com

# Build image
cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership/api
docker build -t ruuvitag-api .

# Tag image
docker tag ruuvitag-api:latest 865097414780.dkr.ecr.eu-north-1.amazonaws.com/ruuvitag-api:latest

# Push image
docker push 865097414780.dkr.ecr.eu-north-1.amazonaws.com/ruuvitag-api:latest
```

### Step 3: Deploy API with AWS App Runner

Create `apprunner.yaml`:
```yaml
version: 1.0
runtime: python3
build:
  commands:
    pre-build:
      - cd api
      - npm install
    build:
      - npm run build
      - npx prisma generate
run:
  runtime-version: 20
  command: npm start
  network:
    port: 3001
  env:
    - name: NODE_ENV
      value: production
```

Deploy:
```bash
# Create App Runner service
aws apprunner create-service \
  --service-name ruuvitag-api \
  --source-configuration '{
    "CodeRepository": {
      "RepositoryUrl": "https://git-codecommit.eu-north-1.amazonaws.com/v1/repos/ruuvitag-test-drive-tracker",
      "SourceCodeVersion": {
        "Type": "BRANCH",
        "Value": "main"
      },
      "CodeConfiguration": {
        "ConfigurationSource": "API",
        "CodeConfigurationValues": {
          "Runtime": "NODEJS_20",
          "BuildCommand": "cd api && npm install && npm run build && npx prisma generate",
          "StartCommand": "cd api && npm start",
          "Port": "3001",
          "RuntimeEnvironmentVariables": {
            "NODE_ENV": "production",
            "DATABASE_URL": "postgresql://postgres:RuuviTag2024Pass@'$DB_ENDPOINT':5432/ruuvitag",
            "JWT_SECRET": "your-production-secret-key"
          }
        }
      }
    },
    "AutoDeploymentsEnabled": true
  }' \
  --instance-configuration '{
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  }' \
  --region eu-north-1
```

### Step 4: Update Dashboard with API URL

Once App Runner is deployed, get the API URL and update dashboard:
```bash
# Get App Runner service URL
API_URL=$(aws apprunner list-services --region eu-north-1 \
  --query 'ServiceSummaryList[?ServiceName==`ruuvitag-api`].ServiceUrl' \
  --output text)

# Update Amplify environment variable
aws amplify update-branch \
  --app-id dete97jasypwk \
  --branch-name main \
  --environment-variables VITE_API_URL=https://$API_URL \
  --region eu-north-1

# Trigger new build
aws amplify start-job \
  --app-id dete97jasypwk \
  --branch-name main \
  --job-type RELEASE \
  --region eu-north-1
```

### Step 5: Initialize Database

```bash
# SSH or use App Runner console to run:
npx prisma db push
```

## 🏗️ Alternative: Use AWS Elastic Beanstalk

If App Runner gives issues, use Elastic Beanstalk:

```bash
# Install EB CLI
pip3 install awsebcli

# Initialize
cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership/api
eb init -p node.js-20 ruuvitag-api --region eu-north-1

# Create environment
eb create ruuvitag-api-prod \
  --envvars DATABASE_URL=postgresql://postgres:RuuviTag2024Pass@$DB_ENDPOINT:5432/ruuvitag,JWT_SECRET=your-secret,NODE_ENV=production

# Deploy
eb deploy
```

## 📊 Cost Estimate (Monthly)

| Service | Configuration | Cost |
|---------|--------------|------|
| **RDS PostgreSQL** | db.t3.micro, 20GB | ~$15 |
| **App Runner** | 1 vCPU, 2GB RAM | ~$10-20 |
| **Amplify** | Free tier | $0 |
| **CodeCommit** | 5 users, 50GB | $0 |
| **ECR** | 500MB | $0 |
| **Data Transfer** | ~10GB | ~$1 |
| **Total** | | **~$26-36/month** |

## 🔐 Security Credentials

**Database:**
- Username: `postgres`
- Password: `RuuviTag2024Pass` (stored in `/tmp/ruuvitag-db-password.txt`)
- **⚠️ IMPORTANT:** Change this password for production!

**JWT Secret:**
- Currently: `your-production-secret-key`
- **⚠️ Generate a secure one:**
```bash
openssl rand -base64 32
```

## 🐛 Troubleshooting

### Dashboard shows "Cannot connect to API"
1. Check API is running: `curl https://your-api-url/health`
2. Verify CORS is configured in API
3. Check environment variable in Amplify

### Database connection fails
1. Check security group allows App Runner IP ranges
2. Verify DATABASE_URL format
3. Check RDS is publicly accessible

### API won't start
1. Check App Runner logs
2. Verify Prisma client is generated
3. Check DATABASE_URL is correct

## 📱 URLs Summary

Once everything is deployed:

- **Dashboard:** https://dete97jasypwk.amplifyapp.com
- **API:** Will be at App Runner URL (format: `https://xxxxx.eu-north-1.awsapprunner.com`)
- **Database:** `ruuvitag-db.xxxxx.eu-north-1.rds.amazonaws.com:5432`

## ✅ Current Status

- [x] Code repository created
- [x] Dashboard deploying
- [x] RDS database creating
- [ ] API deployment (waiting for RDS)
- [ ] Database initialization
- [ ] Integration testing

**Estimated time to complete:** 10-15 minutes (waiting for RDS)

## 🚀 Quick Commands Reference

```bash
# Check dashboard status
aws amplify get-job --app-id dete97jasypwk --branch-name main --job-id 1 --region eu-north-1

# Check RDS status
aws rds describe-db-instances --db-instance-identifier ruuvitag-db --region eu-north-1

# Get database password
cat /tmp/ruuvitag-db-password.txt

# View App Runner services (when created)
aws apprunner list-services --region eu-north-1

# View all resources
aws resourcegroupstaggingapi get-resources --region eu-north-1
```

---

**Next:** Wait for RDS to be available (~5 more minutes), then proceed with Step 2!
