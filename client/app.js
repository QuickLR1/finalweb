
const API_BASE = "/api";


const tokenKey = "notely_token";

const el = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[c]));

function setToken(t){ localStorage.setItem(tokenKey, t); }
function getToken(){ return localStorage.getItem(tokenKey); }
function clearToken(){ localStorage.removeItem(tokenKey); }

async function api(path, { method="GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || `HTTP ${res.status}`;
    const details = Array.isArray(data.details) ? `: ${data.details.join("; ")}` : "";
    throw new Error(msg + details);
  }
  return data;
}

function show(screen) {
  el("authScreen").classList.toggle("hidden", screen !== "auth");
  el("appScreen").classList.toggle("hidden", screen !== "app");
}

function setMsg(id, text) { el(id).textContent = text || ""; }

// ===== AUTH TABS =====
function setAuthTab(tab) {
  el("tabSignIn").classList.toggle("tab--active", tab === "in");
  el("tabSignUp").classList.toggle("tab--active", tab === "up");
  el("formSignIn").classList.toggle("hidden", tab !== "in");
  el("formSignUp").classList.toggle("hidden", tab !== "up");
  setMsg("authMsg", "");
  setMsg("authMsg2", "");
}

el("tabSignIn").addEventListener("click", () => setAuthTab("in"));
el("tabSignUp").addEventListener("click", () => setAuthTab("up"));

// ===== STATE =====
let allNotes = [];
let role = "user";
let viewMode = "mine"; // mine | all

function isAdminModeAllowed() {
  return role === "admin" || role === "moderator";
}

// ===== AUTH ACTIONS =====
el("formSignIn").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    setMsg("authMsg", "");
    const email = el("inEmail").value.trim();
    const password = el("inPassword").value;
    const data = await api("/auth/login", { method:"POST", body:{ email, password } });
    setToken(data.token);
    await enterApp();
  } catch (err) {
    setMsg("authMsg", err.message);
  }
});

el("formSignUp").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    setMsg("authMsg2", "");
    const username = el("upUsername").value.trim();
    const email = el("upEmail").value.trim();
    const password = el("upPassword").value;
    const data = await api("/auth/register", { method:"POST", body:{ username, email, password } });
    setToken(data.token);
    await enterApp();
  } catch (err) {
    setMsg("authMsg2", err.message);
  }
});

// ===== APP =====
async function enterApp() {
  show("app");
  await loadProfile();
  setupAdminToggle();
  await loadNotes();
}

async function loadProfile() {
  const profile = await api("/users/profile");
  role = profile.role || "user";

  el("welcomeName").textContent = profile.username || "user";
  el("profileId").textContent = String(profile._id || profile.id || "-");
  el("profileUsername").value = profile.username || "";
  el("profileEmail").value = profile.email || "";
}

function setupAdminToggle() {
  const btn = el("btnToggleAll");
  if (!isAdminModeAllowed()) {
    btn.classList.add("hidden");
    viewMode = "mine";
    return;
  }

  btn.classList.remove("hidden");
  btn.textContent = viewMode === "all" ? "My notes" : "All notes";

  btn.onclick = async () => {
    viewMode = (viewMode === "all") ? "mine" : "all";
    btn.textContent = viewMode === "all" ? "My notes" : "All notes";
    await loadNotes();
  };
}

async function loadNotes() {
  const path = (viewMode === "all" && isAdminModeAllowed()) ? "/admin/notes" : "/notes";
  const notes = await api(path);
  allNotes = Array.isArray(notes) ? notes : [];
  renderNotes();
}

el("searchInput").addEventListener("input", renderNotes);

function renderNotes() {
  const q = el("searchInput").value.trim().toLowerCase();

  const filtered = allNotes.filter(n => {
    const ownerTxt = (n.user && typeof n.user === "object")
      ? `${n.user.username || ""} ${n.user.email || ""} ${n.user.role || ""}`
      : "";
    const hay = `${n.title||""} ${n.content||""} ${(n.tags||[]).join(" ")} ${ownerTxt}`.toLowerCase();
    return hay.includes(q);
  });

  el("notesCount").textContent = `${filtered.length} notes total`;

  const empty = filtered.length === 0;
  el("emptyState").classList.toggle("hidden", !empty);
  el("notesGrid").classList.toggle("hidden", empty);

  const grid = el("notesGrid");
  grid.innerHTML = "";

  filtered.forEach(n => {
    const owner = (viewMode === "all" && n.user && typeof n.user === "object")
      ? ` • ${n.user.username || "?"} (${n.user.role || "user"})`
      : "";

    const div = document.createElement("div");
    div.className = "note";
    div.innerHTML = `
      <div class="note__top">
        <div class="note__title">${esc(n.title)} ${n.pinned ? "📌" : ""}</div>
        <div class="note__meta">${new Date(n.updatedAt).toLocaleString()}${owner}</div>
      </div>
      <div class="note__content">${esc(n.content || "")}</div>
      <div class="note__tags">${(n.tags && n.tags.length) ? `Tags: ${n.tags.map(esc).join(", ")}` : " "}</div>
      <div class="note__actions">
        <button class="small-btn" data-edit="${n._id}">Edit</button>
        <button class="small-btn" data-pin="${n._id}">${n.pinned ? "Unpin" : "Pin"}</button>
        <button class="small-btn small-btn--danger" data-del="${n._id}">Delete</button>
      </div>
    `;
    grid.appendChild(div);
  });

  grid.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => delNote(b.dataset.del)));
  grid.querySelectorAll("[data-pin]").forEach(b => b.addEventListener("click", () => togglePin(b.dataset.pin)));
  grid.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => editNote(b.dataset.edit)));
}

