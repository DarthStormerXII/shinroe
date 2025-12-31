---
description: Add a protocol integration to the project
argument: <protocol-name>
---

# Add Protocol Integration

Add a protocol from the registry to this project.

## Prerequisites

- Load `web3-integration` skill
- Read `registry/registry.json` to verify protocol exists
- Ensure frontend is set up with an auth provider

### Context7 Lookups (if integrating protocol SDK)

If the protocol requires SDK usage, look up docs:
- Protocol SDK: `mcp__context7__resolve-library-id({ libraryName: "{protocol}-sdk" })` then get docs
- viem for transactions: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/wevm/viem", topic: "sendTransaction" })`

## Steps

### 1. Validate Protocol

Check if `$ARGUMENTS` exists in registry:

1. Read `registry/registry.json`
2. Look for `$ARGUMENTS` in `protocols` section
3. If found -> continue
4. If NOT found -> list available protocols and STOP

**Get available protocols:**
```bash
cat registry/registry.json | jq '.protocols | keys'
```

**Read protocol meta.json:**
```
registry/protocols/$ARGUMENTS/meta.json
```

If not found, inform user of available protocols:
```
Protocol "$ARGUMENTS" not found in registry.

Available protocols:
- 1inch
- lifi
- uniswap
- cowswap
- across
- hyperlane
- layerzero
...

Run `/add-protocol {name}` with one of the above.
```

### 2. Check Auth Compatibility

From meta.json, check compatibility:

1. Read `authLayerRequired` field:
   - If set, verify current auth provider matches
   - Check `frontend/providers/web3-provider.tsx` for current provider

2. Read `incompatibleAuthProviders` array:
   - If current auth is in this list -> WARN user and STOP

**If incompatible:**
```
Protocol "$ARGUMENTS" is incompatible with your current auth provider.

Required: {authLayerRequired}
Current: {detected provider}

Switch auth providers first: /switch-auth {required-provider}
```

### 3. Copy Protocol Files

**Get the file list:** Read `meta.json` -> `files` array.

**For EACH file in the array:**

1. Source path: `registry/protocols/$ARGUMENTS/{file.source}`
2. Target path: `frontend/{file.target}`
3. Create parent directories if they don't exist:
   ```bash
   mkdir -p frontend/{parent-dirs}
   ```
4. Read source file content
5. Write to target path
6. Verify file was created

**After all files copied:**
```bash
ls frontend/app/swap/$ARGUMENTS/
ls frontend/lib/services/
```

### 4. Install Dependencies

**Get dependencies:** Read `meta.json` -> `dependencies` object.

**If dependencies is not empty:**

```bash
cd frontend && npm install {all dependency packages}
```

For example, if meta.json has:
```json
"dependencies": {
  "@lifi/sdk": "^3.0.0",
  "@lifi/types": "^2.0.0"
}
```

Run:
```bash
cd frontend && npm install @lifi/sdk@^3.0.0 @lifi/types@^2.0.0
```

**Verify installation:**
```bash
cat frontend/package.json | jq '.dependencies | keys' | grep -i $ARGUMENTS
```

### 5. Add Environment Variables

**Get env vars:** Read `meta.json` -> `envVars` array.

**For EACH envVar:**

1. Check if exists in `frontend/.env.local`
2. If exists -> skip (don't overwrite)
3. If missing -> append with comment and placeholder:

```bash
# Added by /add-protocol $ARGUMENTS
NEXT_PUBLIC_XXX_API_KEY=your_api_key_here
```

**Show user which env vars need values:**
```
The following environment variables need to be set in frontend/.env.local:

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_XXX_API_KEY | API key for XXX | Yes |

Get your API key from: {provider dashboard URL if known}
```

### 6. Update Tracking

Check if `frontend/.evm-kit/installed.json` exists:
- If not -> create it with initial structure

Update the file:
```json
{
  "protocols": [
    {
      "name": "$ARGUMENTS",
      "version": "{from meta.json}",
      "installedAt": "{ISO timestamp}"
    }
  ]
}
```

**Create directory if needed:**
```bash
mkdir -p frontend/.evm-kit
```

---

## Success Checklist

Before marking this task complete, verify:

- [ ] Protocol files exist in `frontend/app/swap/$ARGUMENTS/`
- [ ] Service file exists in `frontend/lib/services/`
- [ ] Dependencies installed (check package.json)
- [ ] Environment variables documented in .env.local
- [ ] `frontend/.evm-kit/installed.json` updated
- [ ] Build passes: `cd frontend && npm run build`

**Run this to confirm:**
```bash
ls frontend/app/swap/$ARGUMENTS/
ls frontend/lib/services/*$ARGUMENTS*
cat frontend/package.json | jq '.dependencies' | grep -i $ARGUMENTS || echo "No SDK dependency (OK if protocol uses native fetch)"
cd frontend && npm run build && echo "Build passed"
```

---

## If This Fails

### Error: "Protocol not found"
**Cause:** Protocol doesn't exist in registry.
**Fix:**
1. List available: `cat registry/registry.json | jq '.protocols | keys'`
2. Check spelling of protocol name
3. If protocol truly not available, it needs to be implemented first

### Error: "Auth incompatible"
**Cause:** Protocol requires specific auth provider you don't have.
**Fix:**
1. Check meta.json for `authLayerRequired`
2. Switch auth: `/switch-auth {required-provider}`
3. Then retry: `/add-protocol $ARGUMENTS`

### Error: "File conflict - already exists"
**Cause:** Protocol files already in frontend (maybe already installed).
**Fix:**
1. Check if protocol is installed: `cat frontend/.evm-kit/installed.json`
2. If installed, it's already there - nothing to do
3. If partially installed, consider removing first: `/remove-protocol $ARGUMENTS`

### Error: "npm install failed"
**Cause:** Package name wrong or network issue.
**Fix:**
1. Check exact package names in meta.json
2. Verify packages exist on npm: `npm view {package-name}`
3. Try installing manually: `cd frontend && npm install {package}`

### Error: "Build failed after adding protocol"
**Cause:** Missing dependency, import error, or type mismatch.
**Fix:**
1. Check error message for specific file
2. Verify all imports use `@/lib/web3` (not direct wagmi)
3. Check if missing environment variable
4. Compare with original in registry to find differences

### Error: "Module not found" at runtime
**Cause:** Dependency not installed or wrong import path.
**Fix:**
1. Check package.json for dependency
2. Run `npm install` again
3. Verify import paths match project structure

### General Debugging

1. Always verify protocol exists in registry first
2. Check meta.json for complete file list
3. Build after adding to catch issues early
4. If protocol uses SDK, env vars are likely required
5. If totally broken, remove files and try again: `rm -rf frontend/app/swap/$ARGUMENTS frontend/lib/services/*$ARGUMENTS*`
