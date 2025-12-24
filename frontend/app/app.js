console.log('app.js loaded');

// Dynamically load the SDK bundle (includes deps) with local fallback.
async function initTonomySettings() {
  let mod = null;
  let setSettings = null;
  const sdkUrl = "https://cdn.skypack.dev/@tonomy/tonomy-id-sdk@0.36.0";
  try {
    mod = await import(sdkUrl);
    window.TonomySDKUrl = sdkUrl;
  } catch (err) {
    console.error("Failed to load Tonomy SDK:", err?.message || err);
    return setSettings;
  }
  if (mod) {
    setSettings =
      mod?.setSettings ||
      mod?.default?.setSettings ||
      mod?.default ||
      mod;
    if (typeof setSettings === "function") {
      setSettings({
        ssoWebsiteOrigin: "https://accounts.testnet.tonomy.io",
        blockchainUrl: "https://test.pangea.eosusa.io",
        communicationUrl: "wss://communication.testnet.tonomy.io",
        currencySymbol: "TONO",
      });
      window.TonomySDK = mod;
    } else {
      console.error("setSettings not found in Tonomy SDK module");
    }
  }
  return setSettings;
}

import { buildTonomyLoginDeepLink, buildTonomyLoginQrLink, createSigner } from "./signer.js";

const INVITE_CONTRACT = "invitono"; // invitono contract from TonomyInvite repo
const INVITE_SCOPE = INVITE_CONTRACT;

const TETRA_SERIES = [
  1, 4, 10, 20, 35, 56, 84, 120, 165, 220, 286, 364, 455, 560, 680, 816, 969, 1140, 1330,
  1540, 1771, 2024, 2300, 2600, 999999999,
];

