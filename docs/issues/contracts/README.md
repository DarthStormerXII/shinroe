# Contract Issues & Learnings

> **Scope:** Solidity, Foundry, deployment, testing, ABI, gas optimization
>
> **Reusable:** ✅ Yes - Copy this folder to other projects

---

## Quick Reference

| ID | Title | Tags |
|----|-------|------|
| CONTRACT-001 | Private Key Environment Variable for Deployment | `deployment`, `foundry`, `polygon-amoy` |

---

## Issues

<!--
Template for new issues:

## [CONTRACT-XXX] Title

**Problem:**

**Root Cause:**

**Solution:**

**Prevention:**

**Tags:** `tag1`, `tag2`

**Related Files:**
- `contracts/src/Contract.sol`

---
-->

<!-- Add your issues below this line -->

## [CONTRACT-001] Private Key Environment Variable for Deployment

**Problem:** Claude gets stuck when trying to deploy contracts because it doesn't know where to find the private key with funds for deployment on Polygon Amoy.

**Root Cause:** The `.env` file with `PRIVATE_KEY` is not present in new project's `contracts/` folder, and Claude doesn't know the source of truth for deployment credentials.

**Solution:** Copy the `.env` file from the reference implementation:
```bash
cp /Users/gabrielantonyxaviour/Documents/starters/very/projects/04-shinroe/contracts/.env ./contracts/.env
```

**Prevention:**
- Before any contract deployment or testing, ensure `contracts/.env` exists with `PRIVATE_KEY`
- If `.env` is missing, copy it from `04-shinroe/contracts/.env`
- All deployments and testing happen on **Polygon Amoy** testnet first

**Tags:** `deployment`, `foundry`, `environment`, `polygon-amoy`

**Related Files:**
- `04-shinroe/contracts/.env` (source of truth)
- `contracts/foundry.toml`
- `contracts/script/*.s.sol`

---

