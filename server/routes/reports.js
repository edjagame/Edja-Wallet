const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db');

function isValidMonth(month) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month || '');
  return Boolean(match) && Number(match[1]) > 0;
}

router.get('/summary', auth, async (req, res) => {
  try {
    const { month } = req.query;

    if (!isValidMonth(month)) {
      return res.status(400).json({ message: 'month must use YYYY-MM format' });
    }

    const queryText = `
      WITH bounds AS (
        SELECT
          $2::date AS current_start,
          $2::date + INTERVAL '1 month' AS current_end,
          $2::date - INTERVAL '1 month' AS previous_start
      ),
      totals AS (
        SELECT
          COALESCE(
            SUM(t.amount) FILTER (
              WHERE c.type = 'income'
                AND t.occurred_at >= bounds.current_start
                AND t.occurred_at < bounds.current_end
            ),
            0
          ) AS income,
          COALESCE(
            SUM(t.amount) FILTER (
              WHERE c.type = 'expense'
                AND t.occurred_at >= bounds.current_start
                AND t.occurred_at < bounds.current_end
            ),
            0
          ) AS expenses,
          COALESCE(
            SUM(t.amount) FILTER (
              WHERE c.type = 'income'
                AND t.occurred_at >= bounds.previous_start
                AND t.occurred_at < bounds.current_start
            ),
            0
          ) AS previous_income,
          COALESCE(
            SUM(t.amount) FILTER (
              WHERE c.type = 'expense'
                AND t.occurred_at >= bounds.previous_start
                AND t.occurred_at < bounds.current_start
            ),
            0
          ) AS previous_expenses
        FROM bounds
        LEFT JOIN transactions t
          ON t.user_id = $1
          AND t.occurred_at >= bounds.previous_start
          AND t.occurred_at < bounds.current_end
        LEFT JOIN categories c ON c.id = t.category_id
      )
      SELECT
        income,
        expenses,
        income - expenses AS net_savings,
        previous_income,
        previous_expenses,
        previous_income - previous_expenses AS previous_net_savings,
        income - previous_income AS income_change,
        expenses - previous_expenses AS expenses_change,
        (income - expenses) - (previous_income - previous_expenses) AS net_savings_change,
        CASE
          WHEN previous_income = 0 THEN NULL
          ELSE ROUND(((income - previous_income) / previous_income) * 100, 2)
        END AS income_change_percent,
        CASE
          WHEN previous_expenses = 0 THEN NULL
          ELSE ROUND(((expenses - previous_expenses) / previous_expenses) * 100, 2)
        END AS expenses_change_percent,
        CASE
          WHEN previous_income - previous_expenses = 0 THEN NULL
          ELSE ROUND(
            (
              ((income - expenses) - (previous_income - previous_expenses))
              / (previous_income - previous_expenses)
            ) * 100,
            2
          )
        END AS net_savings_change_percent
      FROM totals
    `;
    const queryParams = [req.user.id, `${month}-01`];

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/categories', auth, async (req, res) => {
  try {
    const { month } = req.query;

    if (!isValidMonth(month)) {
      return res.status(400).json({ message: 'month must use YYYY-MM format' });
    }

    const queryText = `
      SELECT
        c.id AS category_id,
        c.name AS category_name,
        c.icon AS category_icon,
        SUM(t.amount) AS total
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = $1
        AND c.type = 'expense'
        AND t.occurred_at >= $2::date
        AND t.occurred_at < $2::date + INTERVAL '1 month'
      GROUP BY c.id, c.name, c.icon
      ORDER BY total DESC, c.name ASC
    `;
    const queryParams = [req.user.id, `${month}-01`];

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/trends', auth, async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!isValidMonth(from) || !isValidMonth(to)) {
      return res.status(400).json({ message: 'from and to must use YYYY-MM format' });
    }

    if (from > to) {
      return res.status(400).json({ message: 'from must be before or equal to to' });
    }

    const queryText = `
      WITH months AS (
        SELECT generate_series(
          $2::date,
          $3::date,
          INTERVAL '1 month'
        )::date AS month
      ),
      monthly_totals AS (
        SELECT
          date_trunc('month', t.occurred_at)::date AS month,
          COALESCE(
            SUM(t.amount) FILTER (WHERE c.type = 'income'),
            0
          ) AS income,
          COALESCE(
            SUM(t.amount) FILTER (WHERE c.type = 'expense'),
            0
          ) AS expenses
        FROM transactions t
        LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.user_id = $1
          AND t.occurred_at >= $2::date
          AND t.occurred_at < $3::date + INTERVAL '1 month'
        GROUP BY date_trunc('month', t.occurred_at)::date
      )
      SELECT
        to_char(months.month, 'YYYY-MM') AS month,
        COALESCE(monthly_totals.income, 0) AS income,
        COALESCE(monthly_totals.expenses, 0) AS expenses,
        COALESCE(monthly_totals.income, 0)
          - COALESCE(monthly_totals.expenses, 0) AS net_savings
      FROM months
      LEFT JOIN monthly_totals ON monthly_totals.month = months.month
      ORDER BY months.month ASC
    `;
    const queryParams = [req.user.id, `${from}-01`, `${to}-01`];

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
