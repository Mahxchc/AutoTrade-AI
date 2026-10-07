const tg = window.Telegram && window.Telegram.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const listEl = document.getElementById("list");
const statsEl = document.getElementById("stats");
const whoEl = document.getElementById("who");
let currentTab = "pending";

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function api(path, options = {}) {
  if (!tg || !tg.initData) {
    throw new Error("این صفحه را باید از داخل تلگرام باز کنید.");
  }
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": tg.initData,
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || ("خطا " + res.status));
  }
  return data;
}

function userCard(u) {
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || "بدون نام";
  const approval = u.approvalStatus || "PENDING";
  const status = u.status || "";
  let buttons = "";
  if (!u.isAdmin) {
    if (approval !== "APPROVED") buttons += `<button class="btn ok" data-act="approve" data-id="${esc(u._id)}">✅ تأیید</button>`;
    if (approval !== "REJECTED") buttons += `<button class="btn no" data-act="reject" data-id="${esc(u._id)}">❌ رد</button>`;
    if (status === "BLOCKED") buttons += `<button class="btn neutral" data-act="unblock" data-id="${esc(u._id)}">رفع مسدودی</button>`;
    else if (approval === "APPROVED") buttons += `<button class="btn neutral" data-act="block" data-id="${esc(u._id)}">مسدود</button>`;
  }
  return `
    <div class="card">
      <div class="name">${esc(name)}
        <span class="badge ${esc(approval)}">${esc(approval)}</span>
        ${u.isAdmin ? '<span class="badge APPROVED">Owner/Admin</span>' : ""}
      </div>
      <div class="row"><span>آیدی تلگرام</span><b>${esc(u.telegramId)}</b></div>
      <div class="row"><span>یوزرنیم</span><b>${u.username ? "@" + esc(u.username) : "—"}</b></div>
      <div class="row"><span>شماره</span><b dir="ltr">${esc(u.phoneNumber || "—")}</b></div>
      ${buttons ? `<div class="actions">${buttons}</div>` : ""}
    </div>`;
}

async function loadStats() {
  const { stats } = await api("/api/admin/stats");
  const items = [["کل", stats.total], ["در انتظار", stats.pending], ["فعال", stats.active],
                 ["رد شده", stats.rejected], ["مسدود", stats.blocked]];
  statsEl.innerHTML = items.map(([l, v]) =>
    `<div class="card stat"><b>${esc(v)}</b><span>${l}</span></div>`).join("");
}

async function loadList() {
  listEl.innerHTML = '<div class="empty">در حال بارگذاری...</div>';
  const path = currentTab === "pending" ? "/api/admin/users/pending" : "/api/admin/users";
  const { users = [] } = await api(path);
  listEl.innerHTML = users.length
    ? users.map(userCard).join("")
    : '<div class="empty">موردی وجود ندارد.</div>';
}

async function refresh() {
  try {
    await Promise.all([loadStats(), loadList()]);
  } catch (e) {
    listEl.innerHTML = `<div class="err">${esc(e.message)}</div>`;
  }
}

listEl.addEventListener("click", async (ev) => {
  const btn = ev.target.closest("button[data-act]");
  if (!btn) return;
  const act = btn.dataset.act;
  if ((act === "reject" || act === "block") && !confirm("مطمئنید؟")) return;
  btn.disabled = true;
  try {
    await api(`/api/admin/users/${btn.dataset.id}/${act}`, { method: "POST", body: "{}" });
    await refresh();
  } catch (e) {
    alert(e.message);
    btn.disabled = false;
  }
});

document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  currentTab = t.dataset.tab;
  loadList().catch(e => { listEl.innerHTML = `<div class="err">${esc(e.message)}</div>`; });
}));

(async () => {
  try {
    const me = await api("/api/admin/me");
    const u = me;
    whoEl.textContent = "ورود موفق — ID: " + (u.telegramId || "");
  } catch (e) {
    whoEl.textContent = "";
    statsEl.innerHTML = "";
    listEl.innerHTML = `<div class="err">${esc(e.message)}</div>`;
    return;
  }
  refresh();
})();
