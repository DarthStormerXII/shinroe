# Shinroe (신뢰) - Hackathon Submission

---

## 1. One-Liner Vision

**Build trust once, unlock benefits everywhere — a portable on-chain reputation score for the VeryChain ecosystem.**

---

## 2. GitHub URL

**https://github.com/DarthStormerXII/shinroe**

*(SSH key: `darthstormer` → Email: darthstormer.ai@gmail.com)*

---

## 3. Key Innovation Domains

1. **Decentralized Identity (DID)**
2. **Reputation Infrastructure**
3. **Privacy-Preserving Credentials**

---

## 4. Detailed Description

### The Problem

Every new dApp in Web3 starts from zero — no user history, no reputation, no trust. Users must rebuild credibility on every platform. Bad actors simply create new accounts to escape negative history. This "cold start problem" wastes resources and limits what dApps can offer to trustworthy users.

### Our Solution: Shinroe (신뢰)

Shinroe ("trust" in Korean) is an **on-chain reputation scoring system** built for the VeryChain ecosystem. It aggregates user behavior across multiple dApps to create a **portable, verifiable trust score** that unlocks benefits ecosystem-wide.

### How It Works

**Score Aggregation (5 Categories):**
- **Identity (20%)** — KYC level, verification age, profile completeness
- **Financial (25%)** — Payment history, stake behavior, transaction volume
- **Social (20%)** — VeryChat activity, network quality, endorsements received
- **Transactional (25%)** — On-chain history, default rates, contract diversity
- **Behavioral (10%)** — Report history, dispute outcomes, ban history

**Privacy-First Architecture:**
- Scores are stored as **keccak256 hashes** on-chain
- Users prove their score via hash verification without revealing raw data
- Granular **privacy controls** — choose what to share and with whom

### Smart Contracts

| Contract | Purpose |
|----------|---------|
| **ScoreRegistry** | Stores score hashes, user registration, privacy settings |
| **EndorsementVault** | Staked peer vouching with 10%/month decay after 6 months |
| **BadgeNFT** | Soulbound achievement tokens for reputation milestones |
| **TokenFactory** | Create tokens for reputation-gated airdrops |
| **AirdropVault** | Score-based token distribution with eligibility criteria |

### Endorsement System

Users can **stake VERY tokens** to vouch for others:
- Minimum stake: 0.01 VERY
- 6-month grace period, then 10% weight decay per month
- Slashing for fraudulent endorsements → treasury receives stake
- Three types: General Trust, Financial Reliability, Professional Competence

### dApp Integration

Other VeryChain dApps can query Shinroe scores to:
- **Moigye** → Lower stake requirements for high-score users
- **Pumasi** → Unlock higher-value job listings
- **Jokjipge** → Adjust betting limits based on reputation
- **Jjinmannam** → Display trust badges on dating profiles

### Tech Stack

- **Frontend:** Next.js 14 + shadcn/ui + Tailwind CSS
- **Auth:** WEPIN (only provider supporting VeryChain mainnet)
- **Contracts:** Foundry (Solidity 0.8.26)
- **Indexing:** Self-hosted TheGraph node (VeryChain has no external indexer support)
- **Chat:** VeryChat API integration for social verification

### Score Tiers

| Score Range | Tier | Description |
|-------------|------|-------------|
| 800-1000 | Elite | Top 5%, maximum trust |
| 650-799 | Excellent | Highly reliable |
| 500-649 | Good | Solid track record |
| 350-499 | Building | New or limited history |
| 0-349 | At Risk | Negative history |

### Key Features

- **Score Dashboard** — View breakdown, trends, improvement tips
- **Profile Search** — Look up any user's public reputation
- **Peer Endorsements** — Stake-weighted vouching system
- **Badge NFTs** — Soulbound achievement tokens
- **Reputation-Gated Airdrops** — Token distribution based on score criteria
- **Privacy Controls** — Toggle public/private visibility per category
- **Cross-dApp SDK** — 3 lines to integrate score queries

### Why VeryChain?

Shinroe leverages VeryChat's KYC-verified identities as a unique foundation. Unlike anonymous chains, VeryChain users have verified identities — making reputation meaningful and sybil-resistant.

---

**신뢰를 쌓고, 혜택을 누리세요.** *(Build trust, unlock benefits.)*
