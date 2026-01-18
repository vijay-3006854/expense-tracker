const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validation');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboardStats
} = require('../controllers/transactionController');

// All routes are protected
router.use(auth);

// Dashboard stats
router.get('/stats', getDashboardStats);

// CRUD operations
router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/', validateTransaction, createTransaction);
router.put('/:id', validateTransaction, updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;