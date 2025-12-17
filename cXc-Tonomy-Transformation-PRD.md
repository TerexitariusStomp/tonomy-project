# Product Requirements Document: cXc on Pangea & Tonomy Integration
## Adapting cXc.world for Pangea Web4 Passports & Cross-Chain Token Bridge

**Document Version:** 2.0  
**Date:** December 2025  
**Project:** cXc Music/Video on Pangea with Tonomy BLUX Bridge  
**Reference Sites:** https://music.cxc.world/ | https://tools.cxc.world/  
**Grant Proposal:** Pangea Grant Proposal - cXc.world Expansion  
**Milestone 1 Status:** ✅ COMPLETED (March 18, 2025)

---

## Executive Summary

This PRD documents the evolution of the cXc.world platform to integrate with **Pangea Web4 passports** and establish **cross-chain BLUX tokenomics** through the Tonomy bridge. Building on the successfully launched cXc Music Beta (with tokenized upvotes on WAX), this document outlines the technical roadmap to:

1. **Bring cXc Music to Pangea** with passport-based authentication and localized upvote mechanics
2. **Bridge BLUX tokens** between WAX and Tonomy blockchains using existing bridge infrastructure
3. **Launch cXc Video** on Pangea supporting YouTube, TikTok, and Instagram content
4. **Modernize existing tech stack** while preserving proven geospatial database and core systems

**Already Completed (Milestone 1 - March 2025):**
- ✅ cXc Music Beta launched at cXc.world with tokenized upvotes on WAX
- ✅ Localized content search and geospatial database integration
- ✅ Time-sorted charts with filtering by time spans
- ✅ TonomyInvite smart contract for 6-month free upvote gamification
- ✅ Ant-Bridge-Contract for BLUX token bridging to Tonomy

**Key Objectives (Remaining Milestones):**
- Integrate Pangea Web4 passport (DID) authentication system
- Implement passport-level-gated upvote distribution (per Pangea resource model)
- Launch cXc Video on Pangea (YouTube, TikTok, Instagram integration)
- Establish Tonomy as alternate blockchain settlement layer for BLUX
- Scale geospatial database to support global video and music content

---

## 1. ARCHITECTURE & EXISTING INFRASTRUCTURE

### 1.1 Current Production Systems (Live & Proven)

**Frontend Stack (cXc.world Beta - Live):**
- jQuery + Leaflet for interactive mapping
- Custom geospatial UI built by cXc team
- Live at https://music.cxc.world/

**Backend Infrastructure (Proven, Production-Grade):**
- **Primary Database:** MariaDB Global System (custom geospatial database)
  - Covers all nations and regions (top-level administrative districts) globally
  - Eliminates reliance on third-party APIs for geographic data
  - Optimized for localized content queries
- **Application Layer:** PHP backend + Node.js services
- **Job Queue:** bree.js for scheduled services
- **Status:** Currently handling live cXc Music traffic

**Smart Contracts (Deployed & Live):**
- Ups Content Curation Contracts: https://github.com/currentxchange/ups
- Media NFT Standards: https://github.com/currentxchange/WAX-NFT-Metadata-Standards
- Leveled NFT staking system: https://github.com/currentxchange/loot
- TonomyInvite contract (gamified referral system): https://github.com/currentxchange/TonomyInvite
- Ant-Bridge-Contract (BLUX token bridge): https://github.com/currentxchange/Ant-Bridge-Contract

**Blockchains Currently Integrated:**
- WAX (production - cXc Music upvotes live)
- Tonomy (bridge contracts compiled, pending Jack Tanner deployment)

### 1.2 Milestone Roadmap

**Milestone 1: ✅ COMPLETED (March 18, 2025)**
- ✅ Beta version launched with tokenized upvotes on WAX
- ✅ Localized content + charts by upvotes
- ✅ Time-based upvotes with filtering
- ✅ TonomyInvite smart contract deployed
- ✅ BLUX bridge contract to Tonomy ready

**Milestone 2: IN PROGRESS (Target: ~2 months from M1)**
- Pangea Web4 passport authentication integration
- Upvote distribution gated by DID verification level (per Pangea resource allocation model)
- Tiered release for invite program (6-month free upvotes on Tonomy)
- Panegea-specific upvote mechanics

**Milestone 3: PLANNED (Target: ~4 months from M1)**
- cXc Video launch on Pangea
- Support for YouTube, TikTok, Instagram content
- Passport-holder daily upvote claims for video content

### 1.3 Architecture for Pangea & Tonomy Integration

```
Current cXc.world Stack:
├── Frontend (jQuery + Leaflet)
│   ├── Map visualization (interactive.js)
│   ├── Upvote UI components
│   ├── Content posting interface
│   └── User profile/dashboard
│
├── Backend (PHP + Node.js)
│   ├── MariaDB (geospatial queries)
│   ├── API endpoints (content, charts, locations)
│   ├── bree.js scheduled tasks
│   └── Authentication layer
│
├── Blockchains
│   ├── WAX (primary - live upvotes)
│   ├── Tonomy (bridge target - under deployment)
│   └── Pangea (new integration target - Milestone 2)
│
└── Smart Contracts
    ├── Ups (curation)
    ├── Media NFT Standards
    ├── Loot (NFT staking)
    ├── TonomyInvite (referral gamification)
    └── Ant-Bridge (BLUX bridging)

Enhancement Points for Pangea/Tonomy:
├── Add Pangea Passport (DID) Authentication
│   ├── World Citizens Wallet integration
│   ├── Verification level checking
│   └── Resource allocation alignment
│
├── Extend Bridge Infrastructure
│   ├── WAX ↔ Tonomy BLUX bridge (live)
│   ├── WAX/Tonomy ↔ Pangea BLUX bridge (new)
│   └── Cross-chain settlement layer
│
├── Video Content Support
│   ├── YouTube integration
│   ├── TikTok integration
│   ├── Instagram integration
│   └── Video-specific upvote mechanics
│
└── Scale Geospatial Database
    ├── Video content indexing
    ├── Multi-content-type filtering
    ├── Enhanced query optimization
    └── Region-specific isolation (if needed)
```

### 1.4 Technology Stack Recommendations (Upgrades, not replacement)

**Frontend Modernization (Optional, Backward-Compatible):**
- Keep jQuery + Leaflet as primary (proven production-grade)
- Consider React/TypeScript layer over existing components (phased migration)
- Add Pangea Web4 Wallet integration components
- Maintain mobile-first responsive design

**Backend Enhancements:**
- Maintain PHP + MariaDB core (proven at scale)
- Add Node.js microservices for:
  - Pangea passport verification
  - Token bridge monitoring
  - Real-time upvote processing
  - Video content ingestion
- Add Redis caching layer for:
  - Passport verification results (TTL)
  - Real-time upvote counts
  - Chart rankings (by time slice)
  - Session management

**Blockchain Integration Layer (New):**
- Pangea SDK for passport verification
- Tonomy bridge monitoring (automated)
- WAX integration (existing, proven)
- Multi-chain transaction tracking
- Cross-chain settlement reconciliation

**Database Enhancements (Not Replacement):**
- Extend MariaDB schema for video content types
- Add video platform metadata indexing
- Enhance geospatial query performance for video
- Add blockchain transaction linking tables

---

## 2. CORE FEATURES & ENHANCEMENTS

### 2.1 Time-Based Upvote System (Live - Enhance for Pangea)

**Current Implementation (WAX - Production):**
- Users can upvote once per 5-minute window
- Upvotes are filtered by time spans
- Charts show top content within selected time periods
- Time filtering at multiple levels: All Time, Year, Month, Week, Day, 5 Minutes

**Existing Data Model:**
```
Upvote:
- content_id: string
- voter_account: string
- timestamp: Date
- tu_block: number (5-minute block number since epoch)
- location: GeoLocation (optional, for regional upvotes)

Content:
- id: string
- creator: string
- title: string
- platform: 'music' | 'video'
- content_sources: {youtube?, spotify?, soundcloud?, tiktok?, instagram?}
- location: GeoLocation
- created_at: Date
- stats: {upvotes: number, visibility: number}
```

**Pangea Integration Points (Milestone 2):**
- Tie upvote allowance to DID verification level (per Pangea resource model)
- Daily upvote budget based on passport level
- Real-time upvote distribution from Pangea contract
- Cross-chain upvote recording (WAX, Tonomy, Pangea chains)
- Synchronized charts across all chains

**Implementation Requirements:**
```typescript
interface PangeaVerificationLevel {
  did: string;
  verificationLevel: 0 | 1 | 2 | 3 | 4; // Pangea levels
  dailyUpvotes: number; // Calculated per level
  lastResetDate: Date;
  remainingUpvotes: number;
}

interface CrossChainUpvote {
  localId: string;
  voter: string;
  content: string;
  timestamp: Date;
  chains: {
    wax?: string; // tx hash on WAX
    tonomy?: string; // tx hash on Tonomy
    pangea?: string; // tx hash on Pangea
  };
  syncStatus: 'pending' | 'partial' | 'confirmed' | 'failed';
}
```

### 2.2 Gamified Invite System (TonomyInvite - Live)

**Current Implementation (Deployed on Tonomy):**
- Tetrahedral reward structure for referral chains
- Upstream multipliers based on referral depth
- 6-month promotional period for free upvotes
- BLUX token distribution to invitees
- Contract deployed and awaiting launch at invite.cxc on Tonomy

