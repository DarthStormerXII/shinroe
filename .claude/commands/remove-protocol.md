---
description: Clean up codebase after removing a protocol via CLI. Finds usages, comments them out, and removes unused dependencies.
arguments:
  - name: protocol
    description: The protocol name that was removed (e.g., lifi, uniswap, 1inch)
    required: true
---

# Protocol Cleanup: $ARGUMENTS.protocol

The CLI has already deleted the protocol's directories and files. Your job is to:
1. Find all remaining references to this protocol in the codebase
2. Safely comment them out so the app doesn't crash
3. Identify and remove unused dependencies

---

## Step 1: Identify What Was Removed

The CLI would have deleted these locations (verify they're gone):

### Frontend
- `frontend/app/swap/$ARGUMENTS.protocol/` (page)
- `frontend/app/api/$ARGUMENTS.protocol/` (API routes)
- `frontend/components/protocols/$ARGUMENTS.protocol/` (components)
- `frontend/hooks/protocols/$ARGUMENTS.protocol/` (hooks)
- `frontend/constants/protocols/$ARGUMENTS.protocol/` (constants)
- `frontend/lib/services/$ARGUMENTS.protocol-service.ts` (service)

### Contracts
- `contracts/src/integrations/$ARGUMENTS.protocol/` (contracts)
- `contracts/test/integrations/$ARGUMENTS.protocol/` (tests)
- `contracts/script/$ARGUMENTS.protocol/` (deploy scripts)

List which directories/files are confirmed deleted.

---

## Step 2: Find Broken Imports (Frontend)

Search the **entire frontend/** directory for imports referencing the removed protocol.

Search patterns:
```
import.*from.*['"]@?/?.*$ARGUMENTS.protocol
import.*from.*['"]@/lib/services/$ARGUMENTS.protocol
import.*from.*['"]@/hooks/protocols/$ARGUMENTS.protocol
import.*from.*['"]@/components/protocols/$ARGUMENTS.protocol
import.*from.*['"]@/constants/protocols/$ARGUMENTS.protocol
```

Also search for:
- Dynamic imports: `import('.*$ARGUMENTS.protocol.*')`
- Direct references: `/$ARGUMENTS.protocol` in strings (routes, links)
- Config entries: protocol lists, navigation items, etc.

For each file found, note:
- File path
- Line numbers
- What is being imported/referenced

---

## Step 3: Find Broken Imports (Contracts)

Search **contracts/** for references:

```
import.*$ARGUMENTS.protocol
```

Check:
- `contracts/src/` for imports of removed contracts
- `contracts/test/` for test files importing removed contracts
- `contracts/script/` for deployment scripts
- `contracts/foundry.toml` for remappings

---

## Step 4: Fix Broken Code (Frontend)

For each file with broken imports:

### If it's a config/list file (e.g., protocol selector, navigation):
Remove the entry entirely.

**Example - Protocol list:**
```typescript
// BEFORE
const protocols = [
  { name: '1inch', path: '/swap/1inch' },
  { name: 'LI.FI', path: '/swap/lifi' },  // Remove this line
  { name: 'Uniswap', path: '/swap/uniswap' },
]

// AFTER
const protocols = [
  { name: '1inch', path: '/swap/1inch' },
  { name: 'Uniswap', path: '/swap/uniswap' },
]
```

### If it's product code that used the protocol:
Comment out and add TODO.

**Example - Component using the service:**
```typescript
// BEFORE
import { lifiService } from '@/lib/services/lifi-service'
import { LiFiRouteDisplay } from '@/components/protocols/lifi/route-display'

export function MySwapComponent() {
  const quote = await lifiService.getQuote(params)
  return <LiFiRouteDisplay route={quote.route} />
}

// AFTER
// TODO: [PROTOCOL REMOVED] lifi was removed - update or delete this code
// import { lifiService } from '@/lib/services/lifi-service'
// import { LiFiRouteDisplay } from '@/components/protocols/lifi/route-display'

export function MySwapComponent() {
  // TODO: [PROTOCOL REMOVED] lifi was removed - this functionality needs replacement
  // const quote = await lifiService.getQuote(params)
  // return <LiFiRouteDisplay route={quote.route} />
  return <div>Protocol removed - needs update</div>
}
```

### If it's a barrel/index file:
Remove the export line.

```typescript
// BEFORE
export * from './lifi'  // Remove
export * from './uniswap'

// AFTER
export * from './uniswap'
```

---

## Step 5: Fix Broken Code (Contracts)

### If contracts imported the removed protocol:
Comment out imports and usages.

```solidity
// BEFORE
import {LiFiAdapter} from "./integrations/lifi/LiFiAdapter.sol";

contract MyContract {
    LiFiAdapter public lifiAdapter;
}

// AFTER
// TODO: [PROTOCOL REMOVED] lifi was removed
// import {LiFiAdapter} from "./integrations/lifi/LiFiAdapter.sol";

contract MyContract {
    // TODO: [PROTOCOL REMOVED] lifi adapter was removed
    // LiFiAdapter public lifiAdapter;
}
```

### If tests referenced removed contracts:
Comment out the entire test file content or delete if it only tests the removed protocol.

### Update remappings if needed:
Remove any remappings in `foundry.toml` for the protocol.

---

## Step 6: Identify Dependencies to Remove

### Frontend (package.json)

Find dependencies that were ONLY used by this protocol.

1. Read `frontend/package.json`
2. Identify packages likely related to $ARGUMENTS.protocol (e.g., `@lifi/sdk`, `@lifi/types`)
3. For EACH suspected package, search the entire `frontend/` codebase:
   ```
   import.*from.*['"]PACKAGE_NAME
   require.*['"]PACKAGE_NAME
   ```
4. If NO imports exist (after our commenting), it's safe to remove

**Output format:**
```
FRONTEND DEPENDENCIES:

Safe to remove (no remaining usages):
  - @lifi/sdk
  - @lifi/types

Keep (used elsewhere):
  - viem (used by other protocols)
  - wagmi (core dependency)

Unsure (review manually):
  - some-edge-case-package
```

### Contracts (dependencies in foundry.toml or lib/)

Check if any git submodules or dependencies in `contracts/lib/` were only for this protocol.

---

## Step 7: Remove Unused Dependencies

### Frontend
```bash
cd frontend && npm uninstall [SAFE_TO_REMOVE_PACKAGES]
```

### Contracts
If there are unused dependencies in `contracts/lib/`:
```bash
cd contracts && forge remove [UNUSED_LIB]
```

---

## Step 8: Verify Build

### Frontend
```bash
cd frontend && npm run build
```

If build fails:
- Identify the error
- Fix by commenting out more code or adding placeholders
- Repeat until build passes

### Contracts
```bash
cd contracts && forge build
```

If build fails:
- Identify the error
- Fix broken imports/references
- Repeat until build passes

---

## Step 9: Final Report

Provide a summary:

```
PROTOCOL CLEANUP COMPLETE: $ARGUMENTS.protocol

Frontend:
  - Files with broken imports fixed: X
  - Config entries removed: X
  - Dependencies removed: [list]
  - Dependencies kept: [list]
  - Build status: PASS/FAIL

Contracts:
  - Files with broken imports fixed: X
  - Dependencies removed: [list]
  - Build status: PASS/FAIL

Manual review needed:
  - [List any files with TODO comments that need human attention]

Search for remaining TODOs:
  grep -r "TODO.*PROTOCOL REMOVED.*$ARGUMENTS.protocol" frontend/ contracts/
```

---

## Important Rules

1. **Never delete product code** - only comment it out with TODO markers
2. **Always verify builds pass** before finishing
3. **Be conservative with dependency removal** - when in doubt, keep it
4. **Check both frontend AND contracts**
5. **Update any central registries** (protocol lists, navigation, etc.)

---

## Success Checklist

Before marking this task complete, verify:

- [ ] All broken imports in frontend fixed (commented out with TODO)
- [ ] All broken imports in contracts fixed (commented out with TODO)
- [ ] Config/navigation entries removed (not commented)
- [ ] Unused dependencies uninstalled
- [ ] Frontend build passes: `cd frontend && npm run build`
- [ ] Contracts build passes: `cd contracts && forge build`
- [ ] Final report generated with counts

**Run this to confirm:**
```bash
cd frontend && npm run build && echo "Frontend build passed"
cd ../contracts && forge build && echo "Contracts build passed"
grep -r "TODO.*PROTOCOL REMOVED.*$ARGUMENTS.protocol" frontend/ contracts/ | wc -l
# Shows count of TODOs left for manual review
```

---

## If This Fails

### Error: "Module not found" after commenting imports
**Cause:** Missed a usage of the protocol somewhere.
**Fix:**
1. Search more broadly: `grep -r "$ARGUMENTS.protocol" frontend/`
2. Comment out the additional usage with TODO
3. Rebuild

### Error: "Build failed: unused variable"
**Cause:** Commented import but variable still referenced.
**Fix:**
1. Comment out the variable usage too
2. Or if it's in product code, add placeholder return

### Error: "Cannot uninstall X, required by Y"
**Cause:** Package is a peer dependency of something else.
**Fix:**
1. Keep the package - it's needed by another dependency
2. Move from "safe to remove" to "keep" list

### Error: "forge build" fails after commenting imports
**Cause:** Solidity file still references removed contract.
**Fix:**
1. Comment out the import
2. Comment out all usages of the imported contract
3. Add TODO markers for manual review

### Error: Navigation still shows protocol
**Cause:** Protocol entry in navigation config not removed.
**Fix:**
1. Check all navigation/menu config files
2. Remove (don't comment) the protocol entry
3. Check for dynamic route generation that includes protocol

### Error: Some files weren't deleted by CLI
**Cause:** CLI only deletes known paths, custom files may remain.
**Fix:**
1. Search for protocol name: `find frontend/ -name "*$ARGUMENTS.protocol*"`
2. Delete any remaining protocol-specific files
3. Fix any new broken imports

### General Debugging

1. Always search for protocol name after each step
2. Build after each major change to catch issues early
3. Keep "safe to remove" conservative - can always clean up later
4. Use git diff to review all changes before finishing
5. If build keeps failing, restore from git and start over more carefully
