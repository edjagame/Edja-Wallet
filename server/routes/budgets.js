const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.get('/', auth, (req, res) => {
  res.json({ message: 'budgets route working', user: req.user });
});

module.exports = router;