**Tetrahedral Reward Series Mechanics:**
- Layer 1: Direct invitee (base reward)
- Layer 2: Invitee's invitees (multiplied rewards)
- Layer 3: Secondary downstream (further multiplied)
- Layer 4: Tertiary downstream (peak multiplier)
- Rewards calculated based on new member activation and participation

**Existing Smart Contract:**
- GitHub: https://github.com/currentxchange/TonomyInvite
- Status: Compiled WASM passed to Jack Tanner for deployment
- Deployment Target: invite.cxc on Tonomy
- Token Contract Target: tokens.cxc on Tonomy

**Pangea Integration Points (Milestone 2):**
- Extend invite system to Pangea network
- Link invites to DID verification completion
- Milestone reward for passport completion (bonus BLUX)
- Gamified passport level progression (rewards at each level)
- Cross-chain invite tracking (can invite on any chain, activate on any)

### 2.3 Token Economics & BLUX Bridge (Live)

**Current Token Implementation:**
- **BLUX:** Primary platform token
  - Earned through upvoting on content
  - Used for boosting content to top charts (costs BLUX)
  - Tradeable on Alcor DEX (WAX-based)
  - Transferable between users

**Current Bridge Implementation (Ant-Bridge-Contract):**
- Live contract: https://github.com/currentxchange/Ant-Bridge-Contract
- Compiled WASM deployed to WAX
- Bridges BLUX from WAX to Tonomy
- 1:1 token transfer via locking/minting mechanism
- Status: Ready for Tonomy deployment

**Existing Smart Contract Functions:**
```cpp
// Transfer BLUX between users (on WAX)
[[eosio::action]] void transfer(name from, name to, asset quantity);

// Bridge BLUX to Tonomy
[[eosio::action]] void bridgeout(name user, asset quantity);

// Receive bridged BLUX from Tonomy
[[eosio::action]] void bridgein(name user, asset quantity);
```

**Pangea Integration Points (Milestone 2):**
- Extend bridge to support Pangea blockchain
- Three-way bridge: WAX ↔ Tonomy ↔ Pangea
- Cross-chain BLUX settlement
- Arbitrage prevention mechanisms
- Token supply tracking across chains

**Enhanced Data Model for Multi-Chain:**
```typescript
interface BLUXBalance {
  account: string;
  chain: 'wax' | 'tonomy' | 'pangea';
  balance: number;
  lastUpdated: Date;
  transactionHistory: ChainTransaction[];
}

interface CrossChainBridgeTransaction {
  id: string;
  from: {chain: string; account: string};
  to: {chain: string; account: string};
  amount: number;
  status: 'initiated' | 'locked' | 'minted' | 'confirmed' | 'failed';
  initiatedAt: Date;
  completedAt?: Date;
  txHashes: {source?: string; destination?: string};
}
```

### 2.4 Content Posting System (Music - Live, Video - Milestone 3)

**Music Content (Currently Live):**
- YouTube as primary source (channel earns upvotes)
- Spotify integration (song links)
- SoundCloud integration (track links only, not playlists)
- Geolocation tagging (where song was recorded)
- Metadata: Genre, Mood, Format
- Audio NFT creation via Atomic Assets templates

**Existing Features:**
- YouTube channel verification (Google OAuth)
- Multi-link posting (one song across platforms)
- Location-based curation on map
- NFT minting from music metadata
- Content visibility tracking

**Video Content (Milestone 3 - Planned):**
- YouTube channel integration
- TikTok video linking (trending video curations)
- Instagram Reels support
- Video platform account verification
- Per-platform metadata extraction
- Video-specific upvote mechanics

**Enhanced Data Model:**
```typescript
interface Content {
  id: string;
  type: 'music' | 'video';
  creatorAccount: string;
  creatorChannel: {
    platform: 'youtube' | 'spotify' | 'soundcloud' | 'tiktok' | 'instagram';
    channelId: string;
    verified: boolean;
    verifiedAt: Date;
  };
  
  metadata: {
    title: string;
    description: string;
    genre: string;
    mood: string;
    format: string; // for music
    recordedAt: GeoLocation;
    duration: number;
    thumbnail: string;
  };
  
  sources: {
    youtube?: string;
    spotify?: string;
    soundcloud?: string;
    tiktok?: string;
    instagram?: string;
  };
  
  stats: {
    upvotes: {wax?: number; tonomy?: number; pangea?: number};
    bluxBoosted: number;
    nftsMinted: number;
    engagement: {views: number; plays: number; shares: number};
  };
  
  visibility: 'public' | 'private' | 'verified-only' | 'passport-level-gated';
  createdAt: Date;
  postedAt: {wax: Date; tonomy?: Date; pangea?: Date};
}
```

### 2.5 Interactive Geospatial Map (Live - Enhanced for Video)

**Current Implementation (Live with Music):**
- Leaflet-based interactive mapping
- Global coverage (all nations and regions)
- Clickable location points showing content
- Zoom/pan interactions
- Filtering by:
  - Genre
  - Mood  
  - Time range (All Time, Year, Month, Week, Day, 5 Minutes)
  - Location (administrative district, region, nation)
  - Verification level (Pangea passports - new)

**MariaDB Geospatial Queries (Proven at Production):**
- ST_Contains() for regional containment
- ST_Distance() for proximity searches
- ST_Intersects() for boundary queries
- Indexed geographic hierarchies (nations → regions → districts)
- Custom administrative boundary definitions

**Pangea Enhancements:**
- Add video content layer to map
- Content type filtering (music vs video)
- Verification level density heatmaps
- Cross-chain upvote visualization
- Regional competition leaderboards (Pangea passport holders only for some tiers)

**Performance Optimizations Required:**
- Tile-based map rendering (fewer queries at zoom)
- Redis caching for popular regions
- Asynchronous data loading
- Connection pooling for MariaDB

### 2.6 Localized Competition System (Live - Core Differentiator)

**How It Works (Current):**
1. Content is posted to a specific geographic location
2. Multiple pieces of content compete within that region
3. Upvotes within a time period determine rankings
4. Top content "wins" the region for that time period
5. Rankings cascade: District → Region → Nation → Global

**Fractal Chart Structure (Daily Reset):**
- Time-span specific: 5-min, Daily, Weekly, Monthly, Yearly, All-Time
- Geographic cascading: each region inherits/aggregates from sub-regions
- Permanent records: all historical positions immortalized on-chain
- Creator rewards: artists compensated based on chart positions

**Pangea Integration:**
- Passport verification tier bonus (higher levels = more competition visibility)
- Regional isolation options (some regions locked to passport holders)
- Localized BLUX rewards (based on regional upvote participation)
- Governor/admin passport level can pin announcements

