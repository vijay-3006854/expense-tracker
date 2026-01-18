import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Budget = () => {
  const [budgetData, setBudgetData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudget, setNewBudget] = useState('');

  useEffect(() => {
    fetchBudgetData();
    fetchBudgetAnalytics();
  }, []);

  const fetchBudgetData = async () => {
    try {
      const response = await axios.get('/api/budget');
      setBudgetData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch budget data');
    }
  };

  const fetchBudgetAnalytics = async () => {
    try {
      const response = await axios.get('/api/budget/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch budget analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/budget', { budget: parseFloat(newBudget) });
      toast.success('Budget updated successfully');
      setShowBudgetModal(false);
      setNewBudget('');
      fetchBudgetData();
      fetchBudgetAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update budget');
    }
  };

  if (loading) {
    return <LoadingSpinner size="xl" className="h-64" />;
  }

  const getProgressColor = (usage) => {
    if (usage >= 100) return 'bg-red-500';
    if (usage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressTextColor = (usage) => {
    if (usage >= 100) return 'text-red-600 dark:text-red-400';
    if (usage >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Budget Management
        </h1>
        <button
          onClick={() => {
            setNewBudget(budgetData?.budget?.toString() || '');
            setShowBudgetModal(true);
          }}
          className="btn btn-primary"
        >
          <Target className="h-4 w-4 mr-2" />
          Set Budget
        </button>
      </div>

      {/* Current Budget Status */}
      {budgetData && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Current Month Budget
            </h2>
            {budgetData.isOverBudget && (
              <div className="flex items-center text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Over Budget!
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${budgetData.budget.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Monthly Budget
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${budgetData.currentExpenses.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Current Expenses
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                budgetData.remaining >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                ${Math.abs(budgetData.remaining).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {budgetData.remaining >= 0 ? 'Remaining' : 'Over Budget'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Budget Usage
              </span>
              <span className={`text-sm font-medium ${getProgressTextColor(budgetData.budgetUsage)}`}>
                {budgetData.budgetUsage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(budgetData.budgetUsage)}`}
                style={{ width: `${Math.min(budgetData.budgetUsage, 100)}%` }}
              />
            </div>
          </div>

          {budgetData.budgetUsage >= 80 && (
            <div className={`p-4 rounded-lg ${
              budgetData.budgetUsage >= 100 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center">
                <AlertTriangle className={`h-5 w-5 mr-3 ${
                  budgetData.budgetUsage >= 100 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`} />
                <div>
                  <h3 className={`font-medium ${
                    budgetData.budgetUsage >= 100 
                      ? 'text-red-800 dark:text-red-200' 
                      : 'text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {budgetData.budgetUsage >= 100 ? 'Budget Exceeded!' : 'Budget Warning!'}
                  </h3>
                  <p className={`text-sm ${
                    budgetData.budgetUsage >= 100 
                      ? 'text-red-700 dark:text-red-300' 
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {budgetData.budgetUsage >= 100 
                      ? 'You have exceeded your monthly budget. Consider reviewing your expenses.'
                      : 'You are approaching your budget limit. Monitor your spending carefully.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Budget Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Budget vs Expenses
            </h3>
            <div className="space-y-4">
              {analytics.monthlyData.slice(-6).map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Budget: ${month.budget.toFixed(0)}
                    </div>
                    <div className={`text-sm font-medium ${
                      month.expenses <= month.budget 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Spent: ${month.expenses.toFixed(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Statistics */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Budget Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Avg Monthly Expenses
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  ${analytics.analytics.avgMonthlyExpenses}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Savings
                  </span>
                </div>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  ${analytics.analytics.totalSavings}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Budget Adherence
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {analytics.analytics.budgetAdherence.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analytics?.recommendations && analytics.recommendations.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Budget Recommendations
          </h3>
          <div className="space-y-3">
            {analytics.recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200">{rec.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Set Monthly Budget
            </h2>
            
            <form onSubmit={handleSetBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Budget Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="Enter your monthly budget"
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Set a realistic monthly budget to track your spending
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBudgetModal(false);
                    setNewBudget('');
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Set Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;