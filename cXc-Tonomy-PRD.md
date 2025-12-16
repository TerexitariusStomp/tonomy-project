# Product Requirements Document: cXc.world Tonomy Invite System & Integration

## Document Information

**Project:** cXc.world Tonomy/Pangea Integration - Milestone 2 & 3  
**Date:** December 16, 2025  
**Author:** Product Requirements Analysis  
**Version:** 1.0  
**Status:** Draft for Implementation  

---

## Executive Summary

This PRD specifies the technical and functional requirements to complete Milestones 2 and 3 of the cXc.world grant proposal for Pangea integration. The system will enable gamified user onboarding to Pangea through a referral-based invite system, integrate Pangea Passport DID authentication for upvoting, and prepare for expansion to video content.

### Current State (Milestone 1 - Completed)
- cXc Music Beta live at cXc.world with localized charts
- Tokenized upvoting system on WAX blockchain using BLUX tokens
- 3,869 localized music charts covering global regions
- Time-based filtering and geographic search
- Smart contracts developed for Invite System and BLUX Bridge
- Contracts ready for deployment at `invite.cxc` and `bridge.cxc`

### Target State (Milestones 2 & 3)
- Pangea Passport authentication integrated
- Gamified invite system with tetrahedral rewards active
- BLUX token bridged to Tonomy blockchain
- Daily upvote allocation based on DID verification level
- 6-month promotional campaign infrastructure
- Foundation for cXc Video launch on Pangea

---

## 1. Project Context & Background

### 1.1 Vision & Mission Alignment

**cXc Mission:** To expand human experience through an information age organized by free-will.

**Value Proposition:** cXc gets users local attention for their creations through localized content competitions and discovery.

**Pangea Alignment:** Using Pangea's Web4 passports and DID verification system to enable fair curation while preventing sybil attacks, making Pangea the highest-cap and most-used Antelope chain.

### 1.2 Problem Statement

- Over 50% of advertising dollars flow through Meta and Google
- Centralized platforms control attention and content visibility
- Creators lack transparent, fair mechanisms for local discovery
- Need for secure, decentralized identity verification for fair curation
- Barrier to blockchain adoption requires engaging onboarding

### 1.3 Solution Overview

A gamified invite system that:
1. Creates viral growth through referral incentives
2. Onboards users to Pangea with minimal friction
3. Rewards both inviter and invited with BLUX tokens
4. Enables daily upvoting based on verified identity levels
5. Builds foundation for multi-content-type expansion (video)

---

## 2. Technical Architecture

### 2.1 System Components

#### 2.1.1 Smart Contracts (Antelope/C++)

**A. Invite Contract** (`invite.cxc`)
- Repository: https://github.com/currentxchange/TonomyInvite
- Deployment account: `invite.cxc` (pending deployment by Pangea team)

**B. Bridge Contract** (`bridge.cxc`)
- Repository: https://github.com/currentxchange/Ant-Bridge-Contract
- Deployment account: `bridge.cxc` (pending deployment by Pangea team)
- Purpose: Bridge BLUX tokens from WAX to Tonomy

**C. Token Contract** (`tokens.cxc`)
- Based on standard eosio.token pattern
- Manages BLUX token supply on Tonomy
- Receives tokens from bridge

#### 2.1.2 Frontend Components

**Technology Stack:**
- jQuery (existing)
- Leaflet.js for maps (existing)
- Tonomy ID SDK integration (new)
- World Citizens Wallet integration (new)

**Integration Points:**
- cXc.world main application
- Invite code redemption interface
- Pangea Passport authentication flow
- Daily upvote claim interface

#### 2.1.3 Backend Components

**Existing:**
- PHP/MariaDB backend
- Node.js services with bree.js
- MariaDB Global System (geospatial database)

**New Requirements:**
- Tonomy blockchain node connection
- Passport verification API integration
- Invite tracking and analytics
- Bridge transaction monitoring

### 2.2 Data Models

#### 2.2.1 Invite Contract Data Structures

```cpp
// TABLE: invites
struct invite_record {
    name inviter;           // Account that sent invite
    name invited;           // Account that accepted invite
    time_point timestamp;   // When invite was accepted
    uint64_t tier;          // Referral tier depth
    asset rewards_earned;   // Total BLUX earned from this invite
    uint64_t primary_key() const { return invited.value; }
};

// TABLE: user_stats
struct user_stats {
    name username;
    uint32_t direct_invites;      // Level 1 invites
    uint32_t total_downstream;    // All downstream invites
    asset total_rewards;          // Total BLUX earned
    time_point last_invite;       // Rate limiting
    uint32_t daily_invites_used;  // Anti-sybil tracking
    uint64_t verification_level;  // From Pangea Passport
    uint64_t primary_key() const { return username.value; }
};

// TABLE: config
struct invite_config {
    uint32_t daily_invite_limit;          // Max invites per day
    uint32_t campaign_duration_days;      // 6 months = 180
    time_point campaign_start;
    time_point campaign_end;
    vector<asset> tier_rewards;           // Tetrahedral reward structure
    bool campaign_active;
};
```

#### 2.2.2 Bridge Contract Data Structures

```cpp
// TABLE: bridge_transfers
struct transfer_record {
    uint64_t id;
    name from_account;      // WAX account
    name to_account;        // Tonomy account
    asset quantity;         // BLUX amount
    string from_chain;      // "WAX"
    string to_chain;        // "TONOMY"
    time_point initiated;
    time_point completed;
    string status;          // pending, completed, failed
    checksum256 wax_tx_id;
    checksum256 tonomy_tx_id;
    uint64_t primary_key() const { return id; }
};
```

#### 2.2.3 Upvote Allocation Data

```cpp
// TABLE: upvote_allocations
struct upvote_alloc {
    name user;
    uint64_t verification_level;  // From Pangea Passport
    uint32_t daily_upvotes;       // Calculated from verification
    uint32_t upvotes_used_today;
    time_point last_reset;        // Daily reset timestamp
    uint64_t primary_key() const { return user.value; }
};
```

### 2.3 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     cXc.world Frontend                        │
│  (jQuery + Leaflet + Tonomy ID SDK)                          │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─────────────┐
             │             │
             ▼             ▼
    ┌────────────┐   ┌────────────────┐
    │  PHP/Node  │   │  Tonomy ID /   │
    │  Backend   │   │  World Citizens│
    │  Services  │   │  Wallet        │
    └─────┬──────┘   └────────┬───────┘
          │                   │
          │                   │
          ▼                   ▼
    ┌────────────────────────────────┐
    │    Tonomy Blockchain Nodes     │
    │                                 │
    │  ┌──────────┐  ┌──────────┐   │
    │  │ invite.  │  │ bridge.  │   │
    │  │   cxc    │  │   cxc    │   │
    │  └──────────┘  └──────────┘   │
    │                                 │
    │  ┌──────────┐  ┌──────────┐   │
    │  │ tokens.  │  │ Pangea   │   │
    │  │   cxc    │  │ Passport │   │
    │  └──────────┘  └──────────┘   │
    └────────────────────────────────┘
              │
              │ (Bridge)
              ▼
    ┌────────────────────┐
    │   WAX Blockchain   │
    │   (Legacy BLUX)    │
    └────────────────────┘
