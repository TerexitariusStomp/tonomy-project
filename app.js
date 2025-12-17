import { createSigner, detectSignerPreference } from "./signer.js";

// Network presets; update pangea values once live RPC + chainId are confirmed.
const NETWORKS = {
  pangea: {
    label: "Pangea (Tonomy)",
    rpc: "https://pangea.rpc.url", // TODO: replace with live Pangea RPC
    chainId: "PANGEA_CHAIN_ID_HERE"
  },
  eos: {
    label: "EOS Mainnet",
    rpc: "https://eos.greymass.com",
    chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3d119416cf6838fb94c5a37a"
  },
  jungle: {
    label: "Jungle Testnet",
    rpc: "https://jungle3.eosio.dev",
    chainId: "73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d"
  },
  custom: {
    label: "Custom",
    rpc: "",
    chainId: ""
  }
};

const EXPLORERS = {
  waxTx: "https://wax.bloks.io/transaction/",
  tonomyTx: "https://explorer.pangea.url/transaction/" // TODO: replace with live explorer base
};

const ONBOARDING_STEPS = [
  { key: "welcome", title: "Welcome", detail: "Learn the cXc.world + Pangea flow." },
  { key: "create", title: "Create / Connect account", detail: "Sign in with Tonomy ID or Anchor." },
  { key: "invite", title: "Enter invite code", detail: "Redeem a code to unlock daily upvotes." },
  { key: "verify", title: "Verify DID", detail: "Increase daily upvotes by completing verification." },
  { key: "tutorial", title: "Tutorial", detail: "Finish the walkthrough and start upvoting." },
];

let signer = null;
let rpc = null;
let sessionAccount = null;
let sessionDidLevel = null;
let selectedSignerKind = "auto";
let selectedNetwork = (typeof localStorage !== "undefined" && localStorage.getItem("network")) || "pangea";
let customNetwork = {
  rpc: (typeof localStorage !== "undefined" && localStorage.getItem("customRpc")) || "",
  chainId: (typeof localStorage !== "undefined" && localStorage.getItem("customChainId")) || "",
};
let onboardingStepKey = (typeof localStorage !== "undefined" && localStorage.getItem("onboardingStep")) || ONBOARDING_STEPS[0].key;
let lastBridgeMemo = "";
let bridgePollHandle = null;
let lastEsrPayload = null;
let esrCallbackData = null;

function currentNetwork() {
  const preset = NETWORKS[selectedNetwork] || NETWORKS.pangea;
  if (selectedNetwork === "custom") {
    return {
      label: preset.label,
      rpc: customNetwork.rpc || NETWORKS.pangea.rpc,
      chainId: customNetwork.chainId || NETWORKS.pangea.chainId,
    };
  }
  return preset;
}

async function getRpc() {
  if (!rpc) {
    const { JsonRpc } = eosjs_jsonrpc;
    rpc = new JsonRpc(currentNetwork().rpc);
  }
  return rpc;
}

function setHint(el, text, success = false) {
  el.textContent = text;
  el.style.color = success ? "#3ecf8e" : "#9aa3b5";
}

function updateEsrOutputs(payload, msg) {
  const esrUriField = document.getElementById("esrUri");
  const esrDeepLinkField = document.getElementById("esrDeepLink");
  const esrStatus = document.getElementById("esrStatus");
  if (!payload) return;
  if (esrUriField) esrUriField.value = payload.esrUri || payload.request || "";
  if (esrDeepLinkField) esrDeepLinkField.value = payload.deepLink || "";
  if (esrStatus && msg) setHint(esrStatus, msg, true);
}

