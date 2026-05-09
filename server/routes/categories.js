const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const pool = require('../db');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories WHERE user_id = $1", [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;