```

---

## 3. Functional Requirements

### 3.1 Gamified Invite System

#### 3.1.1 Tetrahedral Reward Structure

**Requirement ID:** FR-INV-001  
**Priority:** P0 (Critical)  
**Status:** Contract developed, pending deployment

**Description:**  
Implement a tetrahedral (pyramid-based) reward multiplier system where users earn rewards not just for direct invites, but for their downstream referral network.

**Tetrahedral Structure:**
```
Level 0 (Self):         User
Level 1 (Direct):       4 invites × 1.0 multiplier
Level 2 (Tier 2):       16 invites × 0.5 multiplier
Level 3 (Tier 3):       64 invites × 0.25 multiplier
Level 4 (Tier 4):       256 invites × 0.125 multiplier
```

**Reward Formula:**
```
User Total Reward = Σ(invites_at_tier × tier_multiplier × base_reward)
```

**Base Reward Configuration:**
- Base invite reward: 100 BLUX
- Campaign duration: 6 months (180 days)
- Daily invite limit: 5 per user (anti-sybil)

**User Stories:**
- As an inviter, I want to earn BLUX when people I invite join and when they invite others, so I'm incentivized to bring quality users
- As a new user, I want to see how many BLUX I can earn by inviting friends, so I understand the value of participation
- As the platform, I want to prevent sybil attacks through daily limits while encouraging viral growth

**Acceptance Criteria:**
- [ ] Smart contract correctly calculates tetrahedral rewards up to 4 levels deep
- [ ] Daily invite limit of 5 per user enforced by contract
- [ ] Rewards distributed in BLUX tokens on Tonomy
- [ ] Real-time reward preview shown to users before inviting
- [ ] Analytics dashboard shows referral tree structure
- [ ] Contract prevents gaming through duplicate accounts (requires Pangea Passport)

#### 3.1.2 Invite Code Generation & Redemption

**Requirement ID:** FR-INV-002  
**Priority:** P0 (Critical)

**Description:**  
Each registered user's username serves as their unique invite code. Users can share this with friends, who enter it during onboarding.

**Technical Implementation:**
- Invite code = Tonomy account username
- User shares their username or generated referral link
- New users enter code during Pangea Passport creation
- Smart contract validates and records relationship

**User Flow:**
1. User completes Pangea Passport verification
2. System displays their unique invite code (username)
3. User copies shareable link: `https://music.cxc.world/invite/USERNAME`
4. Friend clicks link → redirected to Pangea onboarding
5. Friend's account automatically linked to inviter
6. Both receive reward confirmation

**Acceptance Criteria:**
- [ ] Invite codes are unique and tied to verified Pangea accounts
- [ ] Shareable links auto-populate invite code in signup flow
- [ ] Invalid/expired codes show helpful error messages
- [ ] Users can view their invite code and link at any time
- [ ] Invite redemption recorded immutably on-chain
- [ ] Both parties notified of successful invite completion

#### 3.1.3 Invite Limits & Anti-Sybil

**Requirement ID:** FR-INV-003  
**Priority:** P0 (Critical)

**Description:**  
Prevent abuse through daily invite limits and Pangea Passport verification requirements.

**Anti-Sybil Mechanisms:**
1. **Daily Invite Limit:** Max 5 new invites per 24 hours per user
2. **Passport Requirement:** Both inviter and invited must have verified Pangea Passport
3. **Cooldown Period:** 24-hour reset on invite count
4. **Verification Threshold:** Minimum DID verification level to send invites
5. **Activity Monitoring:** Track and flag suspicious patterns

**Smart Contract Logic:**
```cpp
ACTION sendinvite(name inviter, name invited) {
    require_auth(inviter);
    
    // Check daily limit
    user_stats stats = get_user_stats(inviter);
    check(stats.daily_invites_used < 5, "Daily invite limit reached");
    
    // Check Pangea Passport verification
    check(is_verified_passport(inviter), "Inviter must have verified passport");
    check(is_verified_passport(invited), "Invited must have verified passport");
    
    // Check cooldown
    time_point now = current_time_point();
    time_point last_reset = stats.last_invite;
    if (now - last_reset > days(1)) {
        stats.daily_invites_used = 0;
        stats.last_invite = now;
    }
    
    // Record invite
    record_invite(inviter, invited);
    stats.daily_invites_used++;
    
    // Calculate and distribute rewards
    distribute_tetrahedral_rewards(inviter, invited);
}
```

**Acceptance Criteria:**
- [ ] Users cannot send more than 5 invites per 24 hours
- [ ] Daily counter resets automatically at 24-hour mark
- [ ] Unverified users cannot send or accept invites
- [ ] Attempting to exceed limit shows clear error with reset time
- [ ] Admin can view and flag suspicious activity patterns

### 3.2 BLUX Token Bridge

#### 3.2.1 WAX to Tonomy Bridge

**Requirement ID:** FR-BRG-001  
**Priority:** P0 (Critical)  
**Status:** Contract developed, pending deployment

**Description:**  
Enable users to bridge their existing BLUX tokens from WAX blockchain to Tonomy blockchain to participate in cXc on Pangea.

**Bridge Workflow:**
```
1. User locks BLUX on WAX (bridge.cxc on WAX)
2. Oracle/Relayer detects lock transaction
3. Equivalent BLUX minted on Tonomy (bridge.cxc)
4. User receives BLUX in Tonomy account
5. Transaction hash recorded on both chains
```

**Security Considerations:**
- Multi-sig authority for bridge operations
- Oracle consensus for cross-chain verification
- Time locks on high-value transfers
- Emergency pause mechanism
- Audit trail for all bridge transactions

**User Stories:**
- As a WAX BLUX holder, I want to bridge my tokens to Tonomy, so I can use them on cXc.world
- As a user, I want to see bridge transaction status in real-time, so I know when my tokens are available
- As the platform, I want to ensure 1:1 token parity across chains, so users trust the bridge

**Acceptance Criteria:**
- [ ] Users can initiate bridge transfer from cXc.world UI
- [ ] Bridge maintains 1:1 token parity (no inflation/deflation)
- [ ] Transfer completes within 5 minutes average
- [ ] Transaction hash and status visible to user
- [ ] Failed transfers automatically refunded
- [ ] Bridge history accessible for audit

#### 3.2.2 Bridge UI Components

**Requirement ID:** FR-BRG-002  
**Priority:** P1 (High)

**Description:**  
User-friendly interface for bridging BLUX tokens between chains.

**UI Components:**
```
┌────────────────────────────────────────┐
│     Bridge BLUX: WAX → Tonomy          │
├────────────────────────────────────────┤
│                                        │
│  From:  [WAX Chain]        ▼          │
│  Amount: [____] BLUX                  │
│  Balance: 1,234 BLUX                  │
│                                        │
│  To:    [Tonomy Chain]     ▼          │
│  Receive: 1,234 BLUX (estimated)      │
│  Fee:     ~0.5 WAX                    │
│                                        │
│  Time: ~3-5 minutes                   │
│                                        │
│  [ Cancel ]    [Bridge Tokens ➜]      │
│                                        │
└────────────────────────────────────────┘
```

**Status Display:**
```
Bridge Status: In Progress...

Step 1: ✓ Tokens locked on WAX
        TX: 8f3a9d... [View on WAX]
        
Step 2: ⏳ Waiting for confirmations (2/3)
        
Step 3: ⏱ Minting on Tonomy (pending)

Estimated completion: 2 minutes
```

**Acceptance Criteria:**
- [ ] Clear visual indication of bridge progress
- [ ] Error states with actionable messages
- [ ] Transaction links to both chain explorers
- [ ] Estimated completion time displayed
- [ ] Success confirmation with new balance

### 3.3 Pangea Passport Integration

#### 3.3.1 Authentication Flow

**Requirement ID:** FR-AUTH-001  
**Priority:** P0 (Critical)

**Description:**  
Integrate Tonomy ID / World Citizens Wallet for user authentication using Pangea Passport DID system.

**Authentication Sequence:**
```
1. User visits cXc.world
2. Clicks "Connect Wallet"
3. Options displayed:
   - Tonomy ID (mobile app)
   - World Citizens Wallet (web/extension)
4. User selects authentication method
5. Wallet prompts for authorization
6. cXc.world receives:
   - User's Tonomy account name
   - DID verification level
   - Authorized permissions
7. Session established
8. User can access full cXc features
```

**DID Verification Levels (from Pangea):**
- **Level 0:** Unverified (email only) → 1 upvote/day
- **Level 1:** Phone verified → 5 upvotes/day
- **Level 2:** Government ID verified → 10 upvotes/day
- **Level 3:** Biometric verified → 20 upvotes/day
- **Level 4:** Multi-factor + vouched → 50 upvotes/day

**Technical Integration:**
```javascript
// Frontend: Tonomy ID SDK Integration
import { TonomyID } from '@tonomy/tonomy-id-sdk';

async function connectWallet() {
    try {
        const tonomy = new TonomyID({
            appId: 'cxc.world',
            redirectUri: 'https://music.cxc.world/auth/callback'
        });
        
        // Request authentication
        const session = await tonomy.login({
            scope: ['upvote', 'profile', 'invites']
        });
        
        // Get user DID and verification level
        const userDID = session.did;
        const verificationLevel = await tonomy.getVerificationLevel(userDID);
        
        // Store session
        saveUserSession({
            account: session.accountName,
            did: userDID,
            verificationLevel: verificationLevel,
            dailyUpvotes: calculateUpvotes(verificationLevel)
        });
        
        return session;
    } catch (error) {
        handleAuthError(error);
    }
}
```

