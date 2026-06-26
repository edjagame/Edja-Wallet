const express = require('express');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const pool = require('../db');
const bcrypt = require('bcrypt');

jest.mock('../db', () => ({
  query: jest.fn()
}));

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('../utils/mailer', () => ({
  sendPasswordResetEmail: jest.fn()
}));

process.env.JWT_SECRET = 'test-secret';

const authRouter = require('./auth');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRouter);
  return app;
}

function authHeader(userId = 1) {
  const token = jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET);
  return `Bearer ${token}`;
}

describe('auth validation', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    pool.query.mockReset();
    bcrypt.genSalt.mockReset();
    bcrypt.hash.mockReset();
    bcrypt.compare.mockReset();
  });

  test('register rejects invalid email', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        name: 'Edja',
        email: 'not-an-email',
        password: 'password1'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Enter a valid email address' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('register rejects weak password', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        name: 'Edja',
        email: 'edja@example.com',
        password: 'password'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Password must be at least 8 characters and include at least one letter and one number'
    });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('register trims name and lowercases email before duplicate lookup and insert', async () => {
    const insertedUser = {
      id: 1,
      name: 'Edja',
      email: 'edja@example.com'
    };

    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [insertedUser] })
      .mockResolvedValue({ rows: [] });
    bcrypt.genSalt.mockResolvedValueOnce('salt');
    bcrypt.hash.mockResolvedValueOnce('hashed-password');

    const response = await request(app)
      .post('/auth/register')
      .send({
        name: '  Edja  ',
        email: '  Edja@Example.COM  ',
        password: 'password1'
      });

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(insertedUser);
    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      'SELECT * FROM users WHERE LOWER(email) = $1',
      ['edja@example.com']
    );
    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      ['Edja', 'edja@example.com', 'hashed-password']
    );
  });

  test('login uses normalized email lookup', async () => {
    const user = {
      id: 1,
      name: 'Edja',
      email: 'MixedCase@Example.com',
      password_hash: 'hash'
    };

    pool.query.mockResolvedValueOnce({ rows: [user] });
    bcrypt.compare.mockResolvedValueOnce(true);

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: '  MIXEDCASE@example.COM ',
        password: 'password1'
      });

    expect(response.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE LOWER(email) = $1',
      ['mixedcase@example.com']
    );
  });

  test('reset-password rejects weak new passwords', async () => {
    const response = await request(app)
      .post('/auth/reset-password')
      .send({
        token: 'reset-token',
        newPassword: 'password'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Password must be at least 8 characters and include at least one letter and one number'
    });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('change-password rejects weak new passwords', async () => {
    const response = await request(app)
      .post('/auth/change-password')
      .set('Authorization', authHeader(1))
      .send({
        oldPassword: 'oldpassword1',
        newPassword: 'password'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Password must be at least 8 characters and include at least one letter and one number'
    });
    expect(pool.query).not.toHaveBeenCalled();
  });
});
