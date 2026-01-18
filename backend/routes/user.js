const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const {
  getProfile,
  updateProfile,
  changePassword,
  exportTransactions,
  deleteAccount,
  getUserStats
} = require('../controllers/userController');

// All routes are protected
router.use(auth);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/stats', getUserStats);

// Password change
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  handleValidationErrors
], changePassword);

// Export transactions
router.get('/export', exportTransactions);

// Delete account
router.delete('/account', [
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
], deleteAccount);

module.exports = router;