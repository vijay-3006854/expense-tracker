import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, Edit, Trash2, Download } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: null,
    endDate: null
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date()
  });

  const categories = [
    'Food', 'Travel', 'Rent', 'Shopping', 'Bills', 'Healthcare',
    'Entertainment', 'Education', 'Salary', 'Freelance', 'Investment', 'Others'
  ];

  useEffect(() => {
    fetchTransactions();
  }, [filters, pagination.current]);

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters,
        startDate: filters.startDate?.toISOString() || '',
        endDate: filters.endDate?.toISOString() || ''
      });

      const response = await axios.get(`/api/transactions?${params}`);
      setTransactions(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date.toISOString()
      };

      if (editingTransaction) {
        await axios.put(`/api/transactions/${editingTransaction._id}`, transactionData);
        toast.success('Transaction updated successfully');
      } else {
        await axios.post('/api/transactions', transactionData);
        toast.success('Transaction added successfully');
      }

      setShowModal(false);
      setEditingTransaction(null);
      resetForm();
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: new Date(transaction.date)
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/api/transactions/${id}`);
        toast.success('Transaction deleted successfully');
        fetchTransactions();
      } catch (error) {
        toast.error('Failed to delete transaction');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date()
    });
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...filters,
        startDate: filters.startDate?.toISOString() || '',
        endDate: filters.endDate?.toISOString() || ''
      });

      const response = await axios.get(`/api/user/export?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Transactions exported successfully');
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transactions
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="btn btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          
          <select
            className="input"
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <select
            className="input"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <DatePicker
            selected={filters.startDate}
            onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
            placeholderText="Start Date"
            className="input"
            isClearable
          />
          
          <DatePicker
            selected={filters.endDate}
            onChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
            placeholderText="End Date"
            className="input"
            isClearable
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner size="lg" className="h-32" />
        ) : transactions.length > 0 ? (
          <>
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
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {transaction.type}
                        </span>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchTransactions(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchTransactions(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No transactions found. Add your first transaction to get started!
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                  className="input"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                    resetForm();
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;