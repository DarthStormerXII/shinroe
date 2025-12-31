-- ============================================================================
-- TEMPLATE: Database Migration
-- Replace: TABLE_NAME, columns, indexes, policies
-- ============================================================================

-- Create table
CREATE TABLE TABLE_NAME (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key (if needed)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Your columns here
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE TABLE_NAME ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_TABLE_NAME_user ON TABLE_NAME(user_id);
CREATE INDEX idx_TABLE_NAME_status ON TABLE_NAME(status);
CREATE INDEX idx_TABLE_NAME_created ON TABLE_NAME(created_at);

-- Policies

-- Users can view own records
CREATE POLICY "Users can view own TABLE_NAME"
  ON TABLE_NAME FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert own records
CREATE POLICY "Users can insert own TABLE_NAME"
  ON TABLE_NAME FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update own records
CREATE POLICY "Users can update own TABLE_NAME"
  ON TABLE_NAME FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete own records
CREATE POLICY "Users can delete own TABLE_NAME"
  ON TABLE_NAME FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Updated_at trigger (requires update_updated_at function)
CREATE TRIGGER set_TABLE_NAME_updated_at
  BEFORE UPDATE ON TABLE_NAME
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- Common additions (uncomment as needed)
-- ============================================================================

-- Unique constraint
-- ALTER TABLE TABLE_NAME ADD CONSTRAINT unique_name UNIQUE (user_id, name);

-- JSONB index for specific field
-- CREATE INDEX idx_TABLE_NAME_metadata ON TABLE_NAME USING gin(metadata);

-- Partial index
-- CREATE INDEX idx_TABLE_NAME_active ON TABLE_NAME(user_id) WHERE status = 'active';

-- Admin policy
-- CREATE POLICY "Admins can manage all TABLE_NAME"
--   ON TABLE_NAME FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
--   );
