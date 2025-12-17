// Signer adapter supporting Tonomy ID and Anchor Link.
// For pure browser usage without bundling, only injected window.tonomy will work.
// For full support, bundle @tonomy/tonomy-id-sdk and anchor-link (+browser transport) or expose them on window.

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
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("signerPreference") : null;
  if (stored) return stored;
  if (typeof window !== "undefined" && window.tonomy) return "tonomy";
  if (typeof window !== "undefined" && window.esrHelper) return "esr";
  return "anchor";
}

export async function createSigner(kind = detectSignerPreference(), network) {
  const net = normalizeNetwork(network);
  if (kind === "esr") return createEsrSigner(net);
  if (kind === "tonomy") return createTonomySigner();
  return createAnchorSigner(net);
}

function parseEsrCallbackFromUrl() {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.get("esrResponse")) return null;
    return {
      request: url.searchParams.get("request"),
      signature: url.searchParams.get("signature"),
      account: url.searchParams.get("account"),
      permission: url.searchParams.get("permission"),
      requestId: url.searchParams.get("requestId"),
    };
  } catch (e) {
    return null;
  }
}

function buildCallbackUrl(requestId) {
  return `${window.location.origin}${window.location.pathname}?esrResponse=1&requestId=${requestId}`;
}

async function createEsrSigner(network) {
  const helper = window.esrHelper;
  if (!helper) {
    throw new Error("ESR helper not loaded. Ensure ESR helper script is included in index.html.");
  }
  if (helper.setNetwork) {
    helper.setNetwork({ chainId: network.chainId, rpcEndpoint: network.nodeUrl });
  }

  function makeDeepLink(esrUri) {
    return `tonomy://sign?request=${encodeURIComponent(esrUri)}`;
  }

  async function login() {
    const requestId = Date.now().toString();
    const callback = buildCallbackUrl(requestId);
    const esrUri = await helper.createIdentityEsr(callback);
    const deepLink = makeDeepLink(esrUri);
    const callbackData = parseEsrCallbackFromUrl();
    return { esrUri, deepLink, requestId, account: callbackData?.account || null, callbackData };
  }

  async function transact(args) {
    const requestId = Date.now().toString();
    const callback = buildCallbackUrl(requestId);
    const esrUri = await helper.createEsr(args.actions, { broadcast: true, callback, chainId: network.chainId });
    const deepLink = makeDeepLink(esrUri);
    return { esrUri, deepLink, requestId };
  }

  return { kind: "esr", login, transact };
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
    const { session, account } = await tonomy.login();
    return { session, account };
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
