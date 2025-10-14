# Wave - Energy Waves for the Future

A full-stack MERN application for energy wave management, featuring user authentication, blog management, calendar events, and appointment scheduling.

## Project Structure

```
Wave/
├── backend/           # Node.js/Express backend API
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── middleware/    # Authentication middleware
│   ├── services/      # Email and other services
│   └── scripts/       # Database seeding scripts
├── src/              # React frontend
│   ├── components/   # Reusable React components
│   ├── pages/        # Page components
│   ├── contexts/     # React contexts (Auth, Theme)
│   └── services/     # API service layer
├── public/           # Static assets
└── build/            # Production build output
```

## Quick Start

### Option 1: Start Both Services (Recommended)
```powershell
.\start-dev.ps1
```

### Option 2: Start Services Separately

**Backend only:**
```powershell
.\start-backend.ps1
```

**Frontend only:**
```powershell
.\start-frontend.ps1
```

### Option 3: Manual Start

**Backend:**
```powershell
cd backend
npm install
npm run dev
```

**Frontend:**
```powershell
npm install
npm start
```

## Available Scripts

### Frontend Scripts (Root Directory)
- `npm start` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm test` - Run tests

### Backend Scripts (Backend Directory)
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed:admin` - Create admin user
- `npm run seed:users` - Seed sample users

## Environment Setup

1. **Backend Environment Variables** (create `backend/.env`):
```
MONGODB_URI=mongodb://localhost:27017/energy-waves
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

2. **Frontend Environment Variables** (create `.env` in root):
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Features

- 🔐 User Authentication & Authorization
- 📝 Blog Management System
- 📅 Calendar & Event Management
- 📋 Appointment Scheduling
- 👥 User Management
- 🎨 Modern UI with Theme Support
- 📱 Responsive Design

## Technology Stack

**Frontend:**
- React 19
- TypeScript
- React Router
- Axios for API calls
- Custom CSS

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer for emails
- Multer for file uploads

## API Endpoints

- `GET /api/blog` - Get all blog posts
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/calendar` - Get calendar events
- `POST /api/appointments` - Create appointment
- And many more...

## Development

The project is now properly organized with:
- Backend files in `/backend` directory
- Frontend files in root directory (moved from `/client`)
- Proper import paths and configurations
- Working API connections between frontend and backend

Both servers can run simultaneously and communicate properly through the configured API endpoints.
