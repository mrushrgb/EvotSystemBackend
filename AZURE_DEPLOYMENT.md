# Azure Deployment Guide - E-Voting Backend

## 📋 Prerequisites
- Azure account with an active App Service
- Git installed locally
- Azure CLI (optional but recommended)

## 🚀 Deployment Methods

### Method 1: Git Deployment (Recommended)

#### Step 1: Configure Azure App Service

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your App Service: `evoting-be-bzegbchphggwbub5`
3. Go to **Settings** → **Configuration** → **Application Settings**
4. Add these environment variables:

```
MONGO_URI = mongodb+srv://mohammedrusaith_db_user:Test123@voting-cluster.xg9xjq0.mongodb.net/cloudbase_voting?retryWrites=true&w=majority&appName=voting-cluster

JWT_SECRET = your_production_jwt_secret_must_be_different_from_dev

JWT_EXPIRY = 7d

NODE_ENV = production

CORS_ORIGIN = https://evoting-fe-gkcehggjhje8azfg.southindia-01.azurewebsites.net

ADMIN_SECRET_KEY = your_production_admin_secret_key_must_be_very_secure

PORT = 8080
```

5. Click **Save** and wait for the restart

#### Step 2: Set Up Deployment Center

1. In Azure Portal, go to **Deployment** → **Deployment Center**
2. Choose **Local Git** as source
3. Click **Save**
4. Copy the **Git Clone Uri** (something like: https://evoting-be-bzegbchphggwbub5.scm.southindia-01.azurewebsites.net/evoting-be-bzegbchphggwbub5.git)

#### Step 3: Get Deployment Credentials

1. In Azure Portal, go to **Deployment** → **Deployment Center**
2. Click on **Local Git/FTPS credentials** tab
3. Note your **Username** and **Password** (or set a new password)

#### Step 4: Deploy from Local Machine

Open your terminal in the backend folder and run:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Deploy to Azure"

# Add Azure as remote (replace with your Git Clone Uri)
git remote add azure https://evoting-be-bzegbchphggwbub5.scm.southindia-01.azurewebsites.net/evoting-be-bzegbchphggwbub5.git

# Push to Azure (will prompt for credentials)
git push azure main:master

# If you're on a different branch, use:
# git push azure <your-branch>:master
```

Enter your deployment credentials when prompted.

---

### Method 2: GitHub Actions (Automated CI/CD)

#### Step 1: Get Publish Profile

1. In Azure Portal, go to your App Service
2. Click **Get publish profile** (download button at top)
3. Open the downloaded `.PublishSettings` file and copy its content

#### Step 2: Add Secret to GitHub

1. Go to your GitHub repository: https://github.com/mrushrgb/EvotSystemBackend
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
5. Value: Paste the publish profile content
6. Click **Add secret**

#### Step 3: Configure Environment Variables in Azure

Same as Method 1, Step 1 above.

#### Step 4: Deploy

The GitHub Actions workflow is already created (`.github/workflows/azure-deploy.yml`).

To deploy:
```bash
git add .
git commit -m "Setup Azure deployment"
git push origin main
```

The deployment will automatically trigger and you can monitor it in the **Actions** tab on GitHub.

---

### Method 3: Azure CLI Deployment

#### Prerequisites
Install Azure CLI: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "your-subscription-id"

# Create a zip deployment package
cd "d:\Degree project\E - Vote System-Amj\backend"
7z a -tzip backend.zip * -xr!node_modules -xr!.git -xr!.env

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group your-resource-group-name \
  --name evoting-be-bzegbchphggwbub5 \
  --src backend.zip

# Check logs
az webapp log tail --name evoting-be-bzegbchphggwbub5 --resource-group your-resource-group-name
```

---

## 🔧 Post-Deployment Steps

### 1. Verify Environment Variables
```bash
# Test if backend is running
curl https://evoting-be-bzegbchphggwbub5.southindia-01.azurewebsites.net/

# Should return: "CloudBase Voting Backend"
```

### 2. Enable Logging (for debugging)

In Azure Portal:
1. Go to **Monitoring** → **App Service logs**
2. Enable **Application Logging (Filesystem)**
3. Set Level to **Information** or **Verbose**
4. Click **Save**

### 3. View Logs

```bash
# View live logs in portal
# Go to Monitoring → Log stream

# Or use Azure CLI
az webapp log tail --name evoting-be-bzegbchphggwbub5 --resource-group your-resource-group-name
```

### 4. Test Your APIs

```bash
# Test registration
curl -X POST https://evoting-be-bzegbchphggwbub5.southindia-01.azurewebsites.net/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123456"}'

# Test login
curl -X POST https://evoting-be-bzegbchphggwbub5.southindia-01.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

---

## 🐛 Troubleshooting

### Issue: 503 Service Unavailable
**Solution:** Check if environment variables are set correctly in Azure Configuration.

### Issue: 403 Site Disabled / Quota Exceeded
**Solution:** 
- Wait until quota resets (midnight UTC)
- Or upgrade to Basic B1 plan ($13/month)

### Issue: Database Connection Failed
**Solution:**
- Verify MONGO_URI is correct in Azure Configuration
- Check MongoDB Atlas network access allows Azure IPs (or use 0.0.0.0/0 for all IPs)

### Issue: CORS Errors
**Solution:** 
- Make sure CORS_ORIGIN in Azure matches your frontend URL exactly
- Should be: `https://evoting-fe-gkcehggjhje8azfg.southindia-01.azurewebsites.net`

---

## 📊 Monitoring

### Check App Status
- Azure Portal → Your App Service → **Overview**
- Status should be "Running"

### Check Quota Usage (Free Tier)
- Azure Portal → Your App Service → **Metrics**
- Monitor CPU Time to avoid hitting 60 min/day limit

---

## ⚠️ Important Notes

1. **Never commit .env files** - They're in .gitignore for security
2. **Set different JWT_SECRET** for production than development
3. **Free tier limits**: 60 CPU minutes/day - Consider upgrading for production
4. **Always test locally** before deploying to Azure

---

## 🎯 Quick Deploy Command

For fastest deployment using git:

```bash
cd "d:\Degree project\E - Vote System-Amj\backend"
git add .
git commit -m "Deploy updates"
git push azure main:master
```

---

## 📞 Need Help?

- Azure Logs: `Monitoring → Log stream`
- Application Insights: Enable in Azure for advanced monitoring
- Azure Support: Available in portal under "Support + troubleshooting"
