const express = require('express');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const pool = require('../db');

jest.mock('../db', () => ({
  query: jest.fn()
}));

process.env.JWT_SECRET = 'test-secret';

const reportsRouter = require('./reports');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/reports', reportsRouter);
  return app;
}

function authHeader(userId = 1) {
  const token = jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET);
  return `Bearer ${token}`;
}

describe('report routes', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    pool.query.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('requires authentication', async () => {
    const response = await request(app).get('/reports/summary?month=2026-06');

    expect(response.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('returns current and previous monthly summary values', async () => {
    const summary = {
      income: '5000.00',
      expenses: '3200.00',
      net_savings: '1800.00',
      previous_income: '4800.00',
      previous_expenses: '3000.00',
      previous_net_savings: '1800.00',
      income_change: '200.00',
      expenses_change: '200.00',
      net_savings_change: '0.00',
      income_change_percent: '4.17',
      expenses_change_percent: '6.67',
      net_savings_change_percent: '0.00'
    };
    pool.query.mockResolvedValueOnce({ rows: [summary] });

    const response = await request(app)
      .get('/reports/summary?month=2026-06')
      .set('Authorization', authHeader(7));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(summary);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('previous_income'),
      [7, '2026-06-01']
    );
  });

  test.each([
    '/reports/summary',
    '/reports/summary?month=2026-13',
    '/reports/categories?month=0000-01',
    '/reports/trends?from=2026-01',
    '/reports/trends?from=June&to=2026-06'
  ])('rejects invalid month parameters for %s', async (path) => {
    const response = await request(app)
      .get(path)
      .set('Authorization', authHeader());

    expect(response.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('returns expense totals grouped by category', async () => {
    const categories = [
      {
        category_id: 3,
        category_name: 'Rent/Housing',
        category_icon: '🏠',
        total: '1200.00'
      },
      {
        category_id: 1,
        category_name: 'Food & Drinks',
        category_icon: '🍔',
        total: '450.00'
      }
    ];
    pool.query.mockResolvedValueOnce({ rows: categories });

    const response = await request(app)
      .get('/reports/categories?month=2026-06')
      .set('Authorization', authHeader(3));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(categories);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("c.type = 'expense'"),
      [3, '2026-06-01']
    );
  });

  test('returns trends for an inclusive month range', async () => {
    const trends = [
      {
        month: '2026-04',
        income: '0',
        expenses: '0',
        net_savings: '0'
      },
      {
        month: '2026-05',
        income: '4000.00',
        expenses: '2800.00',
        net_savings: '1200.00'
      },
      {
        month: '2026-06',
        income: '4200.00',
        expenses: '3100.00',
        net_savings: '1100.00'
      }
    ];
    pool.query.mockResolvedValueOnce({ rows: trends });

    const response = await request(app)
      .get('/reports/trends?from=2026-04&to=2026-06')
      .set('Authorization', authHeader(5));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(trends);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('generate_series'),
      [5, '2026-04-01', '2026-06-01']
    );
  });

  test('rejects a reversed trend range', async () => {
    const response = await request(app)
      .get('/reports/trends?from=2026-07&to=2026-06')
      .set('Authorization', authHeader());

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'from must be before or equal to to'
    });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('returns a server error when a report query fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    pool.query.mockRejectedValueOnce(new Error('database unavailable'));

    const response = await request(app)
      .get('/reports/summary?month=2026-06')
      .set('Authorization', authHeader());

    expect(response.status).toBe(500);
    expect(response.text).toBe('Server Error');
  });
});
