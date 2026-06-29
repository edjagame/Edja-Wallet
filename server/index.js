const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config({ override: true });

const app = express();

// Apply security headers before any route handlers respond.
app.use(helmet());

// Keep API abuse bounded while allowing static assets to remain unaffected.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Build a strict origin allow-list for local development and deployed clients.
let allowedOrigins = ['http://localhost:3000', 'http://localhost', 'http://localhost:80'];
if (process.env.FRONTEND_URL) {
  const sanitizedUrl = process.env.FRONTEND_URL.endsWith('/')
    ? process.env.FRONTEND_URL.slice(0, -1)
    : process.env.FRONTEND_URL;

  allowedOrigins.push(sanitizedUrl);

  if (sanitizedUrl.startsWith('https://')) {
    allowedOrigins.push(sanitizedUrl.replace('https://', 'http://'));
  } else if (sanitizedUrl.startsWith('http://')) {
    allowedOrigins.push(sanitizedUrl.replace('http://', 'https://'));
  }
}

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/reports', require('./routes/reports'));

app.listen(5000, () => console.log('Server running on port 5000'));
