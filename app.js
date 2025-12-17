import { createSigner } from "./signer.js";

// Default to EOS mainnet. Swap to Jungle or Pangea RPC as needed.
const rpcEndpoint = "https://eos.greymass.com";
// const rpcEndpoint = "https://jungle3.eosio.dev"; // Jungle
// const rpcEndpoint = "https://pangea.rpc.url";    // Pangea
const rpc = new eosjs_jsonrpc.JsonRpc(rpcEndpoint);
let signer = null;
let sessionAccount = null;
let sessionDidLevel = null;

function setHint(el, text, success = false) {
  el.textContent = text;
  el.style.color = success ? "#3ecf8e" : "#9aa3b5";
}

async function getUserStats(account) {
  const res = await rpc.get_table_rows({
    code: "invite.cxc",
    scope: "invite.cxc",
    table: "userstats",
    lower_bound: account,
    upper_bound: account,
    limit: 1,
  });
  return res.rows[0];
}

async function getInviteStatus(invited) {
  const res = await rpc.get_table_rows({
    code: "invite.cxc",
    scope: "invite.cxc",
    table: "invites",
    lower_bound: invited,
    upper_bound: invited,
    limit: 1,
  });
  return res.rows[0];
}

async function getUpvoteAllocation(user) {
  const res = await rpc.get_table_rows({
    code: "invite.cxc",
    scope: "invite.cxc",
    table: "upvotes",
    lower_bound: user,
    upper_bound: user,
    limit: 1,
  });
  return res.rows[0];
}

async function getDownstreamCounts(root) {
  const idx = await rpc.get_table_rows({
    code: "invite.cxc",
    scope: "invite.cxc",
    table: "invites",
    index_position: 2,
    key_type: "name",
    lower_bound: root,
    upper_bound: root,
    limit: 500,
  });
  return idx.rows;
}

async function transact(actions) {
  if (!signer) {
    signer = await createSigner();
    const { account } = await signer.login();
    sessionAccount = account;
  }
  return signer.transact({ actions });
}

document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const inviteBtn = document.getElementById("sendInvite");
  const inviteCode = document.getElementById("inviteCode");
  const inviteTarget = document.getElementById("inviteTarget");
  const inviteResult = document.getElementById("inviteResult");
  const statsGrid = document.getElementById("stats");

  const upvoteBtn = document.getElementById("claimUpvotes");
  const upvoteStatus = document.getElementById("upvoteStatus");
  const upvoteMeter = document.querySelector("#upvoteMeter .fill");
  const upvoteCounts = document.getElementById("upvoteCounts");

  const bridgeBtn = document.getElementById("bridgeBtn");
  const bridgeStatus = document.getElementById("bridgeStatus");

  connectBtn?.addEventListener("click", async () => {
    try {
      signer = await createSigner();
      const { account } = await signer.login();
      sessionAccount = account;
      const stats = await getUserStats(account);
      sessionDidLevel = stats ? stats.verification_level : null;
      inviteCode.value = account;
      setHint(inviteResult, `Connected as ${account}`, true);
      if (stats) {
        statsGrid.querySelectorAll("strong")[0].textContent = stats.direct_invites || 0;
        statsGrid.querySelectorAll("strong")[1].textContent = stats.total_downstream || 0;
        statsGrid.querySelectorAll("strong")[2].textContent = `${(stats.total_rewards?.amount || 0) / 10000} BLUX`;
      }
    } catch (err) {
      setHint(inviteResult, `Connect error: ${err.message}`);
    }
  });

  inviteBtn.addEventListener("click", async () => {
    try {
      setHint(inviteResult, "Sending invite...");
      const inviter = inviteCode.value.trim();
      const invited = inviteTarget.value.trim();

      await transact([{
        account: "invite.cxc",
        name: "sendinvite",
        authorization: [{ actor: inviter, permission: "active" }],
        data: { inviter, invited }
      }]);

      const row = await getInviteStatus(invited);
      setHint(inviteResult, row ? "Invite recorded on-chain." : "Invite sent.", true);
    } catch (err) {
      setHint(inviteResult, `Error: ${err.message}`);
    }
  });

  upvoteBtn.addEventListener("click", async () => {
    try {
      setHint(upvoteStatus, "Claiming upvotes...");
      const user = inviteCode.value.trim() || sessionAccount;
      await transact([{
        account: "invite.cxc",
        name: "claimdaily",
        authorization: [{ actor: user, permission: "active" }],
        data: { user }
      }]);
      const alloc = await getUpvoteAllocation(user);
      const remaining = alloc ? alloc.daily_upvotes - alloc.upvotes_used_today : 0;
      const total = alloc ? alloc.daily_upvotes : 0;
      upvoteMeter.style.width = total ? `${(remaining / total) * 100}%` : "0%";
      upvoteCounts.textContent = `${remaining} / ${total} upvotes`;
      setHint(upvoteStatus, "Daily upvotes claimed", true);
    } catch (err) {
      setHint(upvoteStatus, `Error: ${err.message}`);
    }
  });

  bridgeBtn.addEventListener("click", async () => {
    const amount = document.getElementById("bridgeAmount").value;
    const tonomyAccount = document.getElementById("tonomyAccount").value.trim();
    const waxAccount = document.getElementById("waxAccount").value.trim();
    try {
      setHint(bridgeStatus, "Initiating bridge...");
      // Bridge initiation requires WAX-side lock; surface memo and action params for a WAX wallet SDK call.
      const memo = `TRANSFER_${Date.now()}`;
      setHint(
        bridgeStatus,
        `Lock ${amount} BLUX from ${waxAccount} to ${tonomyAccount} on bridge.cxc (WAX) memo ${memo}; then wait for oracle mint on Tonomy.`,
        true
      );
    } catch (err) {
      setHint(bridgeStatus, `Error: ${err.message}`);
    }
  });
});
