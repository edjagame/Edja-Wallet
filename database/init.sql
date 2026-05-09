CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')),
  icon VARCHAR(10),
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  monthly_limit NUMERIC(10,2) NOT NULL,
  month DATE NOT NULL,
  UNIQUE (user_id, category_id, month) 
);

-- Indexes to speed up read operations --
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories (user_id);
-- Starter Categories for User ID 1 --
INSERT INTO categories (user_id, name, type, icon) VALUES
(1, 'Food & Drinks', 'expense', '🍔'),
(1, 'Transportation', 'expense', '🚗'),
(1, 'Rent/Housing', 'expense', '🏠'),
(1, 'Entertainment', 'expense', '🎬'),
(1, 'Salary', 'income', '💰'),
(1, 'Gifts', 'income', '🎁')
ON CONFLICT (user_id, name) DO NOTHING;