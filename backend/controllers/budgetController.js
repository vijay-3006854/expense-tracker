const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get user budget
const getBudget = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get current month expenses
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    
    const expenses = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const currentExpenses = expenses[0]?.total || 0;
    const budgetUsage = user.budget > 0 ? (currentExpenses / user.budget) * 100 : 0;

    res.json({
      success: true,
      data: {
        budget: user.budget,
        currentExpenses,
        remaining: Math.max(0, user.budget - currentExpenses),
        budgetUsage: Math.min(100, budgetUsage),
        isOverBudget: currentExpenses > user.budget,
        period: {
          start: startOfMonth,
          end: endOfMonth
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budget', error: error.message });
  }
};

// Set or update budget
const setBudget = async (req, res) => {
  try {
    const { budget } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { budget },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: { budget: user.budget }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating budget', error: error.message });
  }
};

// Get budget history and analytics
const getBudgetAnalytics = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    // Get monthly budget vs expenses for the last N months
    const monthsData = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const expenses = await Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            type: 'expense',
            date: { $gte: monthStart, $lte: monthEnd }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      monthsData.push({
        month: monthStart.toISOString().substring(0, 7), // YYYY-MM format
        budget: req.user.budget,
        expenses: expenses[0]?.total || 0,
        savings: Math.max(0, req.user.budget - (expenses[0]?.total || 0))
      });
    }

    // Calculate average monthly expenses
    const totalExpenses = monthsData.reduce((sum, month) => sum + month.expenses, 0);
    const avgMonthlyExpenses = totalExpenses / monthsData.length;

    // Budget recommendations
    const recommendations = [];
    if (avgMonthlyExpenses > req.user.budget) {
      recommendations.push({
        type: 'increase_budget',
        message: `Consider increasing your budget to $${Math.ceil(avgMonthlyExpenses * 1.1)} based on your spending pattern`
      });
    }
    
    if (req.user.budget > avgMonthlyExpenses * 1.5) {
      recommendations.push({
        type: 'optimize_budget',
        message: `You could optimize your budget to $${Math.ceil(avgMonthlyExpenses * 1.2)} and allocate more to savings`
      });
    }

    res.json({
      success: true,
      data: {
        monthlyData: monthsData,
        analytics: {
          avgMonthlyExpenses: avgMonthlyExpenses.toFixed(2),
          totalSavings: monthsData.reduce((sum, month) => sum + month.savings, 0).toFixed(2),
          budgetAdherence: monthsData.filter(month => month.expenses <= month.budget).length / monthsData.length * 100
        },
        recommendations
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budget analytics', error: error.message });
  }
};

module.exports = {
  getBudget,
  setBudget,
  getBudgetAnalytics
};