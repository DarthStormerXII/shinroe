# Shinroe (신뢰) — Product Requirements Document

## On-Chain Social Credit Score

---

## 1. Executive Summary

**Product Name:** Shinroe (신뢰)
**Tagline:** "신뢰를 쌓고, 혜택을 누리세요" (Build Trust, Unlock Benefits)
**Category:** Identity / Reputation Infrastructure

Shinroe is an on-chain reputation scoring system for the Very Network ecosystem. It aggregates user behavior across multiple dApps to create a portable, verifiable trust score that unlocks benefits across the entire ecosystem.

---

## 2. Problem Statement

### The Web3 Trust Deficit

Every new dApp starts from zero — no user history, no reputation, no trust. This leads to:

**Current Pain Points:**

| Problem | Impact |
|---------|--------|
| **Cold Start** | Each dApp must build trust infrastructure from scratch |
| **Siloed Reputation** | Good behavior in one app doesn't transfer |
| **Sybil Attacks** | Bad actors create new accounts to escape history |
| **No Accountability** | Anonymous users have no consequences |
| **Verification Fatigue** | Users re-verify for every new service |

### The Opportunity

VeryChat's KYC creates a unique foundation: verified identities that can accumulate cross-platform reputation.

---

## 3. Solution Overview

Shinroe creates a composable reputation layer where:

1. **Score Aggregation** — Collects signals from across Very ecosystem
2. **Single Identity** — One reputation tied to KYC-verified identity
3. **Portable Trust** — Use your score in any integrated dApp
4. **Permissioned Access** — You control who sees what
5. **Economic Benefits** — High scores unlock perks, low scores face friction

---

## 4. Target Users

### Primary: Very Ecosystem dApp Developers
- Need trust/reputation for their apps
- Don't want to build from scratch
- Want to leverage existing user history

### Secondary: Power Users
- Active across multiple Very dApps
- Want their reputation to "count"
- Seek benefits from being trustworthy

### Tertiary: New Users
- Need to build reputation in ecosystem
- Starting point for trust building

---

## 5. Score Components

### Input Signals

| Category | Signals | Weight |
|----------|---------|--------|
| **Identity** | KYC level, verification age | 20% |
| **Financial** | 계 participation, payment history, stakes | 25% |
| **Social** | VeryChat activity, connections, endorsements | 20% |
| **Transactional** | On-chain history, default rate | 25% |
| **Behavioral** | Report history, dispute outcomes | 10% |

### Score Breakdown

| Score Range | Tier | Description |
|-------------|------|-------------|
| 800-1000 | 🏆 Elite | Top 5%, maximum trust |
| 650-799 | ✅ Excellent | Highly reliable |
| 500-649 | 👍 Good | Solid track record |
| 350-499 | ⚠️ Building | New or limited history |
| 0-349 | ⛔ At Risk | Negative history, restricted |

### Score Factors (Detail)

**Identity (20%)**
- VeryChat account age
- KYC verification tier
- Profile completeness
- Linked accounts

**Financial (25%)**
- Moigye participation rate
- Bitzero settlement speed
- Stake history (deposited, slashed?)
- Transaction volume

**Social (20%)**
- VeryChat engagement
- Friend network quality (avg friend score)
- Endorsements received
- Community participation

**Transactional (25%)**
- Total transactions
- Default/dispute rate
- Contract interaction diversity
- On-chain history age

**Behavioral (10%)**
- Reports filed (valid vs. false)
- Reports received
- Dispute outcomes
- Ban history

---

## 6. User Flows

### Flow 1: Viewing Your Score

```
1. User opens Shinroe dApp
2. Logs in with VeryChat
3. Dashboard shows:
   - Overall score (e.g., 742)
   - Tier badge (Excellent ✅)
   - Score breakdown by category
   - Trend (↑ +15 this month)
4. Drill into each category
5. See specific factors affecting score
6. View improvement suggestions
```

### Flow 2: Checking Someone's Score

