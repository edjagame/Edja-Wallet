const express = require('express');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const pool = require('../db');

jest.mock('../db', () => ({
  query: jest.fn()
}));

process.env.JWT_SECRET = 'test-secret';

const transactionsRouter = require('./transactions');
const budgetsRouter = require('./budgets');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/transactions', transactionsRouter);
  app.use('/budgets', budgetsRouter);
  return app;
}

function authHeader(userId = 1) {
  const token = jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET);
  return `Bearer ${token}`;
}

describe('category ownership checks', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    pool.query.mockReset();
  });

  test('transaction create rejects another user category', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post('/transactions')
      .set('Authorization', authHeader(1))
      .send({
        amount: 25,
        description: 'Groceries',
        categoryId: 42,
        occurredAt: '2026-06-01T12:00:00.000Z'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid category' });
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [42, 1]
    );
  });

  test('transaction update rejects another user category', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .put('/transactions/99')
      .set('Authorization', authHeader(1))
      .send({
        amount: 30,
        description: 'Dinner',
        categoryId: 42,
        occurredAt: '2026-06-02T12:00:00.000Z'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid category' });
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [42, 1]
    );
  });

  test('budget create rejects another user category', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post('/budgets')
      .set('Authorization', authHeader(1))
      .send({
        category_id: 42,
        monthly_limit: 500,
        month: '2026-06-01'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid category' });
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [42, 1]
    );
  });

  test('transaction create succeeds with owned category', async () => {
    const transaction = {
      id: 7,
      user_id: 1,
      amount: '25.00',
      description: 'Groceries',
      category_id: 42
    };

    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 42 }] })
      .mockResolvedValueOnce({ rows: [transaction] });

    const response = await request(app)
      .post('/transactions')
      .set('Authorization', authHeader(1))
      .send({
        amount: 25,
        description: 'Groceries',
        categoryId: 42,
        occurredAt: '2026-06-01T12:00:00.000Z'
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(transaction);
    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [42, 1]
    );
    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO transactions'),
      [1, 25, 'Groceries', 42, '2026-06-01T12:00:00.000Z']
    );
  });
});
