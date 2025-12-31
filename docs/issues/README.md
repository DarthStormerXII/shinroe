# Issues & Learnings Documentation

This folder tracks issues encountered and their solutions during development. Use this as a reference to avoid repeating mistakes.

## Structure

| Folder | Scope | Reusable? |
|--------|-------|-----------|
| `ui/` | Frontend, React, Next.js, shadcn/ui, styling | ✅ Yes |
| `contracts/` | Solidity, Foundry, deployment, testing | ✅ Yes |
| `subgraph/` | TheGraph, GraphQL, indexing, mappings | ✅ Yes |
| `verychain/` | WEPIN auth, VeryChat API, VeryChain network | ❌ Project-specific |

## How to Use

### Adding an Issue

Each issue should follow this format:

```markdown
## [CATEGORY-XXX] Short Title

**Problem:** What went wrong

**Root Cause:** Why it happened

**Solution:** How you fixed it

**Prevention:** How to avoid this in the future

**Tags:** `tag1`, `tag2`
```

### Issue Categories

- `UI-XXX` - Frontend/UI issues
- `CONTRACT-XXX` - Smart contract issues
- `SUBGRAPH-XXX` - Indexing/subgraph issues
- `VERY-XXX` - VeryChain/WEPIN specific issues

## Copying to Other Projects

For new hackathons or projects, copy these folders:
- `docs/issues/ui/`
- `docs/issues/contracts/`
- `docs/issues/subgraph/`

Do NOT copy:
- `docs/issues/verychain/` (VeryChain hackathon specific)
