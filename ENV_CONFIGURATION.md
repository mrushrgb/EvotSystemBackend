# Backend Environment Variables Configuration

## ✅ Changes Made

### 1. Enhanced Environment Variable Management

#### Files Updated:
- ✅ `backend/.env` - Development configuration with real values
- ✅ `backend/.env.example` - Template for developers
- ✅ `backend/.env.production` - Production template
- ✅ `backend/.gitignore` - Prevents committing sensitive data
- ✅ `backend/server.js` - Added validation and better CORS
- ✅ `backend/src/middleware/auth.js` - Removed fallback secrets
- ✅ `backend/src/controllers/authController.js` - Removed fallback secrets

### 2. Environment Variables Used

#### Required Variables (Server won't start without these):
```env
MONGO_URI=mongodb://...           # MongoDB connection string
JWT_SECRET=your_secret_here       # JWT signing key
PORT=5000                         # Server port
```

#### Optional Variables:
```env
JWT_EXPIRY=7d                     # Token expiration time
NODE_ENV=development              # Environment mode
CORS_ORIGIN=http://localhost:3000 # Frontend URL for CORS
```

### 3. Security Improvements

#### Before:
```javascript
// Had insecure fallbacks
const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
```

#### After:
```javascript
// Validates JWT_SECRET exists
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET is not defined!');
  return res.status(500).json({ msg: 'Server configuration error' });
}
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
```

### 4. Server Startup Validation

The backend now validates required environment variables on startup:

```
❌ ERROR: Missing required environment variables:
   - MONGO_URI
   - JWT_SECRET
   
💡 Please create a .env file in the backend directory.
   You can copy .env.example and fill in the values.
```

## Current Configuration

### Development (`.env`):
```env
MONGO_URI=mongodb+srv://mohammedrusaith_db_user:Test123@voting-cluster.xg9xjq0.mongodb.net/cloudbase_voting?...
PORT=5000
JWT_SECRET=cloudbase_voting_jwt_secret_dev_2025_change_in_production
JWT_EXPIRY=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Production Template (`.env.production`):
```env
MONGO_URI=your_production_mongodb_uri_here
PORT=5000
JWT_SECRET=your_production_jwt_secret_must_be_different_from_dev
JWT_EXPIRY=7d
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-app.azurestaticapps.net
```

## Setup Instructions

### For New Developers:

1. **Copy the example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Fill in the values:**
   - Set your MongoDB URI (local or Atlas)
   - Generate a JWT secret:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Update other values as needed

3. **Start the backend:**
   ```bash
   npm start
   ```

### For Production Deployment:

1. **Set environment variables in Azure App Service:**
   ```bash
   az webapp config appsettings set --resource-group <rg-name> --name <app-name> --settings \
     MONGO_URI="<production-mongodb-uri>" \
     JWT_SECRET="<strong-production-secret>" \
     NODE_ENV="production" \
     CORS_ORIGIN="https://your-frontend.azurestaticapps.net"
   ```

2. **Or use Azure Portal:**
   - Go to App Service → Configuration → Application Settings
   - Add each environment variable
   - Save and restart the app

## Security Best Practices

### ✅ DO:
- Use different JWT secrets for dev/staging/production
- Generate strong secrets (32+ characters, random)
- Store production secrets in Azure Key Vault
- Rotate secrets regularly
- Use `.gitignore` to prevent committing `.env` files

### ❌ DON'T:
- Commit `.env` files to git
- Use simple/weak secrets like "secret", "password", "123456"
- Share the same secret across environments
- Hardcode secrets in source code
- Use default/example secrets in production

## Generating Secure Secrets

### JWT Secret (32 bytes):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### JWT Secret (64 bytes - more secure):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Environment-Specific MongoDB URIs

### Local Development:
```env
MONGO_URI=mongodb://127.0.0.1:27017/cloudbase_voting
```

### MongoDB Atlas (Cloud):
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cloudbase_voting?retryWrites=true&w=majority
```

### Azure Cosmos DB (MongoDB API):
```env
MONGO_URI=mongodb://account-name:password@account-name.mongo.cosmos.azure.com:10255/cloudbase_voting?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000
```

## Troubleshooting

### Error: "Missing required environment variables"
**Solution**: Create `.env` file in backend directory with all required variables

### Error: "JWT_SECRET is not defined"
**Solution**: Add `JWT_SECRET=your_secret_here` to `.env` file

### Error: "MongoDB connection failed"
**Solution**: 
- Check MONGO_URI is correct
- Ensure MongoDB is running (if local)
- Check network connectivity (if cloud)
- Verify username/password (if Atlas/Cosmos)

### CORS Errors
**Solution**: Set `CORS_ORIGIN` to match your frontend URL

## Testing Configuration

```bash
# Test environment variables are loaded
cd backend
node -e "require('dotenv').config(); console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing')"
node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing')"
```

## Files Protected by .gitignore

```
.env
.env.local
.env.production
.env.production.local
```

These files will NOT be committed to git, protecting your secrets.

## Summary

✅ Backend now properly validates all environment variables
✅ No hardcoded secrets or fallback values
✅ Clear error messages when configuration is missing
✅ Separate configurations for dev/production
✅ Security best practices implemented
✅ CORS properly configured
✅ Ready for Azure deployment

The backend is now production-ready with proper environment variable management! 🎉
