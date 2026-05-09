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

The `.env.example` file in `/server` is already configured for Docker. When running with `docker compose`, the environment variables are automatically set. If you need custom values, edit `.env.example` and recreate the containers:

```bash
docker compose down
docker compose up -d
```

| Variable      | Default (Docker) | Description          |
|---------------|------------------|----------------------|
| DB_HOST       | postgres         | Database host        |
| DB_PORT       | 5432             | Database port        |
| DB_USER       | wallet_user      | PostgreSQL username  |
| DB_PASSWORD   | wallet_password  | PostgreSQL password  |
| DB_NAME       | edja_wallet      | Database name        |
| PORT          | 5000             | Server port          |

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

## License

MIT
