console.log('app.js loaded');

import { buildTonomyLoginDeepLink, buildTonomyLoginQrLink, createSigner } from "./signer.js";
import { ExternalUser, setSettings } from "https://cdn.jsdelivr.net/npm/@tonomy/tonomy-id-sdk@0.6.2/dist/tonomy-id-sdk.esm.js";
import { JsonRpc } from "https://cdn.jsdelivr.net/npm/eosjs@22.1.0/dist/eosjs-jsonrpc.esm.js";
import { JsSignatureProvider } from "https://cdn.jsdelivr.net/npm/eosjs@22.1.0/dist/eosjs-jssig.esm.js";
import { Api } from "https://cdn.jsdelivr.net/npm/eosjs@22.1.0/dist/eosjs-api.esm.js";

// Network presets; update pangea values once live RPC + chainId are confirmed.
const NETWORKS = {
  pangea: {
    label: "Pangea (Tonomy)",
    rpc: "https://rpc.pangea.tonomy.io", // TODO: confirm/replace with official Pangea RPC endpoint
    chainId: null, // will be fetched via get_info when needed
    explorerTx: "https://explorer.pangea.url/transaction/"
  },
  eos: {
    label: "EOS Mainnet",
    rpc: "https://eos.greymass.com",
    chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3d119416cf6838fb94c5a37a",
    explorerTx: "https://bloks.io/transaction/"
  },
  jungle: {
    label: "Jungle Testnet",
    rpc: "https://jungle4.api.eosnation.io",
    chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
    explorerTx: "https://jungle4.bloks.io/transaction/"
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

const PASSPORT_ALLOWANCES = {
  0: 0,
  1: 10,
  2: 25,
  3: 50,
  4: 100
};

const ONBOARDING_STEPS = [
  { key: "welcome", title: "Welcome", detail: "Learn the cXc.world + Pangea flow." },
  { key: "create", title: "Create / Connect account", detail: "Sign in with Tonomy ID." },
  { key: "invite", title: "Enter invite code", detail: "Redeem a code to unlock daily upvotes." },
  { key: "verify", title: "Verify DID", detail: "Increase daily upvotes by completing verification." },
  { key: "tutorial", title: "Tutorial", detail: "Finish the walkthrough and start upvoting." },
];

let signer = null;
let rpc = null;
let sessionAccount = (typeof localStorage !== "undefined" && localStorage.getItem("sessionAccount")) || null;
let sessionDidLevel = null;
let selectedNetwork = (typeof localStorage !== "undefined" && localStorage.getItem("network")) || "pangea";
let customNetwork = {
  rpc: (typeof localStorage !== "undefined" && localStorage.getItem("customRpc")) || "",
  chainId: (typeof localStorage !== "undefined" && localStorage.getItem("customChainId")) || "",
};
let onboardingStepKey = (typeof localStorage !== "undefined" && localStorage.getItem("onboardingStep")) || ONBOARDING_STEPS[0].key;
let lastBridgeMemo = "";
let bridgePollHandle = null;
let upvoteBtnEl = null;
let upvoteStatusEl = null;
let upvoteMeterFillEl = null;
let upvoteCountsEl = null;
let upvoteResetEl = null;
let passportBadgeEl = null;
let passportHintEl = null;
let qrInstance = null;
let lastBuiltQrLink = null;

function currentNetwork() {
  const preset = NETWORKS[selectedNetwork] || NETWORKS.pangea;
  if (selectedNetwork === "custom") {
    return {
      label: preset.label,
      rpc: customNetwork.rpc || NETWORKS.pangea.rpc,
      chainId: customNetwork.chainId || NETWORKS.pangea.chainId,
      explorerTx: customNetwork.explorerTx || NETWORKS.pangea.explorerTx,
    };
  }
  return preset;
}

function tonomyExplorerBase() {
  return currentNetwork().explorerTx || EXPLORERS.tonomyTx;
}

async function getRpc() {
  if (!rpc) {
    const { JsonRpc } = eosjs_jsonrpc;
    rpc = new JsonRpc(currentNetwork().rpc);
  }
  return rpc;
}

async function fetchChainIdIfMissing(net) {
  const target = net || currentNetwork();
  if (target.chainId) return target.chainId;
  try {
    const infoRes = await fetch(`${target.rpc}/v1/chain/get_info`, { method: "POST" });
    if (!infoRes.ok) throw new Error(`RPC responded ${infoRes.status}`);
    const info = await infoRes.json();
    if (info?.chain_id) {
      NETWORKS[selectedNetwork].chainId = info.chain_id;
      return info.chain_id;
    }
  } catch (err) {
    console.warn("Could not fetch chain id:", err.message);
  }
  return null;
}

function setHint(el, text, success = false) {
  el.textContent = text;
  el.style.color = success ? "#3ecf8e" : "#9aa3b5";
}

function deriveAllowance(level) {
  const lvl = typeof level === "number" ? level : Number(level) || 0;
  return PASSPORT_ALLOWANCES.hasOwnProperty(lvl) ? PASSPORT_ALLOWANCES[lvl] : PASSPORT_ALLOWANCES[0];
}

function formatResetCountdown(date) {
  if (!date) return "";
  const target = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(target.getTime())) return "";
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return "Resets soon";
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m until reset`;
  return `${mins}m until reset`;
}

function estimateResetTime(allocRow) {
  const raw =
    allocRow?.next_reset ||
    allocRow?.reset_time ||
    allocRow?.reset_at ||
    allocRow?.resets_at ||
    allocRow?.reset;
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const now = new Date();
  const fallback = new Date(now);
  fallback.setHours(24, 0, 0, 0);
  return fallback;
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

function renderPassportLevel(level) {
  const lvl = typeof level === "number" ? level : Number(level) || 0;
  if (passportBadgeEl) {
    passportBadgeEl.textContent = `Passport level ${lvl}`;
  }
  if (passportHintEl) {
    const base = deriveAllowance(lvl);
    passportHintEl.textContent = lvl
      ? `Level ${lvl} detected. Base allowance ${base} upvotes/day.`
      : "Connect with Tonomy to load your level.";
  }
}

function renderUpvoteAllocation(allocRow, level) {
  const totalRaw = allocRow?.daily_upvotes;
  const total =
    typeof totalRaw === "number" ? totalRaw : Number(totalRaw) || deriveAllowance(level);
  const usedRaw = allocRow?.upvotes_used_today;
  const used = typeof usedRaw === "number" ? usedRaw : Number(usedRaw) || 0;
  const remaining = Math.max(total - used, 0);
  if (upvoteMeterFillEl) {
    upvoteMeterFillEl.style.width = total ? `${(remaining / total) * 100}%` : "0%";
  }
  if (upvoteCountsEl) {
    upvoteCountsEl.textContent = `${remaining} / ${total} upvotes`;
  }
  if (upvoteResetEl) {
    const resetDate = estimateResetTime(allocRow);
    const label = formatResetCountdown(resetDate);
    upvoteResetEl.textContent = label || "Reset time not available";
  }
  if (upvoteBtnEl) {
    upvoteBtnEl.disabled = total === 0 || remaining <= 0;
  }
  if (upvoteStatusEl && (total === 0 || remaining <= 0)) {
    const msg =
      total === 0
        ? "No daily upvote allocation for this passport level yet."
        : "Out of upvotes. Wait for reset or level up your passport.";
    setHint(upvoteStatusEl, msg);
  }
  return { total, remaining, used };
}

async function refreshPassportAndUpvotes(account, stats) {
  if (!account) return { stats: null, alloc: null };
  const userStats = stats || (await getUserStats(account));
  sessionDidLevel = userStats?.verification_level ?? sessionDidLevel ?? 0;
  renderPassportLevel(sessionDidLevel);
  try {
    const alloc = await getUpvoteAllocation(account);
    renderUpvoteAllocation(alloc, sessionDidLevel);
    return { stats: userStats, alloc };
  } catch (err) {
    if (upvoteStatusEl) setHint(upvoteStatusEl, `Could not load allocation: ${err.message}`);
    return { stats: userStats, alloc: null };
  }
}

async function ensureSigner() {
  console.log('Ensuring signer...');
  if (!signer) {
    const net = currentNetwork();
    // Ensure chainId is known before creating signer when possible
    if (!net.chainId) {
      await fetchChainIdIfMissing(net);
    }
    signer = await createSigner("tonomy", { ...net, chainId: net.chainId || NETWORKS.pangea.chainId });
  }
  if (!sessionAccount) {
    console.log('No sessionAccount, attempting login...');
    const loginResult = await signer.login();
    console.log('Login result:', loginResult);
    if (loginResult?.account) {
      sessionAccount = loginResult.account;
    }
  }
  return signer;
}

async function initSession() {
  console.log('Starting initSession');
  try {
    await ensureSigner();
    if (sessionAccount) {
      const stats = await getUserStats(sessionAccount);
      sessionDidLevel = stats?.verification_level ?? 0;
      if (inviteCode) inviteCode.value = sessionAccount;
      setHint(inviteResult, `Auto-connected as ${sessionAccount}`, true);
      if (stats && statsGrid) {
        statsGrid.querySelectorAll("strong")[0].textContent = stats.direct_invites || 0;
        statsGrid.querySelectorAll("strong")[1].textContent = stats.total_downstream || 0;
        statsGrid.querySelectorAll("strong")[2].textContent = `${(stats.total_rewards?.amount || 0) / 10000} BLUX`;
      }
      await refreshPassportAndUpvotes(sessionAccount, stats);
      await refreshReferralList(sessionAccount);
      renderOnboarding();
    }
  } catch (err) {
    console.error('Auto-session init failed:', err.message);
    // Silently fail; user can click connect if needed
  }
}

async function transact(actions) {
  console.log('Transact called with actions:', actions);
  await ensureSigner();
  if (!signer) {
    throw new Error("No signer available");
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
  rpc = null;
  signer = null;
  sessionAccount = null;
  sessionDidLevel = 0;
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

async function fetchBridgeTransfer(memo) {
  try {
    const apiRes = await fetch(`/v1/bridge/status/${encodeURIComponent(memo)}`);
    if (apiRes.ok) {
      const json = await apiRes.json();
      const row = json?.transfer || json?.data || json;
      if (row) return { row, source: "api" };
    }
  } catch (e) {
    // ignore and fall back to on-chain check
  }
  const r = await getRpc();
  const res = await r.get_table_rows({
    code: "bridge.cxc",
    scope: "bridge.cxc",
    table: "bridge_transfers",
    lower_bound: memo,
    upper_bound: memo,
    limit: 1,
  });
  return { row: res.rows?.[0], source: "table" };
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
      entry.innerHTML = `<div>${invited}</div><div class="muted">${status}${claimed ? " - claimed" : ""}</div>`;
      list.appendChild(entry);
    });
    if (totals) {
      totals.textContent = `Showing ${Math.min(rows.length, 25)} of ${rows.length} downstream invites`;
    }
  } catch (err) {
    list.textContent = `Error loading referrals: ${err.message}`;
  }
}

function renderTonomyQr(targetEl, link, statusEl) {
  if (!targetEl) return;
  const qrLib = window.QRCode;
  if (!qrLib) {
    if (statusEl) setHint(statusEl, "QR code library not loaded.");
    return;
  }
  if (!qrInstance) {
    qrInstance = new qrLib(targetEl, {
      text: link,
      width: 220,
      height: 220,
      colorDark: "#ffffff",
      colorLight: "#121212",
      correctLevel: qrLib.CorrectLevel.M,
    });
  } else {
    qrInstance.makeCode(link);
  }
  if (statusEl) setHint(statusEl, "Scan with the Tonomy wallet to connect.", true);
}

function defaultCallbackUrl() {
  if (typeof window === "undefined" || !window.location) return "";
  return `${window.location.origin}/callback`;
}

async function buildAndRenderLoginQr(qrBox, qrLinkInput, statusEl) {
  if (!qrBox) return null;
  try {
    if (statusEl) setHint(statusEl, "Building ESR login request...");
    const net = currentNetwork();
    if (!net.chainId) {
      await fetchChainIdIfMissing(net);
    }
    const { deepLink, error } = await buildTonomyLoginQrLink(
      { ...net, chainId: net.chainId || NETWORKS.pangea.chainId },
      {
      callbackUrl: defaultCallbackUrl(),
    }
    );
    lastBuiltQrLink = deepLink;
    if (qrLinkInput) qrLinkInput.value = deepLink;
    renderTonomyQr(qrBox, deepLink, statusEl);
    if (error && statusEl) {
      setHint(statusEl, `Using fallback deep link; ESR error: ${error.message}`);
    }
    return deepLink;
  } catch (err) {
    const fallback = buildTonomyLoginDeepLink(defaultCallbackUrl());
    lastBuiltQrLink = fallback;
    if (qrLinkInput) qrLinkInput.value = fallback;
    renderTonomyQr(qrBox, fallback, statusEl);
    if (statusEl) setHint(statusEl, `QR build failed: ${err.message}`);
    return fallback;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
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
  const upvoteReset = document.getElementById("upvoteReset");
  const passportBadge = document.getElementById("passportBadge");
  const passportHint = document.getElementById("passportHint");

  const bridgeBtn = document.getElementById("bridgeBtn");
  const bridgeCheckBtn = document.getElementById("bridgeCheckBtn");
  const bridgeMemoInput = document.getElementById("bridgeMemo");
  const bridgeStatus = document.getElementById("bridgeStatus");
  const onboardingNextBtn = document.getElementById("onboardingNext");
  const onboardingResetBtn = document.getElementById("onboardingReset");
  upvoteBtnEl = upvoteBtn;
  upvoteStatusEl = upvoteStatus;
  upvoteMeterFillEl = upvoteMeter;
  upvoteCountsEl = upvoteCounts;
  upvoteResetEl = upvoteReset;
  passportBadgeEl = passportBadge;
  passportHintEl = passportHint;
  renderPassportLevel(sessionDidLevel || 0);

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
      signer = null;
      sessionAccount = null;
      sessionDidLevel = 0;

      const qrCard = document.getElementById("qrCard");
      const qrBox = document.getElementById("tonomyQr");
      const qrStatus = document.getElementById("tonomyQrStatus");

      if (qrCard) {
        qrCard.style.display = 'block';
      }

      if (qrBox && qrStatus) {
        await buildAndRenderLoginQr(qrBox, null, qrStatus);
      }

      await ensureSigner();

      if (sessionAccount) {
        const stats = await getUserStats(sessionAccount);
        sessionDidLevel = stats?.verification_level ?? 0;
        inviteCode.value = sessionAccount;
        setHint(inviteResult, `Connected as ${sessionAccount}`, true);
        if (stats && statsGrid) {
          statsGrid.querySelectorAll("strong")[0].textContent = stats.direct_invites || 0;
          statsGrid.querySelectorAll("strong")[1].textContent = stats.total_downstream || 0;
          statsGrid.querySelectorAll("strong")[2].textContent = `${(stats.total_rewards?.amount || 0) / 10000} BLUX`;
        }
        await refreshPassportAndUpvotes(sessionAccount, stats);
        await refreshReferralList(sessionAccount);
        renderOnboarding();
        if (qrCard) {
          qrCard.style.display = 'none';
        }
      } else {
        setHint(inviteResult, "Scan the QR code with Tonomy wallet to connect.");
      }
    } catch (err) {
      console.error('Connect error:', err);
      setHint(inviteResult, `Connect error: ${err.message}`);
      if (qrStatus) {
        setHint(qrStatus, "Scan the QR code to connect.", true);
      }
    }
  });


  inviteBtn.addEventListener("click", async () => {
    try {
      setHint(inviteResult, "Sending invite...");
      await ensureSigner();
      const inviter = inviteCode.value.trim() || sessionAccount;
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
      await ensureSigner();
      const user = inviteCode.value.trim() || sessionAccount;
      await transact([{
        account: "invite.cxc",
        name: "claimdaily",
        authorization: [{ actor: user, permission: "active" }],
        data: { user }
      }]);
      await refreshPassportAndUpvotes(user);
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
      updateBridgeStepper("lock");
      stopBridgePolling();
      setHint(
        bridgeStatus,
        `Lock ${amount} BLUX from ${waxAccount} to ${tonomyAccount} on bridge.cxc (WAX) using memo ${memo}; then click "Check Bridge Status" to watch for the mint on Tonomy.`,
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
        const { row, source } = await fetchBridgeTransfer(memo);
        if (!row) {
          setHint(bridgeStatus, `No bridge transfer found for memo ${memo}`);
          updateBridgeStepper("memo");
          return false;
        }
        const statusRaw = (row.status || row.state || row.bridge_status || "pending").toString().toLowerCase();
        const qty = row.quantity || row.amount || row.value || "";
        const waxFrom = row.wax_account || row.from || row.wax_from || "";
        const tonomyTo = row.tonomy_account || row.to || row.tonomy_to || "";
        const txid = row.txid || row.trx_id || row.trxid || row.tonomy_txid;
        const waxTx = row.wax_trxid || row.wax_txid || row.wax_trx;
        setBridgeExplorers({
          waxTx: waxTx ? `${EXPLORERS.waxTx}${waxTx}` : "",
          tonomyTx: txid ? `${tonomyExplorerBase()}${txid}` : "",
        });
        let stage = (row.stage || row.bridge_stage || "").toString().toLowerCase() || "memo";
        if (statusRaw.includes("lock")) stage = "lock";
        if (statusRaw.includes("mint") || statusRaw.includes("done") || statusRaw.includes("complete")) stage = "done";
        updateBridgeStepper(stage === "done" ? "done" : stage);
        const finished =
          statusRaw.includes("mint") || statusRaw.includes("done") || statusRaw.includes("complete") || statusRaw.includes("refund");
        setHint(
          bridgeStatus,
          `Status (${source || "table"}): ${statusRaw} | ${qty} from ${waxFrom} to ${tonomyTo} (memo ${memo})`,
          finished
        );
        return finished;
      };
      const finished = await check();
      if (!finished) {
        bridgePollHandle = setInterval(check, 10000);
      }
    } catch (err) {
      setHint(bridgeStatus, `Error: ${err.message}`);
    }
  });

  onboardingNextBtn?.addEventListener("click", advanceOnboarding);
  onboardingResetBtn?.addEventListener("click", resetOnboarding);
  renderOnboarding();
});