**User Stories:**
- As a new user, I want to authenticate with my Tonomy ID, so I can use cXc securely
- As a verified user, I want my verification level to automatically determine my daily upvotes, so I don't have to do anything extra
- As the platform, I want to leverage Pangea's DID system, so we have built-in anti-sybil protection

**Acceptance Criteria:**
- [ ] Tonomy ID login button prominently displayed
- [ ] Mobile app deep linking works for Tonomy ID
- [ ] Verification level fetched and stored on login
- [ ] Session persists across page refreshes
- [ ] Logout properly clears session
- [ ] User's DID visible in profile

#### 3.3.2 Daily Upvote Allocation

**Requirement ID:** FR-AUTH-002  
**Priority:** P0 (Critical)

**Description:**  
Allocate daily upvotes to users based on their Pangea Passport DID verification level.

**Allocation Logic:**
```cpp
// Smart Contract: Calculate Daily Upvotes
uint32_t calculate_daily_upvotes(uint64_t verification_level) {
    // Mapping from Pangea verification levels
    switch(verification_level) {
        case 0: return 1;   // Unverified
        case 1: return 5;   // Phone verified
        case 2: return 10;  // ID verified
        case 3: return 20;  // Biometric verified
        case 4: return 50;  // Full verification
        default: return 1;  // Default to minimum
    }
}

ACTION claimdaily(name user) {
    require_auth(user);
    
    // Get current allocation record
    auto alloc = allocations.find(user.value);
    time_point now = current_time_point();
    
    // Check if 24 hours passed
    if (alloc != allocations.end()) {
        time_point last_reset = alloc->last_reset;
        check(now - last_reset >= days(1), "Already claimed today");
    }
    
    // Fetch verification level from Pangea Passport
    uint64_t verification_level = get_passport_level(user);
    uint32_t daily_upvotes = calculate_daily_upvotes(verification_level);
    
    // Update or insert allocation
    if (alloc != allocations.end()) {
        allocations.modify(alloc, same_payer, [&](auto& a) {
            a.verification_level = verification_level;
            a.daily_upvotes = daily_upvotes;
            a.upvotes_used_today = 0;
            a.last_reset = now;
        });
    } else {
        allocations.emplace(user, [&](auto& a) {
            a.user = user;
            a.verification_level = verification_level;
            a.daily_upvotes = daily_upvotes;
            a.upvotes_used_today = 0;
            a.last_reset = now;
        });
    }
}
```

**Frontend Display:**
```javascript
// User Dashboard Component
function UpvotesDisplay({ user }) {
    const [upvotes, setUpvotes] = useState(null);
    
    useEffect(() => {
        async function fetchUpvotes() {
            const allocation = await getUpvoteAllocation(user.account);
            setUpvotes({
                total: allocation.daily_upvotes,
                remaining: allocation.daily_upvotes - allocation.upvotes_used_today,
                resetTime: allocation.last_reset + 86400 // +24 hours
            });
        }
        fetchUpvotes();
    }, [user]);
    
    return (
        <div className="upvotes-status">
            <h3>Daily Upvotes</h3>
            <div className="upvote-meter">
                <span className="remaining">{upvotes.remaining}</span>
                <span className="total">/ {upvotes.total}</span>
            </div>
            <p>Resets in: {formatTimeRemaining(upvotes.resetTime)}</p>
            <a href="/verify">Increase your limit →</a>
        </div>
    );
}
```

**Acceptance Criteria:**
- [ ] Daily upvotes automatically allocated based on verification level
- [ ] Users can claim daily upvotes via smart contract action
- [ ] UI clearly shows remaining upvotes and reset time
- [ ] Upvote count decrements after each use
- [ ] System automatically resets after 24 hours
- [ ] Link to increase verification level prominent

### 3.4 Enhanced Onboarding Flow

#### 3.4.1 Progressive Onboarding Journey

**Requirement ID:** FR-ONB-001  
**Priority:** P1 (High)

**Description:**  
Implement a guided onboarding experience that progressively introduces users to cXc features while encouraging Pangea Passport completion.

**Onboarding Stages:**

**Stage 1: First Visit (Anonymous)**
```
┌─────────────────────────────────────────┐
│  Welcome to cXc Music!                  │
│                                         │
│  Discover music from your area →       │
│  [View Map]                             │
│                                         │
│  Want to upvote? [Get Started]          │
└─────────────────────────────────────────┘
```
- User can browse map and listen to music
- One upvote allowed without account
- CTA to create account after first upvote attempt

**Stage 2: Create Account**
```
┌─────────────────────────────────────────┐
│  Join cXc with Tonomy ID                │
│                                         │
│  ✓ Secure & private identity            │
│  ✓ Earn rewards for inviting friends    │
│  ✓ Vote daily on music you love         │
│                                         │
│  [Create Tonomy ID]                     │
│                                         │
│  Have an invite code? [Enter here]      │
└─────────────────────────────────────────┘
```

**Stage 3: Redeem Invite Code**
```
┌─────────────────────────────────────────┐
│  Enter Your Invite Code                 │
│                                         │
│  Code: [_____________]                  │
│                                         │
│  Don't have one? Get one here:          │
│  • Telegram: t.me/cXc_world             │
│  • Discord: #cxc-invites                │
│                                         │
│  [Redeem Code]  [Skip for Now]          │
└─────────────────────────────────────────┘
```
- Validates invite code
- Links inviter-invited relationship
- Distributes initial BLUX rewards

**Stage 4: Verification Incentive**
```
┌─────────────────────────────────────────┐
│  Unlock More Daily Upvotes!             │
│                                         │
│  Current: 1 upvote/day                  │
│                                         │
│  Verify your phone → 5 upvotes/day      │
│  Verify your ID → 10 upvotes/day        │
│  Full verification → 50 upvotes/day     │
│                                         │
│  [Verify Now]  [Maybe Later]            │
└─────────────────────────────────────────┘
```

**Stage 5: Feature Discovery**
```
┌─────────────────────────────────────────┐
│  Tutorial: How to Use cXc               │
│                                         │
│  1. 🗺 Explore music by location         │
│  2. 🔺 Upvote music you love             │
│  3. 📈 Watch charts update in real-time  │
│  4. 👥 Invite friends, earn BLUX         │
│  5. 🏆 See your rewards grow             │
│                                         │
│  [Start Exploring]                      │
└─────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Onboarding skippable but encouraged
- [ ] Progress saved if user exits mid-flow
- [ ] Clear value proposition at each stage
- [ ] Mobile-responsive design
- [ ] Invite code validation with helpful errors
- [ ] Success states with confetti/animation

#### 3.4.2 Invite Discovery Mechanisms

**Requirement ID:** FR-ONB-002  
**Priority:** P1 (High)

**Description:**  
Provide multiple channels for new users to discover and obtain invite codes.

**Discovery Channels:**

**1. Telegram Bot Integration**
- Bot command: `/invite` in t.me/cXc_world group
- Bot provides random invite code from active pool
- Tracks which codes have been claimed

**2. Discord Integration**
- Dedicated #cxc-invites channel (pending Pangea team approval)
- Users post "Looking for invite" → Community responds
- Bot monitors and provides codes

**3. Social Media Campaign**
- Twitter/X: Daily invite code drops
- Instagram: Stories with QR codes linking to invite
- YouTube: Codes in video descriptions

**4. In-App Sharing**
```javascript
// Share Button Component
function ShareInviteButton({ userCode }) {
    const shareUrl = `https://music.cxc.world/invite/${userCode}`;
    
    async function shareInvite() {
        if (navigator.share) {
            // Native mobile sharing
            await navigator.share({
                title: 'Join me on cXc Music!',
                text: 'Discover local music and earn rewards. Use my invite code:',
                url: shareUrl
            });
        } else {
            // Fallback: Copy to clipboard
            await navigator.clipboard.writeText(shareUrl);
            showToast('Link copied! Share with friends to earn BLUX');
        }
    }
    
    return (
        <button onClick={shareInvite} className="share-button">
            Share My Code & Earn 🔺
        </button>
    );
}
```

**5. Waitlist System**
```
User without code → Join waitlist
Waitlist email collected
Weekly invite batch sent to waitlist
Prioritize based on referrer activity
```

**Acceptance Criteria:**
- [ ] Multiple discovery channels functional
- [ ] Invite codes trackable to source
- [ ] Analytics on which channels convert best
- [ ] Bot integrations deployed
- [ ] Social campaigns scheduled

### 3.5 Analytics & Reporting

#### 3.5.1 Invite Performance Dashboard

**Requirement ID:** FR-RPT-001  
**Priority:** P2 (Medium)

**Description:**  
Admin and user dashboards to track invite campaign performance.

**User Dashboard Metrics:**
```
My Invite Performance