// ===== NOTE MODAL =====
function openModal() {
  el("noteTitle").value = "";
  el("noteContent").value = "";
  el("noteTags").value = "";
  el("notePinned").checked = false;
  setMsg("noteMsg", "");
  el("modalBackdrop").classList.remove("hidden");
  el("noteModal").classList.remove("hidden");
}

function closeModal() {
  el("modalBackdrop").classList.add("hidden");
  el("noteModal").classList.add("hidden");
}

el("btnNewNote").addEventListener("click", openModal);
el("btnCloseModal").addEventListener("click", closeModal);
el("modalBackdrop").addEventListener("click", closeModal);

el("btnCreateNote").addEventListener("click", async () => {
  try {
    setMsg("noteMsg", "");
    const title = el("noteTitle").value.trim();
    const content = el("noteContent").value;
    const tags = el("noteTags").value.split(",").map(s => s.trim()).filter(Boolean);
    const pinned = el("notePinned").checked;

    await api("/notes", { method:"POST", body:{ title, content, tags, pinned } });
    closeModal();
    await loadNotes();
  } catch (err) {
    setMsg("noteMsg", err.message);
  }
});

async function delNote(id) {
  if (!confirm("Delete this note?")) return;

  // ✅ If admin is viewing ALL notes -> delete ANY note via admin endpoint
  const path = (viewMode === "all" && isAdminModeAllowed())
    ? `/admin/notes/${id}`
    : `/notes/${id}`;

  await api(path, { method:"DELETE" });
  await loadNotes();
}

async function togglePin(id) {
  const note = allNotes.find(n => n._id === id);
  if (!note) return;
  await api(`/notes/${id}`, { method:"PUT", body:{ pinned: !note.pinned } });
  await loadNotes();
}

async function editNote(id) {
  // Editing still uses normal endpoint, but it will succeed only if user owns the note.
  // (This keeps "users only update their own notes" rule.)
  const note = allNotes.find(n => n._id === id);
  if (!note) return;

  const newTitle = prompt("New title:", note.title || "");
  if (newTitle === null) return;

  const newContent = prompt("New content:", note.content || "");
  if (newContent === null) return;

  await api(`/notes/${id}`, { method:"PUT", body:{ title:newTitle.trim(), content:newContent } });
  await loadNotes();
}

// ===== PROFILE DRAWER =====
function openDrawer() {
  el("drawer").classList.remove("hidden");
  el("drawerDim").classList.remove("hidden");
}

function closeDrawer() {
  el("drawer").classList.add("hidden");
  el("drawerDim").classList.add("hidden");
  setMsg("profileMsg", "");
}

el("btnProfile").addEventListener("click", openDrawer);
el("btnCloseDrawer").addEventListener("click", closeDrawer);
el("drawerDim").addEventListener("click", closeDrawer);

el("btnSaveProfile").addEventListener("click", async () => {
  try {
    setMsg("profileMsg", "");
    const body = {};
    const username = el("profileUsername").value.trim();
    const email = el("profileEmail").value.trim();
    if (username) body.username = username;
    if (email) body.email = email;
    if (!Object.keys(body).length) throw new Error("Nothing to update");

    await api("/users/profile", { method:"PUT", body });
    await loadProfile();
    setupAdminToggle();
    setMsg("profileMsg", "Saved!");
    setTimeout(() => setMsg("profileMsg", ""), 1200);
  } catch (err) {
    setMsg("profileMsg", err.message);
  }
});

el("btnLogout").addEventListener("click", () => {
  clearToken();
  show("auth");
  setAuthTab("in");
});

// ===== INIT =====
(async function init(){
  setAuthTab("in");
  const t = getToken();
  if (!t) return;

  try {
    await enterApp();
  } catch {
    clearToken();
    show("auth");
  }
})();
