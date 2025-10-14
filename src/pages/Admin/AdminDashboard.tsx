import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminBlogs from './AdminBlogs';
import AdminEvents from './AdminEvents';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="admin-dashboard">
      <div className="page-content">
        <div className="container">
          <div className="admin-header">
            <h1 className="section-title">Admin Dashboard</h1>
            <p className="section-subtitle">
              Welcome, {user?.firstName}! Manage your Energy Waves platform.
            </p>
          </div>

          {/* Admin Navigation */}
          <nav className="admin-nav">
            <Link 
              to="/admin" 
              className={`admin-nav-item ${isActive('/admin') ? 'active' : ''}`}
            >
              📊 Overview
            </Link>
            <Link 
              to="/admin/users" 
              className={`admin-nav-item ${isActive('/admin/users') ? 'active' : ''}`}
            >
              👥 Users
            </Link>
            <Link 
              to="/admin/blogs" 
              className={`admin-nav-item ${isActive('/admin/blogs') ? 'active' : ''}`}
            >
              📝 Blogs
            </Link>
            <Link 
              to="/admin/events" 
              className={`admin-nav-item ${isActive('/admin/events') ? 'active' : ''}`}
            >
              📅 Events
            </Link>
          </nav>

          <div className="admin-content">
            <Routes>
              <Route path="/" element={<AdminOverview />} />
              <Route path="/users" element={<AdminUsers />} />
              <Route path="/blogs" element={<AdminBlogs />} />
              <Route path="/events" element={<AdminEvents />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
