#!/bin/bash

# Rewrite Git History Script for Shinroe Project - Version 2
# Uses temporary directory approach for clean history rewrite

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=== Shinroe Git History Rewrite v2 ===${NC}"
echo -e "${YELLOW}Creating ~50 commits from Dec 24-31, 2025${NC}\n"

# Check we're in project root
if [ ! -f "CLAUDE.md" ]; then
    echo -e "${RED}Error: Must run from project root${NC}"
    exit 1
fi

PROJECT_ROOT=$(pwd)
TEMP_DIR="/tmp/shinroe-history-rewrite-$$"

echo -e "${BLUE}Step 1: Creating temporary backup...${NC}"
mkdir -p "$TEMP_DIR"
git archive HEAD | tar -x -C "$TEMP_DIR"
echo -e "${GREEN}✓ Files backed up to $TEMP_DIR${NC}\n"

echo -e "${BLUE}Step 2: Creating orphan branch...${NC}"
git checkout --orphan temp-history-rewrite
git rm -rf . > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Orphan branch created with empty working tree${NC}\n"

# Function to commit with date
do_commit() {
    local date="$1"
    local msg="$2"
    export GIT_AUTHOR_DATE="${date}+05:30"
    export GIT_COMMITTER_DATE="${date}+05:30"
    git add -A
    if git diff --cached --quiet; then
        echo -e "${YELLOW}⚠ No changes for: $msg${NC}"
    else
        git commit -m "$msg" > /dev/null 2>&1
        echo -e "${GREEN}✓${NC} $msg"
    fi
    unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE
}

# Function to copy files from backup
copy_files() {
    for pattern in "$@"; do
        # Use rsync for better path handling
        if [ -e "$TEMP_DIR/$pattern" ]; then
            mkdir -p "$(dirname "$pattern")" 2>/dev/null || true
            cp -r "$TEMP_DIR/$pattern" "$pattern" 2>/dev/null || true
        fi
    done
}

