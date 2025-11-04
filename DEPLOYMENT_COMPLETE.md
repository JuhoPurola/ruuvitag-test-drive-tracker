# Production Deployment - Complete

## Deployment Summary

Your RuuviTag Test Drive Tracker has been successfully deployed to AWS!

## Deployed Services

### 1. Database (RDS PostgreSQL) ✅
- **Status:** Available and running
- **Endpoint:** `ruuvitag-db.cdeweqeqgsf0.eu-north-1.rds.amazonaws.com`
- **Database:** postgres
- **Username:** postgres
- **Password:** RuuviTag2024Pass (saved in `/tmp/ruuvitag-db-password.txt`)
- **Instance Type:** db.t3.micro
- **Region:** eu-north-1

### 2. API (Elastic Beanstalk) ✅
- **Status:** Running
- **URL:** http://ruuvitag-api-prod-v2.eba-nuiqe3pr.eu-north-1.elasticbeanstalk.com
- **Environment:** ruuvitag-api-prod-v2
- **Instance Type:** t3.micro
- **Docker Image:** 865097414780.dkr.ecr.eu-north-1.amazonaws.com/ruuvitag-api:latest
- **Health Endpoint:** http://ruuvitag-api-prod-v2.eba-nuiqe3pr.eu-north-1.elasticbeanstalk.com/health

**Environment Variables:**
- NODE_ENV=production
- DATABASE_URL=postgresql://postgres:RuuviTag2024Pass@ruuvitag-db.cdeweqeqgsf0.eu-north-1.rds.amazonaws.com:5432/postgres
- JWT_SECRET=(auto-generated)
- CORS_ORIGIN=*

### 3. Dashboard (AWS Amplify) 🔄
- **Status:** Building (Job ID: 3)
- **URL:** https://dete97jasypwk.amplifyapp.com
- **Branch:** main
- **API URL:** http://ruuvitag-api-prod-v2.eba-nuiqe3pr.eu-north-1.elasticbeanstalk.com

Check deployment status:
```bash
aws amplify get-job --app-id dete97jasypwk --branch-name main --job-id 3 --region eu-north-1
```

## Next Steps

### 1. Initialize Database Schema

The database needs to be initialized with Prisma. Connect to the Elastic Beanstalk instance:

```bash
# Option A: Using AWS Session Manager (recommended)
# Get the instance ID
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:elasticbeanstalk:environment-name,Values=ruuvitag-api-prod-v2" \
  --region eu-north-1 \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text)

# Connect to the instance
aws ssm start-session --target $INSTANCE_ID --region eu-north-1

# Once connected, run:
cd /var/app/current
npx prisma db push
```

### 2. Test API Endpoints

Once the API is fully running and database is initialized:

```bash
# Health check
curl http://ruuvitag-api-prod-v2.eba-nuiqe3pr.eu-north-1.elasticbeanstalk.com/health

# Get test drives
curl http://ruuvitag-api-prod-v2.eba-nuiqe3pr.eu-north-1.elasticbeanstalk.com/api/testdrives

# Get analytics
curl http://ruuvitag-api-prod-v2.eba-nuiqe3pr.eu-north-1.elasticbeanstalk.com/api/analytics/stats
```

### 3. Access Dashboard

Once Amplify build completes (~5 minutes):
- **Main URL:** https://dete97jasypwk.amplifyapp.com

### 4. Create Sample Data (Optional)

Connect to database and create sample vehicle:

```bash
psql -h ruuvitag-db.cdeweqeqgsf0.eu-north-1.rds.amazonaws.com -U postgres -d postgres

# Once connected:
INSERT INTO vehicles (id, make, model, year, vin, color, "ruuviTagMac", available)
VALUES (
  gen_random_uuid(),
  'Tesla',
  'Model 3',
  2024,
  'TEST123456789',
  'Blue',
  'AA:BB:CC:DD:EE:FF',
  true
);
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS eu-north-1                           │
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐               │
│  │  AWS Amplify     │      │  Elastic         │               │
│  │  Dashboard       │─────▶│  Beanstalk API   │               │
│  │  (React)         │      │  (Docker/Node)   │               │
│  └──────────────────┘      └────────┬─────────┘               │
│                                      │                          │
│                                      │                          │
│                             ┌────────▼─────────┐               │
│                             │  RDS PostgreSQL  │               │
│                             │  (db.t3.micro)   │               │
│                             └──────────────────┘               │
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐               │
│  │  ECR             │      │  CodeCommit      │               │
│  │  Docker Registry │      │  Git Repository  │               │
│  └──────────────────┘      └──────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

## AWS Resources Created

| Resource Type | Name/ID | Purpose |
|--------------|---------|---------|
| **RDS Instance** | ruuvitag-db | PostgreSQL database |
| **ECR Repository** | ruuvitag-api | Docker image storage |
| **EB Application** | ruuvitag-api | Container for EB environment |
| **EB Environment** | ruuvitag-api-prod-v2 | API runtime environment |
| **Amplify App** | dete97jasypwk | Dashboard hosting |
| **CodeCommit Repo** | ruuvitag-test-drive-tracker | Source code |
| **S3 Bucket** | ruuvitag-api-deploy-7466c027 | Deployment artifacts |
| **IAM Role** | aws-elasticbeanstalk-ec2-role | EC2 instance permissions |
| **IAM Role** | AppRunnerECRAccessRole | ECR access (not used) |

## Monitoring & Logs

### Elastic Beanstalk Logs
```bash
# View recent logs
aws elasticbeanstalk describe-events \
  --environment-name ruuvitag-api-prod-v2 \
  --region eu-north-1 \
  --max-items 20

