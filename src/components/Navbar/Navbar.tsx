import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { setTheme, actualTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(actualTheme === 'light' ? 'dark' : 'light');
  };

  // Handle navigation with smooth scroll
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string, path: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (location.pathname === '/') {
      // If we're on home page, smooth scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Navigate to home page, then scroll to section
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          The Waves
        </Link>

        {/* Desktop Menu */}
        <div className="nav-right">
          <ul className="nav-menu desktop-menu">
            <li>
              <a 
                href="#home" 
                onClick={(e) => handleNavClick(e, 'home', '/')}
                className={isActive('/') ? 'active' : ''}
              >
                Home
              </a>
            </li>
          <li>
            <a 
              href="#about" 
              onClick={(e) => handleNavClick(e, 'about', '/about')}
            >
              About
            </a>
          </li>
          <li>
            <a 
              href="#calendar" 
              onClick={(e) => handleNavClick(e, 'calendar', '/calendar')}
            >
              Calendar
            </a>
          </li>
          <li>
            <a 
              href="#blog" 
              onClick={(e) => handleNavClick(e, 'blog', '/blog')}
            >
              Blog
            </a>
          </li>
          <li>
            <a 
              href="#contact" 
              onClick={(e) => handleNavClick(e, 'contact', '/contact')}
            >
              Contact
            </a>
          </li>

          {/* Auth Menu */}
          {isAuthenticated && (
            <>
              <li className="nav-dropdown">
                <span className="nav-user">
                  {user?.firstName} {user?.lastName}
                </span>
                <div className="dropdown-menu">
                  <Link 
                    to={user?.role === 'admin' ? '/admin' : '/dashboard'} 
                    className="dropdown-item"
                  >
                    {user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                  </Link>
                  {user?.role !== 'admin' && (
                    <Link to="/dashboard" className="dropdown-item">
                      📅 My Calendar
                    </Link>
                  )}
                  <Link to="/my-blogs" className="dropdown-item">
                    📝 My Blogs
                  </Link>
                  <Link to="/profile" className="dropdown-item">
                    Profile
                  </Link>
                  <Link to="/settings" className="dropdown-item">
                    Settings
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              </li>
            </>
          )}
          </ul>

          {/* Theme Toggle Button */}
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={actualTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {actualTheme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <ul className="mobile-menu-list">
            <li>
              <a 
                href="#home" 
                onClick={(e) => handleNavClick(e, 'home', '/')}
                className={isActive('/') ? 'active' : ''}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                onClick={(e) => handleNavClick(e, 'about', '/about')}
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#calendar" 
                onClick={(e) => handleNavClick(e, 'calendar', '/calendar')}
              >
                Calendar
              </a>
            </li>
            <li>
              <a 
                href="#blog" 
                onClick={(e) => handleNavClick(e, 'blog', '/blog')}
              >
                Blog
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                onClick={(e) => handleNavClick(e, 'contact', '/contact')}
              >
                Contact
              </a>
            </li>

            {/* Auth Menu */}
            {isAuthenticated && (
              <>
                <li className="mobile-user-section">
                  <div className="mobile-user-name">
                    {user?.firstName} {user?.lastName}
                  </div>
                </li>
                <li>
                  <Link 
                    to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                  </Link>
                </li>
                {user?.role !== 'admin' && (
                  <li>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      📅 My Calendar
                    </Link>
                  </li>
                )}
                <li>
                  <Link 
                    to="/my-blogs" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📝 My Blogs
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/settings" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="mobile-logout">
                    Logout
                  </button>
                </li>
              </>
            )}
            
            {/* Theme Toggle in Mobile Menu */}
            <li>
              <button onClick={toggleTheme} className="mobile-theme-toggle">
                {actualTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
