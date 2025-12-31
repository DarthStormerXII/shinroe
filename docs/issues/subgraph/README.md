# Subgraph Issues & Learnings

> **Scope:** TheGraph, GraphQL schema, mappings, indexing, self-hosted graph-node, Apollo Client
>
> **Reusable:** ✅ Yes - Copy this folder to other projects

---

## Quick Reference

| ID | Title | Tags |
|----|-------|------|
| SUBGRAPH-001 | Always Deploy Subgraphs to Local Graph Node, Not Graph Studio | `thegraph`, `deployment`, `local` |

---

## Issues

<!--
Template for new issues:

## [SUBGRAPH-XXX] Title

**Problem:**

**Root Cause:**

**Solution:**

**Prevention:**

**Tags:** `tag1`, `tag2`

**Related Files:**
- `subgraph/schema.graphql`
- `subgraph/src/mapping.ts`

---
-->

<!-- Add your issues below this line -->

## [SUBGRAPH-001] Always Deploy Subgraphs to Local Graph Node, Not Graph Studio

**Problem:** Claude attempts to deploy subgraphs to The Graph Studio (hosted service) when the project should use a local graph-node instead. This causes confusion about deployment targets and authentication.

**Root Cause:** The Graph ecosystem has multiple deployment options (Studio, hosted service, self-hosted). Claude defaults to suggesting Graph Studio deployment, but for VeryChain projects we MUST use local graph-node because:
1. VeryChain mainnet has no external indexer support
2. We need to validate our code works locally before mainnet migration
3. Graph Studio API keys are not the deployment target

**Solution:** Always deploy to the local graph-node:

```bash
# Local graph-node location (shared across all projects)
/Users/gabrielantonyxaviour/Documents/starters/very/graph-node/

# Start the local graph-node
cd /Users/gabrielantonyxaviour/Documents/starters/very/graph-node/
docker-compose up -d

# Deploy subgraph to local node (NOT graph studio)
cd subgraph/
graph create --node http://localhost:8020/ <project-name>
graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 <project-name>
```

**Prevention:**
- **NEVER** deploy to Graph Studio during development
- **ALWAYS** use `http://localhost:8020/` as the graph-node endpoint
- **ALWAYS** use `http://localhost:5001` as the IPFS endpoint
- Ignore Graph Studio API keys (these are NOT for deployment)
- The query endpoint after deployment is: `http://localhost:8000/subgraphs/name/<project-name>`

**Tags:** `thegraph`, `deployment`, `local`, `graph-node`, `ipfs`

**Related Files:**
- `/Users/gabrielantonyxaviour/Documents/starters/very/graph-node/docker-compose.yml`
- `subgraph/subgraph.yaml`
- `subgraph/package.json` (check deploy scripts)

---

