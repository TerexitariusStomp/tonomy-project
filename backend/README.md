# On-chain only (no REST)

Per request, remove the REST layer and talk directly to chain endpoints from the frontend using `eosjs`/`@greymass/eosio` plus wallet signatures (Tonomy ID / World Citizens Wallet / Anchor).

## How to interact
- **Reads:** use `get_table_rows` against `invite.cxc`, `bridge.cxc`, and BLUX token tables for stats, referral tree, bridge status, and upvote allocations.
- **Writes:** sign transactions in-wallet:
  - `invite.cxc::sendinvite(inviter, invited)`
  - `invite.cxc::claimdaily(user)`
  - `invite.cxc::resetdaily(user)` (if needed)
  - `bridge.cxc::lockwax` (on WAX) and `bridge.cxc::minttonomy` (oracle)
  - `transfer`/`issue` on BLUX token as appropriate
- **Passport level:** consumed via the contract verifier/oracle (`setverify` or a future proof-verification action). Frontend should surface the level returned by the contract table, not an API.

## Frontend wiring tips
- Instantiate `JsonRpc` with the Pangea endpoint and pass wallet-provided signatures via a compatible signer (e.g., `window.tonomy`, Anchor, or injected provider).
- Cache light computed data client-side (e.g., referral tree traversal) to avoid extra RPC calls during a session.

If you still want analytics/exports, keep a thin read-only indexer/mirror later; it is optional for core flows.*** End Patch