Direct Invites:        12
Total Network:         47 (includes downstream)
BLUX Earned:          2,340
Rank:                 Top 5%

Referral Tree:
├─ alice.cxc (3 invites)
│  ├─ bob.cxc (1 invite)
│  ├─ carol.cxc (5 invites)
│  └─ dave.cxc (0 invites)
├─ eve.cxc (2 invites)
└─ frank.cxc (0 invites)

[Share My Code] [View Full Tree]
```

**Admin Dashboard Metrics:**
```
Campaign Overview (6 months)

Total Sign-ups:        12,453
Verified Accounts:     8,721 (70%)
Invite Redemption:     6,234 (50%)
BLUX Distributed:      1.2M
Avg. Invites/User:     2.3
Top Referrer:          alice.cxc (347 network)

Growth Chart:
[Line graph showing daily signups]

Verification Funnel:
Email Only:     3,732 (30%)
Phone Verified: 4,360 (35%)
ID Verified:    3,121 (25%)
Full Verified:  1,240 (10%)

Top Traffic Sources:
1. Telegram:    4,521 (36%)
2. Twitter:     3,112 (25%)
3. Discord:     2,234 (18%)
4. Direct:      2,586 (21%)
```

**Technical Implementation:**
- Real-time metrics via blockchain queries
- Cached aggregations for performance
- Export to CSV for analysis
- Public leaderboard (opt-in)

**Acceptance Criteria:**
- [ ] User dashboard accessible after login
- [ ] Real-time updates (< 30 second delay)
- [ ] Visual referral tree display
- [ ] Admin dashboard restricted access
- [ ] Export functionality working
- [ ] Mobile-responsive charts

---

## 4. Non-Functional Requirements

### 4.1 Performance

**Requirement ID:** NFR-PERF-001  
**Priority:** P0

**Requirements:**
- Page load time < 3 seconds (desktop)
- Page load time < 5 seconds (mobile 3G)
- Map render time < 2 seconds with 1000+ markers
- Upvote action response < 1 second
- Smart contract actions confirm < 5 seconds
- Bridge transfers complete < 5 minutes (average)

### 4.2 Scalability

**Requirement ID:** NFR-SCALE-001  
**Priority:** P1

**Requirements:**
- Support 10,000 concurrent users
- Handle 100,000 daily active users
- Process 1,000 upvotes per minute
- Store 1M+ invite relationships
- Bridge 10,000 BLUX transactions per day

### 4.3 Security

**Requirement ID:** NFR-SEC-001  
**Priority:** P0

**Requirements:**
- Smart contracts audited before mainnet deployment
- Bridge multi-sig with 3/5 threshold
- Rate limiting on all API endpoints
- CSRF protection on all forms
- Secure session management
- Encrypted sensitive data at rest
- HTTPS only (no HTTP)
- Content Security Policy headers
- Regular security scans

### 4.4 Reliability

**Requirement ID:** NFR-REL-001  
**Priority:** P0

**Requirements:**
- 99.5% uptime SLA
- Graceful degradation if blockchain node down
- Failed bridge transactions auto-refund
- Session recovery after disconnect
- Error logging and monitoring
- Automated backups daily

### 4.5 Usability

**Requirement ID:** NFR-USE-001  
**Priority:** P1

**Requirements:**
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance
- Support for screen readers
- Keyboard navigation
- Multi-language support (English, Spanish, Portuguese priority)
- Clear error messages with recovery steps
- Progressive web app (PWA) capabilities

### 4.6 Compatibility

**Requirement ID:** NFR-COMP-001  
**Priority:** P1

**Browser Support:**
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

**Wallet Support:**
- Tonomy ID mobile app (iOS/Android)
- World Citizens Wallet (web/extension)
- Future: Hardware wallet support

---

## 5. User Stories & Use Cases

### 5.1 Epic: Invite a Friend

**As Alice (existing cXc user with BLUX),**  
**I want to invite my friend Bob to join cXc,**  
**So that we both earn BLUX rewards and Bob can discover local music.**

#### User Story 1: Sharing Invite Link
**Given** Alice is logged into cXc.world with her Tonomy ID  
**When** Alice clicks "Invite Friends" in her profile  
**Then** Alice sees her unique invite code: `alice.cxc`  
**And** Alice sees a "Share" button  
**When** Alice clicks "Share"  
**Then** Alice can share via:
- Copy link to clipboard
- Twitter
- WhatsApp
- Email
- Native mobile share sheet

#### User Story 2: Bob Joins via Invite
**Given** Bob receives Alice's invite link  
**When** Bob clicks the link  
**Then** Bob is directed to cXc onboarding flow  
**And** Alice's invite code is pre-filled  
**When** Bob completes Pangea Passport setup  
**Then** Bob's account is linked to Alice as referrer  
**And** Both Alice and Bob receive notification: "Congrats! You both earned 100 BLUX"

#### User Story 3: Bob Invites Carol (Downstream)
**Given** Bob has successfully joined via Alice's invite  
**When** Bob shares his invite code with Carol  
**And** Carol completes signup  
**Then** Bob earns 100 BLUX (direct invite reward)  
**And** Alice earns 50 BLUX (tier 2 downstream reward at 0.5x multiplier)  
**And** Alice sees updated stats: "2 total network invites"

### 5.2 Epic: Daily Upvoting

**As Carol (new user with phone verification),**  
**I want to upvote music I enjoy daily,**  
**So that I support local artists and influence charts.**

#### User Story 1: First Upvote
**Given** Carol has Pangea Passport with phone verification (Level 1)  
**And** Carol has 5 daily upvotes allocated  
**When** Carol opens cXc.world and finds a song she likes  
**And** Carol clicks the upvote (△) button  
**Then** The upvote is recorded on-chain  
**And** Carol sees confirmation: "Upvoted! 4 upvotes remaining today"  
**And** The song's rank increases on local chart

#### User Story 2: Using BLUX for Bonus Upvotes
**Given** Carol has used all 5 daily free upvotes  
**And** Carol has 150 BLUX in her wallet  
**When** Carol tries to upvote again  
**Then** Carol sees prompt: "Out of daily upvotes. Spend 10 BLUX for bonus upvote?"  
**When** Carol confirms  
**Then** 10 BLUX deducted from wallet  
**And** Bonus upvote applied  
**And** Carol sees: "Bonus upvote sent! 140 BLUX remaining"

#### User Story 3: Increasing Verification Level
**Given** Carol wants more daily upvotes  
**When** Carol clicks "Increase Daily Upvotes" in profile  
**Then** Carol is directed to Pangea Passport verification flow  
**When** Carol completes ID verification (Level 2)  
**Then** Carol's daily allocation increases to 10 upvotes  
**And** Carol receives welcome message: "You now get 10 upvotes per day!"

### 5.3 Epic: Bridging BLUX

**As Dave (WAX BLUX holder),**  
**I want to bridge my BLUX to Tonomy,**  
**So that I can use them on the new cXc platform.**

#### User Story 1: Initiating Bridge Transfer
**Given** Dave has 1,000 BLUX on WAX blockchain  
**When** Dave visits cXc.world bridge interface  
**And** Dave connects both WAX and Tonomy wallets  
**Then** Dave sees his WAX BLUX balance: 1,000  
**When** Dave enters amount: 500 BLUX  
**And** Dave clicks "Bridge to Tonomy"  
**Then** Dave confirms transaction in WAX wallet  
**And** Bridge contract locks 500 BLUX on WAX

#### User Story 2: Monitoring Transfer
**Given** Dave's bridge transfer is in progress  
**When** Dave views bridge status page  
**Then** Dave sees:
- ✓ Step 1: Locked on WAX (tx: 8f3a9d...)
- ⏳ Step 2: Awaiting confirmations (2/3)
- ⏱ Step 3: Minting on Tonomy (pending)
- Estimated time: 3 minutes

#### User Story 3: Transfer Complete
**Given** Bridge transfer confirmations complete  
**When** BLUX minted on Tonomy  
**Then** Dave receives notification: "Bridge complete!"  
**And** Dave's Tonomy BLUX balance updates: +500  
**And** Dave can now use BLUX on cXc.world for upvoting

---

## 6. Technical Specifications

### 6.1 Smart Contract Actions

#### Invite Contract (`invite.cxc`)

**ACTION:** `init`
```cpp
ACTION init(
    uint32_t daily_limit,
    uint32_t campaign_days,
    vector<asset> tier_rewards
);
```
- Initialize invite campaign configuration
- Set daily invite limits and reward structure
- Admin-only action

**ACTION:** `sendinvite`
```cpp
ACTION sendinvite(
    name inviter,
    name invited
);
```
- Record invite relationship
- Validate daily limits and verification
- Calculate and distribute rewards

**ACTION:** `claimreward`
```cpp
ACTION claimreward(
    name user,
    uint64_t reward_id
);
```
- Allow users to claim pending rewards
- Transfer BLUX from contract to user

**ACTION:** `updatestats`
```cpp
ACTION updatestats(
    name user
);
```
- Recalculate user's total network size
- Update tier multipliers
- Called automatically on new invites

**ACTION:** `resetdaily`
```cpp
ACTION resetdaily(
    name user
);
```
- Reset daily invite counter after 24 hours
- Automated or user-triggered

#### Bridge Contract (`bridge.cxc`)

**ACTION:** `initbridge`
```cpp
ACTION initbridge(
    name wax_account,
    name tonomy_account,
    vector<name> oracles
);
```
- Initialize bridge with cross-chain accounts
- Register oracle validators
- Admin-only action

**ACTION:** `lockwax`
```cpp
ACTION lockwax(
    name from,
    asset quantity,
    name tonomy_account,
    string memo
);
```
- Lock BLUX on WAX side
- Emit event for oracle detection
- Store pending transfer record

**ACTION:** `minttonomy`
```cpp
ACTION minttonomy(
    name to,
    asset quantity,
    checksum256 wax_tx_id
);
```
- Mint equivalent BLUX on Tonomy
- Requires oracle consensus
- Updates transfer status to "completed"

**ACTION:** `refund`
```cpp
ACTION refund(
    uint64_t transfer_id,
    string reason
);
```
- Refund failed bridge transfer
- Return locked BLUX to original account
- Log failure reason

#### Token Contract (`tokens.cxc`)

Standard `eosio.token` actions:
- `create`: Create BLUX token
- `issue`: Issue supply (bridge only)
- `transfer`: Transfer between accounts
- `retire`: Burn tokens (bridge unlock)

### 6.2 API Endpoints

#### RESTful API (Backend)

**Base URL:** `https://api.cxc.world/v1`

