-- Create shinroe_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."shinroe_users" (
  "address" TEXT PRIMARY KEY,
  "display_name" TEXT,
  "avatar_url" TEXT,
  "bio" TEXT,
  "verychat_id" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Add verychat_id column if it doesn't exist (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'shinroe_users'
    AND column_name = 'verychat_id'
  ) THEN
    ALTER TABLE "public"."shinroe_users" ADD COLUMN "verychat_id" TEXT;
  END IF;
END $$;

-- Index for faster lookups by display name (for search)
CREATE INDEX IF NOT EXISTS idx_shinroe_users_display_name
ON "public"."shinroe_users"(LOWER("display_name"));

-- Index for VeryChat ID lookups (only create if verychat_id column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'shinroe_users'
    AND column_name = 'verychat_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_shinroe_users_verychat_id
    ON "public"."shinroe_users"("verychat_id")
    WHERE "verychat_id" IS NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to shinroe_users
DROP TRIGGER IF EXISTS set_shinroe_users_updated_at ON "public"."shinroe_users";
CREATE TRIGGER set_shinroe_users_updated_at
  BEFORE UPDATE ON "public"."shinroe_users"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Disable RLS (using service role key for all operations)
ALTER TABLE "public"."shinroe_users" DISABLE ROW LEVEL SECURITY;