```typescript
interface LocalizedChart {
  id: string;
  region: GeoRegion; // nation, state, city, district
  timeSpan: '5min' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all-time';
  content: {
    rank: number;
    contentId: string;
    upvotesInPeriod: number;
    creatorAccount: string;
    creatorLevel: number; // Pangea passport level
  }[];
  calculatedAt: Date;
  frozenAt?: Date; // Time period ended, chart locked
  chainRecords: {
    wax?: string; // tx hash storing proof
    tonomy?: string;
    pangea?: string;
  };
}

---

## 3. USER INTERFACE & EXPERIENCE

### 3.1 Current cXc.world Design (Proven, Live)

**Visual Identity:**
- Dark theme with custom accent colors
- Emoji-enhanced UI (aligns with cXc brand)
- Responsive design (mobile-first)
- Icon-based navigation
- Real-time status indicators
- Leaflet map as primary focal point

**Key UI Elements:**
- Interactive geospatial map (Leaflet)
- Time filter controls (All Time, Year, Month, Week, Day, 5 Minutes)
- Content cards showing upvotes
- Genre/mood tags
- Notification system
- User profile display

### 3.2 Core Pages/Screens (Current + Enhancements for Pangea)

**Dashboard / Home**
- **Current:** Welcome screen, quick links to features
- **Pangea Enhancement:** 
  - Add passport status widget (level, DID verification status)
  - Display daily upvote remaining count
  - Show cross-chain balance (BLUX on WAX, Tonomy, Pangea)
  - Highlight invite code redemption CTA (first-time users)

**Interactive Map (Primary Feature)**
- **Current:** Clickable locations showing music content
- **Preserved:** All existing functionality
- **Pangea Enhancements:**
  - Add verification level filter (show/hide unverified content)
  - Display regional competition status (passport holders only)
  - Cross-chain upvote indicators (shows which chains content has been voted on)
  - Video layer toggle (when M3 launches)

**Content Posting**
- **Current (Music):** Multi-link posting (YouTube, Spotify, SoundCloud), location tagging
- **Preserved:** All music posting functionality
- **Pangea Enhancements:**
  - Show passport level requirement for posting (if any)
  - Display earning potential (BLUX per upvote)
  - Cross-chain posting option (select which chains to post to)
- **Milestone 3 (Video):** Add video URL input, platform selection

**Upvote Interface**
- **Current:** Click to upvote, upvote count display
- **Preserved:** Core interaction
- **Pangea Enhancements:**
  - Show daily upvote remaining count
  - Disable upvote button if out of upvotes with UI explanation
  - Display "reset in X hours" if daily budget exhausted
  - Show upvote sources (which chains synced)

**User Profile**
- **Current:** Account info, content created, upvotes given
- **Preserved:** Core profile data
- **Pangea Enhancements:**
  - Display Pangea passport level & verification status
  - Show DID information (if user consents)
  - Multi-chain BLUX balances (WAX, Tonomy, Pangea)
  - Invite code display & invitee tracking
  - Invited members list with status (pending, verified, earning rewards)

**Charts & Leaderboards**
- **Current:** Top 64 by time range and location
- **Preserved:** All existing chart logic
- **Pangea Enhancements:**
  - Passport level-specific charts (top content by verified creators)
  - Regional charts (nation, state, district level)
  - Permanent historical records (show past winners)
  - Cross-chain chart synthesis (combines upvotes from all chains)

**Invite System (New UI for M2)**
- **For New Users:**
  - Prominent invite code input field
  - "Don't have a code?" → Link to Telegram/Discord for codes
  - Clear description of 6-month free upvotes benefit
  - Passport completion progress (visual steps)
  
- **For Existing Users:**
  - "Share Your Invite Code" widget
  - Referral tracking dashboard
  - Rewards breakdown (Tetrahedral structure visualization)
  - Leaderboard (top inviters by rewards earned)
  - Milestone completion bonuses display

**Passport Authentication Screen (New for M2)**
- World Citizens Wallet login option
- DID verification level display
- Link to passport completion if incomplete
- Quick setup guide for new users
- One-click verification level check

### 3.3 Navigation Structure (Current + Enhancements)

```
Navigation Tree:
├── Home/Dashboard
│   ├── Quick stats (passport level, daily upvotes, BLUX balance)
│   ├── Recent activity
│   └── Quick action buttons
│
├── Music Map (Primary)
│   ├── Interactive Leaflet map
│   ├── Filters
│   │   ├── Genre
│   │   ├── Mood
│   │   ├── Time Range
│   │   ├── Verification Level [NEW - Pangea]
│   │   └── Content Type (Music | Video) [NEW - M3]
│   ├── Results display
│   ├── Content cards
│   └── Time controls
│
├── Add Content
│   ├── Music Posting [Existing]
│   │   ├── Multi-link input (YouTube, Spotify, SoundCloud)
│   │   ├── Location tagging
│   │   ├── Metadata (Genre, Mood, Format)
│   │   └── NFT creation option
│   │
│   └── Video Posting [M3]
│       ├── Video link input (YouTube, TikTok, Instagram)
│       ├── Location tagging
│       ├── Metadata extraction
│       └── NFT creation option
│
├── Charts & Leaderboards
│   ├── Time period selector (5 min, daily, weekly, etc.)
│   ├── Geographic level selector (Global, Nation, Region, District)
│   ├── Content type filter (Music | Video)
│   ├── Top 64 display
│   ├── Historic winners archive
│   └── Creator stats
│
├── Invite System [NEW - M2]
│   ├── Redeem Invite Code [for new users]
│   ├── Share Your Code [for existing users]
│   ├── Referral Tracking
│   ├── Rewards Dashboard
│   ├── Leaderboard (top inviters)
│   └── Milestone Bonuses
│
├── Profile
│   ├── Account Settings
│   ├── Passport Status [NEW - M2]
│   │   ├── Verification Level
│   │   ├── DID Display
│   │   └── Link to World Citizens Wallet
│   ├── BLUX Holdings [NEW - Multi-chain]
│   │   ├── WAX Balance
│   │   ├── Tonomy Balance
│   │   └── Pangea Balance [NEW - M2]
│   ├── Content Created
│   ├── Upvotes Given
│   ├── NFT Collections
│   ├── Creator Stats
│   ├── Invite Code & Referrals [NEW - M2]
│   └── Privacy Settings
│
└── Settings/Help
    ├── FAQs
    ├── How to Get Invite Code
    ├── Passport Completion Guide [NEW - M2]
    ├── Bridge & Multi-Chain Help [NEW - M2]
    ├── Support Contact
    └── About cXc
```

### 3.4 Responsive Design Principles

- **Mobile First:** All features accessible on phones
- **Tablet:** Optimized touch interactions
- **Desktop:** Full feature access, map dominance
- **Map Priority:** Geospatial content always featured
- **Performance:** Sub-2s load times across devices

### 3.5 Accessibility

- WCAG 2.1 compliance (Level AA minimum)
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode option
- Emoji use supplemented with text labels

---

## 4. PANGEA & TONOMY BLOCKCHAIN INTEGRATION

### 4.1 Pangea Web4 Passport System (Milestone 2)

**Integration Requirement:**
- Implement Pangea passport (DID) verification into cXc authentication flow
- Use World Citizens Wallet for login
- Map verification levels to upvote allowances

**Verification Levels (From Pangea Resource Model):**
```
Level 0: Unverified - Limited access
Level 1: Basic verification - 10 upvotes/day
Level 2: Intermediate verification - 25 upvotes/day
Level 3: Advanced verification - 50 upvotes/day
Level 4: Full verification - 100+ upvotes/day (+ governance rights)
```

**Pangea SDK Integration Points:**
```typescript
// Verify DID status
async function verifyPassport(did: string): Promise<PassportStatus> {
  const verification = await pangeaSDK.verifyDID(did);
  return {
    level: verification.level,
    verified: verification.verified,
    lastUpdated: verification.lastUpdated,
    upvoteAllowance: calculateUpvoteAllowance(verification.level)
  };
}

// Check current verification level
async function getUserVerificationLevel(did: string): Promise<number> {
  const passport = await pangeaSDK.getPassport(did);
  return passport.verificationLevel;
}

// Fetch verification requirements for next level
async function getNextLevelRequirements(currentLevel: number): Promise<Requirement[]> {
  return await pangeaSDK.getLevelRequirements(currentLevel + 1);
}
```

**Authentication Flow (New for M2):**
1. User arrives at cXc.world
2. Click "Login with Pangea" / "World Citizens Wallet"
3. Wallet opens passport verification
4. Return to cXc with DID + verification level
5. Create/update cXc user record with DID link
6. Display passport level + daily upvote allowance

### 4.2 Cross-Chain BLUX Bridge (Milestone 2)

**Current Bridge Infrastructure (Milestone 1 - Live):**
- WAX → Tonomy bridge (Ant-Bridge-Contract)
- 1:1 token transfer via lock/mint mechanism
- Deployed and awaiting activation

**Milestone 2 Bridge Extension:**
- Extend bridge to support Pangea blockchain
- Create three-way bridge: WAX ↔ Tonomy ↔ Pangea
- All bridges maintain 1:1 peg (total supply constant)

**Bridge Contract Functions (Proposed):**
```cpp
// Bridge BLUX from WAX to Tonomy or Pangea
[[eosio::action]] void bridgeout(name user, asset quantity, string targetChain);

// Bridge BLUX from Tonomy or Pangea back to WAX
[[eosio::action]] void bridgein(name user, asset quantity, string sourceChain);

// Internal bridge transfer between Tonomy and Pangea
[[eosio::action]] void relaybridge(name user, asset quantity, string fromChain, string toChain);

// Check bridge status and balances
[[eosio::action]] void getbridgestatus(string bridgeName);
```

**Bridge Architecture:**
```
WAX Network              Tonomy Network           Pangea Network
┌─────────────┐         ┌──────────────┐        ┌──────────────┐
│  BLUX Token │◄───────►│ BLUX Bridge  │◄──────►│ BLUX Bridge  │
│  (Primary)  │         │  (Locked)    │        │  (Locked)    │
└─────────────┘         └──────────────┘        └──────────────┘
       ▲                                               ▲
       │                                               │
    Total Supply = 100M BLUX (constant across all chains)
    WAX: 40M actual + 30M locked in bridge = 70M
    Tonomy: 20M actual + 10M locked in bridge = 30M
    Pangea: 0M initial → grows as M2 completes
```

**Bridge Deployment Schedule (M2):**
- Week 1: Develop Pangea bridge contract
- Week 2: Deploy bridge to Pangea testnet
- Week 3-4: Testing and security review
- Week 5-6: Mainnet deployment

**Bridge Monitoring Service (Backend):**
```typescript
// Monitor bridge transactions
async function monitorBridgeTransaction(txHash: string, sourceChain: string): Promise<BridgeStatus> {
  const status = await blockchainClients[sourceChain].getTransaction(txHash);
  
  if (status.confirmed) {
    // Execute corresponding action on destination chain
    await executeBridgeAction(sourceChain, status.destination, status.amount);
  }
  
  return status;
}