**Authentication:** Bearer token (JWT from Tonomy ID session)

**GET** `/user/:account`
```json
Response:
{
  "account": "alice.cxc",
  "did": "did:pangea:abc123",
  "verification_level": 2,
  "daily_upvotes": 10,
  "upvotes_remaining": 7,
  "last_reset": "2025-12-16T00:00:00Z",
  "invite_stats": {
    "direct_invites": 12,
    "total_network": 47,
    "blux_earned": 2340,
    "rank_percentile": 95
  }
}
```

**GET** `/user/:account/referrals`
```json
Response:
{
  "account": "alice.cxc",
  "direct_referrals": [
    {
      "account": "bob.cxc",
      "joined_date": "2025-11-15T12:34:56Z",
      "downstream_count": 8,
      "status": "verified"
    }
  ],
  "total_network_size": 47,
  "tier_breakdown": {
    "tier_1": 4,
    "tier_2": 16,
    "tier_3": 27,
    "tier_4": 0
  }
}
```

**POST** `/invite/redeem`
```json
Request:
{
  "inviter_code": "alice.cxc",
  "invited_account": "frank.cxc"
}

Response:
{
  "success": true,
  "transaction_id": "8f3a9d2b...",
  "rewards": {
    "inviter_reward": "100.0000 BLUX",
    "invited_reward": "50.0000 BLUX"
  }
}
```

**GET** `/bridge/status/:tx_id`
```json
Response:
{
  "transfer_id": 12345,
  "wax_tx_id": "8f3a9d2b...",
  "tonomy_tx_id": "4c7e1f9a...",
  "from_account": "dave.wax",
  "to_account": "dave.cxc",
  "amount": "500.0000 BLUX",
  "status": "completed",
  "initiated_at": "2025-12-16T10:15:00Z",
  "completed_at": "2025-12-16T10:18:23Z",
  "confirmations": 3
}
```

**POST** `/bridge/initiate`
```json
Request:
{
  "from_chain": "WAX",
  "to_chain": "TONOMY",
  "from_account": "dave.wax",
  "to_account": "dave.cxc",
  "amount": "500.0000 BLUX"
}

Response:
{
  "success": true,
  "transfer_id": 12346,
  "wax_tx_required": true,
  "lock_action": {
    "account": "bridge.cxc",
    "name": "lockwax",
    "data": {
      "from": "dave.wax",
      "quantity": "500.0000 BLUX",
      "memo": "TRANSFER_12346"
    }
  }
}
```

**GET** `/campaign/stats`
```json
Response:
{
  "campaign_start": "2025-06-16T00:00:00Z",
  "campaign_end": "2025-12-16T00:00:00Z",
  "days_remaining": 90,
  "total_signups": 12453,
  "verified_accounts": 8721,
  "invite_redemption_rate": 0.50,
  "blux_distributed": "1234567.8900 BLUX",
  "avg_invites_per_user": 2.3,
  "top_referrers": [
    {
      "account": "alice.cxc",
      "network_size": 347,
      "blux_earned": "45678.9000 BLUX"
    }
  ]
}
```

### 6.3 Frontend Components (React/jQuery)

#### InviteButton Component
```javascript
// Components/InviteButton.jsx
import React, { useState } from 'react';
import { shareInvite } from '../services/shareService';

function InviteButton({ userCode, userName }) {
    const [copying, setCopying] = useState(false);
    
    const inviteUrl = `https://music.cxc.world/invite/${userCode}`;
    const message = `Join me on cXc Music! Discover local music and earn rewards. Use my code: ${userCode}`;
    
    async function handleShare(method) {
        switch(method) {
            case 'copy':
                await navigator.clipboard.writeText(inviteUrl);
                setCopying(true);
                setTimeout(() => setCopying(false), 2000);
                break;
                
            case 'native':
                if (navigator.share) {
                    await navigator.share({
                        title: 'Join cXc Music',
                        text: message,
                        url: inviteUrl
                    });
                }
                break;
                
            case 'twitter':
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(inviteUrl)}`;
                window.open(twitterUrl, '_blank');
                break;
                
            case 'whatsapp':
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + inviteUrl)}`;
                window.open(whatsappUrl, '_blank');
                break;
        }
        
        // Track share event
        trackEvent('invite_share', { method, user: userName });
    }
    
    return (
        <div className="invite-button-group">
            <button 
                className="btn-primary"
                onClick={() => handleShare('native')}
            >
                Share Invite Code 🔺
            </button>
            
            <div className="share-options">
                <button onClick={() => handleShare('copy')}>
                    {copying ? '✓ Copied!' : '📋 Copy Link'}
                </button>
                <button onClick={() => handleShare('twitter')}>
                    🐦 Twitter
                </button>
                <button onClick={() => handleShare('whatsapp')}>
                    💬 WhatsApp
                </button>
            </div>
            
            <div className="invite-code-display">
                Your code: <code>{userCode}</code>
            </div>
        </div>
    );
}

export default InviteButton;
```

#### UpvoteAllocation Component
```javascript
// Components/UpvoteAllocation.jsx
import React, { useState, useEffect } from 'react';
import { getUserAllocation } from '../services/upvoteService';
import { formatTimeRemaining } from '../utils/time';

