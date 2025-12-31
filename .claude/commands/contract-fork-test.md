---
description: Implement and test on forked network (safe, no real deployment)
argument: <what to implement and test>
---

# Contract Fork Test

Implement features and run tests on forked network. **Safe iteration—no real deployment or gas costs.**

Use this for development before going live with `/contract-real-test`.

**SINGLE SOURCE OF TRUTH:** `contracts/deployment.config.json`
**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Load `contracts-dev` skill
- Read `contracts/deployment.config.json` for network config
- `contracts/.env` has RPC URLs configured

### Context7 Lookups (if unsure about syntax)

Before testing, look up current patterns if needed:
- Fork testing: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "forge test fork" })`
- Fuzz testing: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "fuzz testing" })`
- Cheatcodes: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "cheatcodes" })`

## Input

User provides:
- Features to implement or test
- Expected behavior
- Edge cases to verify

## Steps

### 1. Read Current State

```bash
cd contracts && source .env
```

Check existing code:
- `contracts/src/` - Contract implementations
- `contracts/test/` - Existing tests
- `contracts/deployment.config.json` - Contract info

### 2. Implement Changes

If changes needed:
1. Modify contracts in `contracts/src/`
2. Add events for new state changes
3. Add custom errors for new failure cases
4. Follow existing code patterns

### 3. Write/Update Tests

Location: `contracts/test/unit/` or `contracts/test/fork/`

```solidity
function test_Feature_WhenCondition_ShouldBehavior() public {
    // Arrange
    // Act
    // Assert
}

function testRevert_Feature_WhenInvalid() public {
    vm.expectRevert(CustomError.selector);
    // Call that should revert
}

function testFuzz_Feature(uint256 input) public {
    input = bound(input, MIN, MAX);
    // Test with random valid inputs
}
```

### 4. Run Fork Tests

```bash
# All tests
forge test -vv

# Specific test
forge test --match-test "test_Feature" -vv

# Against forked network state
forge test --fork-url $SEPOLIA_RPC_URL -vv

# With gas report
forge test --gas-report
```

### 5. Debug Failures

If tests fail:
```bash
# Maximum verbosity
forge test --match-test "failing_test" -vvvv

# Add console.log in test
import "forge-std/console.sol";
console.log("value:", someValue);
```

### 6. Iterate

Repeat steps 2-5 until all tests pass.

## Success Checklist

Before marking this task complete, verify:

- [ ] Features implemented in `contracts/src/`
- [ ] Tests written in `contracts/test/`
- [ ] All unit tests pass: `forge test -vv`
- [ ] Fork tests pass: `forge test --fork-url $RPC_URL -vv`
- [ ] No compiler warnings (or explain why they're acceptable)
- [ ] Ready for `/contract-real-test`

**Run this to confirm:**
```bash
cd contracts && source .env
forge build && echo "Build passed"
forge test -vv && echo "Unit tests passed"
forge test --fork-url $SEPOLIA_RPC_URL -vv && echo "Fork tests passed"
```

## Example Usage

```
/contract-fork-test Add max supply of 1 million tokens to FreeMintToken.
The mint function should revert with MaxSupplyReached when limit is hit.
Test minting up to the limit and verify revert after.
```

```
/contract-fork-test Test that the NFT whitelist works correctly. Add addresses
to whitelist, verify they can mint, verify non-whitelisted cannot mint during
whitelist period, verify anyone can mint after period ends.
```

---

## If This Fails

### Error: "Could not instantiate forked environment"
**Cause:** RPC URL invalid or rate limited.
**Fix:**
1. Check RPC URL: `echo $SEPOLIA_RPC_URL`
2. Verify connectivity: `cast block-number --rpc-url $SEPOLIA_RPC_URL`
3. Use a different RPC provider if rate limited

### Error: "Test failure: EvmError: Revert"
**Cause:** Function reverted during test.
**Fix:**
1. Run with max verbosity: `forge test --match-test "test_name" -vvvv`
2. Look for custom error selector in trace output
3. Add console.log statements to debug values

### Error: "Arithmetic overflow/underflow"
**Cause:** Integer math exceeded bounds.
**Fix:**
1. Use `bound()` in fuzz tests: `input = bound(input, 1, MAX)`
2. Check for division by zero
3. Use SafeMath or Solidity 0.8+ built-in checks

### Error: "vm.expectRevert did not revert"
**Cause:** Expected revert but function succeeded.
**Fix:**
1. Check test setup - maybe condition for revert not met
2. Verify error selector matches custom error
3. Use `vm.expectRevert(CustomError.selector)`

### Error: "Forked block number too old"
**Cause:** RPC doesn't serve historical state.
**Fix:**
1. Use `--fork-block-number` for recent block
2. Use archive node RPC if testing old state

### Error: Tests pass locally but fail in CI
**Cause:** Environment differences or flaky tests.
**Fix:**
1. Set fixed fork block: `--fork-block-number 12345678`
2. Use fixed random seed: `--fuzz-seed 0`
3. Check for time-dependent tests (use `vm.warp`)

### General Debugging

1. Run failing test with `-vvvv` for full trace
2. Add `console.log` from `forge-std/console.sol`
3. Use `vm.startPrank(address)` to simulate callers
4. Check `vm.expectEmit()` for event verification
5. If fork tests fail, try without fork first to isolate issue
