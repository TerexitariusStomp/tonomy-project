// Signer adapter supporting Tonomy ID and Anchor Link.
// Fill in CHAIN_ID and RPC endpoint before production.
import AnchorLink from "anchor-link";
import AnchorLinkBrowserTransport from "anchor-link-browser-transport";
import { createTonomyId } from "@tonomy/tonomy-id-sdk";

const CHAIN_ID = "REPLACE_WITH_PANGEA_CHAIN_ID";
const NODE_URL = "https://pangea.node.url";

export function detectSignerPreference() {
  const stored = localStorage.getItem("signerPreference");
  if (stored) return stored;
  if (typeof window !== "undefined" && window.tonomy) return "tonomy";
  return "anchor";
}

export async function createSigner(kind = detectSignerPreference()) {
  if (kind === "tonomy") return createTonomySigner();
  return createAnchorSigner();
}

async function createTonomySigner() {
  const tonomy = window.tonomy || (await createTonomyId({
    appId: "cxc.world",
    callbackUrl: window.location.href,
  }));

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
    const session = await link.restoreSession("cxc-world");
    if (!session) throw new Error("No Anchor session");
    return session.transact(args);
  }

  return { kind: "anchor", login, transact };
}