function UpvoteAllocation({ userAccount }) {
    const [allocation, setAllocation] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchAllocation() {
            try {
                const data = await getUserAllocation(userAccount);
                setAllocation(data);
            } catch (error) {
                console.error('Failed to fetch allocation:', error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchAllocation();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchAllocation, 30000);
        return () => clearInterval(interval);
    }, [userAccount]);
    
    if (loading) return <div>Loading upvotes...</div>;
    if (!allocation) return <div>Failed to load upvotes</div>;
    
    const percentUsed = (allocation.upvotes_used_today / allocation.daily_upvotes) * 100;
    const timeToReset = formatTimeRemaining(allocation.last_reset, 86400); // +24 hours
    
    return (
        <div className="upvote-allocation">
            <h3>Daily Upvotes</h3>
            
            <div className="upvote-meter">
                <div className="meter-bar">
                    <div 
                        className="meter-fill"
                        style={{ width: `${100 - percentUsed}%` }}
                    />
                </div>
                <div className="meter-labels">
                    <span className="remaining">
                        {allocation.daily_upvotes - allocation.upvotes_used_today}
                    </span>
                    <span className="total">
                        / {allocation.daily_upvotes}
                    </span>
                </div>
            </div>
            
            <p className="reset-time">
                Resets in: <strong>{timeToReset}</strong>
            </p>
            
            {allocation.verification_level < 4 && (
                <a href="/passport/verify" className="upgrade-link">
                    ⬆ Increase your daily limit
                </a>
            )}
            
            {allocation.upvotes_used_today >= allocation.daily_upvotes && (
                <div className="out-of-upvotes">
                    <p>Out of upvotes? Use BLUX for bonus upvotes!</p>
                    <button className="btn-secondary">
                        Buy 10 Upvotes (100 BLUX)
                    </button>
                </div>
            )}
        </div>
    );
}

export default UpvoteAllocation;
```

#### BridgeInterface Component
```javascript
// Components/BridgeInterface.jsx
import React, { useState, useEffect } from 'react';
import { initiateBridge, checkBridgeStatus } from '../services/bridgeService';

function BridgeInterface({ waxAccount, tonomyAccount }) {
    const [amount, setAmount] = useState('');
    const [waxBalance, setWaxBalance] = useState(0);
    const [bridging, setBridging] = useState(false);
    const [transferId, setTransferId] = useState(null);
    const [status, setStatus] = useState(null);
    
    async function handleBridge() {
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        setBridging(true);
        
        try {
            const result = await initiateBridge({
                from_chain: 'WAX',
                to_chain: 'TONOMY',
                from_account: waxAccount,
                to_account: tonomyAccount,
                amount: `${parseFloat(amount).toFixed(4)} BLUX`
            });
            
            setTransferId(result.transfer_id);
            
            // Start polling for status
            pollStatus(result.transfer_id);
            
        } catch (error) {
            console.error('Bridge failed:', error);
            alert('Bridge transfer failed. Please try again.');
            setBridging(false);
        }
    }
    
    async function pollStatus(id) {
        const interval = setInterval(async () => {
            const statusData = await checkBridgeStatus(id);
            setStatus(statusData);
            
            if (statusData.status === 'completed' || statusData.status === 'failed') {
                clearInterval(interval);
                setBridging(false);
            }
        }, 5000); // Poll every 5 seconds
    }
    
    return (
        <div className="bridge-interface">
            <h2>Bridge BLUX: WAX → Tonomy</h2>
            
            {!bridging ? (
                <div className="bridge-form">
                    <div className="form-group">
                        <label>From Chain</label>
                        <select disabled>
                            <option>WAX</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Amount (BLUX)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0000"
                            min="1"
                            step="0.0001"
                        />
                        <div className="balance">
                            Balance: {waxBalance.toFixed(4)} BLUX
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>To Chain</label>
                        <select disabled>
                            <option>Tonomy</option>
                        </select>
                    </div>
                    
                    <div className="bridge-info">
                        <div>Receive: {amount || '0.0000'} BLUX (estimated)</div>
                        <div>Fee: ~0.5 WAX</div>
                        <div>Time: ~3-5 minutes</div>
                    </div>
                    
                    <button 
                        className="btn-primary"
                        onClick={handleBridge}
                        disabled={!amount || parseFloat(amount) <= 0}
                    >
                        Bridge Tokens ➜
                    </button>
                </div>
            ) : (
                <BridgeStatus status={status} transferId={transferId} />
            )}
        </div>
    );
}

