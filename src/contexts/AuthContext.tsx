import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  isActive: boolean;
  preferences: {
    notifications: {
      email: boolean;
      calendar: boolean;
      blog: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token is still valid
          try {
            const response = await authAPI.getCurrentUser();
            if (response.data.data?.user) {
              setUser(response.data.data.user);
              localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
          } catch (error) {
            // Token is invalid, clear auth state
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (login: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login(login, password);
      
      const { user: userData, token: accessToken, refreshToken } = response.data.data || {};
      
      if (!userData || !accessToken || !refreshToken) {
        throw new Error('Invalid response from server');
      }
      
      // Store tokens and user data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(accessToken);
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      const { user: newUser, token: accessToken, refreshToken } = response.data.data || {};
      
      if (!newUser || !accessToken || !refreshToken) {
        throw new Error('Invalid response from server');
      }
      
      // Store tokens and user data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(accessToken);
      setUser(newUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API first (while token is still valid)
      await authAPI.logout();
    } catch (error) {
      // Ignore errors, proceed with logout anyway
      console.error('Logout API error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear state
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const response = await authAPI.updateUser(user.id, userData);
      const updatedUser = response.data.data?.user;
      
      if (!updatedUser) {
        throw new Error('Invalid response from server');
      }
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isSuperAdmin: false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
