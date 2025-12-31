# Supabase Operations Examples

## User Management Table

### Create Migration

```bash
npx supabase migration new create_users_table
```

### Migration File

```sql
-- supabase/migrations/20240101000000_create_users_table.sql

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  wallet_address TEXT UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  is_verified BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_role ON users(role);

-- Policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Updated_at trigger
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## Blockchain Transactions Table

```sql
-- supabase/migrations/20240102000000_create_transactions_table.sql

-- Create enum for tx status
CREATE TYPE tx_status AS ENUM ('pending', 'confirmed', 'failed');

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chain_id INTEGER NOT NULL,
  tx_hash TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  value TEXT NOT NULL,
  gas_used TEXT,
  gas_price TEXT,
  status tx_status DEFAULT 'pending',
  block_number BIGINT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_tx_user ON transactions(user_id);
CREATE INDEX idx_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_tx_status ON transactions(status);
CREATE INDEX idx_tx_chain ON transactions(chain_id);
CREATE UNIQUE INDEX idx_tx_unique ON transactions(chain_id, tx_hash);

-- Policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());
```

## Query Examples

### Select with Joins

```bash
# Get user with their transactions
psql "$DB_URL" -c "
  SELECT
    u.email,
    u.wallet_address,
    COUNT(t.id) as tx_count,
    SUM(CAST(t.value AS NUMERIC)) as total_value
  FROM users u
  LEFT JOIN transactions t ON u.id = t.user_id
  GROUP BY u.id
  ORDER BY tx_count DESC
  LIMIT 10
"
```

### Insert with Returning

```bash
# Insert user and return created record
psql "$DB_URL" -c "
  INSERT INTO users (email, wallet_address, display_name)
  VALUES ('user@example.com', '0x123...', 'New User')
  RETURNING id, email, created_at
"
```

### Upsert (Insert or Update)

```bash
# Upsert user by wallet address
psql "$DB_URL" -c "
  INSERT INTO users (wallet_address, display_name)
  VALUES ('0x123...', 'Updated Name')
  ON CONFLICT (wallet_address)
  DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = NOW()
  RETURNING *
"
```

### JSONB Operations

```bash
# Query JSONB field
psql "$DB_URL" -c "
  SELECT * FROM users
  WHERE metadata->>'preferences' IS NOT NULL
"

# Update JSONB field
psql "$DB_URL" -c "
  UPDATE users
  SET metadata = metadata || '{\"theme\": \"dark\"}'::jsonb
  WHERE id = '[USER_ID]'
"

# Query nested JSONB
psql "$DB_URL" -c "
  SELECT * FROM users
  WHERE metadata->'settings'->>'notifications' = 'true'
"
```

### Aggregations

```bash
# Daily transaction counts
psql "$DB_URL" -c "
  SELECT
    DATE(created_at) as date,
    COUNT(*) as count,
    SUM(CAST(value AS NUMERIC)) as volume
  FROM transactions
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY date DESC
"

# User activity summary
psql "$DB_URL" -c "
  SELECT
    u.email,
    COUNT(t.id) as transaction_count,
    MAX(t.created_at) as last_activity
  FROM users u
  LEFT JOIN transactions t ON u.id = t.user_id
  GROUP BY u.id
  HAVING COUNT(t.id) > 0
  ORDER BY last_activity DESC
"
```

### Bulk Operations

```bash
# Bulk insert
psql "$DB_URL" -c "
  INSERT INTO users (email, wallet_address) VALUES
  ('user1@example.com', '0x111...'),
  ('user2@example.com', '0x222...'),
  ('user3@example.com', '0x333...')
"

# Bulk update
psql "$DB_URL" -c "
  UPDATE transactions
  SET status = 'failed'
  WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '1 hour'
"

# Bulk delete
psql "$DB_URL" -c "
  DELETE FROM transactions
  WHERE status = 'failed'
    AND created_at < NOW() - INTERVAL '30 days'
"
```

## TypeScript Client Usage

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Create user
export async function createUser(data: {
  email: string
  wallet_address: string
  display_name?: string
}) {
  const { data: user, error } = await supabase
    .from('users')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return user
}

// Get user by wallet
export async function getUserByWallet(wallet_address: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', wallet_address.toLowerCase())
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Get user transactions
export async function getUserTransactions(
  user_id: string,
  options?: { limit?: number; offset?: number; status?: string }
) {
  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { data, count }
}

// Record transaction
export async function recordTransaction(data: {
  user_id: string
  chain_id: number
  tx_hash: string
  from_address: string
  to_address: string
  value: string
}) {
  const { data: tx, error } = await supabase
    .from('transactions')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return tx
}

// Update transaction status
export async function updateTransactionStatus(
  tx_hash: string,
  status: 'confirmed' | 'failed',
  updates?: { block_number?: number; gas_used?: string; error_message?: string }
) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      status,
      ...updates,
      confirmed_at: status === 'confirmed' ? new Date().toISOString() : undefined,
    })
    .eq('tx_hash', tx_hash)
    .select()
    .single()

  if (error) throw error
  return data
}
```

## After Schema Changes

Always regenerate types:

```bash
# Push migration
npx supabase db push

# Regenerate types
npx supabase gen types typescript --linked > types/supabase.ts
```
