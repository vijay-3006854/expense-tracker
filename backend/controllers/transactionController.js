const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// Get all transactions with filtering and pagination
const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      startDate,
      endDate,
      search
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    // Execute query with pagination
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// Get transaction by ID
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
};

// Create new transaction
const createTransaction = async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      user: req.user._id
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    // Check budget if it's an expense
    if (transaction.type === 'expense') {
      await checkBudgetAlert(req.user._id, transaction.amount);
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get user stats
    const stats = await Transaction.getUserStats(req.user._id, startDate, now);
    const categoryStats = await Transaction.getCategoryStats(req.user._id, startDate, now);

    // Calculate totals
    const income = stats.find(s => s._id === 'income')?.total || 0;
    const expense = stats.find(s => s._id === 'expense')?.total || 0;
    const balance = income - expense;

    // Get recent transactions
    const recentTransactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    // Monthly trend data
    const monthlyTrend = await getMonthlyTrend(req.user._id);

    res.json({
      success: true,
      data: {
        summary: {
          income,
          expense,
          balance,
          transactionCount: stats.reduce((acc, s) => acc + s.count, 0)
        },
        categoryStats,
        recentTransactions,
        monthlyTrend,
        period
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// Helper function to get monthly trend
const getMonthlyTrend = async (userId) => {
  const pipeline = [
    {
      $match: {
        user: userId,
        date: { $gte: new Date(new Date().getFullYear(), 0, 1) }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' }
      }
    },
    {
      $sort: { '_id.month': 1 }
    }
  ];

  return Transaction.aggregate(pipeline);
};

// Helper function to check budget alert
const checkBudgetAlert = async (userId, expenseAmount) => {
  try {
    const user = await User.findById(userId);
    if (!user.budget || !user.preferences.emailNotifications) return;

    // Get current month expenses
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const expenses = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpenses = expenses[0]?.total || 0;
    const budgetUsage = (totalExpenses / user.budget) * 100;

    // Send alert if budget exceeds 80%
    if (budgetUsage >= 80) {
      await sendEmail({
        to: user.email,
        subject: 'Budget Alert - Expense Tracker',
        html: `
          <h2>Budget Alert</h2>
          <p>Hi ${user.name},</p>
          <p>You have used ${budgetUsage.toFixed(1)}% of your monthly budget.</p>
          <p>Current expenses: $${totalExpenses.toFixed(2)}</p>
          <p>Monthly budget: $${user.budget.toFixed(2)}</p>
          <p>Please review your spending to stay within budget.</p>
        `
      });
    }
  } catch (error) {
    console.error('Budget alert error:', error);
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboardStats
};