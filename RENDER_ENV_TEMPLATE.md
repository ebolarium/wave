# 🔐 Render.com Environment Variables Template

## Copy these to your Render.com services

---

## 📦 BACKEND WEB SERVICE - Environment Variables

Copy and paste these into Render Dashboard → Your Backend Service → Environment

### Required Variables (Must Configure)

```
NODE_ENV=production
```

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/energy-waves?retryWrites=true&w=majority
```
👆 Replace with your MongoDB Atlas connection string

```
JWT_SECRET=CHANGE_THIS_TO_A_VERY_LONG_RANDOM_STRING_AT_LEAST_32_CHARACTERS
```
👆 Generate a strong random string (use: https://passwordsgenerator.net/)

```
JWT_EXPIRES_IN=7d
```

```
CLIENT_URL=https://YOUR_FRONTEND_APP_NAME.onrender.com
```
👆 Will fill this after frontend deployment

---

### Optional Variables (For Email Notifications)

Only add these if you want appointment email notifications:

```
EMAIL_HOST=smtp.gmail.com
```

```
EMAIL_PORT=587
```

```
EMAIL_SECURE=false
```

```
EMAIL_USER=your-email@gmail.com
```
👆 Your Gmail address

```
EMAIL_PASSWORD=your-gmail-app-password
```
👆 Gmail App Password (not your regular password!)
Generate at: https://myaccount.google.com/apppasswords

```
EMAIL_FROM=Energy Waves <noreply@energywaves.com>
```

```
APP_URL=https://YOUR_FRONTEND_APP_NAME.onrender.com
```

```
API_URL=https://YOUR_BACKEND_APP_NAME.onrender.com
```

---

## 🎨 FRONTEND STATIC SITE - Environment Variables

Copy and paste this into Render Dashboard → Your Frontend Service → Environment

```
REACT_APP_API_URL=https://YOUR_BACKEND_APP_NAME.onrender.com/api
```
👆 Replace with your backend URL (don't forget `/api` at the end!)

---

## 📝 Quick Setup Guide

### Step 1: Deploy Backend First
1. Create Web Service on Render
2. Add all REQUIRED backend variables above
3. Leave `CLIENT_URL` empty for now
4. Deploy
5. Copy your backend URL: `https://your-backend-app.onrender.com`

### Step 2: Deploy Frontend
1. Create Static Site on Render
2. Add `REACT_APP_API_URL` variable with your backend URL + `/api`
3. Deploy
4. Copy your frontend URL: `https://your-frontend-app.onrender.com`

### Step 3: Update Backend
1. Go back to Backend service
2. Update `CLIENT_URL` with your frontend URL
3. If using email, also update `APP_URL` and `API_URL`
4. Manual Deploy

### Step 4: Test
1. Visit your frontend URL
2. Register a user
3. Login
4. Test all features!

---

## 🔒 Security Notes

- **Never commit these values to Git**
- **Use strong JWT_SECRET** (32+ characters, random)
- **For Gmail**: Use App Passwords, not your account password
- **MongoDB**: Ensure strong password for database user

---

## 📋 Checklist

### Backend Required ✅
- [ ] `NODE_ENV`
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRES_IN`
- [ ] `CLIENT_URL` (add after frontend deployed)

### Frontend Required ✅
- [ ] `REACT_APP_API_URL`

### Email (Optional) 📧
- [ ] `EMAIL_HOST`
- [ ] `EMAIL_PORT`
- [ ] `EMAIL_SECURE`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASSWORD`
- [ ] `EMAIL_FROM`
- [ ] `APP_URL`
- [ ] `API_URL`

---

## 🎯 Final Values Example

After deployment, your variables should look like this:

### Backend:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://myuser:mypass123@cluster0.abc123.mongodb.net/energy-waves?retryWrites=true&w=majority
JWT_SECRET=super-secret-random-key-1234567890abcdefghijklmnop
JWT_EXPIRES_IN=7d
CLIENT_URL=https://energy-waves-frontend.onrender.com
```

### Frontend:
```
REACT_APP_API_URL=https://energy-waves-backend.onrender.com/api
```

---

**Ready to deploy! 🚀**