function BridgeStatus({ status, transferId }) {
    if (!status) {
        return <div>Initializing bridge transfer...</div>;
    }
    
    const steps = [
        { label: 'Tokens locked on WAX', key: 'locked' },
        { label: 'Waiting for confirmations', key: 'confirming' },
        { label: 'Minting on Tonomy', key: 'minting' },
        { label: 'Complete', key: 'completed' }
    ];
    
    function getStepStatus(step) {
        switch(status.status) {
            case 'locked': return step.key === 'locked' ? 'active' : 'pending';
            case 'confirming': return step.key === 'locked' ? 'complete' : step.key === 'confirming' ? 'active' : 'pending';
            case 'minting': return ['locked', 'confirming'].includes(step.key) ? 'complete' : step.key === 'minting' ? 'active' : 'pending';
            case 'completed': return step.key === 'completed' ? 'complete' : step.key === 'completed' ? 'active' : 'complete';
            default: return 'pending';
        }
    }
    
    return (
        <div className="bridge-status">
            <h3>Bridge Status: {status.status}</h3>
            
            <div className="status-steps">
                {steps.map((step, i) => (
                    <div key={i} className={`step step-${getStepStatus(step)}`}>
                        <div className="step-icon">
                            {getStepStatus(step) === 'complete' ? '✓' : 
                             getStepStatus(step) === 'active' ? '⏳' : '⏱'}
                        </div>
                        <div className="step-label">{step.label}</div>
                    </div>
                ))}
            </div>
            
            {status.wax_tx_id && (
                <div className="tx-link">
                    <a href={`https://wax.bloks.io/transaction/${status.wax_tx_id}`} target="_blank">
                        View WAX Transaction →
                    </a>
                </div>
            )}
            
            {status.status === 'completed' && (
                <div className="success-message">
                    <h4>✅ Bridge Complete!</h4>
                    <p>Your BLUX tokens are now available on Tonomy</p>
                    <button onClick={() => window.location.reload()}>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

export default BridgeInterface;
```

---

## 7. Implementation Phases

### Phase 1: Smart Contract Deployment (Week 1-2)

**Tasks:**
- [ ] Deploy `invite.cxc` contract to Pangea mainnet
- [ ] Deploy `bridge.cxc` contract to Pangea mainnet
- [ ] Deploy `tokens.cxc` contract to Pangea mainnet
- [ ] Initialize contracts with configuration
- [ ] Register oracle accounts for bridge
- [ ] Test all contract actions on testnet first
- [ ] Conduct security audit review
- [ ] Create multi-sig for admin actions

**Deliverables:**
- Deployed and initialized contracts
- Contract accounts: invite.cxc, bridge.cxc, tokens.cxc
- Multi-sig wallet configured
- Test transaction results

**Blockers/Dependencies:**
- Pangea team deployment access (Jack Tanner)
- Multi-sig co-signers identified
- Oracle infrastructure setup

### Phase 2: Tonomy ID Integration (Week 2-3)

**Tasks:**
- [ ] Install Tonomy ID SDK in cXc.world frontend
- [ ] Implement login/logout flows
- [ ] Integrate World Citizens Wallet support
- [ ] Fetch DID verification level on login
- [ ] Store session securely
- [ ] Handle authentication errors gracefully
- [ ] Test on mobile (iOS/Android)
- [ ] Test on desktop browsers

**Deliverables:**
- Working Tonomy ID authentication
- Session management
- DID level fetching
- Mobile deep linking

**Blockers/Dependencies:**
- Tonomy ID SDK documentation
- Test accounts on Pangea
- cXc.world staging environment

### Phase 3: Upvote Allocation System (Week 3-4)

**Tasks:**
- [ ] Implement smart contract upvote allocation logic
- [ ] Build frontend upvote display component
- [ ] Connect allocation to Pangea Passport levels
- [ ] Implement daily reset mechanism
- [ ] Add BLUX bonus upvote option
- [ ] Test allocation across all verification levels
- [ ] Add analytics tracking for upvotes

**Deliverables:**
- Daily upvote allocation working
- UI showing remaining upvotes
- BLUX bonus upvote flow
- Analytics tracking

**Blockers/Dependencies:**
- Phase 2 complete (authentication)
- Smart contracts deployed
- BLUX token available on Tonomy

### Phase 4: Invite System UI (Week 4-5)

**Tasks:**
- [ ] Build invite code redemption form
- [ ] Create shareable invite links
- [ ] Implement invite button components
- [ ] Build referral tree visualization
- [ ] Create user invite dashboard
- [ ] Add social media share integrations
- [ ] Test viral sharing flows
- [ ] Implement invite code validation

**Deliverables:**
- Invite redemption working
- Share buttons functional
- Referral dashboard live
- Social sharing tested

**Blockers/Dependencies:**
- Phase 1 complete (contracts)
- Phase 2 complete (auth)

### Phase 5: Bridge Interface (Week 5-6)

**Tasks:**
- [ ] Build bridge UI component
- [ ] Integrate WAX wallet connection
- [ ] Implement bridge initiation flow
- [ ] Build status polling system
- [ ] Add transaction history view
- [ ] Test bridge transfers (small amounts first)
- [ ] Add error handling and refunds
- [ ] Create bridge monitoring dashboard

**Deliverables:**
- Bridge UI functional
- WAX ↔ Tonomy transfers working
- Status tracking accurate
- Error handling robust

**Blockers/Dependencies:**
- Phase 1 complete (bridge contract)
- Oracle system operational
- WAX integration tested

### Phase 6: Onboarding Flow (Week 6-7)

**Tasks:**
- [ ] Design onboarding sequence
- [ ] Build progressive onboarding components
- [ ] Integrate invite code step
- [ ] Add tutorial overlays
- [ ] Create verification incentive prompts
- [ ] Test complete onboarding journey
- [ ] Add skip/resume functionality
- [ ] Mobile responsiveness testing

**Deliverables:**
- Complete onboarding flow
- Tutorial system
- Verification prompts
- Mobile-optimized experience

**Blockers/Dependencies:**
- Phases 2, 3, 4 complete

### Phase 7: Analytics & Admin Dashboard (Week 7-8)

**Tasks:**
- [ ] Build user invite performance dashboard
- [ ] Create admin campaign overview
- [ ] Implement real-time metrics
- [ ] Add referral tree visualization
- [ ] Build leaderboard (opt-in)
- [ ] Create export functionality
- [ ] Add monitoring alerts
- [ ] Test dashboard performance with load

**Deliverables:**
- User dashboard functional
- Admin dashboard with full metrics
- Export to CSV working
- Real-time updates operational

**Blockers/Dependencies:**
- All previous phases complete
- Significant user data to display

### Phase 8: Testing & Optimization (Week 8-9)

**Tasks:**
- [ ] End-to-end testing all user flows
- [ ] Performance testing (load, stress)
- [ ] Security testing and penetration testing
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Fix critical bugs
- [ ] Optimize slow queries/components

**Deliverables:**
- Test report with all findings
- Bug fixes deployed
- Performance benchmarks met
- Security vulnerabilities addressed

### Phase 9: Launch Preparation (Week 9-10)

**Tasks:**
- [ ] Create launch checklist
- [ ] Prepare marketing materials
- [ ] Set up monitoring and alerting
- [ ] Create user documentation
- [ ] Record tutorial videos
- [ ] Prepare support team
- [ ] Schedule launch announcement
- [ ] Coordinate with Pangea team

**Deliverables:**
- Launch ready system
- Documentation complete
- Marketing materials ready
- Support team trained

### Phase 10: Public Launch (Week 10)

**Tasks:**
- [ ] Go-live decision meeting
- [ ] Deploy to production
- [ ] Announce on social media
- [ ] Send email to waitlist
- [ ] Activate Telegram/Discord bots
- [ ] Monitor system closely
- [ ] Respond to user feedback
- [ ] Hot-fix any critical issues

**Deliverables:**
- Live cXc.world with Tonomy integration
- Active invite campaign
- User signups flowing
- Metrics being tracked

---

## 8. Success Metrics (KPIs)

### 8.1 User Acquisition

**Target:** 10,000 verified Pangea Passport users in 6 months

**Metrics:**
- Daily signups
- Invite redemption rate (target: >50%)
- Verification completion rate (target: >70%)
- Viral coefficient (target: >1.2)
- Average invites per user (target: >2.0)

### 8.2 Engagement

**Target:** 50% DAU/MAU ratio

**Metrics:**
- Daily active users (DAU)
- Monthly active users (MAU)
- Average upvotes per user per day
- Session duration (target: >5 minutes)
- Return rate (target: >40% after 7 days)

### 8.3 Token Economics

**Target:** 1M BLUX distributed in rewards

**Metrics:**
- Total BLUX earned through invites
- Total BLUX spent on bonus upvotes
- Bridge transaction volume
- BLUX holder count on Tonomy
- Average BLUX balance per user

### 8.4 Technical Performance

**Metrics:**
- Page load time (target: <3s)
- Smart contract response time (target: <5s)
- Bridge transfer time (target: <5 min avg)
- Uptime (target: 99.5%)
- Error rate (target: <0.1%)

### 8.5 Campaign Performance

**Top Referrer Leaderboard:**
- Track top 100 referrers by network size
- Reward top performers with bonus BLUX
- Public recognition (opt-in)

**Traffic Sources:**
- Telegram vs Discord vs Twitter vs Direct
- Optimize based on conversion rates
- Allocate marketing budget accordingly

---

## 9. Risk Management

### 9.1 Technical Risks

**Risk:** Smart contract vulnerabilities  
**Likelihood:** Medium  
**Impact:** Critical  
**Mitigation:**
- Conduct thorough security audit before mainnet
- Use established contract patterns (eosio.token)
- Implement emergency pause mechanism
- Bug bounty program post-launch
- Monitor transactions for anomalies

**Risk:** Bridge failure or loss of funds  
**Likelihood:** Low  
**Impact:** Critical  
**Mitigation:**
- Multi-sig approval for bridge operations
- Oracle consensus requirement (3/5)
- Test extensively on testnet
- Start with small transfer limits
- Implement auto-refund for failures
- Insurance fund for edge cases

**Risk:** Poor performance under load  
**Likelihood:** Medium  
**Impact:** High  
**Mitigation:**
- Load testing before launch
- CDN for static assets
- Database query optimization
- Caching layer for frequent queries
- Auto-scaling infrastructure
- Gradual rollout strategy

### 9.2 Business Risks

**Risk:** Low user adoption  
**Likelihood:** Medium  
**Impact:** High  
**Mitigation:**
- Strong marketing campaign
- Incentivize early adopters
- Leverage existing cXc user base
- Partner with influencers
- Regular community engagement
- Iterate based on feedback

**Risk:** Invite system abuse/sybil attacks  
**Likelihood:** Medium  
**Impact:** High  
**Mitigation:**
- Daily invite limits enforced
- Pangea Passport verification required
- Pattern detection and flagging
- Admin tools for manual review
- Adjust limits based on activity
- Community reporting system

**Risk:** Competitor launches similar system  
**Likelihood:** Low  
**Impact:** Medium  
**Mitigation:**
- First-mover advantage on Pangea
- Unique localized charts differentiation
- Strong community building
- Continuous feature innovation
- Partnership with Pangea team

### 9.3 Regulatory Risks

**Risk:** Token classified as security  
**Likelihood:** Low  
**Impact:** High  
**Mitigation:**
- Legal consultation on token design
- BLUX as utility token (upvoting)
- No investment promises
- Clear terms of service
- Compliance monitoring

**Risk:** Data privacy violations (GDPR, etc.)  
**Likelihood:** Low  
**Impact:** High  
**Mitigation:**
- Privacy policy compliance
- User data minimization
- Right to erasure implementation
- Cookie consent banners
- Data encryption at rest/transit

---

## 10. Milestone 3: cXc Video Preparation

### 10.1 Video Platform Overview

**Requirement ID:** M3-VID-001  
**Priority:** P1 (Milestone 3)  
**Timeline:** 4 months from Milestone 2 completion

**Description:**  
Extend cXc platform to support video content from major platforms (YouTube, TikTok, Instagram), using the same localized upvoting and discovery mechanics as cXc Music.

### 10.2 Video Platform Requirements

#### 10.2.1 Supported Video Sources

**YouTube Integration:**
- Users paste YouTube video URL
- Extract video metadata (title, description, creator)
- Embed YouTube player in cXc interface
- Display thumbnail on map
- Track upvotes separately from music

**TikTok Integration:**
- Support TikTok video links
- Extract creator, description
- Embed TikTok player
- Mobile-first display considerations

**Instagram Integration:**
- Support Instagram Reels and IGTV
- Extract metadata via Instagram API
- Embed player
- Handle auth requirements

**Technical Approach:**
- Use oEmbed protocol where available
- YouTube Data API v3
- TikTok oEmbed endpoint
- Instagram Graph API
- Fallback to web scraping (with limits)

#### 10.2.2 Video-Specific Features

**Separate Charts:**
```
cXc Video Charts Structure:

music.cxc.world → Music charts (existing)
video.cxc.world → Video charts (new)

Video categories:
- Educational
- Entertainment
- Documentary
- Vlogs
- Comedy
- Art & Animation
- News & Politics
- Sports
- Technology
- [User-suggested categories]
```

**Localized Video Discovery:**
- Videos pinned to location (where filmed/relevant)
- Filter by category and time range
- "Trending near me" video section
- Video-specific search

**Upvoting Mechanics:**
- Same BLUX-based upvote system
- Same daily allocation rules
- Separate upvote pools (music vs video) OR
- Shared upvote pool across content types (TBD)

**Creator Profiles:**
- Link to original platform profile
- Aggregate stats across platforms
- cXc-specific follower system
- Creator verification badges

#### 10.2.3 Data Model Extensions

```cpp
// TABLE: videos
struct video_record {
    uint64_t video_id;
    string platform;        // youtube, tiktok, instagram
    string external_id;     // Platform's video ID
    string url;             // Full URL
    string title;
    string description;
    name creator_account;   // cXc/Tonomy account
    string creator_name;    // Platform username
    string thumbnail_url;
    double latitude;
    double longitude;
    string location_name;
    string category;
    uint32_t upvote_count;
    time_point created_at;
    uint64_t primary_key() const { return video_id; }
};

// TABLE: video_upvotes
struct video_upvote {
    uint64_t upvote_id;
    uint64_t video_id;
    name user;
    asset blux_spent;       // 0 if free daily upvote
    time_point timestamp;
    uint64_t primary_key() const { return upvote_id; }
};
```

#### 10.2.4 UI/UX Adaptations

**Video Map Interface:**
```
Similar to music map, but:
- Video thumbnail previews on markers
- Play button overlay
- Video duration displayed
- Platform icon (YouTube/TikTok/Instagram)
- Auto-play on marker click (muted)
- Fullscreen option
```

**Video Submission Flow:**
```
1. User clicks "Add Video" on map
2. Paste video URL
3. System fetches metadata
4. User confirms location (or adjusts)
5. Select category
6. Submit → Video appears on map
```

**Mobile Optimizations:**
- Vertical video support (TikTok style)
- Swipe to next video
- Picture-in-picture while browsing map
- Offline video list caching

### 10.3 Implementation Requirements

**Phase 1: Video Backend (Month 1)**
- Develop video metadata extraction service
- Build video submission API
- Create video storage in database
- Implement video search and filtering
- Test with all three platforms

**Phase 2: Video Frontend (Month 2)**
- Build video map interface
- Create video player embeds
- Develop video submission UI
- Implement category filtering
- Mobile responsive design

**Phase 3: Video Charts & Discovery (Month 3)**
- Build localized video charts
- Create trending algorithms
- Implement video leaderboards
- Add creator profiles
- Video-specific analytics

**Phase 4: Testing & Launch (Month 4)**
- Beta testing with users
- Performance optimization
- Bug fixes
- Marketing campaign
- Public launch

### 10.4 Video Success Metrics

**Target:** 5,000 videos submitted in first 3 months

**KPIs:**
- Videos per day submission rate
- Video upvote engagement rate
- Cross-platform distribution (YT vs TT vs IG)
- Creator retention rate
- Video views driven by cXc
- User session time (video vs music)

---

## 11. Open Questions & Decisions Needed

### 11.1 Technical Decisions

**Q1: Should video and music share the same daily upvote pool or have separate allocations?**
- Option A: Shared pool (e.g., 10 upvotes/day for ANY content)
- Option B: Separate pools (e.g., 5 for music + 5 for video)
- Recommendation: Start with separate pools to encourage engagement with both

**Q2: What is the minimum Pangea Passport verification level to send invites?**
- Recommendation: Level 1 (phone verified) as minimum to prevent spam

**Q3: Should bridge support bi-directional transfers (Tonomy → WAX)?**
- Recommendation: Phase 1 = WAX → Tonomy only, Phase 2 = add reverse

**Q4: Should invite rewards be paid immediately or vested over time?**
- Recommendation: 50% immediate, 50% vested over 6 months to encourage retention

### 11.2 Business Decisions

**Q5: What is the exact tetrahedral reward formula and tier multipliers?**
- Need confirmation from Douglas Butner on specific multipliers
- Draft: Tier 1 = 1.0x, Tier 2 = 0.5x, Tier 3 = 0.25x, Tier 4 = 0.125x

**Q6: Should there be a cap on total BLUX that can be earned via invites per user?**
- Recommendation: Yes, cap at 100,000 BLUX per user for 6-month campaign

**Q7: What happens to unclaimed rewards after campaign ends?**
- Recommendation: 90-day grace period to claim, then returned to treasury

**Q8: Should top referrers receive bonus rewards or recognition?**
- Recommendation: Yes, top 10 referrers at end of campaign get bonus 10,000 BLUX each

### 11.3 Coordination with Pangea Team

**Q9: When will smart contracts be deployed to mainnet?**
- Status: Pending coordination with Jack Tanner

**Q10: What are the Pangea Passport API endpoints for verification level queries?**
- Need technical documentation from Tonomy Foundation

**Q11: Are there rate limits or quotas for DID verification queries?**
- Need clarification to design appropriate caching strategy

**Q12: Will Pangea provide promotional support for cXc launch?**
- Request: Blog post, social media promotion, featured in Tonomy ID app

---

## 12. Appendices

### Appendix A: Glossary

**BLUX:** Utility token used for upvoting and rewards on cXc platform

**DID:** Decentralized Identifier, part of Pangea Passport system

**Pangea Passport:** Self-sovereign identity system on Pangea blockchain with verification levels

**Tetrahedral Rewards:** Pyramid-based reward structure with 4 downstream tiers

**Tonomy ID:** Mobile wallet and authentication app for Pangea (formerly United Citizen Wallet)

**Upvote:** User action to support content, recorded on-chain

**Verification Level:** Tier of identity verification in Pangea Passport (0-4)

**World Citizens Wallet:** Web/browser extension wallet for Pangea

### Appendix B: Reference Links

**Grant Proposal:**  
https://docs.google.com/document/d/e/2PACX-1vTnp35wg2U5w-CH6IJCcHahE8b3lfh7RTn1x9gMBjnlPWSItBfG2a4Gjys3gQ8Msx3zEN5iEH9xDC4V/pub

**Milestone 1 Report:**  
https://docs.google.com/document/d/e/2PACX-1vRI2QTs_02nllg5LxuiEpT6yeP_IDCyeuCveV4oIJgxPYPmY-m4Iy12E60UZDAhy4s989WqnRdYPdPD/pub

**GitHub Repositories:**
- TonomyInvite: https://github.com/currentxchange/TonomyInvite
- Ant-Bridge-Contract: https://github.com/currentxchange/Ant-Bridge-Contract
- cXc Organization: https://github.com/currentxchange
- Tonomy Foundation: https://github.com/Tonomy-Foundation

**Live cXc Music:** https://cxc.world  
**Demo Video:** https://www.youtube.com/watch?v=_obJ2-nPFDA

**Community Channels:**
- Telegram: t.me/cXc_world
- Twitter: @CurrentXChange

### Appendix C: Contact Information

**Project Lead:**  
Douglas Butner  
Email: douglas@cxc.world  
Telegram: @godsolislove

**Pangea Integration Contact:**  
Jack Tanner (Tonomy Foundation)

---

## Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-16 | Analysis Team | Initial PRD creation |

**Approval:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | Douglas Butner | TBD | ___________ |
| Technical Lead | TBD | TBD | ___________ |
| Pangea Liaison | Jack Tanner | TBD | ___________ |

**Distribution:**
- [ ] Douglas Butner (cXc)
- [ ] Development Team
- [ ] Pangea/Tonomy Foundation
- [ ] Stakeholders

---

**END OF DOCUMENT**