// Reconcile balances across chains
async function reconcileBalances(): Promise<AuditReport> {
  const wasBLUX = await getChainBalance('wax', 'blux');
  const tonomyBLUX = await getChainBalance('tonomy', 'blux');
  const pangeaBLUX = await getChainBalance('pangea', 'blux');
  
  const totalSupply = wasBLUX + tonomyBLUX + pangeaBLUX;
  
  if (totalSupply !== EXPECTED_TOTAL_SUPPLY) {
    console.error('CRITICAL: Supply mismatch detected');
    // Trigger emergency halt
  }
  
  return {valid: totalSupply === EXPECTED_TOTAL_SUPPLY, totals: {wax: wasBLUX, tonomy: tonomyBLUX, pangea: pangeaBLUX}};
}
```

### 4.3 Existing Smart Contracts (Live & Operational)

**Ups Content Curation Contract**
- GitHub: https://github.com/currentxchange/ups
- Status: Live on WAX
- Function: Core upvoting mechanism
- Enhancement for M2: Extend to support multi-chain upvoting

**Media NFT Standards**
- GitHub: https://github.com/currentxchange/WAX-NFT-Metadata-Standards
- Status: Live on WAX
- Function: Define NFT metadata for music/video content
- Enhancement for M2: Support Pangea NFT standards (if different)

**Leveled NFT Staking (Loot)**
- GitHub: https://github.com/currentxchange/loot
- Status: Live on WAX
- Function: Allow users to stake NFTs for additional rewards
- Enhancement for M2: Optional staking reward boost for passport holders

**TonomyInvite Contract (M1 Completed)**
- GitHub: https://github.com/currentxchange/TonomyInvite
- Status: Compiled, awaiting deployment at invite.cxc
- Function: Gamified 6-month invite program with Tetrahedral rewards
- Deployment: Pending Jack Tanner (Tonomy team)

**Ant-Bridge Contract (M1 Completed)**
- GitHub: https://github.com/currentxchange/Ant-Bridge-Contract
- Status: Compiled, awaiting deployment on Tonomy
- Function: Bridge BLUX from WAX to Tonomy
- Deployment: Pending Jack Tanner (Tonomy team)
- Extension: Add Pangea bridge support (M2)

### 4.4 Multi-Chain Upvote System (Milestone 2)

**How Multi-Chain Upvoting Works:**
1. User votes on content at cXc.world
2. Backend checks user's chain preference (WAX, Tonomy, or Pangea)
3. Vote submitted to selected blockchain
4. Vote stored in database with chain reference
5. Content stats aggregated across all chains

**Data Synchronization (Important):**
- Each blockchain maintains independent upvote state
- Database acts as source of truth for UI display
- Cross-chain upvote totals calculated real-time
- Historical records immutable on-chain

**User's Chain Selection (M2 UX):**
- Default: Auto-select based on user's passport location
- Override: Allow user to choose (WAX, Tonomy, Pangea)
- Display: Show which chains they can vote on
- Incentive: Small rewards for voting on less-used chains

**Backend Implementation:**
```typescript
async function submitUpvote(userId: string, contentId: string, chainPreference: string) {
  // Verify user's daily upvote allowance
  const allowance = await getUserUpvoteAllowance(userId);
  if (!allowance.hasRemaining()) {
    throw new Error('Daily upvote limit reached');
  }
  
  // Determine which chain to use
  const targetChain = chainPreference || determineOptimalChain(userId);
  
  // Submit to blockchain
  const txHash = await blockchainClients[targetChain].upvote(userId, contentId);
  
  // Record in database
  await database.upvotes.create({
    contentId,
    voter: userId,
    chain: targetChain,
    txHash,
    timestamp: new Date()
  });
  
  // Decrement user's daily allowance
  await decrementUpvoteAllowance(userId);
  
  // Update content stats in real-time
  await updateContentStats(contentId);
  
  return {txHash, chain: targetChain, remainingToday: allowance.remaining() - 1};
}
```

### 4.5 Contract Deployment & Testing

**Testnet Validation (M2 Pre-Launch):**
- [ ] Deploy all contracts to Pangea testnet
- [ ] Test bridge mechanics with test BLUX
- [ ] Verify passport verification works
- [ ] Load test with simulated traffic
- [ ] Security audit
- [ ] Documentation review

**Mainnet Deployment (M2 Launch):**
- [ ] Contracts deployed to Pangea mainnet
- [ ] Bridge activated with token migration plan
- [ ] Gradual user migration from WAX-only to multi-chain
- [ ] Monitoring dashboards active
- [ ] Emergency pause functions ready

**Post-Launch Monitoring:**
- 24/7 bridge monitoring
- Daily balance reconciliation
- Weekly audit reports
- Community communication (if issues arise)

---

## 5. DATA PERSISTENCE & STORAGE

### 5.1 Current Database Infrastructure (MariaDB - Production)

The existing MariaDB "Global System" is production-proven and geospatially optimized. No replacement needed; enhancements only.

**Current Schema (Proven):**
- Geospatial indexes on all location data
- Optimized for regional queries
- All nations and administrative districts globally mapped
- Real-time upvote tracking

### 5.2 Enhanced Database Schema (Additions for M2 & M3)

**Add to Users Table:**
```sql
ALTER TABLE users ADD COLUMN (
  pangea_did VARCHAR(255) UNIQUE,
  passport_level INT DEFAULT 0,
  passport_verified_at TIMESTAMP,
  passport_verification_status ENUM('unverified', 'pending', 'level1', 'level2', 'level3', 'level4'),
  INDEX idx_did (pangea_did),
  INDEX idx_passport_level (passport_level)
);
```

**New Table: Passport Verification History**
```sql
CREATE TABLE passport_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  did VARCHAR(255),
  old_level INT,
  new_level INT,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verification_method VARCHAR(50), -- 'initial', 'milestone', 'manual'
  tx_hash_pangea VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_did (did),
  INDEX idx_verified_at (verified_at)
);
```

**New Table: Multi-Chain Upvotes (M2)**
```sql
CREATE TABLE multi_chain_upvotes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  content_id BIGINT NOT NULL,
  voter_id INT NOT NULL,
  upvote_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Per-chain tracking
  wax_tx_hash VARCHAR(255),
  wax_submitted_at TIMESTAMP,
  wax_confirmed_at TIMESTAMP,
  
  tonomy_tx_hash VARCHAR(255),
  tonomy_submitted_at TIMESTAMP,
  tonomy_confirmed_at TIMESTAMP,
  
  pangea_tx_hash VARCHAR(255),
  pangea_submitted_at TIMESTAMP,
  pangea_confirmed_at TIMESTAMP,
  
  -- Sync status
  sync_status ENUM('pending', 'partial', 'confirmed', 'failed'),
  
  FOREIGN KEY (content_id) REFERENCES content(id),
  FOREIGN KEY (voter_id) REFERENCES users(id),
  INDEX idx_content (content_id),
  INDEX idx_voter (voter_id),
  INDEX idx_time (upvote_time),
  UNIQUE KEY unique_upvote_per_voter (content_id, voter_id)
);
```

**New Table: Daily Upvote Budget (M2)**
```sql
CREATE TABLE daily_upvote_budget (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  passport_level INT,
  total_allowed INT,
  used INT DEFAULT 0,
  reset_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY user_date (user_id, date),
  INDEX idx_date (date)
);
```

**New Table: Invite System (M2)**
```sql
CREATE TABLE invites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inviter_id INT NOT NULL,
  invitee_id INT,
  invite_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Referral structure
  referral_depth INT DEFAULT 0, -- 0=direct, 1=secondary, etc.
  parent_invite_id INT, -- Link to upstream inviter
  
  -- Tetrahedral rewards
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  verified_at TIMESTAMP,
  
  status ENUM('pending', 'accepted', 'verified', 'rewarded', 'expired'),
  reward_tier INT, -- Calculated based on depth
  
  FOREIGN KEY (inviter_id) REFERENCES users(id),
  FOREIGN KEY (invitee_id) REFERENCES users(id),
  FOREIGN KEY (parent_invite_id) REFERENCES invites(id),
  INDEX idx_code (invite_code),
  INDEX idx_inviter (inviter_id),
  INDEX idx_invitee (invitee_id),
  INDEX idx_created (created_at)
);
```

**New Table: Referral Rewards (M2)**
```sql
CREATE TABLE referral_rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT NOT NULL,
  source_invite_id INT,
  reward_type ENUM('direct', 'tier1', 'tier2', 'tier3', 'milestone'),
  blux_amount DECIMAL(20, 8),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tx_hash_wax VARCHAR(255),
  tx_hash_tonomy VARCHAR(255),
  tx_hash_pangea VARCHAR(255),
  
  FOREIGN KEY (recipient_id) REFERENCES users(id),
  FOREIGN KEY (source_invite_id) REFERENCES invites(id),
  INDEX idx_recipient (recipient_id),
  INDEX idx_earned (earned_at)
);
```

**Enhanced Content Table (Add for M3 - Video):**
```sql
ALTER TABLE content ADD COLUMN (
  content_type ENUM('music', 'video') DEFAULT 'music',
  video_platform VARCHAR(50), -- 'youtube', 'tiktok', 'instagram'
  video_duration INT, -- seconds
  thumbnail_url VARCHAR(500),
  INDEX idx_content_type (content_type),
  INDEX idx_video_platform (video_platform)
);
```

**New Table: Cross-Chain Content Stats (M2)**
```sql
CREATE TABLE content_stats_multichain (
  content_id BIGINT PRIMARY KEY,
  
  wax_upvotes INT DEFAULT 0,
  wax_last_updated TIMESTAMP,
  
  tonomy_upvotes INT DEFAULT 0,
  tonomy_last_updated TIMESTAMP,
  
  pangea_upvotes INT DEFAULT 0,
  pangea_last_updated TIMESTAMP,
  
  total_upvotes INT GENERATED ALWAYS AS (
    COALESCE(wax_upvotes, 0) + 
    COALESCE(tonomy_upvotes, 0) + 
    COALESCE(pangea_upvotes, 0)
  ) STORED,
  
  FOREIGN KEY (content_id) REFERENCES content(id),
  INDEX idx_total_upvotes (total_upvotes)
);
```

**New Table: Multi-Chain BLUX Balances (M2)**
```sql
CREATE TABLE blux_balances_multichain (
  user_id INT PRIMARY KEY,
  
  wax_balance DECIMAL(20, 8) DEFAULT 0,
  wax_last_synced TIMESTAMP,
  
  tonomy_balance DECIMAL(20, 8) DEFAULT 0,
  tonomy_last_synced TIMESTAMP,
  
  pangea_balance DECIMAL(20, 8) DEFAULT 0,
  pangea_last_synced TIMESTAMP,
  
  total_balance DECIMAL(20, 8) GENERATED ALWAYS AS (
    wax_balance + tonomy_balance + pangea_balance
  ) STORED,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_total (total_balance)
);
```

**New Table: Bridge Transactions (M2)**
```sql
CREATE TABLE bridge_transactions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(20, 8),
  
  source_chain ENUM('wax', 'tonomy', 'pangea'),
  source_tx_hash VARCHAR(255),
  source_timestamp TIMESTAMP,
  
  destination_chain ENUM('wax', 'tonomy', 'pangea'),
  destination_tx_hash VARCHAR(255),
  destination_timestamp TIMESTAMP,
  
  status ENUM('initiated', 'locked', 'minted', 'confirmed', 'failed', 'rolled_back'),
  
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  error_message TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_initiated (initiated_at)
);
```

### 5.3 Redis Caching Strategy (M2 New)

**Cache Keys & TTLs:**
```
passport_level:{did} → TTL: 1 hour
  Contains: {level: int, verified: bool, lastUpdated: timestamp}

