---
description: Find and remove unused dependencies from frontend and contracts. Run periodically or after removing protocols.
---

# Cleanup Unused Dependencies

Scan the entire project for unused dependencies and safely remove them.

---

## Part 1: Frontend Dependencies

### Step 1: Get All Dependencies

Read `frontend/package.json` and list:
- All `dependencies`
- All `devDependencies`

### Step 2: Categorize Each Dependency

For EACH dependency, determine its status:

#### Category A: Framework/Build Tools (Never Remove)
These are used implicitly, not via imports:
- `next`
- `react`, `react-dom`
- `typescript`
- `tailwindcss`, `postcss`, `autoprefixer`
- `eslint`, `eslint-*`, `@eslint/*`
- `prettier`
- `@types/*` (check if base package is used)

#### Category B: Config-Based Usage
Search config files for usage:
- `next.config.ts` / `next.config.js`
- `tailwind.config.ts` / `tailwind.config.js`
- `postcss.config.*`
- `.eslintrc.*`
- `tsconfig.json`

#### Category C: Import-Based Usage
Search source files for imports:
```bash
# Search pattern for each package
grep -r "from ['\"]PACKAGE" frontend/app frontend/components frontend/lib frontend/hooks
grep -r "require(['\"]PACKAGE" frontend/
```

Also check for subpath imports:
```bash
grep -r "from ['\"]PACKAGE/" frontend/
```

#### Category D: Peer Dependencies
Some packages are required by others but not directly imported.
Check if a package is a peer dependency of something we're keeping.

### Step 3: Build Usage Report

```
FRONTEND DEPENDENCY ANALYSIS

DEFINITELY USED (keep):
  - next (framework)
  - react (framework)
  - wagmi (187 imports)
  - viem (94 imports)
  - @tanstack/react-query (23 imports)
  - tailwindcss (config)
  - class-variance-authority (45 imports)
  ...

UNUSED (safe to remove):
  - @lifi/sdk (0 imports found)
  - @lifi/types (0 imports found)
  - some-old-package (0 imports found)
  ...

REVIEW MANUALLY:
  - @radix-ui/react-slot (might be used by shadcn components)
  - clsx (might be used via cn utility)
  ...

TYPE PACKAGES:
  - @types/node: KEEP (typescript project)
  - @types/react: KEEP (react is used)
  - @types/some-removed-package: REMOVE (base package removed)
  ...
```

### Step 4: Confirm Before Removal

Present the "UNUSED" list and ask:
"These packages appear unused. Confirm removal? (y/n)"

If confirmed, run:
```bash
cd frontend && npm uninstall [PACKAGES]
```

### Step 5: Verify Frontend Build

```bash
cd frontend && npm run build
```

If build fails:
- Identify which removed package was actually needed
- Re-install it: `npm install PACKAGE`
- Move it to "REVIEW MANUALLY" for future reference
- Continue with other removals

---

## Part 2: Contract Dependencies

### Step 1: Identify Installed Dependencies

Check:
- `contracts/lib/` directory (git submodules/forge dependencies)
- `contracts/foundry.toml` for remappings
- `contracts/remappings.txt`

List all installed dependencies:
```bash
ls contracts/lib/
```

### Step 2: Search for Usage

For each dependency in `lib/`, search for imports in:
- `contracts/src/**/*.sol`
- `contracts/test/**/*.sol`
- `contracts/script/**/*.sol`

Search pattern:
```bash
grep -r "import.*LIB_NAME" contracts/src contracts/test contracts/script
```

Also check remappings to understand import aliases.

### Step 3: Build Usage Report

```
CONTRACT DEPENDENCY ANALYSIS

DEFINITELY USED (keep):
  - forge-std (test framework)
  - openzeppelin-contracts (47 imports)
  - solmate (12 imports)
  ...

UNUSED (safe to remove):
  - some-unused-lib (0 imports)
  ...

REVIEW MANUALLY:
  - [libs that might be transitively needed]
  ...
```

