# Frontend integration checklist (per PRD)

Components to build in the main cXc.world app:
- **Auth**: Tonomy ID + World Citizens Wallet connect, session storage, logout; fetch and persist DID verification level on login.
- **Invite flows**: invite redemption form (pre-filled from link), share/invite buttons, referral dashboard/tree, limits/error states.
- **Upvotes**: allocation widget showing remaining/upcoming reset; decrement on use; BLUX bonus upsell when exhausted.
- **Bridge UI**: WAX→Tonomy form, balance display, status steps with explorer links, polling via `/v1/bridge/status`.
- **Onboarding**: staged modals/cards (welcome → create account → invite code → verification upsell → tutorial); skip/resume; mobile responsive.
- **Analytics**: user dashboard metrics; admin-only campaign overview + CSV export.

Suggested tech: existing jQuery/Leaflet base + small React islands (InviteButton, UpvoteAllocation, BridgeInterface) or pure jQuery equivalents. Keep CSS tokens consistent with current cXc styles.

## Wallet/signers (Tonomy + Anchor + WAX)
- **Tonomy ID SDK:** bundle `@tonomy/tonomy-id-sdk` (https://github.com/Tonomy-Foundation/Tonomy-ID-SDK). Detect `window.tonomy` (mobile deep link) or init `createTonomyId({ appId, callbackUrl })`; use `tonomy.login()` and `tonomy.transact({ actions })`.
- **Anchor Link (desktop/QR):** bundle `anchor-link` + `anchor-link-browser-transport` (https://github.com/greymass/anchor-link-browser-transport). Instantiate `link` with `{ transport, chains: [{ chainId, nodeUrl }] }`; `session = await link.login(...)` or `link.restoreSession(...)`; transact with `session.transact({ actions })`.
- **WAX wallet (bridge lock):** bundle a WAX wallet SDK like `@waxio/waxjs` or WAX Wallet Connect (https://github.com/worldwide-asset-exchange/wax-wallet-connect-sdks). Use it to sign `bridge.cxc::lockwax` on WAX, then poll `bridge.cxc::bridge_transfers` on Tonomy for status/mint.
