const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db')

// GET all budgets for a logged-in user
router.get('/', auth, async (req, res) => {
  try {
    // Fetch all budget records associated with the authenticated user's ID
    const result = await pool.query(
      `SELECT *
       FROM budgets
       WHERE user_id = $1
      `,
      [req.user.id]
    );

    // Return the array of budget objects to the client
    res.json(result.rows)

  } catch(err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST a new budget for a logged-in user
router.post('/', auth, async (req, res) => {
  try {
    const { category_id, monthly_limit, month } = req.body;
    
    // Insert new budget record and return the created row
    const newBudget = await pool.query(
      `INSERT INTO budgets (user_id, category_id, monthly_limit) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [req.user.id, category_id, monthly_limit, month]
    );

    res.json(newBudget.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;