// Network presets; update pangea values once live RPC + chainId are confirmed.
const NETWORKS = {
  pangea: {
    label: "Pangea (Tonomy)",
    rpc: "https://test.pangea.eosusa.io",
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

// Toggle ESR QR generation. Disabled to avoid flaky CDN ESM fetches; falls back to deep link.
const USE_ESR_QR = false;

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
let inviteScoreValueEl = null;
let invitePositionValueEl = null;
let inviteCooldownValueEl = null;
let inviteClaimedValueEl = null;
let inviteConfigBoxEl = null;
let inviteGlobalStatsEl = null;

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

function calculateTetraPosition(score) {
  const val = typeof score === "number" ? score : Number(score) || 0;
  for (let i = 0; i < TETRA_SERIES.length; i += 1) {
    if (TETRA_SERIES[i] > val) return i;
  }
  return TETRA_SERIES.length - 1;
}

function formatInviteCooldown(lastUpdatedSec, rateSeconds) {
  const last = Number(lastUpdatedSec);
  const rate = Number(rateSeconds);
  if (!last || !rate) return "";
  const elapsed = Math.floor(Date.now() / 1000) - last;
  const remaining = Math.max(rate - elapsed, 0);
  if (remaining <= 0) return "ready";
  if (remaining < 60) return `${remaining}s left`;
  const mins = Math.ceil(remaining / 60);
  if (mins >= 120) return `${Math.ceil(mins / 60)}h left`;
  return `${mins}m left`;
}

function normalizeSymbol(sym) {
  if (!sym) return "";
  if (typeof sym === "string") return sym;
  if (sym.sym) return sym.sym;
  if (sym.symbol) return sym.symbol;
  return String(sym);
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
  try {
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
  } catch (err) {
    console.warn("User stats fetch failed:", err.message);
    return null;
  }
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
  try {
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
  } catch (err) {
    console.warn("Upvote allocation fetch failed:", err.message);
    return null;
  }
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

async function getAdopterRow(account) {
  const r = await getRpc();
  const res = await r.get_table_rows({
    code: INVITE_CONTRACT,
    scope: INVITE_SCOPE,
    table: "adopters",
    lower_bound: account,
    upper_bound: account,
    limit: 1,
  });
  return res.rows?.[0];
}

async function getInviteConfig() {
  const r = await getRpc();
  const res = await r.get_table_rows({
    code: INVITE_CONTRACT,
    scope: INVITE_SCOPE,
    table: "config",
    limit: 1,
  });
  return res.rows?.[0];
}

async function getInviteStatsGlobal() {
  const r = await getRpc();
  const res = await r.get_table_rows({
    code: INVITE_CONTRACT,
    scope: INVITE_SCOPE,
    table: "stats",
    limit: 1,
  });
  return res.rows?.[0];
}

async function getInviteLeaderboard(limit = 15) {
  const r = await getRpc();
  const res = await r.get_table_rows({
    code: INVITE_CONTRACT,
    scope: INVITE_SCOPE,
    table: "adopters",
    index_position: 2,
    key_type: "i64",
    limit,
  });
  return res.rows || [];
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

function renderInviteProgram({ adopter, config, stats }) {
  if (inviteScoreValueEl) inviteScoreValueEl.textContent = adopter ? adopter.score || 0 : 0;
  if (invitePositionValueEl) {
    const pos = adopter ? calculateTetraPosition(adopter.score || 0) : null;
    invitePositionValueEl.textContent = adopter ? `Pos ${pos}` : "-";
  }
  if (inviteCooldownValueEl) {
    const cooldown = adopter && config ? formatInviteCooldown(adopter.lastupdated, config.invite_rate_seconds) : "";
    inviteCooldownValueEl.textContent = cooldown || "-";
  }
  if (inviteClaimedValueEl) {
    inviteClaimedValueEl.textContent = adopter ? (adopter.claimed ? "Yes" : "No") : "-";
  }
  if (inviteConfigBoxEl) {
    if (!config) {
      inviteConfigBoxEl.innerHTML = "<div class=\"muted\">No config found on-chain.</div>";
    } else {
      const rewardRate = config.reward_rate ? (Number(config.reward_rate) / 100).toFixed(2) : "1.00";
      const rows = [
        `Min account age: ${config.min_account_age_days || 0} days`,
        `Invite cooldown: ${config.invite_rate_seconds || 0}s between invites`,
        `Referral depth: ${config.max_referral_depth || 0} levels`,
        `Reward rate: ${rewardRate} ${normalizeSymbol(config.reward_symbol)} / point`,
        `Token contract: ${config.token_contract || "n/a"}`,
        `Multiplier: ${config.multiplier || 0}x`,
        `Enabled: ${config.enabled ? "yes" : "paused"}`,
      ];
      inviteConfigBoxEl.innerHTML = rows.map((r) => `<div>${r}</div>`).join("");
    }
  }
  if (inviteGlobalStatsEl && stats) {
    inviteGlobalStatsEl.textContent = `Users: ${stats.total_users || 0} | Referrals: ${stats.total_referrals || 0} | Last registered: ${stats.last_registered || "-"}`;
  }
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

async function loadInviteProgramData(account) {
  try {
    const userAccount = account || sessionAccount || (typeof document !== "undefined" ? document.getElementById("inviteCode")?.value?.trim() : "");
    const [config, stats, adopter] = await Promise.all([
      getInviteConfig().catch(() => null),
      getInviteStatsGlobal().catch(() => null),
      userAccount ? getAdopterRow(userAccount).catch(() => null) : Promise.resolve(null),
    ]);
    renderInviteProgram({ adopter, config, stats });
    await refreshReferralList(userAccount, { config });
    return { adopter, config, stats };
  } catch (err) {
    console.warn("Invite program load failed:", err.message);
    return { adopter: null, config: null, stats: null };
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
    const signerKind = selectedNetwork === "local" ? "local" : "tonomy";
    signer = await createSigner(signerKind, net);
  }
  if (!sessionAccount) {
    console.log('No sessionAccount, attempting login...');
    const loginResult = await signer.login();
    console.log('Login result:', loginResult);
    if (loginResult?.account) {
      sessionAccount = loginResult.account;
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("sessionAccount", sessionAccount);
      }
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
      const inviteCodeInput = document.getElementById("inviteCode");
      const inviteResult = document.getElementById("inviteResult");
      if (inviteCodeInput) inviteCodeInput.value = sessionAccount;
      if (inviteResult) setHint(inviteResult, `Auto-connected as ${sessionAccount}`, true);
      await refreshPassportAndUpvotes(sessionAccount, stats);
      await loadInviteProgramData(sessionAccount);
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

async function refreshReferralList(account, { config } = {}) {
  const list = document.getElementById("referralList");
  const totals = document.getElementById("referralTotals");
  if (!list) return;
  try {
    list.textContent = "Loading leaderboard...";
    const [leaderboard, stats] = await Promise.all([
      getInviteLeaderboard(15),
      getInviteStatsGlobal().catch(() => null),
    ]);
    if (totals && stats) {
      totals.textContent = `Total users: ${stats.total_users || 0} · Total referrals: ${stats.total_referrals || 0}`;
    }
    if (!leaderboard || leaderboard.length === 0) {
      list.textContent = "No adopters yet. Redeem an invite to seed the leaderboard.";
      return;
    }
    list.innerHTML = "";
    leaderboard.forEach((row, idx) => {
      const position = calculateTetraPosition(row.score || 0);
      const cooldown = config ? formatInviteCooldown(row.lastupdated, config.invite_rate_seconds) : "";
      const statusBits = [
        `score ${row.score || 0}`,
        `pos ${position}`,
        row.claimed ? "claimed" : "unclaimed",
        cooldown ? `cooldown ${cooldown}` : "",
      ].filter(Boolean);
      const entry = document.createElement("div");
      entry.className = "referral-row";
      entry.innerHTML = `<div>${idx + 1}. ${row.account}</div><div class="muted">${statusBits.join(" · ")}</div>`;
      list.appendChild(entry);
    });
  } catch (err) {
    list.textContent = `Error loading leaderboard: ${err.message}`;
  }
}

function renderTonomyQr(targetEl, link, statusEl, qrLib = window.QRCode) {
  console.log('Rendering QR with link:', link);
  if (!targetEl) {
    console.error('Target element not found');
    return;
  }
  if (!qrLib) {
    console.error('QR lib not available');
    if (statusEl) setHint(statusEl, "QR code library not loaded.");
    return;
  }
  try {
    if (!qrInstance) {
      console.log('Creating new QR instance');
      qrInstance = new qrLib(targetEl, {
        text: link,
        width: 220,
        height: 220,
        colorDark: "#ffffff",
        colorLight: "#121212",
        correctLevel: qrLib.CorrectLevel.M,
      });
    } else {
      console.log('Updating existing QR instance');
      qrInstance.makeCode(link);
    }
    if (statusEl) setHint(statusEl, "Scan with the Tonomy wallet to connect.", true);
  } catch (qrErr) {
    console.error('QR render error:', qrErr);
    if (statusEl) setHint(statusEl, `Could not render QR: ${qrErr.message}`);
  }
}

function defaultCallbackUrl() {
  if (typeof window === "undefined" || !window.location) return "";
  return window.location.href;
}

async function ensureQrLib() {
  if (window.QRCode) return window.QRCode;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.QRCode) resolve(window.QRCode);
      else reject(new Error('QRCode loaded but window.QRCode not available'));
    };

    script.onerror = () => reject(new Error('Failed to load QRCode library'));

    setTimeout(() => {
      if (!window.QRCode) reject(new Error('QRCode load timed out'));
    }, 10000);
  });
}

async function buildAndRenderLoginQr(qrBox, qrLinkInput, statusEl) {
  console.log('Building and rendering QR');
  if (!qrBox) {
    console.error('QR box not found');
    return null;
  }
  const qrLib = await ensureQrLib();
  console.log('QR lib status:', qrLib ? 'loaded' : 'missing');
  if (!qrLib) {
    if (statusEl) setHint(statusEl, "QR code library missing.");
    return null;
  }
  const fallback = buildTonomyLoginDeepLink(defaultCallbackUrl());
  console.log('Fallback deep link:', fallback);
  // Always show something immediately so the user can scan even if ESR fails.
  renderTonomyQr(qrBox, fallback, statusEl, qrLib);
  lastBuiltQrLink = fallback;
  if (qrLinkInput) qrLinkInput.value = fallback;
  if (!USE_ESR_QR) {
    if (statusEl) setHint(statusEl, "Using fallback deep link (ESR disabled).", true);
    return fallback;
  }
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
    renderTonomyQr(qrBox, deepLink, statusEl, qrLib);
    if (error && statusEl) {
      setHint(statusEl, `Using fallback deep link; ESR error: ${error.message}`);
    }
    return deepLink;
  } catch (err) {
    console.error('ESR build error:', err);
    const fallbackLink = buildTonomyLoginDeepLink(defaultCallbackUrl());
    lastBuiltQrLink = fallbackLink;
    if (qrLinkInput) qrLinkInput.value = fallbackLink;
    renderTonomyQr(qrBox, fallbackLink, statusEl);
    if (statusEl) setHint(statusEl, `QR build failed: ${err.message}`);
    return fallbackLink;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log('DOM loaded');
  try {
    await initTonomySettings();
  } catch (err) {
    console.error('Tonomy SDK init failed:', err);
  }

  const connectBtn = document.getElementById("connectBtn");
  console.log('Connect btn:', connectBtn);
  const networkSelect = document.getElementById("networkSelect");
  const customRpcInput = document.getElementById("customRpc");
  const customChainIdInput = document.getElementById("customChainId");
  const inviteBtn = document.getElementById("sendInvite");
  const inviteCode = document.getElementById("inviteCode");
  const inviteTarget = document.getElementById("inviteTarget");
  const inviteResult = document.getElementById("inviteResult");
  const claimRewardBtn = document.getElementById("claimReward");
  const inviteScoreValue = document.getElementById("inviteScoreValue");
  const invitePositionValue = document.getElementById("invitePositionValue");
  const inviteCooldownValue = document.getElementById("inviteCooldownValue");
  const inviteClaimedValue = document.getElementById("inviteClaimedValue");
  const inviteConfigBox = document.getElementById("inviteConfigBox");
  const inviteGlobalStats = document.getElementById("inviteGlobalStats");

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
  inviteScoreValueEl = inviteScoreValue;
  invitePositionValueEl = invitePositionValue;
  inviteCooldownValueEl = inviteCooldownValue;
  inviteClaimedValueEl = inviteClaimedValue;
  inviteConfigBoxEl = inviteConfigBox;
  inviteGlobalStatsEl = inviteGlobalStats;
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

  if (connectBtn) {
    console.log('Attaching click event to connectBtn');
    connectBtn.addEventListener("click", async () => {
      console.log('Connect button clicked');
      const qrCard = document.getElementById("qrCard");
      const qrBox = document.getElementById("tonomyQr");
      const qrStatus = document.getElementById("tonomyQrStatus");
      try {
        signer = null;
        sessionAccount = null;
        sessionDidLevel = 0;

        if (qrCard) {
          qrCard.style.display = 'block';
        }

        if (qrStatus) setHint(qrStatus, "Preparing QR...");
        if (qrBox && qrStatus) {
          await buildAndRenderLoginQr(qrBox, null, qrStatus);
        } else if (qrStatus) {
          setHint(qrStatus, "QR target missing in DOM.");
        }

        await ensureSigner();

        if (sessionAccount) {
          const stats = await getUserStats(sessionAccount);
          sessionDidLevel = stats?.verification_level ?? 0;
          inviteCode.value = sessionAccount;
          setHint(inviteResult, `Connected as ${sessionAccount}`, true);
          await refreshPassportAndUpvotes(sessionAccount, stats);
          await loadInviteProgramData(sessionAccount);
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
          setHint(qrStatus, `QR/connect error: ${err.message}`);
        }
      }
    });
  } else {
    console.error('Connect button not found');
  }

  inviteBtn?.addEventListener("click", async () => {
    try {
      setHint(inviteResult, "Redeeming invite...");
      await ensureSigner();
      const user = inviteCode.value.trim() || sessionAccount;
      const inviter = inviteTarget.value.trim();
      if (!user) throw new Error("Connect with Tonomy first or enter your account.");
      if (!inviter) throw new Error("Enter the inviter you are redeeming.");
      if (sessionAccount && sessionAccount !== user) {
        throw new Error(`Connected as ${sessionAccount}. Redeem must be signed by ${user}.`);
      }

      await transact([{
        account: INVITE_CONTRACT,
        name: "redeeminvite",
        authorization: [{ actor: user, permission: "active" }],
        data: { user, inviter }
      }]);

      setHint(inviteResult, "Invite redeemed. Score updated on-chain.", true);
      await loadInviteProgramData(user);
    } catch (err) {
      setHint(inviteResult, `Error: ${err.message}`);
    }
  });

  claimRewardBtn?.addEventListener("click", async () => {
    try {
      setHint(inviteResult, "Claiming rewards...");
      await ensureSigner();
      const user = inviteCode.value.trim() || sessionAccount;
      if (!user) throw new Error("Connect with Tonomy first or enter your account.");
      if (sessionAccount && sessionAccount !== user) {
        throw new Error(`Connected as ${sessionAccount}. Claims must be signed by ${user}.`);
      }
      await transact([{
        account: INVITE_CONTRACT,
        name: "claimreward",
        authorization: [{ actor: user, permission: "active" }],
        data: { user }
      }]);
      setHint(inviteResult, "Reward claimed. Use your BLUX to upvote.", true);
      await loadInviteProgramData(user);
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
  loadInviteProgramData();
  renderOnboarding();
});
