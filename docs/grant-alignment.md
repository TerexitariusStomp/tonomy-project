# Grant alignment notes

Source references:
- Proposal: `cXc Pangea Grant .pdf`
- Milestone report: `cXc Grant Deliverable #1 Report.pdf`

## What the grant asks for
- Mission: onboard users to Pangea by turning cXc.world into the flagship app (music first, then video) with Web4 passports powering verified, sybil-resistant engagement.
- Milestones: (1) beta with invite system and airdrop registration, (2) airdrop + cXc Music on-chain upvotes and localized charts, (3) cXc Video launch.
- Key flows: invite gate with daily limits, DID-based upvote allocation, rewards paid in BLUX, bridge from WAX to Tonomy so tokenized upvotes and rewards carry over.

## What the milestone #1 report confirms
- Beta shipped (Mar 18, 2025) with localized content search and charts, plus time-sorted upvotes on WAX.
- Invite and bridge contracts delivered (invite.cxc, bridge.cxc), pending deployment/funding on Tonomy; invite program rewards BLUX over ~6 months with tetrahedral referral bonuses.
- Next step is replicating the WAX flow on Tonomy once the contracts are live.

## How this repo maps to the grant
- `index.html` + `style.css`: lightweight UI shell for invites, upvote allocation, and bridge status; mobile-friendly cards aligned to cXc brand.
- `app.js`: wires the UI to Antelope RPC tables for invite stats (`invite.cxc`), upvote allocations, and bridge transfer lookups (`bridge.cxc`). Generates bridge memos and surfaces lock instructions for the WAX side.
- `signer.js`: runtime detection and adapters for Tonomy ID, Anchor Link, or a local private key, matching the proposal’s multi-wallet expectation.
- `wax-bridge.js`: helper stub for calling `bridge.cxc::lockwax` via a WAX wallet SDK so BLUX can be locked on WAX before minting on Tonomy.

## Gaps to close (per proposal and report)
- Onboarding: staged flow (welcome -> create account -> invite -> DID verification upsell -> tutorial) and resume logic.
- Rich invite UX: referral tree/dashboard, share links, error states for exhausted/invalid codes, invite limits per day.
- Upvotes: countdown to daily reset, spend/decrement UX, BLUX upsell when depleted, and time-span filters for charts.
- Bridge polish: show WAX/Tonomy balances, stepper UI, explorer links, and `/v1/bridge/status` polling endpoint once backend exists.
- Analytics: user metrics and admin campaign views with CSV export.
- Deployment: point RPC endpoints to Pangea once contracts are live; ensure DID verification level is read and cached on login.
