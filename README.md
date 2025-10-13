# Energy Waves - MERN Stack Application

A full-stack web application built with the MERN stack (MongoDB, Express.js, React 19, Node.js) featuring energy wave animations, user management, appointment booking system, blog platform, and admin dashboard.

## 🌊 Features

### Core Features
- **Animated Energy Waves Background**: Beautiful SVG wave animations that respond to scroll
- **User Authentication**: Complete registration, login, and JWT-based authentication with refresh tokens
- **Role-Based Access Control**: User and Admin roles with protected routes
- **Responsive Design**: Mobile-first design with light/dark theme support
- **Real-time Animations**: Scroll-triggered wave animations
- **Image Upload**: Blog featured image upload with multer

### User Features
- **Appointment Booking System**: Public appointment booking with time slot management
- **Personal Dashboard**: Calendar view with appointment management, closure scheduling
- **Blog Creation Platform**: Rich text editor (React Quill) for creating and publishing blog posts
- **Blog Reading**: Public blog list and detailed blog post views
- **Profile Management**: Update personal information and preferences
- **Theme Toggle**: Switch between light and dark themes

### Admin Features
- **User Management**: View, edit, activate/deactivate, and manage user accounts
- **Blog Moderation**: Manage all blog posts with status controls
- **Event Management**: Manage calendar events
- **Analytics Dashboard**: Platform statistics and insights
- **Role Management**: Update user roles

### Appointment System
- **Public Booking**: Users can book appointments with professionals
- **Time Slot Management**: Visual calendar with available/booked/closed slots
- **Closure Management**: Mark specific hours or full days as unavailable
- **Status Management**: Pending/Confirmed/Cancelled appointment workflow
- **Email Notifications**: Automated appointment confirmation emails

### Blog System
- **Rich Text Editor**: React Quill with mobile-friendly toolbar
- **Draft/Published Status**: Save drafts and publish when ready
- **Featured Images**: Upload and display blog images
- **Slug-based URLs**: SEO-friendly blog post URLs
- **Auto Reading Time**: Automatically calculated from content
- **View Tracking**: Track blog post views
- **Author Information**: Display author details with each post

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd energy-waves
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install --legacy-peer-deps
   cd ..
   ```

4. **Environment Setup**
   
   Create `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/energy-waves
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   
   # Email Configuration (Optional - for appointment notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=Energy Waves <noreply@energywaves.com>
   APP_URL=http://localhost:3000
   API_URL=http://localhost:5000
   ```

   Create `client/.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. **Create Admin User**
   ```bash
   npm run seed:admin
   ```

6. **Start the application**
   ```bash
   # Start both backend and frontend concurrently
   npm run dev
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only (in another terminal)
   npm run client
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Admin Login: Use credentials from createAdmin.js script

## 📁 Project Structure

```
energy-waves/
├── client/                    # React 19 frontend
│   ├── public/
│   │   └── images/
│   │       └── blog/         # Uploaded blog images
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── EnergyWaves/
│   │   │   ├── Navbar/
│   │   │   ├── ProtectedRoute/
│   │   │   └── Modals/       # Appointment, Closure, TimeSlot modals
│   │   ├── contexts/         # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── Home/
│   │   │   ├── About/
│   │   │   ├── Calendar/     # Public appointment booking
│   │   │   ├── Blog/         # Public blog reading
│   │   │   ├── MyBlogs/      # Blog creation & management
│   │   │   ├── Contact/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/    # User appointment dashboard
│   │   │   └── Admin/        # Admin panel
│   │   ├── services/         # API services
│   │   │   └── api.ts
│   │   └── App.tsx
│   └── package.json
├── models/                    # MongoDB models
│   ├── User.js
│   ├── Blog.js
│   ├── Calendar.js
│   ├── Appointment.js
│   └── Closure.js
├── routes/                    # Express routes
│   ├── auth.js
│   ├── users.js
│   ├── blog.js
│   ├── calendar.js
│   ├── appointments.js
│   ├── closures.js
│   ├── appointmentActions.js
│   └── admin.js
├── middleware/                # Custom middleware
│   └── auth.js
├── scripts/                   # Utility scripts
│   ├── createAdmin.js
│   └── seedUsers.js
├── services/                  # Backend services
│   └── emailService.js
├── server.js                  # Express server
├── package.json
└── README.md
```

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/public` - Get public user list
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)
- `PUT /api/users/:id/activate` - Activate/deactivate user (admin)

### Blog
- `GET /api/blog` - Get published blog posts (with pagination, search, category filter)
- `GET /api/blog/:slug` - Get blog post by slug
- `GET /api/blog/draft` - Get user's draft posts
- `POST /api/blog` - Create blog post
- `POST /api/blog/upload-image` - Upload blog featured image
- `PUT /api/blog/:id` - Update blog post
- `DELETE /api/blog/:id` - Delete blog post
- `POST /api/blog/:id/like` - Toggle like on blog post

