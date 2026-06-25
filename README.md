# Edja Wallet

A simple, performant full-stack budget tracking app to manage income, expenses, and monthly budgets by category.

## Features

- Add, edit, and delete transactions
- Organize spending by category
- Set monthly budget limits per category
- Dashboard with spending summaries and charts

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js
- **Database:** PostgreSQL (via Docker)

## Prerequisites

- [Docker Desktop](https://docker.com)
- [Node.js](https://nodejs.org/) v18+ (for running the React client locally)

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/budget-tracker.git
cd budget-tracker
```

### 2. Start all services with Docker
```bash
docker compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- Node.js server (port 5000)

### 3. Set up the client (local development)
```bash
cd client
npm install
npm start
```

App runs at `http://localhost:3000`, API at `http://localhost:5000`.

## Environment Variables

The root `.env.example` file is configured for Docker and local development. When running with `docker compose`, the environment variables are automatically set. If you need custom values, copy `.env.example` to `.env`, edit it, and recreate the containers:

```bash
docker compose down
docker compose up -d
```

| Variable      | Default (Docker) | Description                         |
|---------------|------------------|-------------------------------------|
| DB_HOST       | db               | Database host                       |
| DB_PORT       | 5432             | Database port                       |
| DB_USER       | edja_user        | PostgreSQL username                 |
| DB_PASSWORD   | edja_password    | PostgreSQL password                 |
| DB_NAME       | edja_wallet      | Database name                       |
| JWT_SECRET    | your_super_secret_jwt_key | JWT signing secret       |
| PORT          | 5000             | Server port                         |
| FRONTEND_URL  | http://localhost | URL used for CORS and reset links   |
| SMTP_HOST     |                  | SMTP server host                    |
| SMTP_PORT     | 587              | SMTP server port                    |
| SMTP_SECURE   | false            | Use TLS for the SMTP connection     |
| SMTP_USER     |                  | SMTP username                       |
| SMTP_PASS     |                  | SMTP password                       |
| MAIL_FROM     | Edja Wallet <no-reply@edjawallet.local> | Sender address |

If `SMTP_HOST` is empty, password reset emails are written to the server logs as JSON for local development. Set the SMTP values to send real email through a provider.

## Useful Docker Commands

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# View logs
docker compose logs -f server

# Access the database
docker exec -it edja-wallet-db psql -U wallet_user -d edja_wallet

# Rebuild containers (after code changes)
docker compose build --no-cache
docker compose up -d
```

## API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | /api/transactions         | Get all transactions     |
| POST   | /api/transactions         | Create a transaction     |
| PUT    | /api/transactions/:id     | Update a transaction     |
| DELETE | /api/transactions/:id     | Delete a transaction     |
| GET    | /api/categories           | Get all categories       |
| GET    | /api/budgets              | Get all budgets          |
| POST   | /api/auth/forgot-password | Email a password reset link |
| POST   | /api/auth/reset-password  | Reset password with token |

## License

MIT
