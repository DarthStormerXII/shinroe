---
description: Generate NatSpec documentation for contracts
argument: <optional: specific contract name>
---

# Generate Contract Documentation

Add comprehensive NatSpec documentation to contracts for better readability and auto-generated docs.

**NO GARBAGE FILES:** Only modify existing .sol files. Do not create markdown or documentation files.

## Prerequisites

- Load `contracts-dev` skill
- Read `contracts/src/` to identify target contracts

### Context7 Lookups (if unsure about syntax)

Before documenting, look up NatSpec format if needed:
- NatSpec: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "natspec" })`
- Forge doc: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "forge doc" })`

## What Gets Documented

- `@title` - Contract name
- `@notice` - User-facing description
- `@dev` - Developer notes
- `@param` - Parameter descriptions
- `@return` - Return value descriptions
- `@custom:security` - Security considerations

## Steps

### 1. Identify Target

If specific contract provided, document that one.
Otherwise, document all contracts in `contracts/src/`.

**Get the list:**
```bash
ls contracts/src/*.sol
# Or for specific contract: check $ARGUMENTS
```

### 2. Analyze Each Contract

**For EACH contract file:**

1. Read the contract file
2. Identify all elements needing documentation:
   - Contract declaration (needs @title, @notice, @dev)
   - State variables (needs @notice)
   - Events (needs @notice, @param for each parameter)
   - Custom errors (needs @notice, @param if applicable)
   - Constructor (needs @notice, @param for each parameter)
   - External/public functions (needs @notice, @dev, @param, @return)

3. Understand purpose and security considerations

### 3. Add NatSpec

**Contract-level:**
```solidity
/// @title FreeMintToken
/// @notice A free-mint ERC20 token for testing and demos
/// @dev Extends OpenZeppelin ERC20 with unrestricted minting
/// @custom:security No access control on mint - for testing only
contract FreeMintToken is ERC20 {
```

**State variables:**
```solidity
/// @notice Amount of tokens minted per call
uint256 public immutable mintAmount;
```

**Events:**
```solidity
/// @notice Emitted when tokens are minted
/// @param to Recipient address
/// @param amount Number of tokens minted
event TokensMinted(address indexed to, uint256 amount);
```

**Errors:**
```solidity
/// @notice Thrown when mint amount is zero
error InvalidMintAmount();

/// @notice Thrown when max supply would be exceeded
/// @param requested Amount requested to mint
/// @param available Amount still available
error MaxSupplyExceeded(uint256 requested, uint256 available);
```

**Functions:**
```solidity
/// @notice Mints tokens to the caller
/// @dev Anyone can call. Emits TokensMinted event.
/// @return amount The number of tokens minted
function mint() external returns (uint256 amount) {
```

**Constructor:**
```solidity
/// @notice Creates a new FreeMintToken
/// @param _name Token name for ERC20
/// @param _symbol Token symbol for ERC20
/// @param _mintAmount Tokens to mint per call (must be > 0)
constructor(string memory _name, string memory _symbol, uint256 _mintAmount)
```

### 4. Verify Build

```bash
cd contracts && forge build
```

Ensure documentation doesn't break compilation.

### 5. Generate HTML Docs (Optional)

```bash
forge doc --build
# Output in contracts/docs/
```

## Success Checklist

Before marking this task complete, verify:

- [ ] All target contracts documented with @title and @notice
- [ ] All public/external functions have @notice, @param, @return
- [ ] All events documented with @notice and @param
- [ ] All custom errors documented with @notice
- [ ] Security notes added where relevant (@custom:security)
- [ ] Build still passes: `forge build`
- [ ] No NatSpec warnings in build output

**Run this to confirm:**
```bash
cd contracts && source .env
forge build 2>&1 | grep -i natspec || echo "No NatSpec warnings"
forge doc --out /dev/null && echo "Doc generation passed"
```

## Example Usage

```
/contract-generate-docs
```

```
/contract-generate-docs FreeMintNFT
```

---

## If This Fails

### Error: "Compiler error after adding docs"
**Cause:** NatSpec syntax error or misplaced comment.
**Fix:**
1. NatSpec must be directly before the element (no blank lines between)
2. Use `///` for single-line or `/** */` for multi-line
3. Check for unclosed `*/` in multi-line comments

### Error: "@param X doesn't match parameter name"
**Cause:** Parameter name in doc doesn't match actual parameter.
**Fix:**
1. Check exact parameter names in function signature
2. Update @param to match exactly (case-sensitive)

### Error: "Missing @return for view function"
**Cause:** Function returns a value but no @return tag.
**Fix:**
1. Add @return with description for each return value
2. For multiple returns: add separate @return for each

### Error: "forge doc fails"
**Cause:** NatSpec parsing error.
**Fix:**
1. Check for special characters in descriptions
2. Ensure @custom tags follow format: `@custom:name description`
3. Run `forge doc -v` for detailed error output

### Error: NatSpec appears in wrong place in generated docs
**Cause:** Doc comment attached to wrong element.
**Fix:**
1. Ensure no blank lines between doc comment and element
2. Place doc immediately before function/event/error

### General Debugging

1. Add NatSpec to one function, run `forge build` to verify
2. Check Solidity docs for NatSpec format reference
3. Use `forge doc --build` to generate HTML and verify visually
4. If unsure about format, query Context7 for NatSpec examples
