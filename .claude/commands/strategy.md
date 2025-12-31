---
description: Generate prompts for VeryChain x VeryChat with WEPIN integration
argument: <goal> - e.g., "setup wepin auth", "integrate verychat api", "deploy subgraph"
---

# Strategy: $ARGUMENTS

Load the `strategy` skill and generate prompts for the VeryChain x VeryChat x WEPIN integration.

The skill will:
1. Analyze the integration requirements
2. Create `.claude/prompts/` if needed
3. Generate `1.md`, `2.md`, etc. with proper ordering
4. Output summary table

## VeryChain Stack Reference

- **Auth**: WEPIN (only auth layer supporting VeryChain mainnet)
- **Chat**: VeryChat API
- **Indexing**: TheGraph (self-hosted, no external indexers support VeryChain)
- **Contracts**: Foundry/Hardhat (EVM compatible)

Run prompts with: `/run-prompt wepin 1`