daily_upvote_budget:{user_id}:{date} → TTL: Until next day (24h)
  Contains: {allowed: int, used: int, remaining: int}

content_stats:{content_id} → TTL: 5 minutes
  Contains: {wax_upvotes: int, tonomy_upvotes: int, pangea_upvotes: int, total: int}

chart_top64:{region_geohash}:{timespan} → TTL: 1 minute
  Contains: [{rank, content_id, upvotes, creator}...]

bridge_status:{tx_hash} → TTL: Until completion (up to 24h)
  Contains: {status, source, destination, amount, progress: %}

session:{session_id} → TTL: 7 days
  Contains: {user_id, did, passport_level, expires_at}

realtime_upvote_counter:{content_id} → TTL: 5 minutes
  Contains: numeric counter (incremented in real-time)

active_users → TTL: 5 minutes (rolling cache)
  Contains: set of currently active user_ids
```

### 5.4 Database Optimization (M2 Requirements)

**New Indexes:**
```sql
-- For Pangea passport queries
CREATE INDEX idx_users_passport_level ON users(passport_level);
CREATE INDEX idx_users_did ON users(pangea_did);

-- For multi-chain upvote queries
CREATE INDEX idx_multichain_upvotes_time ON multi_chain_upvotes(upvote_time);
CREATE INDEX idx_multichain_upvotes_content ON multi_chain_upvotes(content_id, upvote_time);

-- For invite system queries
CREATE INDEX idx_invites_inviter_created ON invites(inviter_id, created_at);
CREATE INDEX idx_referral_rewards_recipient ON referral_rewards(recipient_id, earned_at);

-- For daily budget queries
CREATE INDEX idx_daily_budget_user_date ON daily_upvote_budget(user_id, date);

-- For bridge transaction queries
CREATE INDEX idx_bridge_txns_user_status ON bridge_transactions(user_id, status);
```

**Query Optimization:**
- Partition content table by geographic region (optional for massive scale)
- Archive old upvote data (partition by month, archive after 1 year)
- Regular ANALYZE on frequently-queried tables
- Connection pooling (increase from defaults)

---

## 6. API SPECIFICATION & BACKEND SERVICES

### 6.1 RESTful Endpoints

**Authentication (Existing + Pangea - M2)**
```
POST   /api/auth/wax-login                    // Existing WAX Cloud Wallet login
POST   /api/auth/pangea-login                 // NEW - World Citizens Wallet login [M2]
POST   /api/auth/logout
GET    /api/auth/verify-passport/:did         // NEW - Check Pangea passport level [M2]
GET    /api/auth/verify-youtube/:channelId    // Existing - YouTube channel verification
```

**User Profile**
```
GET    /api/user/profile                      // Get user profile with multi-chain data
PUT    /api/user/profile                      // Update user profile
GET    /api/user/upvote-allowance            // NEW - Get daily upvote budget [M2]
GET    /api/user/balances                     // Get BLUX balances across chains (WAX, Tonomy, Pangea)
GET    /api/user/transactions/:chain          // Get user's transactions on specific chain
```

**Content**
```
POST   /api/content/post                      // Create content (music or video)
GET    /api/content/:contentId                // Get single content details
GET    /api/content/search                    // Search content with filters
  ?genre=X&mood=Y&timeRange=Z&chains=WAX,Tonomy,Pangea  // NEW - multi-chain filter
POST   /api/content/:contentId/upvote         // Upvote content
  {chainPreference?: 'wax' | 'tonomy' | 'pangea'}  // NEW - Choose chain [M2]
GET    /api/content/top-charts
  ?period=5min|daily|weekly|monthly|yearly&region=GEOHASH&chains=*  // Enhanced for M2
```

**Passport System (New - M2)**
```
GET    /api/passport/level/:did               // Get user's verification level
GET    /api/passport/requirements/:level      // Get requirements for next level
POST   /api/passport/complete-verification   // Initiate level-up verification
GET    /api/passport/user-verification-status // Check current verification status
```

**Invite System (New - M2)**
```
POST   /api/invite/redeem                     // Redeem invite code
GET    /api/invite/code                       // Get user's invite code
GET    /api/invite/referrals                  // Get list of people invited by user
GET    /api/invite/rewards                    // Get rewards from Tetrahedral structure
GET    /api/invite/leaderboard               // Top inviters by rewards
```

**Multi-Chain Bridge (New - M2)**
```
GET    /api/bridge/balances/:account          // Show BLUX balance on each chain
POST   /api/bridge/transfer                   // Initiate cross-chain transfer
  {amount: number, fromChain: string, toChain: string}
GET    /api/bridge/status/:txHash             // Check bridge transaction status
GET    /api/bridge/history/:account           // Get bridge transaction history
```

**Map & Geospatial**
```
GET    /api/map/content-locations            // Get content locations with filtering
  ?bounds=BBOX&genre=X&mood=Y&timeRange=Z&verification=LEVEL
GET    /api/map/heatmap                      // Get engagement heatmap by region
POST   /api/map/location/:contentId          // Update content location
GET    /api/map/regional-stats               // Get stats by geographic region
```

**Charts & Analytics**
```
GET    /api/charts/top-64                    // Get top 64 content for filters
  ?timeSpan=5min|daily|weekly|monthly|yearly&region=GEOHASH&contentType=music|video
GET    /api/charts/history                   // Get historical chart data
GET    /api/charts/my-positions               // Content user has posted, sorted by position
GET    /api/charts/regional-leaderboard      // Top creators by region
```

**Video Platform Integration (M3)**
```
POST   /api/video/youtube/link               // Link YouTube content
POST   /api/video/tiktok/link                // Link TikTok content
POST   /api/video/instagram/link             // Link Instagram Reels
GET    /api/video/metadata/:platform/:id     // Extract metadata from video
```

### 6.2 WebSocket Events (Real-time Sync)

```typescript
// Authentication
socket.on('auth-success', (data) => {
  // User authenticated, receive passport level & upvote allowance
})

// Upvote notifications (multi-chain)
socket.on('upvote-received', (upvoteData) => {
  // {contentId, voter, chain, timestamp}
  // Can come from WAX, Tonomy, or Pangea
})

// Real-time chart updates
socket.on('chart-updated', (chartData) => {
  // Top 64 content updated for selected region/timespan
})

// Passport events
socket.on('passport-verified', (did) => {
  // User completed verification, now has new level
})

socket.on('verification-level-changed', (newLevel) => {
  // User's verification level changed, upvote allowance updated
})

// Bridge events
socket.on('bridge-initiated', (bridgeData) => {
  // Cross-chain transfer started
})

socket.on('bridge-completed', (bridgeData) => {
  // Cross-chain transfer finished, balance updated
})

// Invite rewards
socket.on('reward-earned', (rewardData) => {
  // User earned BLUX from referral
})

socket.on('invitee-activated', (inviteeData) => {
  // Someone used user's invite code, joined cXc
})

