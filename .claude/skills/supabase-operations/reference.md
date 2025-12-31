# Supabase Operations Reference

## When to Use What

| Need | Use This | Not This | Why |
|------|----------|----------|-----|
| Quick query | `psql -c "SELECT ..."` | Supabase dashboard | Faster, scriptable |
| Schema change | Migration file | Direct ALTER | Trackable, reproducible |
| Push schema | `npx supabase db push` | Manual SQL | Handles migrations |
| TypeScript types | `gen types` after schema change | Manual types | Always in sync |
| Row security | RLS policies | Application logic | Database-level security |
| User auth check | `auth.uid()` | Custom JWT parsing | Built-in, secure |
| Auto timestamps | Trigger + function | Application code | Database handles it |
| Soft delete | `deleted_at` column | Hard delete | Data recovery possible |
| UUID primary key | `gen_random_uuid()` | Serial/sequence | Better for distributed |
| JSON data | `JSONB` | `JSON` | Faster queries, indexable |

---

## psql Command Reference

### Connection

```bash
# Connection string format
DB_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"

# Basic usage
psql "$DB_URL" -c "SQL_COMMAND"

# Multi-line query
psql "$DB_URL" -c "
  SELECT *
  FROM users
  WHERE created_at > '2024-01-01'
"
```

### Output Formats

```bash
# Default table format
psql "$DB_URL" -c "SELECT * FROM users"

# Expanded (vertical) format
psql "$DB_URL" -x -c "SELECT * FROM users"

# CSV output
psql "$DB_URL" -c "COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER"

# JSON output
psql "$DB_URL" -c "SELECT json_agg(users) FROM users"

# No headers
psql "$DB_URL" -t -c "SELECT email FROM users"
```

## SQL Quick Reference

### Data Types

| Type | PostgreSQL | Description |
|------|------------|-------------|
| UUID | `UUID DEFAULT gen_random_uuid()` | Auto-generated unique ID |
| Text | `TEXT` | Variable length string |
| Integer | `INTEGER` / `BIGINT` | Numbers |
| Boolean | `BOOLEAN DEFAULT false` | True/false |
| Timestamp | `TIMESTAMPTZ DEFAULT NOW()` | Timestamp with timezone |
| JSON | `JSONB` | JSON data (use JSONB not JSON) |
| Array | `TEXT[]` | Array of type |
| Enum | `CREATE TYPE status AS ENUM (...)` | Custom enum |

### Common Constraints

```sql
-- Primary key
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Not null
email TEXT NOT NULL

-- Unique
email TEXT UNIQUE

-- Foreign key
user_id UUID REFERENCES users(id) ON DELETE CASCADE

-- Check constraint
CHECK (amount >= 0)

-- Default value
status TEXT DEFAULT 'pending'
```

### Index Types

```sql
-- B-tree (default, good for equality and range)
CREATE INDEX idx_users_email ON users(email);

-- Hash (good for equality only)
CREATE INDEX idx_users_email_hash ON users USING hash(email);

-- GIN (good for JSONB and arrays)
CREATE INDEX idx_users_data ON users USING gin(data);

-- Partial index
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- Composite index
CREATE INDEX idx_users_name_email ON users(name, email);
```

## Supabase CLI Reference

### Migrations

```bash
# Create new migration
npx supabase migration new migration_name
# Creates: supabase/migrations/[timestamp]_migration_name.sql

# Push migrations to remote
npx supabase db push

# Check migration status
npx supabase db diff

# Pull remote schema
npx supabase db pull

# Reset local database
npx supabase db reset
```

### Type Generation

```bash
# Generate from linked project
npx supabase gen types typescript --linked > types/supabase.ts

# Generate from project ID
npx supabase gen types typescript --project-id [PROJECT_ID] > types/supabase.ts

# Generate from local
npx supabase gen types typescript --local > types/supabase.ts
```

### Project Management

```bash
# Link to project
npx supabase link --project-ref [PROJECT_ID]

# Start local
npx supabase start

# Stop local
npx supabase stop

# Status
npx supabase status
```

## RLS (Row Level Security)

### Enable RLS

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Policy Syntax

```sql
CREATE POLICY "policy_name"
  ON table_name
  FOR [ALL | SELECT | INSERT | UPDATE | DELETE]
  TO [role_name | public | authenticated]
  USING (select_condition)       -- For SELECT, UPDATE, DELETE
  WITH CHECK (insert_condition); -- For INSERT, UPDATE
```

### Common Patterns

```sql
-- Public read access
CREATE POLICY "Anyone can read"
  ON posts FOR SELECT
  TO public
  USING (true);

-- Authenticated only
CREATE POLICY "Authenticated can read"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

-- Owner only
CREATE POLICY "Users own their data"
  ON profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Role-based
CREATE POLICY "Admins can do anything"
  ON posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Time-based
CREATE POLICY "Can only edit recent"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    created_at > NOW() - INTERVAL '1 hour'
  );
```

## Auth Functions

```sql
-- Current user ID
auth.uid()

-- Current user's JWT
auth.jwt()

-- Check if user has role
auth.jwt() ->> 'role' = 'admin'

-- Get email from JWT
auth.jwt() ->> 'email'
```

## Triggers

### Updated_at Trigger

```sql
-- Create function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to table
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Audit Trigger

```sql
-- Create function
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## TypeScript Types

### Generated Types Usage

```typescript
import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']
type InsertUser = Database['public']['Tables']['users']['Insert']
type UpdateUser = Database['public']['Tables']['users']['Update']
```

### Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Typed query
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active')
```

## psql Meta-Commands

```bash
# List tables
\dt

# Describe table
\d table_name

# List indexes
\di

# List policies
\dp table_name

# List functions
\df

# List triggers
\dS table_name

# Quit
\q
```
