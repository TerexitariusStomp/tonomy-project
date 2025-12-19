# Tonomy ID Emulator Setup for Deep Link Authentication Testing

## Overview
This guide sets up the Tonomy ID emulator to test deep link authentication flows in the cXc Pangea integration. The emulator simulates the Tonomy mobile app on desktop, allowing you to test login and transaction deep links without a physical device. This ensures the session populates correctly after authentication and that contract actions (e.g., `sendinvite`, `claimdaily`) execute as expected via the signer.

The current codebase in `app.js` and `signer.js` uses the Tonomy ID SDK v1.0.0 (loaded via esm.sh bundling), which supports emulator mode through configuration. The SDK detects `window.tonomy` for deep links or initializes via `createTonomyId`. App.js now includes automatic session initialization on page load via `initSession()`, which calls `ensureSigner()` and `login()` to populate `sessionAccount` and update UI elements (invite code, stats, passport level, referrals). Session persistence uses localStorage for `sessionAccount` alongside SDK internals.

## Prerequisites
- Node.js (for serving the app)
- Browser (Chrome recommended for dev tools)
- The project is served at `http://localhost:3000` (current setup via `npx http-server . -p 3000 -c-1`)

## Step 1: Install Tonomy ID SDK (Already Bundled)
The SDK is loaded via CDN in `index.html`:
```html
<script type="module">
  import { createTonomyId } from "https://esm.sh/@tonomy/tonomy-id-sdk@1.0.0?bundle";
  window.createTonomyId = createTonomyId;
</script>
```
No changes needed here. For local bundling (optional, for offline dev):
```
npm install @tonomy/tonomy-id-sdk@1.0.0
```
Then update `signer.js` to import directly instead of CDN.

## Step 2: Configure App for Emulator
1. **Set Callback URL**: In `signer.js` (line 41), `callbackUrl` is set to `window.location.href`. Ensure your server runs on `http://localhost:3000` (matches current terminal). For emulator, use `http://localhost:3000` as the origin.

2. **App ID**: Set to `"cxc.world"` (as in `signer.js` line 42). Register this app ID in your Tonomy developer account if testing production flows (https://developer.tonomy.foundation).

3. **Network Configuration**: Update `app.js` (lines 4-28) for Pangea testnet RPC/chainId. Current placeholders:
   - RPC: `"https://pangea.rpc.url"` → Replace with actual testnet RPC (e.g., from Tonomy docs).
   - Chain ID: `"PANGEA_CHAIN_ID_HERE"` → Use testnet chain ID.
   Example for Jungle (testnet):
   ```js
   jungle: {
     label: "Jungle Testnet",
     rpc: "https://jungle4.api.eosnation.io",
     chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
     explorerTx: "https://jungle4.bloks.io/transaction/"
   }
   ```
   Select "jungle" in the network dropdown for testing.

4. **Deep Link Handling**: The SDK handles deep links via `tonomy.login()`. No explicit changes needed, but ensure `index.html` allows popups/redirects (no CSP blocking).

## Step 3: Run Tonomy Emulator
Tonomy provides a web-based emulator for desktop testing:

1. **Access Emulator**:
   - Open https://emulator.tonomy.foundation/ in a new browser tab.

2. **Configure Emulator**:
   - In emulator settings, set:
     - **App Origin**: `http://localhost:3000`
     - **App ID**: `cxc.world`
     - **Blockchain Network**: Jungle Testnet (or Pangea if available).
   - Create a test account in the emulator (e.g., `testuser.tonomy`).
   - Enable "Deep Link Mode" to simulate mobile app redirects.

3. **Test Flow**:
   - Start your server: `npx http-server . -p 3000 -c-1` (already running).
   - In your app (`http://localhost:3000`), click "Connect with Tonomy".
   - The SDK will trigger a deep link: `tonomy://login?appId=cxc.world&callback=http://localhost:3000`.
   - The emulator should intercept this (configure browser to open links in emulator tab or use a custom handler).
   - Complete login in emulator: Approve the request, select account.
   - Emulator redirects back to `http://localhost:3000` with auth params (handled by SDK's `verifyLoginResponse` internally).
   - Verify in browser console: Session populates with `sessionAccount` (from `app.js` line 255).

## Step 4: Verify Session Population
- After login:
  - Check `localStorage` or console for `sessionAccount` (e.g., `testuser.tonomy`).
  - UI updates: Invite code field populates (`app.js` line 486), stats load (`getUserStats`), passport level renders (`renderPassportLevel`).
  - If session fails: Check console for errors (e.g., mismatched callback). Ensure no ad-blockers interfere with CDN.

- Persistence: Session uses in-memory vars + localStorage for network/onboarding. For full persistence, add `sessionStorage.setItem('tonomySession', JSON.stringify(session))` in `signer.js` after login.

## Step 5: Test Contract Actions
1. **Invite Action (`sendinvite`)**:
   - Login with emulator account.
   - Enter target: `bob.test`.
   - Click "Send Invite".
   - Expected: `transact` calls `invite.cxc::sendinvite` on Jungle RPC.
   - Verify: Check console for tx ID, or query table `invite.cxc::invites` via RPC.

2. **Claim Daily (`claimdaily`)**:
   - Ensure account has allocation (mock via contract deploy if needed).
   - Click "Claim Daily Upvotes".
   - Expected: `transact` to `invite.cxc::claimdaily`.
   - UI: Meter updates (`refreshPassportAndUpvotes`).

3. **Bridge (WAX → Tonomy)**: For full test, deploy `bridge.cxc` on Jungle. Use WAX testnet wallet for lock, poll status.

## Troubleshooting
- **Deep Link Not Opening**: Use browser extension like "Custom Protocol Handler" or run emulator in incognito. Manually paste deep link into emulator address bar.
- **CORS Errors**: Ensure RPC allows localhost origins.
- **No Session**: Debug `tonomy.login()` return value in `signer.js`. Add logs:
  ```js
  console.log('Login result:', { session, account });
  ```
- **Contract Fails**: Verify actions match contract ABI (e.g., `data: { inviter, invited }`). Use Jungle explorer: https://jungle4.bloks.io.
- **Emulator Not Redirecting**: Set emulator callback to exact URL including path (e.g., `http://localhost:3000/`).

## Next Steps
- Deploy contracts to Pangea testnet.
- Integrate React components from `frontend/` for production.
- Test on real Tonomy app (iOS/Android).

For more: https://developer.tonomy.foundation/docs/tonomy-id-sdk/emulator
