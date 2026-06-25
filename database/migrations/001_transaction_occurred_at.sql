BEGIN;

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'transactions'
      AND column_name = 'date'
  ) THEN
    UPDATE transactions
    SET occurred_at = COALESCE(created_at, date::timestamp, NOW())
    WHERE occurred_at IS NULL;
  ELSE
    UPDATE transactions
    SET occurred_at = COALESCE(created_at, NOW())
    WHERE occurred_at IS NULL;
  END IF;
END $$;

ALTER TABLE transactions
  ALTER COLUMN occurred_at SET DEFAULT NOW(),
  ALTER COLUMN occurred_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at
  ON transactions (occurred_at);

DROP INDEX IF EXISTS idx_transactions_date;

ALTER TABLE transactions
  DROP COLUMN IF EXISTS date;

COMMIT;