// Daily upvote reset
socket.on('daily-upvote-reset', (allowance) => {
  // Daily budget reset, send new allowance amount
})
```

### 6.3 Backend Services Architecture

**Core Services (Existing + Enhancements):**

**1. Authentication Service**
- WAX Cloud Wallet integration (existing)
- Pangea passport verification (NEW - M2)
- DID validation
- Session management
- Token refresh handling

**2. Blockchain Integration Service**
- WAX client (existing, proven)
- Tonomy client (new, for bridge)
- Pangea client (new - M2, for upvotes & verification)
- Multi-chain transaction tracking
- Event indexing from all chains

**3. Upvote Processing Service**
- Single-chain upvote (existing WAX logic)
- Multi-chain upvote routing (NEW - M2)
- Daily budget tracking & reset
- Deduplication (prevent same vote on multiple chains)
- Real-time stats aggregation

**4. Passport & Verification Service (NEW - M2)**
- DID verification level checking
- Upvote allowance calculation
- Verification level progression tracking
- Milestone reward distribution
- Requirements management

**5. Bridge Monitoring Service (NEW - M2)**
- Real-time bridge transaction tracking
- Cross-chain settlement monitoring
- Balance reconciliation
- Supply auditing
- Emergency alert system

**6. Invite & Referral Service (NEW - M2)**
- Invite code generation & validation
- Referral chain tracking
- Tetrahedral reward calculation
- Milestone reward triggers
- Leaderboard calculation

**7. Geospatial Database Service**
- Content location queries (existing - optimized)
- Regional aggregation (existing)
- Video content indexing (NEW - M3)
- Performance optimization
- Boundary management

**8. Content Processing Service**
- Music metadata extraction (existing)
- Video metadata extraction (NEW - M3)
- Platform verification (YouTube, Spotify, SoundCloud, TikTok, Instagram)
- NFT template matching
- Thumbnail generation & caching

**9. Cache Layer (Redis)**
- Passport verification results (TTL: 1 hour)
- Content statistics (TTL: 5 minutes)
- Chart rankings (TTL: 1 minute for active ranks)
- Geographic region data (TTL: 24 hours)
- Session storage
- Real-time counters (upvotes, views)

### 6.4 Error Handling & Retry Logic

**Critical Failures (Immediate User Notification):**
- Bridge transaction failure
- Passport verification failure
- Upvote submission failure

**Recoverable Errors (Automatic Retry):**
- Blockchain network timeout (retry 3x with exponential backoff)
- Database connection loss (queue and retry)
- Bridge sync delay (monitor and resolve)

**Graceful Degradation:**
- If Pangea unavailable: Allow WAX-only voting
- If Tonomy unavailable: Allow WAX-only voting
- If one chain is slow: Cache and sync later
- If bridge fails: Manual admin recovery process

---

## 7. IMPLEMENTATION PHASES & GRANT MILESTONES

### Phase Overview (From Grant Proposal)

The project follows a structured 3-milestone approach aligned with the Pangea grant proposal:

---

### Milestone 1: ✅ COMPLETED (March 18, 2025)
**"Beta Version Launches with Tokenized Upvotes & Invite System"**

**Delivered:**
- ✅ [1] New cXc.world version launched with tokenized upvotes on WAX
- ✅ [2] Localized content search powered by geospatial database
- ✅ [3] Local music charts organized by upvotes (district-level shown in grant)
- ✅ [4] Time-sorted upvotes with filtering by time spans
- ✅ [5] Invite system solution with two smart contracts
- ✅ [6] TonomyInvite contract deployed (pending Jack Tanner launch at invite.cxc)
- ✅ [7] 6-month free upvote gamification with Tetrahedral rewards

**Deliverable Links:**
- Live App: https://music.cxc.world/
- Announcement: https://cxc-world.medium.com/cxc-world-beta-on-chain-creative-completion-launching-in-every-nation-every-state-2be5e6bad2a8
- Demo Video: https://www.youtube.com/watch?v=_obJ2-nPFDA
- TonomyInvite Contract: https://github.com/currentxchange/TonomyInvite
- Ant-Bridge Contract: https://github.com/currentxchange/Ant-Bridge-Contract

**Status:** Ready for Milestone 2 dependencies

---

### Milestone 2: IN PROGRESS (~2 months from M1 completion)
**"Passport Authentication & On-Chain Upvotes on Pangea"**

**Objectives:**
- [ ] [1] Pangea passport (DID) authentication integrated into cXc.world
- [ ] [2] World Citizens Wallet login implemented
- [ ] [3] User verification level checking implemented
- [ ] [4] Upvote distribution tied to DID verification levels (per Pangea resource allocation model)
- [ ] [5] Tiered release system (invite-required for first 6 months)
- [ ] [6] Daily upvote budget calculation based on passport level
- [ ] [7] Cross-chain upvote tracking (WAX, Tonomy, Pangea)
- [ ] [8] Pangea BLUX bridge contract deployed
- [ ] [9] Invite system extended to Pangea network
- [ ] [10] Milestone rewards for passport completion (gamified)

**Dependencies:**
- Pangea Web4 SDK availability
- Tonomy bridge deployment (Jack Tanner)
- Pangea testnet access for development

**Technical Work:**
- Passport SDK integration in PHP backend
- DID verification level → upvote allowance mapping
- Multi-chain upvote synchronization
- Extended invite contract for Pangea
- Cross-chain settlement monitoring

**Database/Backend Changes:**
- Add Pangea DID verification tables
- Extend content stats to track multi-chain upvotes
- Add passport level progression tracking
- Implement cross-chain transaction logging

**Frontend Updates:**
- Add World Citizens Wallet integration
- Display user's passport level & daily upvote remaining
- Add Pangea-specific onboarding flow
- Show cross-chain upvote status
- Add invite code input flow

**Testing Requirements:**
- Pangea testnet validation
- Cross-chain bridge testing (WAX ↔ Tonomy ↔ Pangea)
- Passport verification integration tests
- Daily upvote reset scheduling
- Invite gamification testing

**Deliverables:**
- cXc.world running on Pangea with full upvote mechanics
- Passport level-gated upvote system
- Extended invite contract on Pangea
- Three-way bridge infrastructure operational

---

### Milestone 3: PLANNED (~4 months from M1 completion)
**"cXc Video Launch on Pangea"**

**Objectives:**
- [ ] [1] YouTube integration for video content
- [ ] [2] TikTok video linking support
- [ ] [3] Instagram Reels support
- [ ] [4] Video platform account verification system
- [ ] [5] Video-specific upvote mechanics
- [ ] [6] Per-platform metadata extraction
- [ ] [7] Video content geolocation tagging
- [ ] [8] Video charts by region and time (parallel to music)
- [ ] [9] Passport-holder daily upvotes for video content
- [ ] [10] Video NFT collection tools (similar to music)

**Dependencies:**
- Milestone 2 completion (Pangea passport system operational)
- Video platform API access (YouTube, TikTok, Instagram)
- Extended Atomic Assets NFT templates for video
- MariaDB schema enhancements for video metadata

**Technical Work:**
- YouTube Data API integration
- TikTok API integration (limited - link aggregation)
- Instagram API integration (Reels extraction)
- Video metadata extraction pipeline
- Video content indexing in MariaDB
- Video-specific filtering in map interface

**Database/Backend Changes:**
- Extend content table for video-specific fields
- Add video platform API sync service
- Video metadata caching layer (Redis)
- Video upvote aggregation queries
- Video chart calculation (similar to music, but for video regions)

**Frontend Updates:**
- Add video posting interface to cXc.world
- Video preview thumbnails on map
- Video-specific filters (platform, creator, duration)
- Video upvote UI (platform-specific if needed)
- Video NFT minting interface

**Integration Requirements:**
- Maintain feature parity with music platform
- Cross-content search (music + video in same queries)
- Multi-content charts (top 64 across both types)
- Unified creator profile (music + video stats)

**Deliverables:**
- cXc.world Video functional on Pangea
- YouTube, TikTok, Instagram integration operational
- Video creators earning BLUX through upvotes
- Video NFT minting live
- Passport-holders claiming daily upvotes for video content

---

### Post-Milestone: Promotional Campaign (6 months)
**"Community Building & Adoption Push"**

Per the grant proposal, after Milestone 1 completion, a 6-month promotional campaign will:
- Drive adoption of cXc Music on Pangea
- Encourage DID/passport completions
- Build community awareness
- Prepare for cXc Video launch
- Onboard content creators

**Expected Outcomes:**
- Significant user onboarding to Pangea
- High engagement on music platform
- Foundation for video platform success
- Community moderator establishment
- Creator economy activation

---

### Development Timeline Summary

```
Milestone 1: ✅ March 2025 (COMPLETED)
├─ Music + Upvotes on WAX
├─ Invite contracts deployed
└─ Ready for Pangea integration

Milestone 2: June 2025 (~2 months later)
├─ Passport authentication
├─ Multi-chain upvotes
├─ Pangea integration
└─ Video platform preparation

Milestone 3: August 2025 (~4 months from M1)
├─ YouTube integration
├─ TikTok integration
├─ Instagram integration
└─ Video content curation live

