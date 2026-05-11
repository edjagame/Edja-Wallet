const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db');

// GET all transactions for the logged-in user (with optional search)
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;

    // If a search term exists, filter by description (case-insensitive)
    if (search) {
      const result = await pool.query(
        `SELECT t.*, c.name AS category_name, c.icon AS category_icon 
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         WHERE t.user_id = $1 AND t.description ILIKE $2
         ORDER BY t.created_at DESC`,
        [req.user.id, `%${search}%`]
      );
      return res.json(result.rows);
    }

    // If no search term, return all transactions for the user
    const result = await pool.query(
      `SELECT t.*, c.name AS category_name, c.icon AS category_icon 
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Server Error");
    console.error(err);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { amount, description, categoryId } = req.body;
    const newTransaction = await pool.query(
      `INSERT INTO transactions (user_id, amount, description, category_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [req.user.id, amount, description, categoryId]
    );

    res.json(newTransaction.rows[0]);
  } catch (err) {
    res.status(500).send("Server Error");
    console.error(err);
  }
});


// UPDATE transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, categoryId, createdAt } = req.body;

    const result = await pool.query(
      `UPDATE transactions
       SET amount = $1, description = $2, category_id = $3, created_at = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [amount, description, categoryId, createdAt, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Server Error');
    console.error(err);
  }
});

// DELETE transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTransaction = await pool.query(`
      DELETE FROM transactions
      WHERE user_id = $1
      AND id = $2
      RETURNING *;`,
      [req.user.id, id]
    );
    res.json(deleteTransaction.rows[0]);
  } catch (err) {
    res.status(500).send("Server Error");
    console.error(err);
  }

});

module.exports = router;