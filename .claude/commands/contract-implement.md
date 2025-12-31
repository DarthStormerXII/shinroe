---
description: Implement new contract or add features to existing contracts
argument: <what to implement - new contract or feature>
---

# Contract Implementation

Create new contracts or add features to existing ones, with proper tests and config updates.

**SINGLE SOURCE OF TRUTH:** `contracts/deployment.config.json`
**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Load `contracts-dev` skill
- Read `contracts/deployment.config.json` for existing contracts and network config
- Check `contracts/src/` for current implementations

### Context7 Lookups (if unsure about syntax)

Before implementing, look up current patterns if needed:
- OpenZeppelin contracts: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/OpenZeppelin/openzeppelin-contracts", topic: "ERC20" })`
- Foundry testing: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "forge test" })`
- Solidity patterns: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "custom errors" })`

## Input

User provides:
- What to implement (new contract or feature for existing)
- Requirements and expected behavior
- Any specific constraints

## Steps

### 1. Analyze Request

Determine if this is:
- **New Contract:** Create from scratch in `contracts/src/`
- **New Feature:** Add to existing contract

### 2. Design Before Coding

Plan the implementation:
- State variables needed
- Function signatures
- Events (for indexing)
- Custom errors (for clear reverts)
- Access control requirements
- Integration with existing contracts

### 3. Implement

**For New Contract (`contracts/src/NewContract.sol`):**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title NewContract
/// @notice Brief description
contract NewContract {
    // Custom errors
    error CustomError();

    // Events
    event SomethingHappened(address indexed user, uint256 value);

    // State variables

    // Constructor

    // External functions

    // View functions
}
```

**For New Feature (modify existing contract):**
- Add state variables at appropriate location
- Add events for new functionality
- Add custom errors for new failure cases
- Implement functions following existing patterns
- Maintain backwards compatibility

### 4. Write Tests

Location: `contracts/test/unit/[Contract].t.sol`

```solidity
// Happy path
function test_Feature_WhenValidInput_ShouldSucceed() public { }

// Edge cases
function test_Feature_WhenMinValue_ShouldWork() public { }
function test_Feature_WhenMaxValue_ShouldWork() public { }

// Reverts
function testRevert_Feature_WhenUnauthorized() public { }
function testRevert_Feature_WhenInvalidInput() public { }

// Fuzz (if applicable)
function testFuzz_Feature(uint256 input) public {
    input = bound(input, MIN, MAX);
    // Test with bounded random inputs
}
```

### 5. Update Deployment Config

If new contract, add to `contracts/deployment.config.json`:
```json
{
  "contracts": {
    "NewContract": {
      "source": "src/NewContract.sol:NewContract",
      "description": "What it does"
    }
  }
}
```

### 6. Update Deployment Script

If new contract, add to `contracts/script/Deploy.s.sol`:
```solidity
import {NewContract} from "../src/NewContract.sol";

// In run() function:
NewContract newContract = new NewContract(args);
```

### 7. Build & Verify

```bash
cd contracts && source .env
forge build
forge test -vv
```

## Success Checklist

Before marking this task complete, verify:

- [ ] Contract compiles: `forge build` exits without errors
- [ ] All tests pass: `forge test -vv` shows green
- [ ] Events added for all state changes (needed for indexing)
- [ ] Custom errors for all failure cases (better UX than require strings)
- [ ] NatSpec documentation on public functions
- [ ] If new contract: added to `deployment.config.json`
- [ ] If new contract: added to `Deploy.s.sol`

**Run this to confirm:**
```bash
cd contracts && source .env
forge build && echo "Build passed"
forge test -vv && echo "Tests passed"
```

## Example Usage

```
/contract-implement Create a staking contract where users stake FreeMintToken
and earn rewards over time. Need stake(), unstake(), claimRewards(), and
pendingRewards() view function. Linear reward rate of 1% per day.
```

```
/contract-implement Add a whitelist feature to FreeMintNFT. Owner can add/remove
addresses. Whitelisted users can mint during first 24 hours, then open to all.
```

```
/contract-implement Add burn functionality to FreeMintToken. Users should be
able to burn their own tokens. Emit a Burn event with address and amount.
```

---

## If This Fails

### Error: "Compiler error: DeclarationError"
**Cause:** Variable/function name conflict or missing import.
**Fix:**
1. Check for typos in variable names
2. Verify all imports are present
3. Check parent contract has the function you're overriding

### Error: "Compiler error: TypeError"
**Cause:** Wrong types in function calls or assignments.
**Fix:**
1. Check function parameter types match
2. Verify return types are correct
3. Cast values if needed (e.g., `uint256(value)`)

### Error: "Test failure: ... revert"
**Cause:** Function reverted unexpectedly.
**Fix:**
1. Run with max verbosity: `forge test --match-test "failing_test" -vvvv`
2. Check custom error selector in trace
3. Add console.log in test to debug values

### Error: "Stack too deep"
**Cause:** Too many local variables in function.
**Fix:**
1. Use structs to group related variables
2. Split function into smaller internal functions
3. Use memory structs for complex data

### Error: "forge install" fails
**Cause:** Missing dependency or network issue.
**Fix:**
1. Check dependency name in foundry.toml
2. Run `forge install {dependency}` manually
3. Check GitHub repo exists

### Error: Compilation passes but logic is wrong
**Cause:** Implementation bug.
**Fix:**
1. Add more test cases covering edge cases
2. Add fuzz tests for numeric inputs
3. Use invariant tests for state properties

### General Debugging

1. Always run `forge build` after changes
2. Run `forge test -vvvv` for detailed traces
3. Use `console.log` from `forge-std/console.sol` in tests
4. Check OpenZeppelin docs for standard patterns
5. If stuck on Solidity syntax, query Context7 for examples