```
1. User wants to verify another user
2. Enters VeryChat handle
3. If target has public profile:
   - See score, tier, badges
4. If target has private profile:
   - Request access
   - Target approves/denies
5. Verification history logged
```

### Flow 3: Using Score in Another dApp

```
1. User opens Moigye (or other dApp)
2. dApp requests Shinroe score
3. User approves data sharing
4. Shinroe returns:
   - Score
   - Relevant sub-scores
   - Verification proof
5. dApp applies score-based logic:
   - Lower stake requirements
   - Higher limits
   - Priority access
```

### Flow 4: Endorsing Another User

```
1. User A wants to vouch for User B
2. Opens Shinroe → "Endorse"
3. Selects User B by handle
4. Chooses endorsement type:
   - General trust
   - Financial reliability
   - Professional competence
5. Optionally stakes VERY on endorsement
6. Endorsement recorded on-chain
7. User B's score updated
```

### Flow 5: Disputing a Score Factor

```
1. User sees incorrect factor
2. Clicks "Dispute"
3. Selects specific issue
4. Provides evidence
5. Review team investigates
6. Outcome:
   - Corrected (score updated)
   - Rejected (with explanation)
7. Appeal option if rejected
```

---

## 7. Feature Breakdown

### Core Features (MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Score Dashboard** | View your own score and breakdown | P0 |
| **Score Calculation** | Aggregate signals, compute score | P0 |
| **Public Profile** | Optional public score display | P0 |
| **API for dApps** | Query scores programmatically | P0 |
| **Privacy Controls** | Choose what to share | P0 |
| **Basic Verification** | Check another user's score | P0 |

### Endorsement System

| Feature | Description | Priority |
|---------|-------------|----------|
| **Peer Endorsements** | Vouch for other users | P1 |
| **Staked Endorsements** | Put VERY behind your vouch | P1 |
| **Endorsement Types** | Categorized vouching | P1 |
| **Endorsement Decay** | Old endorsements fade | P2 |

### dApp Integration

| Feature | Description | Priority |
|---------|-------------|----------|
| **SDK for Developers** | Easy integration | P0 |
| **Score-Gated Features** | Unlock based on score | P1 |
| **Webhooks** | Notify on score changes | P2 |
| **Batch Queries** | Check multiple users | P2 |

### Secondary Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Score History** | Track changes over time | P1 |
| **Improvement Tips** | Suggest actions to increase | P1 |
| **Badges** | Achievement NFTs | P1 |
| **Leaderboards** | Top scores (opt-in) | P2 |
| **Export** | Portable reputation proof | P2 |

---

## 8. Technical Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  - Score Dashboard                                          │
│  - Profile Settings                                         │
│  - Verification Interface                                   │
│  - Endorsement System                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Shinroe Backend                          │
│  - Score Aggregation Engine                                 │
│  - Signal Collectors (per dApp)                             │
│  - Privacy Layer                                            │
│  - API Gateway                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────┬─────────────────┬───────────────────────┐
│   VeryChat Auth   │   Partner dApps │   VeryChain (EVM)     │
│   - Identity      │   - Moigye      │   - ScoreRegistry     │
│   - KYC status    │   - Bitzero     │   - EndorsementVault  │
│                   │   - Jjinmannam  │   - BadgeNFTs         │
└───────────────────┴─────────────────┴───────────────────────┘
```

### Smart Contracts

| Contract | Purpose |
|----------|---------|
| **ScoreRegistry** | Store score hashes, verification proofs |
| **EndorsementVault** | Manage staked endorsements |
| **BadgeNFT** | Soulbound reputation badges |
| **AccessControl** | Permission management |

### Data Model

**UserScore:**
- userId (VeryChat handle)
- overallScore
- identityScore
- financialScore
- socialScore
- transactionalScore
- behavioralScore
- tier
- lastUpdated
- scoreHash (on-chain)

**Endorsement:**
- endorserId
- endorseeId
- type
- stakeAmount
- createdAt
- expiresAt
- active

**ScoreHistory:**
- userId
- score
- timestamp
- changeReason

### Privacy Architecture

| Data Level | Access |
|------------|--------|
| **Overall Score** | Public (optional) or private |
| **Tier/Badge** | Public (optional) |
| **Category Scores** | Permissioned |
| **Raw Signals** | Never shared |
| **Score Factors** | Owner only |

---

## 9. dApp Integration Guide

### Query Score

```
Endpoint: GET /api/v1/score/{handleId}
Auth: API key + user consent token
Response:
  - score: 742
  - tier: "excellent"
  - verified: true
  - timestamp: "2024-01-15T..."
