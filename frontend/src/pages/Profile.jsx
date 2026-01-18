import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Shield, Download, Trash2, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    preferences: {
      darkMode: user?.preferences?.darkMode || false,
      currency: user?.preferences?.currency || 'USD',
      emailNotifications: user?.preferences?.emailNotifications || true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteData, setDeleteData] = useState({
    password: ''
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/api/user/stats');
      setUserStats(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch user statistics');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put('/api/user/profile', profileData);
      updateUser(response.data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await axios.put('/api/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format) => {
    try {
      const response = await axios.get(`/api/user/export?format=${format}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expense-data.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Data exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (!window.confirm('Are you absolutely sure? This action cannot be undone and will permanently delete your account and all data.')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete('/api/user/account', {
        data: { password: deleteData.password }
      });
      
      toast.success('Account deleted successfully');
      // The user will be automatically logged out by the auth context
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profile Information
            </h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className="input pl-10"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    className="input pl-10 bg-gray-50 dark:bg-gray-700"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  className="input"
                  value={profileData.preferences.currency}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, currency: e.target.value }
                  }))}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={profileData.preferences.emailNotifications}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, emailNotifications: e.target.checked }
                    }))}
                  />
                  <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Email notifications for budget alerts
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Security */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Security
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Password
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last changed: Never
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="btn btn-secondary btn-sm"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Data Export */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Data Export
            </h2>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Export your transaction data for backup or analysis purposes.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleExportData('csv')}
                className="btn btn-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => handleExportData('pdf')}
                className="btn btn-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-200 dark:border-red-800">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Danger Zone
            </h2>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </button>
          </div>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-6">
          {userStats && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats.totalTransactions}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Transactions
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats.accountAge}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Days Active
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Member Since
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(userStats.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {userStats?.topCategories && userStats.topCategories.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Expense Categories
              </h3>
              
              <div className="space-y-3">
                {userStats.topCategories.map((category, index) => (
                  <div key={category._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {category._id}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${category.total.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Change Password
            </h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              Delete Account
            </h2>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This action cannot be undone. This will permanently delete your account and all associated data.
            </p>
            
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  className="input"
                  value={deleteData.password}
                  onChange={(e) => setDeleteData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-danger flex-1"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;