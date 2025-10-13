# Energy Waves - MERN Stack Application

A full-stack web application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring energy wave animations, user management, calendar events, blog system, and admin dashboard.

## 🌊 Features

### Core Features
- **Animated Energy Waves Background**: Beautiful SVG wave animations that respond to scroll
- **User Authentication**: Complete registration, login, and JWT-based authentication
- **Role-Based Access Control**: User and Admin roles
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Real-time Animations**: Scroll-triggered wave animations

### User Features
- **Personal Dashboard**: User-specific dashboard with analytics
- **Calendar Management**: Create and manage events
- **Blog System**: Create, edit, and publish blog posts
- **Profile Management**: Update personal information and preferences

### Admin Features
- **User Management**: View, edit, and manage user accounts
- **Content Moderation**: Manage blog posts and events
- **Analytics Dashboard**: Platform statistics and insights
- **System Administration**: Role management and platform settings

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd energy-waves-mern
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Setup**
   
   Create `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/energy-waves
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random
   CLIENT_URL=http://localhost:3000
   ADMIN_EMAIL=admin@energywaves.com
   ADMIN_PASSWORD=admin123
   ```

   Create `client/.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_NAME=Energy Waves
   ```

5. **Start the application**
   ```bash
   # Start both backend and frontend concurrently
   npm run dev
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only (in another terminal)
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 📁 Project Structure

```
energy-waves-mern/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── EnergyWaves/
│   │   │   ├── Navbar/
│   │   │   └── ProtectedRoute/
│   │   ├── contexts/       # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── Home/
│   │   │   ├── About/
│   │   │   ├── Calendar/
│   │   │   ├── Blog/
│   │   │   ├── Contact/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   └── Admin/
│   │   ├── services/       # API services
│   │   └── App.tsx
│   └── package.json
├── models/                 # MongoDB models
│   ├── User.js
│   ├── Blog.js
│   └── Calendar.js
├── routes/                 # Express routes
│   ├── auth.js
│   ├── users.js
│   ├── blog.js
│   ├── calendar.js
│   └── admin.js
├── middleware/             # Custom middleware
│   └── auth.js
├── server.js              # Express server
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
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)
- `PUT /api/users/:id/activate` - Activate/deactivate user (admin)

### Blog
- `GET /api/blog` - Get published blog posts
- `GET /api/blog/:slug` - Get blog post by slug
- `GET /api/blog/draft` - Get user's draft posts
- `POST /api/blog` - Create blog post
- `PUT /api/blog/:id` - Update blog post
- `DELETE /api/blog/:id` - Delete blog post
- `POST /api/blog/:id/like` - Toggle like on blog post

### Calendar
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
- `PUT /api/admin/users/:id/role` - Update user role (admin)
- `PUT /api/admin/blogs/:id/status` - Update blog status
- `PUT /api/admin/events/:id/status` - Update event status

## 🎨 Customization

### Energy Waves Animation
The energy waves animation is controlled by CSS and can be customized in:
- `client/src/components/EnergyWaves/EnergyWaves.css`
- Wave patterns in `client/src/components/EnergyWaves/EnergyWaves.tsx`

### Theme Customization
The application supports both dark and light themes. Theme styles are located in:
- `client/src/App.css`
- Individual component CSS files with `[data-theme="light"]` selectors

### Styling
- Main styles: `client/src/App.css`
- Component-specific styles in respective component folders
- Responsive design with mobile-first approach

## 🔧 Development

### Available Scripts

**Root directory:**
- `npm start` - Start production server
- `npm run dev` - Start development mode (concurrent backend + frontend)
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production

**Client directory:**
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Database Models

#### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: ['user', 'admin'],
  avatar: String,
  bio: String,
  isActive: Boolean,
  preferences: Object,
  timestamps: true
}
```

#### Blog Model
```javascript
{
  title: String,
  slug: String,
  excerpt: String,
  content: String,
  author: ObjectId (User),
  category: String,
  tags: [String],
  status: ['draft', 'published', 'archived'],
  publishedAt: Date,
  views: Number,
  likes: [ObjectId (User)],
  comments: [Object],
  timestamps: true
}
```

#### Calendar Model
```javascript
{
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  organizer: ObjectId (User),
  attendees: [Object],
  category: String,
  status: String,
  isPublic: Boolean,
  maxAttendees: Number,
  timestamps: true
}
```

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create Heroku app
2. Set environment variables in Heroku dashboard
3. Connect GitHub repository
4. Enable automatic deployments

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy `client/build` folder
3. Set environment variables for production API URL

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/energy-waves
JWT_SECRET=your-production-secret-key
CLIENT_URL=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@energywaves.com or create an issue in the repository.

## 🔮 Future Enhancements

- Real-time notifications
- Advanced analytics dashboard
- File upload system
- Email integration
- Social media integration
- Mobile app development
- Advanced search functionality
- Multi-language support

---

**Energy Waves** - Revolutionizing energy management through technology 🌊
