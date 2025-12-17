// Signer adapter supporting Tonomy ID (mobile-first) with optional Anchor fallback.
// For pure browser usage without bundling, inject window.tonomy or window.createTonomyId.

// Default network targets EOS mainnet; callers can pass a different RPC/chainId (e.g., Pangea).
const DEFAULT_NETWORK = {
  chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3d119416cf6838fb94c5a37a",
  nodeUrl: "https://eos.greymass.com"
};

function normalizeNetwork(network) {
  return {
    chainId: network?.chainId || DEFAULT_NETWORK.chainId,
    nodeUrl: network?.nodeUrl || DEFAULT_NETWORK.nodeUrl,
  };
}

export function detectSignerPreference() {
  if (typeof window !== "undefined" && (window.tonomy || window.createTonomyId)) return "tonomy";
  return "tonomy";
}

export async function createSigner(kind = detectSignerPreference(), network) {
  const net = normalizeNetwork(network);
  if (kind === "tonomy") return createTonomySigner();
  return createAnchorSigner(net);
}

async function createTonomySigner() {
  let tonomy = window.tonomy;
  if (!tonomy) {
    // Use injected createTonomyId if present (loaded via CDN), otherwise dynamic import via CDN.
    let createTonomyIdGlobal = window.createTonomyId;
    if (!createTonomyIdGlobal) {
      try {
        const mod = await import("https://cdn.jsdelivr.net/npm/@tonomy/tonomy-id-sdk@0.6.2/dist/tonomy-id-sdk.esm.js");
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
    console.log('Tonomy login called');
    try {
      const { session, account } = await tonomy.login();
      console.log('Tonomy login success:', { session: session ? 'exists' : null, account });
      return { session, account };
    } catch (err) {
      console.error('Tonomy login error:', err.message);
      throw err;
    }
  }

  async function transact(args) {
    return tonomy.transact(args);
  }

  return { kind: "tonomy", login, transact };
}

async function createAnchorSigner(network) {
  let AnchorLink = window.AnchorLink;
  let AnchorLinkBrowserTransport = window.AnchorLinkBrowserTransport;
  if (!AnchorLink || !AnchorLinkBrowserTransport) {
    try {
      const linkMod = await import("https://cdn.jsdelivr.net/npm/anchor-link@3.5.1/dist/anchorlink.browser.esm.js");
      const transportMod = await import("https://cdn.jsdelivr.net/npm/anchor-link-browser-transport@3.5.1/dist/anchorlink-browser-transport.browser.esm.js");
      AnchorLink = linkMod.default || linkMod;
      AnchorLinkBrowserTransport = transportMod.default || transportMod;
    } catch (e) {
      throw new Error("Anchor Link not available. Bundle anchor-link and anchor-link-browser-transport or inject via window.");
    }
  }

  const transport = new AnchorLinkBrowserTransport();
  const link = new AnchorLink({
    transport,
    chains: [{ chainId: network.chainId, nodeUrl: network.nodeUrl }],
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

export async function createLocalSigner(privateKey, network) {
  const net = normalizeNetwork(network);
  const rpcLocal = new window.eosjs_jsonrpc.JsonRpc(net.nodeUrl);
  const signatureProvider = new window.eosjs_jssig.JsSignatureProvider([privateKey]);
  const api = new window.eosjs_api.Api({
    rpc: rpcLocal,
    signatureProvider,
    chainId: net.chainId
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
