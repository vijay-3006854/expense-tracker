const express = require('express');
const router = express.Router();
const { validateRegister, validateLogin } = require('../middleware/validation');
const auth = require('../middleware/auth');
const {
  register,
  login,
  refreshToken,
  logout,
  logoutAll
} = require('../controllers/authController');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', auth, logout);
router.post('/logout-all', auth, logoutAll);

module.exports = router;