const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db')

// GET all budgets for a logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const { month } = req.query;

    let queryText = `
      SELECT 
          b.*, 
          c.name as category_name,
          c.icon as category_icon,
          COALESCE(
            (SELECT SUM(t.amount) 
             FROM transactions t 
             WHERE t.category_id = b.category_id 
               AND t.user_id = b.user_id 
               AND date_trunc('month', t.occurred_at) = date_trunc('month', b.month)
            ), 0
          ) as amount_spent
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = $1
    `;
    const queryParams = [req.user.id];

    if (month) {
      queryText += ` AND date_trunc('month', b.month) = date_trunc('month', $2::date)`;
      queryParams.push(`${month}-01`);
    }

    const result = await pool.query(queryText, queryParams);

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

    if (parseFloat(monthly_limit) <= 0) {
      return res.status(400).json({ message: "Monthly limit must be a positive number" });
    }
    
    // Insert new budget record and return the created row
    const newBudget = await pool.query(
      `INSERT INTO budgets (user_id, category_id, monthly_limit, month) 
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

// DELETE a budget
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure the budget belongs to the user
    const result = await pool.query(
      "DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Budget not found or unauthorized" });
    }

    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