Post-M3: August 2025 - February 2026
└─ 6-month promotional campaign
```

---

### Sprint Structure for Milestone 2 (Recommended)

**Sprint 1-2 (Weeks 1-2): Foundation**
- [ ] Pangea SDK integration into backend (PHP)
- [ ] Passport DID verification service
- [ ] Database schema updates
- [ ] World Citizens Wallet integration (frontend)
- **Deliverable:** Users can authenticate with Pangea passport

**Sprint 3-4 (Weeks 3-4): Upvote Integration**
- [ ] Verification level → upvote allowance mapping
- [ ] Daily upvote budget calculation
- [ ] Upvote reset scheduling
- [ ] Frontend display of passport level & remaining upvotes
- **Deliverable:** Upvote allowance reflects passport level

**Sprint 5-6 (Weeks 5-6): Cross-Chain**
- [ ] Multi-chain upvote tracking database
- [ ] Pangea bridge contract deployment
- [ ] Bridge monitoring service
- [ ] Cross-chain settlement reconciliation
- **Deliverable:** Upvotes synchronized across WAX, Tonomy, Pangea

**Sprint 7-8 (Weeks 7-8): Invite & Testing**
- [ ] Invite contract extension for Pangea
- [ ] Gamified rewards for passport completion
- [ ] Comprehensive testing on Pangea testnet
- [ ] Security audit & fixes
- **Deliverable:** Ready for Pangea mainnet launch

---

## Appendix: Milestone Success Criteria

### Milestone 1 Criteria (✅ All Met)
- [x] App successfully deployed at cXc.world
- [x] Music upvotes functional on WAX
- [x] Localized charts displaying correctly
- [x] Time filtering working (all ranges)
- [x] Invite contracts compiled and ready
- [x] BLUX bridge functioning

### Milestone 2 Success Criteria
- [ ] Users can login with World Citizens Wallet
- [ ] Passport verification levels reading correctly
- [ ] Upvote allowances varying by verification level
- [ ] Daily upvote resets occurring on schedule
- [ ] Cross-chain upvotes synchronized
- [ ] Pangea mainnet deployment successful
- [ ] 1,000+ DAU on Pangea within 2 weeks
- [ ] Zero critical security issues
- [ ] < 2s page load time maintained

### Milestone 3 Success Criteria
- [ ] YouTube content posting working
- [ ] TikTok links aggregating
- [ ] Instagram Reels loading
- [ ] Video charts calculating correctly
- [ ] Video creators receiving BLUX
- [ ] Video NFTs mintable
- [ ] Passport-holders claiming video upvotes
- [ ] 5,000+ DAU on video platform within 2 weeks of launch
- [ ] Content creator participation > 500 creators

---

## 8. TECHNICAL REQUIREMENTS

### 8.1 Frontend Requirements
- React 18+
- TypeScript for type safety
- TailwindCSS or styled-components
- Socket.io client
- WAX Cloud Wallet SDK
- Mapbox GL JS
- D3.js or Recharts for charts
- Zustand or Redux for state
- Responsive design (mobile-first)
- Accessibility compliance (WCAG 2.1)

### 8.2 Backend Requirements
- Node.js 18+
- Express.js or NestJS
- PostgreSQL 13+
- Redis for caching
- Socket.io for real-time
- TypeScript
- Jest for testing
- Docker containerization
- CI/CD pipeline ready

### 8.3 Blockchain Requirements
- EOSIO CDT for contract compilation
- WAX blockchain deployment
- testnet validation first
- Contract versioning strategy
- Audit-ready code

### 8.4 DevOps Requirements
- Docker & Docker Compose
- Kubernetes readiness
- GitHub Actions for CI/CD
- Environment management (.env)
- Database migrations
- Contract deployment scripts
- Monitoring and logging

---

## 9. SECURITY CONSIDERATIONS

### 9.1 Frontend Security
- Input validation on all forms
- XSS prevention
- CSRF tokens for state-changing operations
- Secure session storage (not localStorage for sensitive data)
- Rate limiting on user requests

### 9.2 Backend Security
- JWT token validation
- SQL injection prevention (parameterized queries)
- Rate limiting per endpoint
- API authentication and authorization
- Input sanitization
- CORS configuration
- Helmet.js middleware

### 9.3 Blockchain Security
- Smart contract audit before mainnet
- Multi-sig for admin functions
- Timelock delays for critical operations
- Emergency pause mechanisms
- Contract version control

### 9.4 Data Privacy
- User data encryption at rest
- HTTPS everywhere
- GDPR compliance mechanisms
- User data export functionality
- Deletion request handling

---

## 10. TESTING STRATEGY

### 10.1 Frontend Testing
- Unit tests (Jest): 80%+ coverage
- Integration tests (React Testing Library)
- E2E tests (Cypress or Playwright)
- Visual regression testing
- Accessibility testing (axe-core)

### 10.2 Backend Testing
- Unit tests: 85%+ coverage
- Integration tests (database interactions)
- API endpoint tests
- WAX integration tests (testnet)
- Load testing (k6 or Artillery)

### 10.3 Smart Contract Testing
- Unit tests for contract functions
- Integration tests (multi-contract interactions)
- Testnet deployment validation
- Stress testing (high volume transactions)

### 10.4 User Acceptance Testing
- UAT environment setup
- Test scenarios based on user flows
- Performance testing at scale
- Community beta testing phase

---

## 11. SUCCESS METRICS & KPIs

### 11.1 Technical Metrics
- Page load time < 2s (P95)
- API response time < 200ms (P95)
- 99.9% uptime SLA
- Smart contract gas optimization (< baseline)
- Database query time < 100ms for 95% queries

### 11.2 User Engagement Metrics
- Daily active users (DAU)
- Monthly active users (MAU)
- Content posts per week
- Guild membership growth
- Voting participation rate

### 11.3 Economic Metrics
- Total value locked (TVL)
- Token circulation velocity
- BLUX/PURPLE price stability
- Reward distribution fairness
- Creator revenue per platform

### 11.4 Quality Metrics
- Bug detection rate
- Security vulnerabilities (zero critical)
- Test coverage > 80%
- Documentation completeness
- User support response time

---

## 12. RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Smart contract vulnerability | Critical | Medium | Professional audit, testnet period |
| WAX network downtime | High | Low | Cache layer, fallback mechanisms |
| Token price volatility | Medium | High | Stablecoin options, hedging strategies |
| Low user adoption | High | Medium | Community building, incentive programs |
| Performance under load | High | Medium | Load testing, optimization, scaling plan |
| Data breach | Critical | Low | Security audit, penetration testing, insurance |
| Regulatory changes | Medium | Medium | Legal consultation, flexibility in design |
| Developer turnover | Medium | Medium | Documentation, knowledge transfer, mentoring |

---

## 13. DEPENDENCIES & INTEGRATIONS

### External Services
- WAX Cloud Wallet
- YouTube Data API
- Spotify Web API
- SoundCloud API
- Mapbox API
- Alcor DEX API
- WAX blockchain (mainnet/testnet)
- Google OAuth (YouTube verification)

### Third-party Libraries
- socket.io (real-time)
- ethers.js or web3.js equivalent for WAX
- passport.js for authentication
- joi or zod for validation
- Bull for job queues

---

## 11. SUCCESS METRICS & GRANT MILESTONE COMPLETION

### 11.1 Milestone 1 Completion Criteria (✅ ALL MET - March 2025)

**Technical Deliverables:**
- [x] Beta version launched at cXc.world
- [x] Tokenized upvotes functional on WAX blockchain
- [x] Localized content search using geospatial database
- [x] Charts organized by upvotes (region-specific)
- [x] Time-based upvote filtering (5-min, daily, weekly, monthly, yearly, all-time)
- [x] TonomyInvite smart contract deployed (awaiting Jack Tanner launch)
- [x] Ant-Bridge-Contract for BLUX bridging deployed (awaiting Jack Tanner launch)

**Performance Metrics:**
- ✅ < 2s page load time achieved
- ✅ Sub-500ms API responses for map queries
- ✅ Real-time upvote processing
- ✅ Scalable geospatial database handling global content

**User Engagement:**
- ✅ Music creator community onboarded
- ✅ Initial user base testing tokenized upvotes
- ✅ Positive community feedback received
- ✅ Demo video published: https://www.youtube.com/watch?v=_obJ2-nPFDA

### 11.2 Milestone 2 Success Criteria (Target: ~2 months from M1)

**Technical Deliverables:**
- [ ] Pangea passport (DID) authentication integrated
- [ ] World Citizens Wallet login functional
- [ ] Passport verification level checking working
- [ ] Daily upvote budget tied to verification levels
- [ ] Multi-chain upvote system (WAX, Tonomy, Pangea)
- [ ] BLUX bridge extended to support Pangea
- [ ] Invite system extended to Pangea network
- [ ] Cross-chain settlement reconciliation working

**Performance Metrics:**
- [ ] < 2s page load time maintained
- [ ] < 200ms API response time (P95)
- [ ] 99.9% uptime on Pangea mainnet
- [ ] Bridge transaction completion < 5 minutes (P95)
- [ ] Zero critical security vulnerabilities

**User Adoption:**
- [ ] 1,000+ DAU within first week of Pangea launch
- [ ] 500+ passport completions
- [ ] Invite program driving 30%+ new user acquisition
- [ ] Positive community engagement (Discord, Telegram)

**Ecosystem Health:**
- [ ] BLUX supply stable across chains (verified in reconciliation audits)
- [ ] Creator BLUX earnings > $X per day (aggregate)
- [ ] User retention > 40% (14-day DAU/MAU)

### 11.3 Milestone 3 Success Criteria (Target: ~4 months from M1)

**Technical Deliverables:**
- [ ] YouTube content integration working
- [ ] TikTok video linking functional
- [ ] Instagram Reels support live
- [ ] Video creator verification system operational
- [ ] Video-specific upvote mechanics implemented
- [ ] Video content geolocation tagging working
- [ ] Video charts calculating correctly
- [ ] Video NFT creation tools functional

**Performance Metrics:**
- [ ] Video page load < 3s (includes thumbnails)
- [ ] Video metadata extraction < 30 seconds
- [ ] Video chart refresh < 1 minute
- [ ] Zero critical security vulnerabilities

**User Adoption:**
- [ ] 5,000+ DAU on video platform within 2 weeks
- [ ] 1,000+ video creators onboarded
- [ ] Video content > 20% of total platform activity
- [ ] Cross-content engagement (users upvoting both music & video)

**Content & Creator Metrics:**
- [ ] 10,000+ video pieces posted
- [ ] Creator earnings from video > 50% of music
- [ ] Average creator retention > 45%

### 11.4 Key Performance Indicators (All Milestones)

**Engagement:**
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Content posts per day
- Upvotes per day
- Average session duration
- Return user rate

**Economic:**
- BLUX total circulation
- Creator earnings (BLUX → USD equivalent)
- Invite program BLUX distributed
- Cross-chain bridge volume

**Technical:**
- System uptime %
- API response times (P50, P95, P99)
- Error rates by endpoint
- Bridge sync success rate
- Smart contract gas optimization

**Quality:**
- Bug report frequency
- Security audit findings
- User support response time
- Community NPS (Net Promoter Score)

---

## 12. RISKS & MITIGATION (Updated for Pangea/Tonomy)

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|-----------|-------|
| Pangea SDK delays | High | Medium | Parallel implementation, use testnet | cXc Dev |
| Bridge auditing takes longer | Medium | Medium | Begin security review early, engage auditors immediately | cXc Dev |
| Slow user passport adoption | High | Medium | Incentivize with milestone rewards, educate users | Marketing |
| Tonomy contract deployment delay | Medium | Medium | Have backup plan for delayed launch | Jack Tanner / cXc |
| BLUX price volatility | Medium | High | Stablecoin bridge option, communicate value prop | Economics |
| Video API rate limiting | Low | Low | Queue system, batch processing | cXc Dev |
| Cross-chain sync failures | High | Low | Comprehensive monitoring, manual recovery process | DevOps |
| Security vulnerability in bridge | Critical | Low | Professional audit, extensive testing, pause mechanisms | Security |
| Low video creator adoption | Medium | Medium | Influencer partnerships, content incentives | Marketing |
| Regulatory changes | Medium | Low | Legal review, flexible contract design | Legal |

---

## 13. GRANT PROPOSAL ALIGNMENT

This PRD strictly adheres to the approved Pangea grant proposal:

**Problem Addressed:**
- ✅ Solves "over 50% of advertising dollars to 2 companies" by decentralizing attention allocation
- ✅ Enables individuals in localized competitions for engagement
- ✅ Democratizes content curation using Pangea passport system

**Solution Delivered:**
- ✅ cXc.world on Pangea with localized competitions
- ✅ Attention-as-reward model (BLUX tokenization)
- ✅ Geographic curating from local → national → global

**Pangea Alignment:**
- ✅ Uses Pangea passports (DID) for voting power allocation
- ✅ Limits invites per day to prevent Sybil attacks
- ✅ Exclusive features for passport holders
- ✅ Drives passport completions through gamified rewards

**Deliverable Commitment:**
- ✅ Milestone 1: Beta + Invite System (COMPLETED March 2025)
- ✅ Milestone 2: Passport Authentication + On-Chain Upvotes (~2 months)
- ✅ Milestone 3: Video Platform (~4 months)
- ✅ 6-Month Promotional Campaign (post-M1)

**Technology Stack Alignment:**
- ✅ Uses Pangea blockchain (Antelope chain)
- ✅ Compatible with World Citizens Wallet
- ✅ Supports Pangea passport/DID system
- ✅ Open-source smart contracts (MIT license)

**Community Benefit:**
- ✅ Onboards users to Pangea and Web4
- ✅ Provides tools for content creators
- ✅ Creates creator economy on Pangea
- ✅ Establishes high-engagement user base

---

## 14. DEPLOYMENT TIMELINE

```
Month 1 (March 2025):
✅ Milestone 1 Complete
├─ cXc Music Beta launched (March 18)
├─ WAX upvotes operational
└─ Invite contracts ready for Tonomy

