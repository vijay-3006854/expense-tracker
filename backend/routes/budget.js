const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateBudget } = require('../middleware/validation');
const {
  getBudget,
  setBudget,
  getBudgetAnalytics
} = require('../controllers/budgetController');

// All routes are protected
router.use(auth);

router.get('/', getBudget);
router.post('/', validateBudget, setBudget);
router.get('/analytics', getBudgetAnalytics);

module.exports = router;