### Appointments
- `GET /api/appointments/public/:userId` - Get public appointments for a user
- `POST /api/appointments/public/:userId` - Create public appointment
- `GET /api/appointments` - Get user's appointments (owner only)
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment (owner)
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Closures
- `GET /api/closures/public/:userId` - Get public closures
- `GET /api/closures` - Get user's closures (owner only)
- `POST /api/closures` - Create closure
- `PUT /api/closures/:id` - Update closure
- `DELETE /api/closures/:id` - Delete closure

### Appointment Actions
- `POST /api/appointment-actions/:id/approve` - Approve appointment
- `POST /api/appointment-actions/:id/reject` - Reject appointment
- `POST /api/appointment-actions/:id/cancel` - Cancel appointment

### Calendar/Events
- `GET /api/calendar` - Get public events
- `GET /api/calendar/:id` - Get event by ID
- `GET /api/calendar/my-events` - Get user's events
- `POST /api/calendar` - Create event
- `PUT /api/calendar/:id` - Update event
- `DELETE /api/calendar/:id` - Delete event
- `POST /api/calendar/:id/register` - Register for event
- `DELETE /api/calendar/:id/register` - Unregister from event

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get users with admin controls
- `GET /api/admin/blogs` - Get blogs with admin controls
- `GET /api/admin/events` - Get events with admin controls
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/blogs/:id/status` - Update blog status
- `PUT /api/admin/events/:id/status` - Update event status
- `DELETE /api/admin/users/:id` - Delete user

## 🎨 Tech Stack

### Frontend
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe code
- **React Router 7** - Client-side routing
- **React Quill (New)** - Rich text editor compatible with React 19
- **Axios** - HTTP client with interceptors
- **Context API** - State management (Auth, Theme)

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File upload
- **Nodemailer** - Email service
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Express Rate Limit** - API rate limiting

## 🔧 Development

### Available Scripts

**Root directory:**
- `npm start` - Start production server
- `npm run dev` - Start development mode (concurrent backend + frontend)
- `npm run server` - Start backend only (with nodemon)
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm run seed:admin` - Create admin user
- `npm run seed:users` - Seed sample users

**Client directory:**
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Database Models

#### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: ['user', 'admin'],
  avatar: String,
  bio: String,
  isActive: Boolean,
  lastLogin: Date,
  preferences: {
    notifications: { email, calendar, blog },
    theme: ['light', 'dark', 'auto']
  },
  timestamps: true
}
```

#### Blog Model
```javascript
{
  title: String,
  slug: String (unique, auto-generated),
  excerpt: String,
  content: String (HTML from rich editor),
  author: ObjectId (User),
  category: String,
  tags: [String],
  featuredImage: String,
  status: ['draft', 'published', 'archived'],
  publishedAt: Date,
  readingTime: Number (auto-calculated),
  views: Number,
  likes: [ObjectId (User)],
  comments: [{user, content, createdAt, isApproved}],
  seo: {metaTitle, metaDescription, metaKeywords},
  timestamps: true
}
```

#### Appointment Model
```javascript
{
  user: ObjectId (User - the professional),
  date: Date,
  startTime: String,
  endTime: String,
  clientName: String,
  clientSurname: String,
  clientEmail: String,
  clientPhone: String,
  notes: String,
  status: ['pending', 'confirmed', 'cancelled', 'completed'],
  timestamps: true
}
```

#### Closure Model
```javascript
{
  user: ObjectId (User),
  date: Date,
  isFullDay: Boolean,
  startTime: String,
  endTime: String,
  reason: String,
  timestamps: true
}
```

## 🚀 Deployment to Render.com

### Backend Deployment

1. **Create New Web Service** on Render.com
   - Connect your GitHub repository
   - Select the branch (main/master)
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Set environment variables (see below)

2. **Set Environment Variables** in Render Dashboard

### Frontend Deployment

1. **Create New Static Site** on Render.com
   - Build Command: `cd client && npm install --legacy-peer-deps && npm run build`
   - Publish Directory: `client/build`
   - Add environment variable for API URL

### Important Notes for Render
- Render automatically detects Node.js version from `package.json`
- Static files (blog images) are served from `client/public/images`
- CORS is configured to accept requests from CLIENT_URL
- Rate limiting is enabled on API routes

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, create an issue in the repository.

## 🔮 Future Enhancements

- ✅ Real-time appointment notifications
- ✅ File upload system (blog images)
- ✅ Email integration (appointment confirmations)
- Advanced analytics dashboard
- Social media integration
- Mobile app development
- Advanced search functionality
- Multi-language support
- WebSocket for real-time updates
- Payment integration for appointments

---

**Energy Waves** - Modern appointment booking and content management platform 🌊
