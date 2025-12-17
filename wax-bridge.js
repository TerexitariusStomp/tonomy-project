// Minimal WAX wallet connect helper for lockwax action.
// Requires wax wallet connect SDK (e.g., @waxio/waxjs or WAX Wallet Connect JS).

import { WaxJS } from "@waxio/waxjs"; // install via npm i @waxio/waxjs

const WAX_RPC = "https://wax.greymass.com"; // adjust as needed
const WAX_CHAIN_ID = "1064487b3cd1a897ce03ae5b6a865651747e2e1b046b6b1e4f1f1f9f0f0b0c5b";

export async function createWax() {
  const wax = new WaxJS({
    rpcEndpoint: WAX_RPC,
    tryAutoLogin: true,
  });

  async function login() {
    const userAccount = await wax.login();
    return { account: userAccount };
  }

  async function lockBlux({ from, quantity, tonomy_account, memo }) {
    return wax.api.transact({
      actions: [{
        account: "bridge.cxc",
        name: "lockwax",
        authorization: [{ actor: from, permission: "active" }],
        data: { from, quantity, tonomy_account, memo },
      }]
    }, { blocksBehind: 3, expireSeconds: 90 });
  }

  return { login, lockBlux };
}
