const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db');

async function categoryBelongsToUser(categoryId, userId) {
  const result = await pool.query(
    'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
    [categoryId, userId]
  );

  return result.rows.length > 0;
}

router.get('/', auth, async (req, res) => {
  try {
    const { search, month, categoryId, minAmount, maxAmount } = req.query;

    // Build a parameterized filter query so optional search fields never
    // become interpolated SQL values.
    let queryText = `
      SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.type AS category_type
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    const queryParams = [req.user.id];
    let paramIndex = 2;

    if (search) {
      queryText += ` AND t.description ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (month) {
      queryText += ` AND date_trunc('month', t.occurred_at) = date_trunc('month', $${paramIndex}::date)`;
      queryParams.push(`${month}-01`);
      paramIndex++;
    }

    if (categoryId) {
      queryText += ` AND t.category_id = $${paramIndex}`;
      queryParams.push(categoryId);
      paramIndex++;
    }

    if (minAmount) {
      queryText += ` AND t.amount >= $${paramIndex}`;
      queryParams.push(minAmount);
      paramIndex++;
    }

    if (maxAmount) {
      queryText += ` AND t.amount <= $${paramIndex}`;
      queryParams.push(maxAmount);
      paramIndex++;
    }

    queryText += ` ORDER BY t.occurred_at DESC, t.created_at DESC`;

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Server Error');
    console.error(err);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { amount, description, categoryId, occurredAt } = req.body;

    if (!categoryId || !(await categoryBelongsToUser(categoryId, req.user.id))) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const newTransaction = await pool.query(
      `INSERT INTO transactions (user_id, amount, description, category_id, occurred_at)
       VALUES ($1, $2, $3, $4, COALESCE($5::timestamp, NOW()))
       RETURNING *`,
      [req.user.id, amount, description, categoryId, occurredAt || null]
    );

    res.json(newTransaction.rows[0]);
  } catch (err) {
    res.status(500).send('Server Error');
    console.error(err);
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, categoryId, occurredAt, createdAt } = req.body;
    const transactionTime = occurredAt || createdAt || null;

    if (
      categoryId !== null &&
      (!categoryId || !(await categoryBelongsToUser(categoryId, req.user.id)))
    ) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const result = await pool.query(
      `UPDATE transactions
       SET amount = $1, description = $2, category_id = $3, occurred_at = COALESCE($4::timestamp, occurred_at)
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [amount, description, categoryId, transactionTime, id, req.user.id]
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

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTransaction = await pool.query(
      `DELETE FROM transactions
       WHERE user_id = $1
       AND id = $2
       RETURNING *;`,
      [req.user.id, id]
    );

    res.json(deleteTransaction.rows[0]);
  } catch (err) {
    res.status(500).send('Server Error');
    console.error(err);
  }
});

module.exports = router;
