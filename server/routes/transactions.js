const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db');

// GET all transactions for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions WHERE user_id = $1", [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Server Error");
    console.error(err);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { amount, description, category_id } = req.body;
    const newTransaction = await pool.query(
      `INSERT INTO transactions (user_id, amount, description, category_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [req.user.id, amount, description, category_id]
    );

    res.json(newTransaction.rows[0]);
  } catch (err) {
    res.status(500).send("Server Error");
    console.error(err);
  }
});

module.exports = router;