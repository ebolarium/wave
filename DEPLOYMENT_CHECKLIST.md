# 🚀 Render.com Deployment Checklist

## Pre-Deployment

- [ ] All code committed to GitHub
- [ ] `.env` files are in `.gitignore` (never commit secrets!)
- [ ] Test application locally one final time
- [ ] MongoDB Atlas account created
- [ ] Render.com account created

## MongoDB Atlas Setup

- [ ] Create cluster (free M0 tier)
- [ ] Create database user (username + password)
- [ ] Whitelist IP: 0.0.0.0/0 (allow all - for Render)
- [ ] Get connection string
- [ ] Test connection from local app

## Backend Deployment (Render Web Service)

- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Add environment variables:
  - [ ] `NODE_ENV` = `production`
  - [ ] `MONGODB_URI` = (your MongoDB Atlas URI)
  - [ ] `JWT_SECRET` = (strong random string, 32+ chars)
  - [ ] `JWT_EXPIRES_IN` = `7d`
  - [ ] `CLIENT_URL` = (will add after frontend is deployed)
- [ ] Deploy and wait for completion
- [ ] Copy backend URL

## Frontend Deployment (Render Static Site)

- [ ] Create new Static Site on Render
- [ ] Connect same GitHub repository
- [ ] Configure build settings:
  - Build Command: `cd client && npm install --legacy-peer-deps && npm run build`
  - Publish Directory: `client/build`
- [ ] Add environment variables:
  - [ ] `REACT_APP_API_URL` = `https://your-backend-url.onrender.com/api`
- [ ] Deploy and wait for completion
- [ ] Copy frontend URL

## Update Backend with Frontend URL

- [ ] Go to backend service on Render
- [ ] Update environment variables:
  - [ ] `CLIENT_URL` = (your frontend URL)
  - [ ] `APP_URL` = (your frontend URL)
  - [ ] `API_URL` = (your backend URL)
- [ ] Trigger manual deploy

## Create Admin User

- [ ] Option 1: Use Render Shell
  - Open Shell in backend service
  - Run: `npm run seed:admin`
- [ ] Option 2: Manual via MongoDB Atlas
  - Create user document with role: 'admin'

## Testing

- [ ] Open frontend URL in browser
- [ ] Test user registration
- [ ] Test user login
- [ ] Test blog creation
- [ ] Test appointment booking
- [ ] Test admin login and dashboard
- [ ] Test image upload
- [ ] Check mobile responsiveness
- [ ] Test theme toggle

## Optional: Email Configuration

If you want appointment email notifications:

- [ ] Get email service credentials (Gmail App Password recommended)
- [ ] Add to backend environment variables:
  - [ ] `EMAIL_HOST`
  - [ ] `EMAIL_PORT`
  - [ ] `EMAIL_USER`
  - [ ] `EMAIL_PASSWORD`
  - [ ] `EMAIL_FROM`
- [ ] Trigger manual deploy
- [ ] Test appointment booking with email

## Post-Deployment

- [ ] Update README.md with live URLs
- [ ] Create Git tag for release: `git tag v1.0.0`
- [ ] Push tag: `git push --tags`
- [ ] Monitor logs for errors
- [ ] Set up uptime monitoring (optional)
- [ ] Configure custom domain (optional)

## Environment Variables Summary

### Backend (Required)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/energy-waves
JWT_SECRET=your-very-long-and-random-secret-key-here
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend.onrender.com
```

### Frontend (Required)
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

### Backend (Optional - Email)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Energy Waves <noreply@energywaves.com>
APP_URL=https://your-frontend.onrender.com
API_URL=https://your-backend.onrender.com
```

## Common Issues & Solutions

### Issue: Backend shows "Application failed to respond"
**Solution**: Check logs in Render dashboard, verify environment variables are set correctly

### Issue: Frontend can't connect to backend
**Solution**: 
- Verify `REACT_APP_API_URL` includes `/api` at the end
- Check `CLIENT_URL` in backend matches your frontend URL exactly
- Wait for backend to spin up (first request takes 30-60 seconds on free tier)

### Issue: CORS errors
**Solution**: Make sure `CLIENT_URL` in backend exactly matches your frontend URL (including https://)

### Issue: Images not uploading
**Solution**: 
- Verify multer is installed: `npm list multer`
- Check `client/public/images/blog/` directory exists
- For production, consider using Cloudinary or AWS S3

### Issue: MongoDB connection fails
**Solution**:
- Verify connection string is correct
- Check database user exists in MongoDB Atlas
- Ensure IP whitelist includes 0.0.0.0/0

## Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Render Docs**: https://render.com/docs
- **GitHub Repo**: (your repository URL)

---

**Status**: 
- [ ] Pre-deployment complete
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Testing complete
- [ ] Production ready ✅

