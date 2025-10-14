import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './AdminOverview.css';

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0 },
    blogs: { total: 0, published: 0 },
    events: { total: 0, upcoming: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStats();
        const statsData = response.data.data?.stats || {
          users: { total: 0, active: 0 },
          blogs: { total: 0, published: 0 },
          events: { total: 0, upcoming: 0 }
        };
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-overview">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Users</h3>
          <p className="stat-number">{stats.users.total}</p>
          <span className="stat-detail">{stats.users.active} active</span>
        </div>

        <div className="stat-card">
          <h3>Blog Posts</h3>
          <p className="stat-number">{stats.blogs.total}</p>
          <span className="stat-detail">{stats.blogs.published} published</span>
        </div>

        <div className="stat-card">
          <h3>Events</h3>
          <p className="stat-number">{stats.events.total}</p>
          <span className="stat-detail">{stats.events.upcoming} upcoming</span>
        </div>
      </div>

      <div className="quick-links">
        <h2>Quick Access</h2>
        <div className="links-grid">
          <Link to="/admin/users" className="link-card">
            <span className="link-icon">👥</span>
            <h4>Manage Users</h4>
          </Link>

          <Link to="/admin/blogs" className="link-card">
            <span className="link-icon">📝</span>
            <h4>Manage Blogs</h4>
          </Link>

          <Link to="/admin/events" className="link-card">
            <span className="link-icon">📅</span>
            <h4>Manage Events</h4>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
