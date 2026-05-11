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
    res.status(500).send("Server Error");
    console.error(err);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteCategory = await pool.query(`
      DELETE FROM categories
      WHERE user_id = $1
      AND id = $2
      RETURNING *;`,
      [req.user.id, id]
    );
    res.json(deleteCategory.rows[0]);
  } catch (err) {
    res.status(500).send("Server Error");
    console.error(err);
  }
});


module.exports = router;