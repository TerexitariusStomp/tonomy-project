const rpcEndpoint = "https://pangea.eosio.node"; // replace with actual RPC endpoint
const rpc = new eosjs_jsonrpc.JsonRpc(rpcEndpoint);

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

async function transact(actions) {
  // TODO: replace with wallet signer (Tonomy ID / World Citizens Wallet)
  // Example: await window.tonomy.transact({ actions });
  throw new Error("Wallet signer not connected");
}

document.addEventListener("DOMContentLoaded", () => {
  const inviteBtn = document.getElementById("sendInvite");
  const inviteCode = document.getElementById("inviteCode");
  const inviteTarget = document.getElementById("inviteTarget");
  const inviteResult = document.getElementById("inviteResult");

  const upvoteBtn = document.getElementById("claimUpvotes");
  const upvoteStatus = document.getElementById("upvoteStatus");
  const upvoteMeter = document.querySelector("#upvoteMeter .fill");
  const upvoteCounts = document.getElementById("upvoteCounts");

  const bridgeBtn = document.getElementById("bridgeBtn");
  const bridgeStatus = document.getElementById("bridgeStatus");

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
      const user = inviteCode.value.trim();
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
      // Bridge initiation requires WAX-side action; surface memo and action params
      const memo = `TRANSFER_${Date.now()}`;
      setHint(
        bridgeStatus,
        `Lock ${amount} BLUX from ${waxAccount} to ${tonomyAccount} on bridge.cxc (WAX) with memo ${memo}. Then wait for mint on Tonomy.`,
        true
      );
    } catch (err) {
      setHint(bridgeStatus, `Error: ${err.message}`);
    }
  });
});
