import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './AdminUsers.css';

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isActive: boolean;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin'
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({});
      const usersData = response.data.data?.users || [];
      setUsers(usersData);
      setError('');
    } catch (err: any) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Toggle user role
  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      setError('Failed to update role');
    }
  };

  // Delete user
  const deleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;
    
    try {
      await adminAPI.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  // Add new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Use the register endpoint to create a new user
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Show validation errors
        if (data.errors && data.errors.length > 0) {
          setError(data.errors.map((e: any) => e.msg).join(', '));
        } else {
          setError(data.message || 'Failed to add user');
        }
        return;
      }
      
      setShowAddModal(false);
      setNewUser({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        role: 'user'
      });
      fetchUsers();
    } catch (err) {
      setError('Failed to add user');
      console.error('Add user error:', err);
    }
  };

  if (loading) {
    return (
      <div className="admin-users">
        <h2>Users</h2>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="admin-users">
        <h2>Users</h2>
        <p className="no-users">No users</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <h2>Users</h2>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          + Add User
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>@{user.username}</td>
              <td>
                <span className={`role-badge ${user.role}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    onClick={() => toggleRole(user._id, user.role)}
                    className="btn-toggle"
                  >
                    {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                  </button>
                  <button 
                    onClick={() => deleteUser(user._id, user.username)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddUser} className="add-user-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-input"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'user' | 'admin'})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