Months 2-3 (~May-June 2025):
📋 Milestone 2 Development
├─ Week 1-2: Passport SDK integration
├─ Week 3-4: Upvote allocation system
├─ Week 5-6: Multi-chain bridge deployment
└─ Week 7-8: Pangea mainnet launch & testing

Month 4 (~August 2025):
📋 Milestone 3 Development
├─ YouTube integration
├─ TikTok + Instagram integration
└─ Video launch on Pangea

Months 5-10 (~September 2025 - February 2026):
🎯 Promotional Campaign
├─ Community building
├─ Creator onboarding
├─ Feature improvements based on feedback
└─ Prepare for next phase of cXc expansion

Post-February 2026:
🚀 Next Phases
├─ cXc News launch
├─ cXc Solutions launch
└─ Full ecosystem expansion
```

---

## 15. DOCUMENTATION REQUIREMENTS

### Technical Documentation
- [ ] Pangea passport integration guide
- [ ] Multi-chain bridge architecture
- [ ] API reference with Pangea endpoints
- [ ] Smart contract deployment guide
- [ ] Database migration scripts for M2
- [ ] Passport verification implementation
- [ ] Cross-chain settlement procedures

### User Documentation
- [ ] Pangea passport setup guide
- [ ] How to redeem invite codes
- [ ] Understanding verification levels
- [ ] Daily upvote budget explained
- [ ] Multi-chain BLUX bridge instructions
- [ ] Video content posting guide (M3)
- [ ] Creator earnings explanation

---

## 16. SUCCESS CRITERIA

The Pangea grant milestones will be considered successful when:

**Milestone 1:** ✅ COMPLETED March 18, 2025
1. ✅ cXc.world Beta launched with tokenized upvotes
2. ✅ Localized charts organized by upvotes
3. ✅ Time-based filtering functional
4. ✅ TonomyInvite contract deployed
5. ✅ BLUX bridge contract ready

**Milestone 2:** 📋 IN PROGRESS (~2 months from M1)
1. [ ] Pangea passport integration working
2. [ ] World Citizens Wallet authentication operational
3. [ ] Daily upvote budgets reflect verification levels
4. [ ] Multi-chain upvotes (WAX, Tonomy, Pangea) synchronized
5. [ ] BLUX bridge to Pangea live
6. [ ] 1,000+ DAU on Pangea within week 1
7. [ ] Zero critical security vulnerabilities
8. [ ] Cross-chain reconciliation audits pass

**Milestone 3:** 📋 PLANNED (~4 months from M1)
1. [ ] YouTube video integration working
2. [ ] TikTok video linking functional
3. [ ] Instagram Reels support live
4. [ ] Video creators can earn BLUX
5. [ ] 5,000+ DAU on video platform
6. [ ] Video charts displaying correctly by region
7. [ ] Creator retention > 45%
8. [ ] Cross-content upvoting working

---

## Appendix A: Glossary (Updated for Pangea Context)

| Term | Definition |
|------|-----------|
| DID | Decentralized Identifier (Pangea Web4 passport) |
| Passport | Pangea Web4 identification with verification levels (0-4) |
| Verification Level | User's identity verification status on Pangea (determines upvote allowance) |
| Daily Upvote Budget | Number of upvotes user can cast per day (based on passport level) |
| BLUX | Primary platform token earned through participation, tradeable across chains |
| Bridge | Smart contract enabling BLUX transfer between WAX, Tonomy, and Pangea blockchains |
| Tonomy | Antelope blockchain used for intermediate testing before Pangea launch |
| Pangea | Antelope blockchain (recipient of this grant, primary platform for M2+) |
| Tetrahedral Rewards | 4-layer referral reward structure (direct + 3 downstream tiers) |
| Invite Code | Code given by existing user to onboard new users (gamified rewards for inviter) |
| Localized Chart | Top content rankings within specific geographic region (district, state, nation) |
| Geospatial | Related to physical geographic locations (uses MariaDB Global System) |
| Multi-Chain | Operating across multiple blockchains simultaneously (WAX, Tonomy, Pangea) |
| World Citizens Wallet | Pangea's primary wallet supporting DID authentication |
| MariaDB Global System | Custom geospatial database covering all global nations and regions |
| Content Curation | Using upvotes to determine what content gets visibility |
| Time-Based Upvotes | User can upvote once per 5-minute window, filtered by time spans |
| Cross-Chain Settlement | Reconciliation of BLUX supply across WAX, Tonomy, and Pangea |

---

## Appendix B: Reference Materials & Links

**cXc Official Resources:**
- Main Website: https://cXc.world
- Music App: https://music.cXc.world
- NFT Tools: https://tools.cxc.world
- GitHub Organization: https://github.com/currentxchange
- Lead: Douglas Butner (@godsolislove on Telegram)
- Discord/Telegram: t.me/cXc_world

**Pangea Resources:**
- Pangea Official: https://pangea.top
- Web4 Manifesto: https://github.com/dougbutner/web4-manifesto
- Tonomy Documentation: https://tonomy.foundation

**Grant Information:**
- Proposal Link: https://docs.google.com/document/d/e/2PACX-1vTnp35wg2U5w-CH6IJCcHahE8b3lfh7RTn1x9gMBjnlPWSItBfG2a4Gjys3gQ8Msx3zEN5iEH9xDC4V/pub
- Marketing Proposal: https://docs.google.com/document/d/e/2PACX-1vS9RVCe9DqZlwBur3jdEuj2ZAG5aK_n-4d6mWUCrwGCYVMEc7Tr5rjhZ5qZv1MFZ7lsg1n2jVoSq9Rn/pub
- Milestone 1 Report: https://docs.google.com/document/d/e/2PACX-1vRI2QTs_02nllg5LxuiEpT6yeP_IDCyeuCveV4oIJgxPYPmY-m4Iy12E60UZDAhy4s989WqnRdYPdPD/pub

**Smart Contract Repositories:**
- Ups (Curation): https://github.com/currentxchange/ups
- Media NFT Standards: https://github.com/currentxchange/WAX-NFT-Metadata-Standards
- Loot (Staking): https://github.com/currentxchange/loot
- TonomyInvite: https://github.com/currentxchange/TonomyInvite
- Ant-Bridge: https://github.com/currentxchange/Ant-Bridge-Contract

**Related Documentation:**
- cXc Milestone 1 Report
- Pangea White Paper
- Tonomy Gov Whitepaper
- Web4 Manifesto (by Douglas Butner)

---

**Document Status:** ✅ Ready for Milestone 2 Development  
**Last Updated:** December 2025  
**Next Review:** Upon Milestone 2 Kickoff  
**Version:** 2.0 (Updated for Pangea & Tonomy Integration)

**Contact for Questions:**
- Lead: Douglas Butner
- Email: douglas@cxc.world
- Telegram: @godsolislove
- Community: t.me/cXc_world

