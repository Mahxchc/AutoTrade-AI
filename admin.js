(() => {
  const tg = window.Telegram?.WebApp;
  const loading = document.getElementById("loading");
  const denied = document.getElementById("denied");
  const deniedText = document.getElementById("deniedText");
  const panel = document.getElementById("panel");
  const pendingList = document.getElementById("pendingList");
  const allList = document.getElementById("allList");
  const toast = document.getElementById("toast");
  const refreshBtn = document.getElementById("refreshBtn");
  const pendingBtn = document.getElementById("pendingBtn");
  const allBtn = document.getElementById("allBtn");

  if (tg) { tg.ready(); tg.expand(); }

  let allUsers = [];
  let pendingUsers = [];

  function showToast(message, error = false) {
    toast.textContent = message;
    toast.classList.toggle("error", error);
    toast.classList.remove("hidden");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.add("hidden"), 3200);
  }

  function setDenied(message) {
    loading.classList.add("hidden");
    panel.classList.add("hidden");
    deniedText.textContent = message;
    denied.classList.remove("hidden");
  }

  async function api(path, options = {}) {
    if (!tg?.initData) throw new Error("این پنل باید داخل Telegram باز شود.");
    const response = await fetch(path, {
      ...options,
      headers: { ...(options.headers || {}), "X-Telegram-Init-Data": tg.initData }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = new Error(data.message || `خطای سرور (${response.status})`);
      err.status = response.status;
      throw err;
    }
    return data;
  }

  function statusInfo(user) {
    if (user.approvalStatus === "APPROVED" && user.accessEnabled) return ["تأیید شده", "approved"];
    if (user.approvalStatus === "REJECTED") return ["رد شده", "rejected"];
    return ["در انتظار", "pending"];
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  }

  function userCard(user, allowActions = false) {
    const [label, cls] = statusInfo(user);
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "بدون نام";
    const username = user.username ? `@${String(user.username).replace(/^@/, "")}` : "بدون username";
    const phone = user.phoneNumber || "ثبت نشده";
    const created = user.createdAt ? new Date(user.createdAt).toLocaleString("fa-IR") : "—";
    return `<article class="user-card">
      <div class="user-main"><div><div class="name">${escapeHtml(name)}</div><div class="username">${escapeHtml(username)}</div></div><span class="badge ${cls}">${label}</span></div>
      <div class="details"><div>Telegram ID: <b>${escapeHtml(user.telegramId)}</b></div><div>شماره: <b>${escapeHtml(phone)}</b></div><div>ثبت‌نام: <b>${escapeHtml(created)}</b></div><div>دسترسی: <b>${user.accessEnabled ? "فعال" : "غیرفعال"}</b></div></div>
      ${allowActions ? `<div class="actions"><button class="action approve" data-action="approve" data-id="${escapeHtml(user._id)}">✓ تأیید دسترسی</button><button class="action reject" data-action="reject" data-id="${escapeHtml(user._id)}">× رد درخواست</button></div>` : ""}
    </article>`;
  }

  function renderPending() {
    pendingList.innerHTML = pendingUsers.length ? pendingUsers.map(u => userCard(u, true)).join("") : `<div class="empty">درخواست جدیدی وجود ندارد ✨</div>`;
  }

  function renderAll() {
    allList.innerHTML = allUsers.length ? allUsers.map(u => userCard(u, false)).join("") : `<div class="empty">کاربری پیدا نشد.</div>`;
  }

  function updateStats() {
    document.getElementById("pendingCount").textContent = pendingUsers.length;
    document.getElementById("approvedCount").textContent = allUsers.filter(u => u.approvalStatus === "APPROVED" && u.accessEnabled).length;
    document.getElementById("rejectedCount").textContent = allUsers.filter(u => u.approvalStatus === "REJECTED").length;
    document.getElementById("totalCount").textContent = allUsers.length;
  }

  async function load() {
    try {
      const [pending, all] = await Promise.all([
        api("/api/admin/users/pending"),
        api("/api/admin/users")
      ]);
      pendingUsers = pending.users || [];
      allUsers = all.users || [];
      updateStats(); renderPending(); renderAll();
      loading.classList.add("hidden"); denied.classList.add("hidden"); panel.classList.remove("hidden");
    } catch (error) {
      if (error.status === 401 || error.status === 403) setDenied(error.message || "دسترسی مدیر لازم است.");
      else setDenied(error.message || "اتصال به پنل مدیریت برقرار نشد.");
    }
  }

  async function changeAccess(id, action) {
    const buttons = document.querySelectorAll(`[data-id="${CSS.escape(id)}"]`);
    buttons.forEach(b => b.disabled = true);
    try {
      const result = await api(`/api/admin/users/${encodeURIComponent(id)}/${action}`, { method: "POST" });
      showToast(result.message || "عملیات انجام شد.");
      await load();
    } catch (error) {
      buttons.forEach(b => b.disabled = false);
      showToast(error.message || "عملیات ناموفق بود.", true);
    }
  }

  pendingList.addEventListener("click", e => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;
    changeAccess(button.dataset.id, button.dataset.action);
  });

  refreshBtn.addEventListener("click", load);
  pendingBtn.addEventListener("click", () => { pendingBtn.classList.add("active"); allBtn.classList.remove("active"); document.querySelectorAll(".section-card")[0].scrollIntoView({behavior:"smooth",block:"start"}); });
  allBtn.addEventListener("click", () => { allBtn.classList.add("active"); pendingBtn.classList.remove("active"); document.querySelectorAll(".section-card")[1].scrollIntoView({behavior:"smooth",block:"start"}); });

  load();
})();