async function getUserStats(account) {
  const r = await getRpc();
  const res = await r.get_table_rows({
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
  const r = await getRpc();
  const res = await r.get_table_rows({
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
  const r = await getRpc();
  const res = await r.get_table_rows({
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
  const r = await getRpc();
  const idx = await r.get_table_rows({
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

function parseEsrCallbackAndClear() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.get("esrResponse")) return null;
    const data = {
      request: url.searchParams.get("request"),
      signature: url.searchParams.get("signature"),
      account: url.searchParams.get("account"),
      permission: url.searchParams.get("permission"),
      requestId: url.searchParams.get("requestId"),
    };
    ["esrResponse", "request", "signature", "account", "permission", "requestId"].forEach((k) =>
      url.searchParams.delete(k)
    );
    window.history.replaceState({}, document.title, url.toString());
    return data;
  } catch (e) {
    return null;
  }
}

async function ensureSigner() {
  const resolvedKind = selectedSignerKind === "auto" ? detectSignerPreference() : selectedSignerKind;
  if (!signer) {
    signer = await createSigner(resolvedKind, currentNetwork());
  }
  if (!sessionAccount) {
    const loginResult = await signer.login();
    if (loginResult?.account) {
      sessionAccount = loginResult.account;
    }
    if (signer.kind === "esr") {
      lastEsrPayload = loginResult;
      if (esrCallbackData?.account && !sessionAccount) {
        sessionAccount = esrCallbackData.account;
      }
    }
  }
  return signer;
}

async function transact(actions) {
  await ensureSigner();
  if (!signer) {
    throw new Error("No signer available");
  }
  if (signer.kind === "esr") {
    const res = await signer.transact({ actions });
    lastEsrPayload = res;
    return res;
  }
  return signer.transact({ actions });
}

function saveOnboardingStep(key) {
  onboardingStepKey = key;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("onboardingStep", key);
  }
}

function renderOnboarding() {
  const list = document.getElementById("onboardingList");
  if (!list) return;
  list.innerHTML = "";
  const activeIndex = ONBOARDING_STEPS.findIndex((s) => s.key === onboardingStepKey);
  ONBOARDING_STEPS.forEach((step, idx) => {
    const item = document.createElement("div");
    item.className = "step-row " + (idx < activeIndex ? "done" : idx === activeIndex ? "active" : "");
    item.innerHTML = `<div class="badge">${idx + 1}</div><div><strong>${step.title}</strong><div class="muted">${step.detail}</div></div>`;
    list.appendChild(item);
  });
  const status = document.getElementById("onboardingStatus");
  if (status) {
    const nextStep = ONBOARDING_STEPS[activeIndex] || ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];
    status.textContent = `Next: ${nextStep.title}`;
  }
}

function advanceOnboarding() {
  const idx = ONBOARDING_STEPS.findIndex((s) => s.key === onboardingStepKey);
  const nextIdx = Math.min(idx + 1, ONBOARDING_STEPS.length - 1);
  saveOnboardingStep(ONBOARDING_STEPS[nextIdx].key);
  renderOnboarding();
}

function resetOnboarding() {
  saveOnboardingStep(ONBOARDING_STEPS[0].key);
  renderOnboarding();
}

function setNetwork(kind) {
  selectedNetwork = kind;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("network", kind);
  }
  const net = currentNetwork();
  if (window.esrHelper && typeof window.esrHelper.setNetwork === "function") {
    window.esrHelper.setNetwork({ chainId: net.chainId, rpcEndpoint: net.rpc });
  }
  rpc = null;
  signer = null;
  sessionAccount = null;
  sessionDidLevel = null;
}

function stopBridgePolling() {
  if (bridgePollHandle) {
    clearInterval(bridgePollHandle);
    bridgePollHandle = null;
  }
}

function updateBridgeStepper(stage) {
  const steps = document.querySelectorAll("#bridgeStepper .step");
  const order = ["memo", "lock", "mint", "done"];
  const stageIndex = order.indexOf(stage);
  steps.forEach((el) => {
    const val = el.getAttribute("data-step");
    el.classList.remove("active", "done");
    const valIndex = order.indexOf(val);
    if (valIndex === stageIndex) el.classList.add("active");
    if (valIndex !== -1 && valIndex < stageIndex) el.classList.add("done");
  });
}

function setBridgeExplorers({ waxTx, tonomyTx }) {
  const waxLink = document.getElementById("bridgeExplorerWax");
  const tonomyLink = document.getElementById("bridgeExplorerTonomy");
  if (waxLink) {
    waxLink.href = waxTx || "#";
    waxLink.classList.toggle("hidden", !waxTx);
  }
  if (tonomyLink) {
    tonomyLink.href = tonomyTx || "#";
    tonomyLink.classList.toggle("hidden", !tonomyTx);
  }
}

async function refreshReferralList(account) {
  const list = document.getElementById("referralList");
  const totals = document.getElementById("referralTotals");
  if (!account || !list) return;
  try {
    list.textContent = "Loading referrals...";
    const rows = await getDownstreamCounts(account);
    if (!rows || rows.length === 0) {
      list.textContent = "No invites yet. Share your code to start building your tree.";
      return;
    }
    list.innerHTML = "";
    rows.slice(0, 25).forEach((row) => {
      const invited = row.invited || row.user || row.account || row.target || "unknown";
      const status = row.status || row.state || "pending";
      const claimed = row.claimed || row.accepted || false;
      const entry = document.createElement("div");
      entry.className = "referral-row";
      entry.innerHTML = `<div>${invited}</div><div class="muted">${status}${claimed ? " • claimed" : ""}</div>`;
      list.appendChild(entry);
    });
    if (totals) {
      totals.textContent = `Showing ${Math.min(rows.length, 25)} of ${rows.length} downstream invites`;
    }
  } catch (err) {
    list.textContent = `Error loading referrals: ${err.message}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const signerSelect = document.getElementById("signerSelect");
  const networkSelect = document.getElementById("networkSelect");
  const customRpcInput = document.getElementById("customRpc");
  const customChainIdInput = document.getElementById("customChainId");
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
  const bridgeCheckBtn = document.getElementById("bridgeCheckBtn");
  const bridgeMemoInput = document.getElementById("bridgeMemo");
  const bridgeStatus = document.getElementById("bridgeStatus");
  const onboardingNextBtn = document.getElementById("onboardingNext");
  const onboardingResetBtn = document.getElementById("onboardingReset");
  const esrUriField = document.getElementById("esrUri");
  const esrDeepLinkField = document.getElementById("esrDeepLink");
  const esrStatus = document.getElementById("esrStatus");
  const esrOpenBtn = document.getElementById("openEsr");

  esrCallbackData = parseEsrCallbackAndClear();
  if (esrCallbackData?.account) {
    sessionAccount = esrCallbackData.account;
    selectedSignerKind = "esr";
    if (signerSelect) signerSelect.value = "esr";
    if (inviteCode) inviteCode.value = sessionAccount;
    setHint(inviteResult, `Tonomy callback received for ${sessionAccount}`, true);
  }
  if (esrCallbackData?.request) {
    updateEsrOutputs(esrCallbackData, "ESR callback received.");
  }

  if (networkSelect) {
    networkSelect.value = selectedNetwork;
    if (networkSelect.value !== selectedNetwork) {
      networkSelect.value = "pangea";
      selectedNetwork = "pangea";
    }
    const toggleCustom = () => {
      const isCustom = networkSelect.value === "custom";
      customRpcInput.classList.toggle("hidden", !isCustom);
      customChainIdInput.classList.toggle("hidden", !isCustom);
    };
    toggleCustom();
    if (customRpcInput && customNetwork.rpc) customRpcInput.value = customNetwork.rpc;
    if (customChainIdInput && customNetwork.chainId) customChainIdInput.value = customNetwork.chainId;
    networkSelect.addEventListener("change", () => {
      setNetwork(networkSelect.value);
      toggleCustom();
      setHint(inviteResult, `Network set to ${currentNetwork().label || networkSelect.value}`);
    });
    [customRpcInput, customChainIdInput].forEach((input) => {
      input?.addEventListener("change", () => {
        customNetwork = {
          rpc: customRpcInput.value.trim(),
          chainId: customChainIdInput.value.trim(),
        };
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("customRpc", customNetwork.rpc);
          localStorage.setItem("customChainId", customNetwork.chainId);
        }
        setNetwork("custom");
        networkSelect.value = "custom";
        rpc = null;
        signer = null;
        setHint(inviteResult, "Custom network saved.");
      });
    });
  }

  connectBtn?.addEventListener("click", async () => {
    try {
      selectedSignerKind = signerSelect?.value || "auto";
      signer = null;
      sessionAccount = null;
      sessionDidLevel = null;

      await ensureSigner();

      if (signer.kind === "esr") {
        updateEsrOutputs(lastEsrPayload, "ESR link generated. Open in Tonomy to complete sign-in.");
        if (!sessionAccount) {
          setHint(inviteResult, "Waiting for Tonomy callback to confirm account...");
          return;
        }
      }

      if (sessionAccount) {
        const stats = await getUserStats(sessionAccount);
        sessionDidLevel = stats ? stats.verification_level : null;
        inviteCode.value = sessionAccount;
        setHint(inviteResult, `Connected as ${sessionAccount}`, true);
        if (stats) {
          statsGrid.querySelectorAll("strong")[0].textContent = stats.direct_invites || 0;
          statsGrid.querySelectorAll("strong")[1].textContent = stats.total_downstream || 0;
          statsGrid.querySelectorAll("strong")[2].textContent = `${(stats.total_rewards?.amount || 0) / 10000} BLUX`;
        }
        await refreshReferralList(sessionAccount);
        renderOnboarding();
      } else {
        setHint(inviteResult, "Could not determine account from signer.");
      }
    } catch (err) {
      setHint(inviteResult, `Connect error: ${err.message}`);
    }
  });

  inviteBtn.addEventListener("click", async () => {
    try {
      setHint(inviteResult, "Sending invite...");
      await ensureSigner();
      const inviter = inviteCode.value.trim() || sessionAccount;
      const invited = inviteTarget.value.trim();

      const txResult = await transact([{
        account: "invite.cxc",
        name: "sendinvite",
        authorization: [{ actor: inviter, permission: "active" }],
        data: { inviter, invited }
      }]);

      if (signer.kind === "esr") {
        updateEsrOutputs(txResult, `Open in Tonomy to sign invite for ${invited}.`);
        return;
      }

      const row = await getInviteStatus(invited);
      setHint(inviteResult, row ? "Invite recorded on-chain." : "Invite sent.", true);
    } catch (err) {
      setHint(inviteResult, `Error: ${err.message}`);
    }
  });

  upvoteBtn.addEventListener("click", async () => {
    try {
      setHint(upvoteStatus, "Claiming upvotes...");
      await ensureSigner();
      const user = inviteCode.value.trim() || sessionAccount;
      const txResult = await transact([{
        account: "invite.cxc",
        name: "claimdaily",
        authorization: [{ actor: user, permission: "active" }],
        data: { user }
      }]);
      if (signer.kind === "esr") {
        updateEsrOutputs(txResult, "Open in Tonomy to sign daily upvotes.");
        return;
      }
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
      lastBridgeMemo = memo;
      bridgeMemoInput.value = memo;
      updateBridgeStepper("memo");
      stopBridgePolling();
      setHint(
        bridgeStatus,
        `Lock ${amount} BLUX from ${waxAccount} to ${tonomyAccount} on bridge.cxc (WAX) memo ${memo}; then wait for oracle mint on Tonomy.`,
        true
      );
    } catch (err) {
      setHint(bridgeStatus, `Error: ${err.message}`);
    }
  });

  bridgeCheckBtn?.addEventListener("click", async () => {
    try {
      const memo = bridgeMemoInput.value.trim() || lastBridgeMemo;
      if (!memo) throw new Error("Enter or generate a bridge memo first");
      setHint(bridgeStatus, "Checking bridge status...");
      stopBridgePolling();
      const check = async () => {
        const r = await getRpc();
        const res = await r.get_table_rows({
          code: "bridge.cxc",
          scope: "bridge.cxc",
          table: "bridge_transfers",
          lower_bound: memo,
          upper_bound: memo,
          limit: 1,
        });
        const row = res.rows?.[0];
        if (!row) {
          setHint(bridgeStatus, `No bridge transfer found for memo ${memo}`);
          updateBridgeStepper("memo");
          return false;
        }
        const status = (row.status || row.state || "pending").toLowerCase();
        const qty = row.quantity || row.amount || "";
        const waxFrom = row.wax_account || row.from || "";
        const tonomyTo = row.tonomy_account || row.to || "";
        const txid = row.txid || row.trx_id || row.trxid;
        const waxTx = row.wax_trxid || row.wax_txid || null;
        setBridgeExplorers({
          waxTx: waxTx ? `${EXPLORERS.waxTx}${waxTx}` : "",
          tonomyTx: txid ? `${EXPLORERS.tonomyTx}${txid}` : "",
        });
        let stage = "memo";
        if (status.includes("lock")) stage = "lock";
        if (status.includes("mint") || status.includes("done") || status.includes("complete")) stage = "done";
        updateBridgeStepper(stage === "done" ? "done" : stage);
        setHint(
          bridgeStatus,
          `Status: ${status} | ${qty} from ${waxFrom} to ${tonomyTo} (memo ${memo})`,
          status.includes("mint") || status.includes("done") || status.includes("complete")
        );
        return status.includes("mint") || status.includes("done") || status.includes("complete") || status.includes("refund");
      };
      const finished = await check();
      if (!finished) {
        bridgePollHandle = setInterval(check, 10000);
      }
    } catch (err) {
      setHint(bridgeStatus, `Error: ${err.message}`);
    }
  });

  esrOpenBtn?.addEventListener("click", () => {
    const link = esrDeepLinkField?.value;
    if (link) {
      window.location.href = link;
    } else if (esrStatus) {
      setHint(esrStatus, "No ESR deep link available. Choose ESR and connect to generate one.");
    }
  });

  onboardingNextBtn?.addEventListener("click", advanceOnboarding);
  onboardingResetBtn?.addEventListener("click", resetOnboarding);
  renderOnboarding();
});