# Download full logs
aws elasticbeanstalk request-environment-info \
  --environment-name ruuvitag-api-prod-v2 \
  --info-type tail \
  --region eu-north-1
```

### Amplify Build Logs
View in AWS Console:
https://eu-north-1.console.aws.amazon.com/amplify/home?region=eu-north-1#/dete97jasypwk

### RDS Monitoring
```bash
aws rds describe-db-instances \
  --db-instance-identifier ruuvitag-db \
  --region eu-north-1
```

## Cost Estimate (Monthly)

| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| RDS PostgreSQL | db.t3.micro, 20GB | ~$15 |
| Elastic Beanstalk | t3.micro (on-demand) | ~$7 |
| Amplify Hosting | Free tier | $0 |
| ECR | 500MB storage | $0.05 |
| Data Transfer | ~10GB | ~$1 |
| **Total** | | **~$23/month** |

## Security Notes

⚠️ **IMPORTANT - Production Security Checklist:**

1. **Change Database Password:**
   ```bash
   aws rds modify-db-instance \
     --db-instance-identifier ruuvitag-db \
     --master-user-password "YourStrongPassword" \
     --region eu-north-1
   ```

2. **Generate Strong JWT Secret:**
   ```bash
   openssl rand -base64 32
   ```
   Then update the EB environment variable.

3. **Restrict CORS Origin:**
   Update `CORS_ORIGIN` environment variable to only allow your dashboard domain:
   ```bash
   aws elasticbeanstalk update-environment \
     --environment-name ruuvitag-api-prod-v2 \
     --option-settings \
       Namespace=aws:elasticbeanstalk:application:environment,OptionName=CORS_ORIGIN,Value=https://dete97jasypwk.amplifyapp.com \
     --region eu-north-1
   ```

4. **Enable HTTPS:**
   - Add SSL certificate to Elastic Beanstalk
   - Update dashboard to use HTTPS API URL

5. **Restrict RDS Access:**
   Currently RDS is publicly accessible. Consider:
   - Moving to private subnet
   - Using security groups to restrict access

## Troubleshooting

### API Health Check Fails

1. Check environment status:
   ```bash
   aws elasticbeanstalk describe-environment-health \
     --environment-name ruuvitag-api-prod-v2 \
     --attribute-names All \
     --region eu-north-1
   ```

2. Check instance logs in AWS Console

3. Verify Docker container is running

### Dashboard Shows "Cannot connect to API"

1. Check CORS settings in API
2. Verify API URL in Amplify environment variables
3. Check browser console for errors

### Database Connection Fails

1. Verify database is running:
   ```bash
   aws rds describe-db-instances \
     --db-instance-identifier ruuvitag-db \
     --region eu-north-1 \
     --query 'DBInstances[0].DBInstanceStatus'
   ```

2. Test connection from local machine:
   ```bash
   psql -h ruuvitag-db.cdeweqeqgsf0.eu-north-1.rds.amazonaws.com -U postgres -d postgres
   ```

3. Check security group rules

## Updating Deployments

### Update API Code

1. Push changes to CodeCommit:
   ```bash
   git add .
   git commit -m "Update API"
   git push
   ```

2. Build and push new Docker image:
   ```bash
   cd api
   docker build -t ruuvitag-api .
   docker tag ruuvitag-api:latest 865097414780.dkr.ecr.eu-north-1.amazonaws.com/ruuvitag-api:latest
   aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 865097414780.dkr.ecr.eu-north-1.amazonaws.com
   docker push 865097414780.dkr.ecr.eu-north-1.amazonaws.com/ruuvitag-api:latest
   ```

3. Restart Elastic Beanstalk environment:
   ```bash
   aws elasticbeanstalk restart-app-server \
     --environment-name ruuvitag-api-prod-v2 \
     --region eu-north-1
   ```

### Update Dashboard

Dashboard auto-deploys when you push to CodeCommit main branch. Or manually trigger:
```bash
aws amplify start-job \
  --app-id dete97jasypwk \
  --branch-name main \
  --job-type RELEASE \
  --region eu-north-1
```

## Cleanup (When Done)

To remove all resources and stop charges:

```bash
# Delete Elastic Beanstalk environment (this takes 5-10 minutes)
aws elasticbeanstalk terminate-environment \
  --environment-name ruuvitag-api-prod-v2 \
  --region eu-north-1

# Delete RDS database
aws rds delete-db-instance \
  --db-instance-identifier ruuvitag-db \
  --skip-final-snapshot \
  --region eu-north-1

# Delete Amplify app
aws amplify delete-app \
  --app-id dete97jasypwk \
  --region eu-north-1

# Delete ECR repository
aws ecr delete-repository \
  --repository-name ruuvitag-api \
  --force \
  --region eu-north-1

# Delete S3 bucket
BUCKET_NAME="ruuvitag-api-deploy-7466c027"
aws s3 rb "s3://${BUCKET_NAME}" --force

# Delete Elastic Beanstalk application
aws elasticbeanstalk delete-application \
  --application-name ruuvitag-api \
  --terminate-env-by-force \
  --region eu-north-1
```

---

## Support & Documentation

- **Project README:** [README.md](README.md)
- **Getting Started:** [GETTING_STARTED.md](GETTING_STARTED.md)
- **AWS Console:** https://console.aws.amazon.com/
- **Amplify Console:** https://eu-north-1.console.aws.amazon.com/amplify/home?region=eu-north-1
- **Elastic Beanstalk Console:** https://eu-north-1.console.aws.amazon.com/elasticbeanstalk/home?region=eu-north-1

**Deployment Date:** 2025-11-04
**Status:** ✅ API Deployed, 🔄 Dashboard Building