### Step 4: Confirm and Remove

For unused dependencies:
```bash
cd contracts && forge remove UNUSED_LIB
# or
rm -rf contracts/lib/UNUSED_LIB
```

Update `foundry.toml` and `remappings.txt` to remove references.

### Step 5: Verify Contract Build

```bash
cd contracts && forge build
```

If build fails, re-add the dependency and mark for manual review.

---

## Part 3: Clean package-lock / lockfiles

After removing packages:

```bash
# Frontend - regenerate lockfile
cd frontend && rm -rf node_modules && npm install

# Verify everything still works
npm run build
```

---

## Part 4: Final Report

```
CLEANUP COMPLETE

Frontend:
  - Packages analyzed: X
  - Packages removed: [list]
  - Space freed: ~X MB (node_modules reduction)
  - Build status: PASS

Contracts:
  - Dependencies analyzed: X
  - Dependencies removed: [list]
  - Build status: PASS

Recommendations:
  - [Any packages that should be reviewed]
  - [Any potential issues found]
```

---

## Safety Rules

1. **Never remove framework packages** (next, react, typescript, etc.)
2. **Check config files** - some packages are used via config, not imports
3. **Check for @types/** - remove type packages only if base package is removed
4. **Verify builds after each removal batch**
5. **When in doubt, keep it** - unused packages are bloat, but broken builds are worse
6. **Check peer dependencies** - some packages are required by others

---

## Quick Mode (Just List, Don't Remove)

If you just want to see what's unused without removing:

Add `--dry-run` to just generate the report without executing any removals.

Output the report and stop before Step 4 in each part.

---

## Success Checklist

Before marking this task complete, verify:

- [ ] All frontend dependencies analyzed
- [ ] All contract dependencies analyzed
- [ ] Unused packages uninstalled (with user confirmation)
- [ ] Frontend build passes: `cd frontend && npm run build`
- [ ] Contracts build passes: `cd contracts && forge build`
- [ ] Final report generated with removed packages listed

**Run this to confirm:**
```bash
cd frontend && npm run build && echo "Frontend build passed"
cd ../contracts && forge build && echo "Contracts build passed"
du -sh frontend/node_modules
# Compare with previous size to confirm reduction
```

---

## If This Fails

### Error: "Build failed" after removing package
**Cause:** Package was actually used somewhere not detected.
**Fix:**
1. Re-install the package: `npm install {package}`
2. Move to "REVIEW MANUALLY" list for future
3. Search more thoroughly next time

### Error: "Cannot find module X" at runtime
**Cause:** Package used dynamically or in config, not via import.
**Fix:**
1. Re-install: `npm install {package}`
2. Check for dynamic imports: `grep -r "import.*${package}" frontend/`
3. Check config files for package usage

### Error: "Peer dependency not met"
**Cause:** Removed a package that another package depends on.
**Fix:**
1. Re-install the peer dependency
2. Check `npm ls {package}` to see what requires it

### Error: "forge remove" fails
**Cause:** Dependency not installed via forge or wrong name.
**Fix:**
1. Check `contracts/lib/` for actual directory name
2. Remove manually: `rm -rf contracts/lib/{dependency}`
3. Update remappings if needed

### Error: "@types/X removed but X still used"
**Cause:** Removed type package but base package exists.
**Fix:**
1. Re-install types: `npm install -D @types/{package}`
2. Types should only be removed when base is removed

### Error: Package listed as unused but build fails without it
**Cause:** False positive - package used in way not detected.
**Fix:**
1. Re-install package
2. Mark as "config-based" or "peer-dependency" for future reference
3. Add to Category A/B/D in analysis

### General Debugging

1. Always confirm with user before bulk uninstall
2. Remove in small batches, build after each
3. Keep list of what was removed for easy rollback
4. Check package.json diff to see exactly what changed
5. If completely broken, restore from git and try more conservatively
