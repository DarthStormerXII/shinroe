---
description: Switch contract framework between Foundry and Hardhat
argument: <foundry|hardhat>
---

# Switch Contract Framework

Switch the working `contracts/` directory between Foundry and Hardhat setup.

**Usage:** `/switch-contracts foundry` or `/switch-contracts hardhat`

## Prerequisites

- Verify `$ARGUMENTS` is either `foundry` or `hardhat`
- Backup current work (commit or stash)
- Read current framework files to understand what exists

### Context7 Lookups (if unsure about syntax)

Before executing, look up current patterns if needed:
- Foundry: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "forge build" })`
- Hardhat: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/NomicFoundation/hardhat", topic: "compile" })`

## Before Switching

1. **Publish current framework to registry first** (if you made changes):
   ```
   /publish-to-registry contracts foundry
   ```

2. **Backup any uncommitted work** in the contracts directory

## Environment Files

Always copy env file after switching:
```bash
cp /Users/gabrielantonyxaviour/.claude/.env.contracts contracts/.env
```

## Switching to Foundry

If `$ARGUMENTS` is `foundry`:

### Step 1: Remove Hardhat files
```bash
cd contracts
rm -rf node_modules package.json package-lock.json hardhat.config.ts ignition/ typechain-types/
```

### Step 2: Copy from registry
```bash
# Copy Foundry structure from registry
cp -r ../registry/contract-frameworks/foundry/contracts/* .
```

### Step 3: Install dependencies
```bash
forge install
```

### Step 4: Setup Environment
```bash
cp /Users/gabrielantonyxaviour/.claude/.env.contracts contracts/.env
```

### Step 5: Verify
```bash
source contracts/.env
forge build
forge test
```

## Switching to Hardhat

If `$ARGUMENTS` is `hardhat`:

### Step 1: Remove Foundry files
```bash
cd contracts
rm -rf out/ cache/ broadcast/ lib/ dependencies/ foundry.toml Makefile .soldeer.lock script/
```

### Step 2: Copy from registry
```bash
# Copy Hardhat structure from registry
cp -r ../registry/contract-frameworks/hardhat3/contracts/* .
```

### Step 3: Preserve contract source
The `src/` directory should be renamed to `contracts/` for Hardhat:
```bash
mv src/ contracts/  # If not already done
```

### Step 4: Install dependencies
```bash
npm install
```

### Step 5: Setup Environment
```bash
cp /Users/gabrielantonyxaviour/.claude/.env.contracts contracts/.env
```

### Step 6: Verify
```bash
npx hardhat compile
npx hardhat test
```

## Important Notes

- Contract SOURCE files (`*.sol`) should be preserved during switch
- Test files need to be rewritten (Solidity tests -> TypeScript tests or vice versa)
- Deployment scripts need to be rewritten
- Always publish to registry BEFORE switching to preserve your work

## Typical Workflow

```
1. Work on Foundry contracts
2. /publish-to-registry contracts foundry
3. /switch-contracts hardhat
4. Port tests and deployment scripts to Hardhat
5. /publish-to-registry contracts hardhat
6. /switch-contracts foundry (back to your preferred framework)
```

---

## Success Checklist

Before marking this task complete, verify:

**For Foundry:**
- [ ] `foundry.toml` exists in contracts/
- [ ] `contracts/lib/` contains dependencies
- [ ] Build passes: `forge build`
- [ ] Tests pass: `forge test`
- [ ] `.env` copied and sourced

**For Hardhat:**
- [ ] `hardhat.config.ts` exists in contracts/
- [ ] `node_modules/` installed: `npm install`
- [ ] Build passes: `npx hardhat compile`
- [ ] Tests pass: `npx hardhat test`
- [ ] `.env` copied

**Run this to confirm (Foundry):**
```bash
cd contracts && source .env
forge build && forge test && echo "Foundry ready"
```

**Run this to confirm (Hardhat):**
```bash
cd contracts
npm install && npx hardhat compile && npx hardhat test && echo "Hardhat ready"
```

---

## If This Fails

### Error: "forge: command not found"
**Cause:** Foundry not installed.
**Fix:**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Error: "npx: command not found" or "hardhat: not found"
**Cause:** Node.js or npm not installed.
**Fix:**
1. Install Node.js: https://nodejs.org
2. Run: `npm install` in contracts directory

### Error: "forge install" fails
**Cause:** Git submodule issue or network problem.
**Fix:**
1. Check network connectivity
2. Try: `forge install --no-git`
3. Or manually clone dependency to `lib/`

### Error: "Cannot find module 'hardhat'"
**Cause:** Dependencies not installed.
**Fix:**
```bash
cd contracts && rm -rf node_modules && npm install
```

### Error: "Source files missing" after switch
**Cause:** `.sol` files were in wrong location.
**Fix:**
1. Foundry uses `src/`, Hardhat uses `contracts/`
2. Move files: `mv contracts/ src/` (for Foundry) or `mv src/ contracts/` (for Hardhat)

### Error: Tests fail after switch
**Cause:** Tests are framework-specific (Solidity vs TypeScript).
**Fix:**
1. Tests need to be rewritten for new framework
2. Foundry: Solidity tests in `test/`
3. Hardhat: TypeScript tests in `test/`

### Error: "PRIVATE_KEY not set"
**Cause:** .env file not copied.
**Fix:**
```bash
cp /Users/gabrielantonyxaviour/.claude/.env.contracts contracts/.env
source contracts/.env
```

### General Debugging

1. Always backup before switching
2. Publish to registry first to preserve work
3. After switch, verify build before anything else
4. If stuck, restore from registry: `cp -r registry/contract-frameworks/{framework}/contracts/* contracts/`
5. Check that source files (.sol) are in correct directory for framework
