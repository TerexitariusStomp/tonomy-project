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
    // Attempt dynamic import (requires bundler)
    try {
      const mod = await import("@tonomy/tonomy-id-sdk");
      tonomy = await mod.createTonomyId({
        appId: "cxc.world",
        callbackUrl: window.location.href,
      });
    } catch (e) {
      throw new Error("Tonomy ID SDK not injected. Bundle @tonomy/tonomy-id-sdk or open via Tonomy app.");
    }
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
      const mod = await import("anchor-link");
      const transportMod = await import("anchor-link-browser-transport");
      AnchorLink = mod.default || mod;
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
