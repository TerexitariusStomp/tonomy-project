ESR Integration Guide (Tonomy Wallet)
=====================================

Note: The current UI uses Tonomy ID login (mobile-first) and does not expose ESR flows. Keep this document for reference only.

This project already supports Tonomy ID (SDK) and Anchor Link via `signer.js`. Use this guide to add ESR (Antelope Signing Request) support so the UI can connect to the Tonomy wallet through deep links or QR codes.

What ESR Does
-------------
- Encodes Antelope transactions or identity requests into a URI.
- Transports via deep link (`tonomy://`), QR, or copyable link.
- Lets the wallet resolve, sign, and (optionally) broadcast.

CDN-Friendly ESR Helper
-----------------------
For this repo's pure-browser setup, you can load WharfKit modules from jsDelivr and expose a small helper. Add this `<script type="module">` block before `app.js` in `index.html`:

```html
<script type="module">
  import { SigningRequest } from "https://cdn.jsdelivr.net/npm/@wharfkit/signing-request/+esm";
  import { APIClient } from "https://cdn.jsdelivr.net/npm/@wharfkit/antelope/+esm";
  import { ABICache } from "https://cdn.jsdelivr.net/npm/@wharfkit/abicache/+esm";
  import pako from "https://cdn.jsdelivr.net/npm/pako@2/+esm";

  const CHAIN_ID = "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3d119416cf6838fb94c5a37a";
  const RPC_ENDPOINT = "https://eos.greymass.com";

  const client = new APIClient({ url: RPC_ENDPOINT });
  const abiCache = new ABICache(client);

  async function createEsr(actions, options = {}) {
    const request = await SigningRequest.create(
      {
        actions,
        broadcast: options.broadcast !== false,
        callback: options.callback,
        chainId: CHAIN_ID,
      },
      { abiProvider: abiCache, zlib: pako }
    );
    return request.encode(true, true, "esr"); // compressed, with slashes, esr:// scheme
  }

  async function createIdentityEsr(callbackUrl) {
    const request = SigningRequest.identity({ callback: callbackUrl });
    return request.encode(true, true, "esr");
  }

  async function resolveEsr(esrUri, signerAccount, signerPermission = "active") {
    const request = SigningRequest.from(esrUri, { abiProvider: abiCache, zlib: pako });
    const abis = await request.fetchAbis();
    const info = await client.v1.chain.get_info();
    const header = info.getTransactionHeader();
    const authorization = { actor: signerAccount, permission: signerPermission };
    const resolved = await request.resolve(abis, authorization, header);
    return {
      transaction: resolved.transaction,
      serializedTransaction: resolved.serializedTransaction,
      signingDigest: resolved.signingDigest,
    };
  }

  window.esrHelper = { createEsr, createIdentityEsr, resolveEsr, client };
</script>
```

Quick Usage Patterns
--------------------
**Login / Connect (identity request)**
```js
const callbackUrl = `${window.location.origin}/callback`;
const esrUri = await window.esrHelper.createIdentityEsr(callbackUrl);
const deepLink = `tonomy://sign?request=${encodeURIComponent(esrUri)}`;
// display deepLink or QR for the Tonomy wallet
```

**Sign and broadcast a transaction**
```js
const actions = [{
  account: "invite.cxc",
  name: "sendinvite",
  authorization: [{ actor: "alice.cxc", permission: "active" }],
  data: { inviter: "alice.cxc", invited: "bob.cxc" },
}];
const esrUri = await window.esrHelper.createEsr(actions, {
  callback: `${window.location.origin}/callback`,
  broadcast: true,
});
const deepLink = `tonomy://sign?request=${encodeURIComponent(esrUri)}`;
```

**Handle wallet callback**
Implement an endpoint or in-app listener to receive `request`, `signature`, and signer info from the wallet. You can resolve the original ESR and broadcast:
```js
const { transaction } = await window.esrHelper.resolveEsr(req.body.request, req.body.account);
const result = await window.esrHelper.client.v1.chain.send_transaction({
  signatures: [req.body.signature],
  compression: 0,
  transaction,
});
```

How to Plug Into the Current UI
-------------------------------
- Add a new signer option (e.g., "Tonomy ESR") to the selector in `index.html` and `app.js`.
- On "Connect", generate an identity ESR URI via `createIdentityEsr` and present a deep link/QR. Store the pending request ID to match the callback.
- For `transact()` calls in `app.js`, wrap actions with `createEsr` when the ESR signer is selected, and open the Tonomy deep link instead of calling the SDK directly.
- Add a lightweight `/callback` handler (Express or serverless) that accepts the wallet response and displays the transaction status.

Test Endpoints
--------------
- Jungle testnet RPC: `https://jungle4.greymass.com`
- Jungle chain id: `73e4385a2708e6d7048834ffc1f88c4210dd5dffaf257da18faf2fbdb75d4e16`

Security Checklist
------------------
- Verify callback origin and use HTTPS.
- Include a request ID and expiration in callbacks to avoid replay.
- Validate action data before sending the ESR to the wallet.
- If you broadcast on the dApp side, verify signatures before pushing.
