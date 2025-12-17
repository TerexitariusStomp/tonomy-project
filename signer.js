// Signer adapter supporting Tonomy ID and Anchor Link.
// For pure browser usage without bundling, only injected window.tonomy will work.
// For full support, bundle @tonomy/tonomy-id-sdk and anchor-link (+browser transport) or expose them on window.

// Defaults to EOS mainnet. For Jungle testnet, swap to the values below.
// Mainnet
const CHAIN_ID = "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3d119416cf6838fb94c5a37a";
const NODE_URL = "https://eos.greymass.com";
// Jungle testnet (uncomment to target Jungle)
// const CHAIN_ID = "73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d";
// const NODE_URL = "https://jungle3.eosio.dev";

export function detectSignerPreference() {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("signerPreference") : null;
  if (stored) return stored;
  if (typeof window !== "undefined" && window.tonomy) return "tonomy";
  return "anchor";
}

export async function createSigner(kind = detectSignerPreference()) {
  if (kind === "tonomy") return createTonomySigner();
  return createAnchorSigner();
}

async function createTonomySigner() {
  let tonomy = window.tonomy;
  if (!tonomy) {
    // Use injected createTonomyId if present (loaded via CDN), otherwise dynamic import via CDN.
    let createTonomyIdGlobal = window.createTonomyId;
    if (!createTonomyIdGlobal) {
      try {
        const mod = await import("https://cdn.jsdelivr.net/npm/@tonomy/tonomy-id-sdk@0.6.2/+esm");
        createTonomyIdGlobal = mod.createTonomyId || mod.default;
      } catch (e) {
        throw new Error("Tonomy ID SDK not injected. Bundle @tonomy/tonomy-id-sdk or open via Tonomy app.");
      }
    }
    tonomy = await createTonomyIdGlobal({
      appId: "cxc.world",
      callbackUrl: window.location.href,
    });
  }

  async function login() {
    const { session, account } = await tonomy.login();
    return { session, account };
  }

  async function transact(args) {
    return tonomy.transact(args);
  }

  return { kind: "tonomy", login, transact };
}

async function createAnchorSigner() {
  let AnchorLink = window.AnchorLink;
  let AnchorLinkBrowserTransport = window.AnchorLinkBrowserTransport;
  if (!AnchorLink || !AnchorLinkBrowserTransport) {
    try {
      const linkMod = await import("https://cdn.jsdelivr.net/npm/anchor-link@3.5.1/+esm");
      const transportMod = await import("https://cdn.jsdelivr.net/npm/anchor-link-browser-transport@3.5.1/+esm");
      AnchorLink = linkMod.default || linkMod;
      AnchorLinkBrowserTransport = transportMod.default || transportMod;
    } catch (e) {
      throw new Error("Anchor Link not available. Bundle anchor-link and anchor-link-browser-transport or inject via window.");
    }
  }

  const transport = new AnchorLinkBrowserTransport();
  const link = new AnchorLink({
    transport,
    chains: [{ chainId: CHAIN_ID, nodeUrl: NODE_URL }],
  });

  async function login() {
    let session = await link.restoreSession("cxc-world");
    if (!session) {
      const res = await link.login("cxc-world");
      session = res.session;
    }
    return { session, account: session.auth.actor.toString() };
  }

  async function transact(args) {
    let session = await link.restoreSession("cxc-world");
    if (!session) throw new Error("No Anchor session");
    return session.transact(args);
  }

  return { kind: "anchor", login, transact };
}

export async function createLocalSigner(privateKey) {
  const rpcLocal = new window.eosjs_jsonrpc.JsonRpc(NODE_URL);
  const signatureProvider = new window.eosjs_jssig.JsSignatureProvider([privateKey]);
  const api = new window.eosjs_api.Api({
    rpc: rpcLocal,
    signatureProvider,
    chainId: CHAIN_ID
  });

  async function login() {
    const pubKeys = signatureProvider.getAvailableKeys();
    if (pubKeys.length === 0) {
      throw new Error("Invalid private key");
    }
    const pubKey = pubKeys[0];
    const res = await rpcLocal.getKeyAccounts({ public_key: pubKey });
    const accountNames = res.account_names;
    if (accountNames.length === 0) {
      throw new Error(`No EOSIO account found for public key ${pubKey}`);
    }
    const account = accountNames[0];
    return { account };
  }

  async function transact(args) {
    return api.transact(args, { blocksBehind: 3, expireSeconds: 30 });
  }

  return { kind: "local", login, transact };
}