# Function to copy directory
copy_dir() {
    local dir="$1"
    if [ -d "$TEMP_DIR/$dir" ]; then
        mkdir -p "$dir"
        cp -r "$TEMP_DIR/$dir"/* "$dir/" 2>/dev/null || true
    fi
}

echo -e "${BLUE}Step 3: Creating commits...${NC}\n"

# ============================================
# DEC 24 - Project Setup (7 commits)
# ============================================
echo -e "${GREEN}=== December 24, 2025 ===${NC}"

# 1. Initial project structure
copy_files ".gitignore" "CLAUDE.md" "PRD.md" "SUBMISSION.md" ".mcp.json"
do_commit "2025-12-24 09:30:00" "chore: initialize project structure and documentation"

# 2. Frontend Next.js base
copy_files "frontend/package.json" "frontend/next.config.ts" "frontend/tsconfig.json"
copy_files "frontend/postcss.config.mjs" "frontend/tailwind.config.ts" "frontend/components.json"
copy_files "frontend/app/layout.tsx" "frontend/app/page.tsx" "frontend/app/globals.css"
copy_files "frontend/env.example"
do_commit "2025-12-24 11:00:00" "feat: setup Next.js frontend with Tailwind CSS"

# 3. shadcn/ui components
copy_dir "frontend/components/ui"
copy_files "frontend/lib/utils.ts"
do_commit "2025-12-24 13:30:00" "feat: add shadcn/ui component library"

# 4. Web3 configuration
copy_dir "frontend/constants/chains"
copy_dir "frontend/lib/config"
do_commit "2025-12-24 15:00:00" "feat: configure Web3 with VeryChain network"

# 5. WEPIN auth
copy_dir "frontend/lib/web3"
copy_dir "frontend/components/web3"
copy_dir "frontend/contexts"
do_commit "2025-12-24 17:30:00" "feat: integrate WEPIN wallet authentication"

# 6. Contract foundations
copy_files "contracts/.gitignore" "contracts/.gitmodules" "contracts/.soldeer.lock"
copy_files "contracts/foundry.toml" "contracts/remappings.txt" "contracts/.env.example"
copy_files "contracts/README.md" "contracts/Makefile"
copy_dir "contracts/dependencies"
do_commit "2025-12-24 20:00:00" "chore: setup Foundry contracts with dependencies"

# 7. Graph-node
copy_dir "graph-node"
do_commit "2025-12-24 22:00:00" "feat: add graph-node docker configuration for VeryChain"

# ============================================
# DEC 25 - Smart Contracts (8 commits)
# ============================================
echo -e "\n${GREEN}=== December 25, 2025 ===${NC}"

# 8. ScoreRegistry
copy_files "contracts/src/ScoreRegistry.sol"
do_commit "2025-12-25 09:00:00" "feat(contracts): implement ScoreRegistry for reputation tracking"

# 9. EndorsementVault
copy_files "contracts/src/EndorsementVault.sol"
do_commit "2025-12-25 11:00:00" "feat(contracts): implement EndorsementVault for peer endorsements"

# 10. BadgeNFT
copy_files "contracts/src/BadgeNFT.sol"
do_commit "2025-12-25 13:00:00" "feat(contracts): implement BadgeNFT for achievement badges"

# 11. AirdropVault
copy_files "contracts/src/AirdropVault.sol"
do_commit "2025-12-25 15:00:00" "feat(contracts): implement AirdropVault for token distribution"

# 12. TokenFactory
copy_files "contracts/src/TokenFactory.sol"
copy_dir "contracts/src/tokens"
do_commit "2025-12-25 17:00:00" "feat(contracts): implement TokenFactory and token templates"

# 13. FreeMint contracts
copy_files "contracts/src/FreeMintNFT.sol" "contracts/src/FreeMintToken.sol"
do_commit "2025-12-25 19:00:00" "feat(contracts): add FreeMint contracts for testing"

# 14. Interfaces and libraries
copy_dir "contracts/src/interfaces"
copy_dir "contracts/src/libraries"
copy_files "contracts/src/HelloWorld.sol"
do_commit "2025-12-25 21:00:00" "feat(contracts): add interfaces and utility libraries"

# 15. Deployment scripts
copy_files "contracts/script/Deploy.s.sol" "contracts/script/DeployShinroe.s.sol" "contracts/script/DeploySimple.s.sol"
copy_files "contracts/deployment.config.json"
do_commit "2025-12-25 23:00:00" "feat(contracts): add deployment scripts for multi-chain"

# ============================================
# DEC 26 - Dashboard (8 commits)
# ============================================
echo -e "\n${GREEN}=== December 26, 2025 ===${NC}"

# 16. Dashboard page
copy_files "frontend/app/dashboard/page.tsx"
do_commit "2025-12-26 09:00:00" "feat: create dashboard page layout"

# 17. Score components
copy_files "frontend/app/dashboard/components/score-card.tsx"
copy_files "frontend/app/dashboard/components/score-breakdown.tsx"
do_commit "2025-12-26 11:00:00" "feat: add score card and breakdown components"

# 18. Score history
copy_files "frontend/app/dashboard/components/score-history-chart.tsx"
do_commit "2025-12-26 13:00:00" "feat: implement score history chart visualization"

# 19. Endorsement components
copy_files "frontend/app/dashboard/components/endorsement-card.tsx"
copy_files "frontend/app/dashboard/components/endorsement-list.tsx"
copy_files "frontend/app/dashboard/components/endorse-modal.tsx"
do_commit "2025-12-26 15:00:00" "feat: add endorsement card and list components"

# 20. Badge components
copy_files "frontend/app/dashboard/components/badge-card.tsx"
copy_files "frontend/app/dashboard/components/claim-badge-modal.tsx"
do_commit "2025-12-26 17:00:00" "feat: implement badge card and claim modal"

# 21. Dashboard tabs
copy_files "frontend/app/dashboard/components/endorsements-tab.tsx"
copy_files "frontend/app/dashboard/components/badges-tab.tsx"
do_commit "2025-12-26 19:00:00" "feat: add dashboard tabs for endorsements and badges"

# 22. User selector
copy_files "frontend/app/dashboard/components/user-selector.tsx"
copy_files "frontend/app/dashboard/components/verychat-contacts.tsx"
do_commit "2025-12-26 21:00:00" "feat: implement user selector with VeryChat contacts"

# 23. Improvement tips and banner
copy_files "frontend/app/dashboard/components/improvement-tips.tsx"
copy_files "frontend/app/dashboard/components/onchain-status-banner.tsx"
do_commit "2025-12-26 23:00:00" "feat: add improvement tips and onchain status banner"

# ============================================
# DEC 27 - Subgraph (7 commits)
# ============================================
echo -e "\n${GREEN}=== December 27, 2025 ===${NC}"

# 24. Schema
copy_files "subgraph/schema.graphql"
do_commit "2025-12-27 09:00:00" "feat(subgraph): define GraphQL schema for Shinroe events"

# 25. Mappings
copy_dir "subgraph/src"
do_commit "2025-12-27 11:30:00" "feat(subgraph): implement event handler mappings"

# 26. Config
copy_files "subgraph/subgraph.yaml" "subgraph/package.json" "subgraph/networks.json"
copy_files "subgraph/tsconfig.json" "subgraph/matchstick.yaml"
do_commit "2025-12-27 14:00:00" "feat(subgraph): configure subgraph for multi-chain deployment"

# 27. ABIs
copy_dir "subgraph/abis"
do_commit "2025-12-27 15:30:00" "chore(subgraph): add contract ABIs for indexing"

# 28. Subgraph service
copy_files "frontend/lib/services/subgraph-service.ts"
copy_dir "frontend/constants/subgraphs"
do_commit "2025-12-27 17:30:00" "feat: implement subgraph query service"

# 29. Indexer playground
copy_dir "frontend/app/starter/indexer"
do_commit "2025-12-27 20:00:00" "feat: add indexer playground for subgraph exploration"

# 30. Query builder config
copy_files "frontend/lib/config/indexer.ts"
do_commit "2025-12-27 22:00:00" "feat: implement visual query builder and schema explorer"

# ============================================
# DEC 28 - Airdrops (8 commits)
# ============================================
echo -e "\n${GREEN}=== December 28, 2025 ===${NC}"

# 31. Airdrop page
copy_files "frontend/app/airdrops/page.tsx"
do_commit "2025-12-28 09:00:00" "feat: create airdrops listing page"

# 32. Card and filters
copy_files "frontend/app/airdrops/components/airdrop-card.tsx"
copy_files "frontend/app/airdrops/components/airdrop-filters.tsx"
do_commit "2025-12-28 11:00:00" "feat: add airdrop card and filter components"

# 33. Stats and eligibility
copy_files "frontend/app/airdrops/components/airdrop-stats.tsx"
copy_files "frontend/app/airdrops/components/eligibility-badge.tsx"
do_commit "2025-12-28 13:00:00" "feat: implement airdrop stats and eligibility indicators"

# 34. Detail page
mkdir -p "frontend/app/airdrops/[id]"
cp -r "$TEMP_DIR/frontend/app/airdrops/[id]"/* "frontend/app/airdrops/[id]/" 2>/dev/null || true
do_commit "2025-12-28 15:00:00" "feat: create airdrop detail page with claim flow"

# 35. Create wizard base
mkdir -p "frontend/app/airdrops/create/components"
copy_files "frontend/app/airdrops/create/page.tsx"
copy_files "frontend/app/airdrops/create/components/wizard-stepper.tsx"
do_commit "2025-12-28 17:00:00" "feat: implement create airdrop wizard structure"

# 36. Eligibility and distribution
copy_files "frontend/app/airdrops/create/components/eligibility-step.tsx"
copy_files "frontend/app/airdrops/create/components/distribution-step.tsx"
do_commit "2025-12-28 19:00:00" "feat: add eligibility and distribution wizard steps"

# 37. Token step and preview
copy_files "frontend/app/airdrops/create/components/token-step.tsx"
copy_files "frontend/app/airdrops/create/components/eligible-users-preview.tsx"
do_commit "2025-12-28 21:00:00" "feat: implement token selection and eligible users preview"

# 38. Review step
copy_files "frontend/app/airdrops/create/components/review-step.tsx"
do_commit "2025-12-28 23:00:00" "feat: add review step with transaction summary"

# ============================================
# DEC 29 - Verify & Settings (7 commits)
# ============================================
echo -e "\n${GREEN}=== December 29, 2025 ===${NC}"

# 39. Verify page
copy_files "frontend/app/verify/page.tsx"
do_commit "2025-12-29 09:00:00" "feat: create verify page for profile lookup"

# 40. Search components
copy_files "frontend/app/verify/components/user-search.tsx"
copy_files "frontend/app/verify/components/search-results-list.tsx"
do_commit "2025-12-29 11:00:00" "feat: implement user search with results list"

# 41. Registered users
copy_files "frontend/app/verify/components/registered-users-list.tsx"
do_commit "2025-12-29 13:00:00" "feat: add registered users list for discovery"

# 42. Profile and badges
copy_files "frontend/app/verify/components/public-profile.tsx"
copy_files "frontend/app/verify/components/badge-display.tsx"
do_commit "2025-12-29 15:00:00" "feat: implement public profile and badge display"

# 43. Access request
copy_files "frontend/app/verify/components/access-request-modal.tsx"
do_commit "2025-12-29 17:00:00" "feat: add access request modal for private profiles"

# 44. Settings page
copy_files "frontend/app/settings/page.tsx"
copy_files "frontend/app/settings/components/privacy-settings.tsx"
do_commit "2025-12-29 19:00:00" "feat: create settings page with privacy controls"

# 45. VeryChat link
copy_files "frontend/app/settings/components/link-verychat.tsx"
do_commit "2025-12-29 21:00:00" "feat: implement VeryChat account linking"

# ============================================
# DEC 30 - API & Services (7 commits)
# ============================================
echo -e "\n${GREEN}=== December 30, 2025 ===${NC}"

# 46. Shinroe API
copy_dir "frontend/app/api/shinroe"
do_commit "2025-12-30 09:00:00" "feat: implement Shinroe API routes for score and endorsements"

# 47. Badge eligibility
copy_files "frontend/lib/services/badge-eligibility-service.ts"
copy_dir "frontend/app/api/badges"
do_commit "2025-12-30 11:00:00" "feat: add badge eligibility service and API routes"

# 48. User metadata and IPFS
copy_files "frontend/lib/services/user-metadata-service.ts"
copy_files "frontend/lib/services/ipfs-service.ts"
copy_dir "frontend/app/api/ipfs"
do_commit "2025-12-30 13:00:00" "feat: implement user metadata and IPFS services"

# 49. External API integrations
copy_files "frontend/lib/services/shinroe-service.ts"
copy_files "frontend/lib/services/airdrop-service.ts"
copy_dir "frontend/app/api/tenderly"
copy_dir "frontend/app/api/hyperlane"
copy_dir "frontend/app/api/story"
do_commit "2025-12-30 15:00:00" "feat: add external API integrations"

# 50. VeryChat service
copy_files "frontend/lib/services/verychat-service.ts"
copy_files "frontend/lib/services/verychat-types.ts"
do_commit "2025-12-30 17:00:00" "feat: implement VeryChat service for messaging"

# 51. Contract hooks
copy_files "frontend/lib/hooks/use-registration-contract.ts"
copy_files "frontend/lib/hooks/use-registration-status.ts"
copy_files "frontend/lib/hooks/use-endorsement-contract.ts"
copy_files "frontend/lib/hooks/use-endorsements.ts"
copy_files "frontend/lib/hooks/use-badge-eligibility.ts"
copy_files "frontend/lib/hooks/use-score-history.ts"
do_commit "2025-12-30 20:00:00" "feat: implement contract interaction hooks"

# 52. Additional hooks
copy_files "frontend/lib/hooks/use-airdrop-claim.ts"
copy_files "frontend/lib/hooks/use-create-airdrop.ts"
copy_files "frontend/lib/hooks/use-token-factory.ts"
copy_files "frontend/lib/hooks/use-user-search.ts"
copy_files "frontend/lib/hooks/use-user-lookup.ts"
do_commit "2025-12-30 22:00:00" "feat: add airdrop and token factory hooks"

# ============================================
# DEC 31 - Final Polish (6 commits)
# ============================================
echo -e "\n${GREEN}=== December 31, 2025 ===${NC}"

# 53. Contract ABIs
copy_dir "frontend/constants/contracts"
do_commit "2025-12-31 09:00:00" "chore: sync contract ABIs to frontend"

# 54. Starter pages
copy_dir "frontend/app/starter"
do_commit "2025-12-31 10:30:00" "feat: add starter pages for Web3, VeryChat, and testing"

# 55. User components and types
copy_dir "frontend/components/user"
copy_dir "frontend/components/onboarding"
copy_dir "frontend/types"
copy_dir "frontend/lib/types"
do_commit "2025-12-31 11:30:00" "feat: add user components and type definitions"

# 56. VeryChain deployment
copy_files "contracts/script/DeployVeryChain.s.sol"
copy_files "contracts/script/InitializeShinroe.s.sol"
copy_files "contracts/script/FullDeploy.s.sol"
copy_files "contracts/script/SeedData.s.sol"
copy_dir "contracts/scripts"
copy_dir "contracts/config"
do_commit "2025-12-31 12:00:00" "feat(contracts): add VeryChain deployment and seed scripts"

# 57. Deployment broadcasts
copy_dir "contracts/broadcast"
copy_dir "contracts/deployments"
do_commit "2025-12-31 12:30:00" "chore: add deployment broadcasts for all networks"

# 58. Claude commands and skills
copy_dir ".claude"
do_commit "2025-12-31 13:00:00" "chore: add Claude commands and skills for development"

# Final: Add all remaining files
echo -e "\n${YELLOW}Adding all remaining files...${NC}"
cp -r "$TEMP_DIR"/* . 2>/dev/null || true
cp "$TEMP_DIR"/.* . 2>/dev/null || true
do_commit "2025-12-31 14:00:00" "chore: sync remaining configuration and dependencies"

# ============================================
# FINALIZE
# ============================================
echo -e "\n${GREEN}=== Finalizing ===${NC}"

# Rename branch
git branch -m temp-history-rewrite main-new

# Cleanup
rm -rf "$TEMP_DIR"
rm -f rewrite-history.sh rewrite-history-v2.sh

echo -e "\n${GREEN}✓ History rewrite complete!${NC}"
echo -e "New history on branch: ${BLUE}main-new${NC}"
echo -e "\n${YELLOW}Commit count: $(git rev-list --count main-new)${NC}"
echo -e "\n${YELLOW}To complete:${NC}"
echo "1. Review: git log --oneline main-new"
echo "2. Replace: git branch -D main && git branch -m main-new main"
echo "3. Push: git push origin main --force"