```

### Score-Based Logic Examples

| dApp | Score Use Case |
|------|---------------|
| **Moigye** | Higher scores → lower stake requirements |
| **Jjinmannam** | Score visible on profiles, filters |
| **Pumasi** | Unlock higher-value jobs |
| **Jokjipge** | Bet limits based on score |
| **Yeolgong** | Trust-based peer tutoring |

---

## 10. Success Metrics

### Primary KPIs

| Metric | Target (3 months) |
|--------|-------------------|
| Users with scores | 10,000+ |
| dApps integrated | 5+ |
| API calls / day | 10,000+ |
| Endorsements given | 5,000+ |
| Score disputes resolved | <100 |

### Secondary KPIs

| Metric | Target |
|--------|--------|
| Avg score | 550+ |
| Score check rate | 30% of transactions |
| Public profiles | 40% |
| Staked endorsements | 500+ |

---

## 11. Korean Market Positioning

### Messaging

**Primary:** "베리에서의 모든 활동이 신뢰로 이어집니다"  
(All your Very activities build into trust)

**Secondary:** "당신의 신뢰 점수, 어디서든 인정받으세요"  
(Your trust score, recognized everywhere)

### Cultural Alignment

| Korean Norm | Shinroe Feature |
|-------------|-----------------|
| 인맥 (connections matter) | Social score from network |
| 스펙 (credentials) | Verifiable, portable score |
| 평판 (reputation) | Public/private reputation |
| 보증 (guarantor) | Staked endorsements |

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Score gaming | High | High | Multiple signals, fraud detection |
| Privacy concerns | High | High | Strong privacy controls, consent |
| Score discrimination | Medium | High | Transparent factors, appeals |
| Low dApp adoption | Medium | High | Launch with own dApps first |
| Endorsement fraud | Medium | Medium | Stake requirements, decay |

---

## 13. Demo Script (For Hackathon)

### Scene 1: The Problem (20 sec)
- "Every dApp: 'Are you trustworthy?'"
- "Start from zero, every time"

### Scene 2: Your Score Dashboard (40 sec)
- Login with VeryChat
- Show overall score
- Break down categories
- View history

### Scene 3: Cross-dApp Benefit (40 sec)
- Open Moigye with high score
- Show reduced stake requirement
- "Your reputation works for you"

### Scene 4: Endorsement (30 sec)
- Vouch for a friend
- Stake VERY
- Friend's score increases

### Scene 5: Developer Integration (20 sec)
- Show API call
- Instant score response
- "3 lines to integrate"

### Closing (10 sec)
- "신뢰를 쌓고, 혜택을 누리세요. Shinroe"

---

## 14. Timeline Estimate

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Design | 2 days | Architecture, privacy model |
| Backend | 5 days | Score engine, API, collectors |
| Smart Contracts | 3 days | Registry, endorsements, badges |
| Frontend | 4 days | Dashboard, endorsements |
| Integration | 2 days | Connect to other Very dApps |
| Testing | 2 days | Privacy tests, edge cases |
| Demo Prep | 1 day | Recording |
| **Total** | **~2.5 weeks** | |

---

## 15. Open Questions

1. Should scores be fully on-chain or hash-only?
2. How often do scores update? Real-time vs. daily batch?
3. Minimum history before score is "valid"?
4. Can users delete their score entirely?
5. How to handle score portability to other chains?
