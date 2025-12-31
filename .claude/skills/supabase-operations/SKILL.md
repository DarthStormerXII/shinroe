---
name: supabase-operations
description: Database operations with Supabase - queries, inserts, migrations, and type generation. Use when working with Supabase tables, running SQL, or managing schema changes.
---

# Supabase Operations Skill

## BEFORE WRITING ANY CODE

**MANDATORY: Use Context7 MCP for all documentation lookups.**

```
1. Resolve library ID:
   mcp__context7__resolve-library-id({ libraryName: "supabase" })

2. Fetch docs for your specific task:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/supabase/supabase",
     topic: "migrations",
     mode: "code"
   })

3. NEVER guess Supabase CLI commands or SQL syntax - verify with Context7 first
4. If Context7 doesn't have the library, state this and ask user for docs
```

---

## When to Use This Skill

Load this skill when:
- Querying or modifying data in Supabase tables
- Creating or running migrations
- Generating TypeScript types from schema
- Setting up RLS policies
- Debugging database issues

## Critical Rules

1. **Execute directly** - Never generate scripts for manual execution
2. **Use remote DB** - Never use local database
3. **Regenerate types** - Always run type generation after schema changes
4. **No Playwright** - Don't use browser automation for DB operations
5. **Check types first** - Review `types/supabase.ts` before operations

## Connection

```bash
DB_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"
```

## Decision Tree

```
Need to query data?
├─ Simple query → psql -c "SELECT ..."
├─ Complex query → psql with multi-line
└─ Join query → psql with JOIN clause

Need to modify data?
├─ Insert → psql -c "INSERT INTO ..."
├─ Update → psql -c "UPDATE ... WHERE ..."
├─ Delete → psql -c "DELETE FROM ... WHERE ..."
└─ Bulk operation → psql with transaction

Need to change schema?
├─ Create migration → npx supabase migration new [name]
├─ Push to remote → npx supabase db push
├─ Check current → npx supabase db dump --schema-only
└─ Generate types → npx supabase gen types typescript

Need RLS policy?
├─ Enable RLS → ALTER TABLE ... ENABLE ROW LEVEL SECURITY
├─ Add policy → CREATE POLICY ...
└─ Check policies → psql -c "\dp tablename"
```

## Common Tasks

### Querying Data

1. Look up psql commands if needed via Context7
2. Use `psql "$DB_URL" -c "SELECT ..."`
3. Always include WHERE clause for updates/deletes
4. Use RETURNING for insert/update to verify

### Creating a Migration

1. Look up Supabase migration syntax via Context7
2. Run: `npx supabase migration new migration_name`
3. Edit the generated SQL file
4. Push: `npx supabase db push`
5. Regenerate types: `npx supabase gen types typescript --linked > types/supabase.ts`

### Adding RLS Policy

1. Enable RLS: `ALTER TABLE tablename ENABLE ROW LEVEL SECURITY`
2. Create policy with appropriate USING clause
3. Test with different user contexts

## Anti-Patterns (NEVER DO)

```bash
# NEVER use local database
psql "postgresql://localhost:5432/postgres"

# Always use remote
psql "$DB_URL" -c "..."

# NEVER forget to regenerate types
# After schema change...
# (forgetting to run gen types)

# Always regenerate types after schema changes
npx supabase db push && npx supabase gen types typescript --linked > types/supabase.ts

# NEVER run destructive queries without WHERE
psql "$DB_URL" -c "DELETE FROM users"  # Deletes ALL users!

# Always use WHERE clause
psql "$DB_URL" -c "DELETE FROM users WHERE id = 1"
```

## Query Operations

### Select

```bash
# Simple select
psql "$DB_URL" -c "SELECT * FROM users LIMIT 10"

# With conditions
psql "$DB_URL" -c "SELECT * FROM users WHERE email LIKE '%@example.com'"

# With joins
psql "$DB_URL" -c "
  SELECT u.email, p.name
  FROM users u
  JOIN profiles p ON u.id = p.user_id
  WHERE u.created_at > '2024-01-01'
"
```

### Insert/Update/Delete

```bash
# Insert
psql "$DB_URL" -c "INSERT INTO users (email) VALUES ('test@example.com') RETURNING id"

# Update
psql "$DB_URL" -c "UPDATE users SET status = 'active' WHERE id = 1 RETURNING *"

# Delete
psql "$DB_URL" -c "DELETE FROM users WHERE id = 1 RETURNING id"
```

## Related Skills

- **web3-integration** - For frontend database interactions

## Quick Reference

| Task | Command |
|------|---------|
| Query | `psql "$DB_URL" -c "SELECT ..."` |
| Insert | `psql "$DB_URL" -c "INSERT INTO ..."` |
| Update | `psql "$DB_URL" -c "UPDATE ... WHERE ..."` |
| Delete | `psql "$DB_URL" -c "DELETE FROM ... WHERE ..."` |
| New migration | `npx supabase migration new name` |
| Push migration | `npx supabase db push` |
| Gen types | `npx supabase gen types typescript --linked > types/supabase.ts` |
| Check schema | `npx supabase db dump --schema-only` |
| List tables | `psql "$DB_URL" -c "\dt"` |
| Describe table | `psql "$DB_URL" -c "\d tablename"` |

See `reference.md` for SQL patterns and RLS policies.
