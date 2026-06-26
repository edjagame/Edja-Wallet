const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db');

// Defaults mirror the categories inserted for new users during registration.
const defaultCategories = [
  ['Food & Drinks', 'expense', '🍔'],
  ['Transportation', 'expense', '🚗'],
  ['Rent/Housing', 'expense', '🏠'],
  ['Entertainment', 'expense', '🎬'],
  ['Salary', 'income', '💰'],
  ['Gifts', 'income', '🎁'],
  ['Other', 'expense', '📦'],
  ['Other', 'income', '📦']
];

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, type, icon } = req.body;
    const newCategory = await pool.query(
      `INSERT INTO categories (user_id, name, type, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, name, type, icon]
    );

    res.json(newCategory.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'A category with this name and type already exists.' });
    }

    res.status(500).send('Server Error');
    console.error(err);
  }
});

router.post('/restore-defaults', auth, async (req, res) => {
  try {
    let insertedCount = 0;

    for (const [catName, type, icon] of defaultCategories) {
      const result = await pool.query(
        'INSERT INTO categories (user_id, name, type, icon) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id',
        [req.user.id, catName, type, icon]
      );

      if (result.rows.length > 0) {
        insertedCount++;
      }
    }

    res.json({ message: `Successfully restored ${insertedCount} default categories.` });
  } catch (err) {
    res.status(500).send('Server Error');
    console.error(err);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Preserve the fallback categories required by transaction entry defaults.
    const categoryCheck = await pool.query(
      'SELECT name FROM categories WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (categoryCheck.rows[0].name.toLowerCase() === 'other') {
      return res.status(403).json({ message: "Cannot delete the default 'Other' category" });
    }

    const deleteCategory = await pool.query(
      `DELETE FROM categories
       WHERE user_id = $1
       AND id = $2
       RETURNING *;`,
      [req.user.id, id]
    );

    res.json(deleteCategory.rows[0]);
  } catch (err) {
    res.status(500).send('Server Error');
    console.error(err);
  }
});

module.exports = router;
