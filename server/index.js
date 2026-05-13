const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet());

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Limit CORS to the specific frontend domain
let allowedOrigins = ['http://localhost:3000', 'http://localhost', 'http://localhost:80'];
if (process.env.FRONTEND_URL) {
    // Remove trailing slash if present to match the origin header exactly
    const sanitizedUrl = process.env.FRONTEND_URL.endsWith('/') 
        ? process.env.FRONTEND_URL.slice(0, -1) 
        : process.env.FRONTEND_URL;
    allowedOrigins.push(sanitizedUrl);
}

const corsOptions = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/budgets', require('./routes/budgets'));

app.listen(5000, () => console.log('Server running on port 5000'));