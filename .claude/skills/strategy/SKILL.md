---
name: strategy
description: Generate numbered prompts (1.md, 2.md) for VeryChain x VeryChat with WEPIN auth. NO CODE - only prompts.
---

# Strategy Skill

## Rules

1. **NO CODE** - only generate prompt files
2. **Simple names** - `1.md`, `2.md`, `3.md`
3. **VeryChain Focus** - WEPIN auth + VeryChat API + TheGraph self-hosted

## Workflow

```
User: /strategy wepin {goal}

Claude:
  1. Analyze the goal for VeryChain/VeryChat/WEPIN integration
  2. CHECK RELEVANT ISSUES FIRST (see below)
  3. mkdir -p .claude/prompts
  4. Write .claude/prompts/1.md, 2.md, etc. (include issue references)
  5. Output summary
```

## Check Issues Before Generating Prompts

**MANDATORY:** Before generating prompts, check if the task involves known pitfalls:

| Task involves... | Read first |
|------------------|------------|
| i18n / multilingual / Korean | `docs/issues/ui/README.md` → UI-004 |
| VeryChat transactions/dialogs | `docs/issues/verychain/README.md` → VERY-002 |
| Subgraph queries | `docs/issues/subgraph/README.md` |
| Contract deployment | `docs/issues/contracts/README.md` |

**In each generated prompt, add a "Known Pitfalls" section if relevant:**

```markdown
## Known Pitfalls
- See `docs/issues/ui/README.md` → UI-004 for i18n pitfalls
```

## Prompt Format

```markdown
# Title

## Required Skills
- skill-name

## Known Pitfalls
- See `docs/issues/[category]/README.md` → [ID] (if relevant)

## Context
- VeryChain mainnet specifics
- WEPIN auth requirements
- VeryChat API endpoints

## Steps
1. Step one
2. Step two

## Files
- path/to/file.ts

## Checklist
- [ ] Read relevant issues first
- [ ] Done
```

## Summary

```
Prompts: .claude/prompts/

| # | Title | Parallel? |
|---|-------|-----------|
| 1 | Setup WEPIN Auth | First |
| 2 | VeryChat API Integration | After 1 |
| 3 | Local Graph Node Setup | Parallel with 2 |
| 4 | Contract Deployment | After 3 |
| 5 | Subgraph Development | After 4 |
| 6 | Frontend Integration | After 5 |

Run: /run-prompt wepin 1
```

## VeryChain Stack

```
Auth Layer:       WEPIN (only auth supporting VeryChain mainnet)
Messaging:        VeryChat API
Indexing:         TheGraph (self-hosted graph-node)
Contracts:        Foundry (EVM compatible)
Frontend:         Next.js + shadcn/ui
```

## Integration Phases

1. **Auth Setup** - WEPIN wallet connection for VeryChain
2. **VeryChat Integration** - Chat API endpoints and messaging
3. **Graph Node** - Self-hosted indexer for VeryChain
4. **Contract Deploy** - Sample contract on VeryChain mainnet
5. **Subgraph** - Index contract events on local graph-node
6. **Frontend** - Query subgraph from the app
