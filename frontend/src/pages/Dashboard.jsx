import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Plus,
  Calendar
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchDashboardStats();
  }, [period]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/transactions/stats?period=${period}`);
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="xl" className="h-64" />;
  }

  if (!stats) {
    return <div>No data available</div>;
  }

  const { summary, categoryStats, recentTransactions, monthlyTrend } = stats;

  // Pie chart data for categories
  const pieData = {
    labels: categoryStats.map(cat => cat._id),
    datasets: [
      {
        data: categoryStats.map(cat => cat.total),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
          '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Bar chart data for monthly trend
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Income',
        data: Array(12).fill(0).map((_, index) => {
          const monthData = monthlyTrend.find(m => m._id.month === index + 1 && m._id.type === 'income');
          return monthData ? monthData.total : 0;
        }),
        backgroundColor: '#10B981',
        borderRadius: 4
      },
      {
        label: 'Expenses',
        data: Array(12).fill(0).map((_, index) => {
          const monthData = monthlyTrend.find(m => m._id.month === index + 1 && m._id.type === 'expense');
          return monthData ? monthData.total : 0;
        }),
        backgroundColor: '#EF4444',
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-auto"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Income
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${summary.income.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${summary.expense.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              summary.balance >= 0 
                ? 'bg-blue-100 dark:bg-blue-900' 
                : 'bg-red-100 dark:bg-red-900'
            }`}>
              <DollarSign className={`h-6 w-6 ${
                summary.balance >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Balance
              </p>
              <p className={`text-2xl font-bold ${
                summary.balance >= 0 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                ${summary.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Transactions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.transactionCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expenses by Category
          </h3>
          {categoryStats.length > 0 ? (
            <div className="h-64">
              <Pie data={pieData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          )}
        </div>

        {/* Monthly Trend Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Trend
          </h3>
          <div className="h-64">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
          <button className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${
                        transaction.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No transactions yet. Add your first transaction to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;