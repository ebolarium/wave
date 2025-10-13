# Render.com Deployment Guide

## 📋 Environment Variables for Render.com

### Backend Web Service Environment Variables

Add these environment variables in your Render.com Backend Web Service dashboard:

#### Required Variables

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `5000` | Server port (Render will auto-assign, but good to have) |
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/energy-waves?retryWrites=true&w=majority` | MongoDB Atlas connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key-minimum-32-characters-long` | JWT signing secret (use a strong random string) |
| `JWT_EXPIRES_IN` | `7d` | Token expiration time |
| `CLIENT_URL` | `https://your-frontend-app.onrender.com` | Your frontend URL on Render |

#### Optional Variables (For Email Notifications)

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `EMAIL_HOST` | `smtp.gmail.com` | SMTP server |
| `EMAIL_PORT` | `587` | SMTP port |
| `EMAIL_SECURE` | `false` | TLS/SSL setting |
| `EMAIL_USER` | `your-email@gmail.com` | Email account |
| `EMAIL_PASSWORD` | `your-app-password` | Email app password |
| `EMAIL_FROM` | `Energy Waves <noreply@energywaves.com>` | From address |
| `APP_URL` | `https://your-frontend-app.onrender.com` | Frontend URL for email links |
| `API_URL` | `https://your-backend-app.onrender.com` | Backend API URL |

### Frontend Static Site Environment Variables

Add this in your Render.com Static Site dashboard:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend-app.onrender.com/api` | Backend API endpoint |

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare MongoDB Atlas

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is fine)
3. Create a database user with username and password
4. Whitelist all IP addresses (0.0.0.0/0) for Render access
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/energy-waves?retryWrites=true&w=majority
   ```

### Step 2: Deploy Backend to Render

1. **Create New Web Service**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository and branch

2. **Configure Build Settings**
   - **Name**: `energy-waves-backend` (or your choice)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` or `master`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

3. **Add Environment Variables**
   - Click "Advanced" → "Add Environment Variable"
   - Add all required variables from the table above
   - **Important**: Replace placeholder values with your actual values

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL: `https://your-backend-app.onrender.com`

### Step 3: Deploy Frontend to Render

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Use same GitHub repository
   - Select same branch

2. **Configure Build Settings**
   - **Name**: `energy-waves-frontend` (or your choice)
   - **Branch**: `main` or `master`
   - **Build Command**: 
     ```bash
     cd client && npm install --legacy-peer-deps && npm run build
     ```
   - **Publish Directory**: `client/build`

3. **Add Environment Variables**
   - Add `REACT_APP_API_URL` with your backend URL
   - Example: `https://your-backend-app.onrender.com/api`

4. **Deploy**
   - Click "Create Static Site"
   - Wait for build and deployment
   - Copy your frontend URL: `https://your-frontend-app.onrender.com`

### Step 4: Update Backend Environment Variables

1. Go back to your Backend Web Service
2. Update `CLIENT_URL` environment variable with your frontend URL
3. Trigger manual deploy to apply changes

### Step 5: Create Admin User

1. Access your backend service shell (Render Dashboard → Shell)
2. Run: `npm run seed:admin`
3. Or manually create via MongoDB Atlas interface

---

## 📝 Important Notes

### Free Tier Limitations
- **Backend**: Spins down after 15 minutes of inactivity
- **First request** after spin-down may take 30-60 seconds
- **Monthly usage**: 750 hours free (enough for one service)
- Consider upgrading to paid tier for production use

### CORS Configuration
The app is pre-configured to accept requests from `CLIENT_URL`. Make sure it's set correctly.

### Static Files (Blog Images)
- Images are served from `client/public/images/blog/`
- In production, uploaded images persist on the server disk
- For production, consider using cloud storage (AWS S3, Cloudinary) for images

### Database Backups
- MongoDB Atlas provides automatic backups on paid tiers
- For free tier, manually export data periodically

### Custom Domain (Optional)
1. Go to Settings → Custom Domain in Render dashboard
2. Add your domain
3. Update DNS records as instructed
4. Update `CLIENT_URL` environment variable

---

## 🔍 Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify MongoDB URI is correct and database is accessible
- Check Render logs for errors

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` is correct (must include `/api`)
- Check CORS settings in backend
- Verify `CLIENT_URL` in backend matches your frontend URL

### Images not loading
- Check if images are in `client/public/images/blog/` directory
- Verify server has write permissions
- Consider using external image hosting for production

### Email not sending
- Verify email credentials are correct
- For Gmail, use App Passwords (not regular password)
- Check email service is not blocking SMTP

---

## 🔐 Security Checklist

- ✅ Use strong JWT_SECRET (minimum 32 characters)
- ✅ Never commit .env files to Git
- ✅ Use MongoDB Atlas with proper authentication
- ✅ Enable IP whitelisting in MongoDB Atlas (if possible)
- ✅ Keep dependencies updated: `npm audit fix`
- ✅ Use HTTPS (Render provides this automatically)
- ✅ Rate limiting is enabled (configured in server.js)

---

## 📊 Monitoring

### Render Dashboard
- Monitor deployments
- View logs in real-time
- Check service metrics
- Set up notifications

### MongoDB Atlas
- Monitor database performance
- Check connection usage
- Review slow queries
- Set up alerts

---

## 🎯 Post-Deployment Tasks

1. **Test all features**:
   - User registration and login
   - Appointment booking
   - Blog creation and publishing
   - Admin dashboard access

2. **Update Git repository**:
   - Tag release: `git tag v1.0.0`
   - Push tags: `git push --tags`

3. **Documentation**:
   - Update README with live URLs
   - Document any custom configurations

4. **Monitoring**:
   - Set up error tracking (Sentry, LogRocket)
   - Configure uptime monitoring
   - Set up analytics (Google Analytics)

---

## 🔄 Updating the Application

### To deploy updates:

1. **Commit changes to Git**:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```

2. **Render auto-deploys** when you push to the connected branch

3. **Manual deploy** (if needed):
   - Go to Render dashboard
   - Click "Manual Deploy" → "Deploy latest commit"

---

## 💰 Cost Estimate (Render.com)

### Free Tier (Good for Testing)
- **Backend**: Free (with limitations)
- **Frontend**: Free (100GB bandwidth/month)
- **Total**: $0/month

### Recommended Production Setup
- **Backend**: $7/month (Starter plan - always on)
- **Frontend**: Free (or $1/month for custom domain)
- **MongoDB Atlas**: $0-9/month (M0 free tier or M2 shared)
- **Total**: ~$7-17/month

---

## 📞 Support Resources

- **Render Documentation**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **GitHub Issues**: Create issue in your repository
- **Render Community**: https://community.render.com

---

**Happy Deploying! 🚀**

