# 🚀 Prescripto Deployment Guide

## Render Deployment Steps

### Prerequisites

- GitHub repository with your code
- Render account (free tier available)
- PostgreSQL database (Render provides this)

### Step 1: Prepare Your Repository

1. Ensure all code is committed and pushed to GitHub
2. Verify your `package.json` has correct scripts
3. Check that `dist/` folder is built (or will be built during deployment)

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub account

### Step 3: Create PostgreSQL Database

1. In Render dashboard, click "New +"
2. Select "PostgreSQL"
3. Choose "Starter" plan (free)
4. Name it: `prescripto-database`
5. Click "Create Database"
6. Wait for database to be created
7. Note down the connection details:
   - Host
   - Port
   - Database Name
   - Username
   - Password

### Step 4: Deploy Web Service

1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repository
4. Choose your repository: `prescripto`
5. Configure the service:
   - **Name**: `prescripto-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Starter` (free)

### Step 5: Configure Environment Variables

In your web service settings, add these environment variables:

#### Required Variables:

```
NODE_ENV=production
PORT=10000
DB_HOST=<your_render_db_host>
DB_PORT=5432
DB_NAME=<your_render_db_name>
DB_USER=<your_render_db_user>
DB_PASSWORD=<your_render_db_password>
DB_DIALECT=postgres
JWT_SECRET=<your_super_secret_jwt_key>
JWT_EXPIRES_IN=24h
QR_ENCRYPTION_KEY=<your_qr_encryption_key>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your_email@gmail.com>
SMTP_PASS=<your_app_password>
FRONTEND_URL=https://your-frontend-domain.com
```

#### Optional Variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Step 6: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Check logs for any errors
4. Test your endpoints

### Step 7: Verify Deployment

1. Check health endpoint: `https://your-app.onrender.com/health`
2. Check API docs: `https://your-app.onrender.com/api/v1/docs`
3. Test authentication: `https://your-app.onrender.com/api/v1/auth/login`

### Step 8: Database Migration

The database migrations will run automatically when the server starts. If you need to run them manually:

1. Go to your web service dashboard
2. Click "Shell"
3. Run: `npm run migrate`

### Troubleshooting

#### Common Issues:

1. **Build Fails**: Check Node.js version (should be 18+)
2. **Database Connection**: Verify environment variables
3. **Port Issues**: Ensure PORT is set to 10000
4. **Migration Errors**: Check database permissions

#### Logs:

- View logs in Render dashboard
- Check build logs for compilation errors
- Check runtime logs for runtime errors

### Security Notes:

1. Change all default passwords
2. Use strong JWT secrets
3. Use strong QR encryption keys
4. Enable HTTPS (automatic on Render)
5. Set up proper CORS for production

### Monitoring:

- Health check endpoint: `/health`
- API documentation: `/api/v1/docs`
- Monitor logs in Render dashboard

### Scaling:

- Upgrade to paid plans for better performance
- Add Redis for session management
- Use CDN for static files
- Implement proper logging and monitoring

## Environment Variables Reference

| Variable          | Description        | Example              |
| ----------------- | ------------------ | -------------------- |
| NODE_ENV          | Environment        | production           |
| PORT              | Server port        | 10000                |
| DB_HOST           | Database host      | your-db.onrender.com |
| DB_PORT           | Database port      | 5432                 |
| DB_NAME           | Database name      | prescripto_db        |
| DB_USER           | Database user      | prescripto_user      |
| DB_PASSWORD       | Database password  | your_password        |
| JWT_SECRET        | JWT signing key    | your_secret_key      |
| QR_ENCRYPTION_KEY | QR code encryption | your_qr_key          |
| SMTP_USER         | Email username     | your_email@gmail.com |
| SMTP_PASS         | Email password     | your_app_password    |
| FRONTEND_URL      | Frontend URL       | https://your-app.com |
