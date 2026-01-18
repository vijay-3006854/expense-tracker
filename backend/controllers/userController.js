const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { generateCSV, generatePDF } = require('../utils/export');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'preferences'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

// Export transactions
const exportTransactions = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;
    
    // Build filter
    const filter = { user: req.user._id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    if (format === 'pdf') {
      const pdfBuffer = await generatePDF(transactions, req.user);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
      res.send(pdfBuffer);
    } else {
      const csv = generateCSV(transactions);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(csv);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error exporting transactions', error: error.message });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user._id);
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Delete all user transactions
    await Transaction.deleteMany({ user: req.user._id });
    
    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments({ user: req.user._id });
    
    const stats = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Account creation date
    const user = await User.findById(req.user._id);
    const accountAge = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      data: {
        totalTransactions,
        accountAge,
        typeStats: stats,
        topCategories: categoryStats.slice(0, 5),
        joinDate: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  exportTransactions,
  deleteAccount,
  getUserStats
};