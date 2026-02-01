/* ================================
   MesinKu - app.js (RTDB HopWeb FIX)
   - No Firestore
   - No module imports
   - Works with firebase.js (compat)
=================================== */

console.log("✅ APP.JS LOADED - VERSION DEBUG 002");

/* ========= BASIC UI ========= */
function navbar() {
  const el = document.getElementById("nav");
  if (!el) return;

  const u = getUser();
  const isAdmin = u && (u.role === "admin" || u.role === "superadmin");

  const adminBtn = isAdmin ? `<a href="admin_panel.html">⚙ Admin</a>` : "";

  el.innerHTML = `
    <div class="nav nav-compact">
      <a href="index.html">Home</a>
      <a href="live_machines.html">Mesin</a>
      <a href="history.html">Riwayat</a>
      <a href="status_anggota.html">Anggota</a>
      <a href="notifikasi.html">Chat broadcast</a>
      <a href="kendala.html">Kendala</a>
      ${adminBtn}

      <!-- ✅ Logout disamakan jadi nav button -->
      <a href="#" onclick="logout(); return false;" style="
        margin-left:auto;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.10);
      ">Logout</a>
    </div>
  `;
}

function setHeaderUser() {
  const u = getUser();
  const hello = document.getElementById("headerUsername");
  if (hello && u) hello.textContent = u.name || u.username || "-";
}

/* ========= ROLE CHECK ========= */
function isAdminOrSuper(){
  const u = getUser();
  return u && (u.role==="admin" || u.role==="superadmin");
}

/* ========= BROADCAST ========= */
function loadBroadcast() {
  return; // header broadcast disabled
}

function renderBroadcastPanel() {
  const el = document.getElementById("broadcastPanel");
  if (!el) return;

  db.ref("broadcast").on("value", (snap) => {
    const b = snap.val();

    if (!b || !b.active || (!b.title && !b.message)) {
      el.innerHTML = `<div class="small muted">Belum ada broadcast.</div>`;
      return;
    }

    const type = (b.type || "info").toLowerCase();
    const titleText = b.title || "Broadcast";
    const msg = b.message || "";

    const icon =
      type === "urgent" ? "🚨" :
      type === "important" ? "⚠️" :
      "📢";

    const badgeColor =
      type === "urgent" ? "rgba(255,80,80,.95)" :
      type === "important" ? "rgba(255,190,80,.95)" :
      "rgba(140,200,255,.95)";

    const t = b.updatedAt ? new Date(b.updatedAt).toLocaleString() : "";
    const by = b.updatedByName ? b.updatedByName : "";

    el.innerHTML = `
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        margin-bottom:10px;
      ">
        <div style="
          font-weight:950;
          font-size:15px;
          color:rgba(255,255,255,.95);
          display:flex;
          align-items:center;
          gap:8px;
        ">
          <span>${icon}</span>
          <span>${escapeHtml(titleText)}</span>
        </div>

        <div style="
          font-size:11px;
          padding:4px 10px;
          border-radius:999px;
          border:1px solid rgba(255,255,255,.10);
          background:rgba(0,0,0,.22);
          color:${badgeColor};
          font-weight:800;
          text-transform:uppercase;
        ">
          ${escapeHtml(type)}
        </div>
      </div>

      <div style="
        font-size:14px;
        line-height:1.5;
        color:rgba(255,255,255,.92);
        white-space:pre-wrap;
        max-height:140px;
        overflow:auto;
        -webkit-overflow-scrolling:touch;
        padding-right:6px;
      ">
        ${escapeHtml(msg)}
      </div>

      ${(t || by) ? `
        <div class="small" style="
          margin-top:10px;
          opacity:.70;
          display:flex;
          align-items:center;
          gap:8px;
        ">
          <span>🕒 ${escapeHtml(t || "-")}</span>
          ${by ? `<span>• oleh ${escapeHtml(by)}</span>` : ""}
        </div>
      ` : ""}
    `;
  });
}

/* ========= STATUS MESIN (Compact) ========= */
function renderMachineListCompact(containerId) {
  const box = document.getElementById(containerId);
  if (!box) return;

  const LIMIT = 20;

  db.ref("machines").on("value", (snap) => {
    const data = snap.val() || {};
    const items = Object.entries(data)
      .map(([id,val]) => ({ id, ...(val||{}) }))
      .filter((x) => x && x.isActive !== false);

    items.sort((a, b) => (a.id || "").localeCompare(b.id || ""));

    if (items.length === 0) {
      box.innerHTML = `<div class="small">Belum ada data mesin.</div>`;
      return;
    }

    const wrap = document.createElement("div");
    wrap.style.maxHeight = "220px";
    wrap.style.overflowY = "auto";
    wrap.style.paddingRight = "4px";

    items.slice(0, LIMIT).forEach((m) => {
      const status = (m.status || "available").toLowerCase();
      const badge =
        status === "available"
          ? `<span class="badge ok">available</span>`
          : `<span class="badge busy">in_use</span>`;

      const who = m.currentUser ? ` • ${escapeHtml(m.currentUser)}` : "";

      // ✅ nama = name, code = id
      const name = m.name || "-";
      const code = m.id || m.code || "-";
      const group = m.group || "-";

      let extra = "";
      if (status === "in_use") {
        const startedAt =
          m.inUseSince || m.startedAt || m.sessionStartedAt || m.updatedAt || 0;
        const dur = startedAt ? formatDuration(_now() - startedAt) : "-";
        extra = `<div class="small" style="margin-top:4px;opacity:.9">🕒 ${escapeHtml(dur)}</div>`;
      }

      const row = document.createElement("div");
      row.className = "list-item";
      row.style.margin = "8px 0";
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
          <div style="font-weight:900;font-size:14px">${escapeHtml(name)}</div>
          ${badge}
        </div>
        <div class="small" style="margin-top:4px">${escapeHtml(code)} • ${escapeHtml(group)}${who}</div>
        ${extra}
      `;

      wrap.appendChild(row);
    });

    box.innerHTML = "";
    box.appendChild(wrap);
  });
}

/* ===========================
   SYNC machines -> machines_list
=========================== */
function syncMachinesToMachinesList(){
  return db.ref("machines").once("value").then(snap=>{
    const data = snap.val() || {};
    const updates = {};
    Object.keys(data).forEach(k=>{
      const m = data[k] || {};
      const code = k; // ✅ pakai key RTDB sebagai code fix
      const name = m.name || m.nama || m.machine_name || m.machineName || code;
      const group = m.group || m.gedung || "";

      updates["machines_list/" + k] = {
        code,
        name,
        group,
        updatedAt: Date.now()
      };
    });
    return db.ref().update(updates);
  }).then(()=>{
    console.log("✅ machines_list synced");
  }).catch(e=>{
    console.warn("❌ syncMachinesToMachinesList error:", e.message);
  });
}

/* ========= RIWAYAT (Compact Panel) ========= */
function renderHistoryCompact(containerId){
  const box = document.getElementById(containerId);
  if(!box) return;

  let machinesListMap = {};

  function syncMachinesList(){
    return db.ref("machines_list").once("value").then(ms=>{
      const mdata = ms.val() || {};
      machinesListMap = {};
      Object.keys(mdata).forEach(id=>{
        const m = mdata[id];
        if(m){
          machinesListMap[id] = m.name || id;
        }
      });
      console.log("✅ machines_list cached:", Object.keys(machinesListMap).length);
    }).catch(()=>{
      machinesListMap = {};
    });
  }

  function renderList(items){
    if(items.length===0){
      box.innerHTML = `<div class="small">Belum ada riwayat pemakaian.</div>`;
      return;
    }

    box.innerHTML = items.map(h=>{
      const mid = h.machine_id || h.machineId || "-";

      // ✅ FIX: nama mesin ambil dari machines_list, BUKAN dari history (karena history masih nyimpen kode)
      const mname = machinesListMap[mid] || h.machine_name || h.machineName || mid;

      const user =
        h.username ||
        h.userName ||
        h.createdByName ||
        h.endedByName ||
        "-";

      const tujuan = h.tujuan || "-";
      const lokasi = h.lokasiTujuan || h.lokasi || "-";

      const started = h.startAt || h.startedAt || 0;
      const ended   = h.endAt || h.endedAt || 0;

      const timeUsed = ended || started || Date.now();
      const t = new Date(timeUsed).toLocaleString();

      let durMin = h.durationMinutes || 0;
      if(!durMin && started && ended){
        durMin = Math.max(1, Math.round((ended-started)/60000));
      }

      const doneBadge = ended
        ? `<span class="badge ok" style="margin-left:8px">DONE</span>`
        : "";

      return `
        <div class="list-item" style="margin:10px 0;padding:14px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div style="flex:1">
              <div style="font-weight:950;font-size:16px;line-height:1.1">
                ${escapeHtml(mname)} ${doneBadge}
              </div>
              <div class="small" style="opacity:.75;margin-top:4px">
                ${escapeHtml(mid)}
              </div>
            </div>
          </div>

          <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
            <span style="font-size:14px;opacity:.9">👤</span>
            <div style="font-weight:900;color:#4da8ff;font-size:14px">
              ${escapeHtml(user)}
            </div>
          </div>

          <div class="small" style="margin-top:8px;opacity:.92">
            🎯 Tujuan: ${escapeHtml(tujuan)}
          </div>

          <div class="small" style="margin-top:4px;opacity:.92">
            📍 Lokasi: ${escapeHtml(lokasi)}
          </div>

          <div class="small" style="margin-top:8px;opacity:.75">
            🕒 ${escapeHtml(t)} • durasi ${durMin ? durMin : "-"} menit
          </div>
        </div>
      `;
    }).join("");
  }

  // ✅ auto sync machines_list 1x saat history load
  syncMachinesToMachinesList().then(()=>{
    return syncMachinesList();
  }).then(()=>{
    db.ref("history").limitToLast(80).on("value", snap=>{
      const data = snap.val() || {};
      const items = Object.values(data).filter(Boolean)
        .sort((a,b)=>(b.endAt||b.endedAt||b.startAt||b.startedAt||0)-(a.endAt||a.endedAt||a.startAt||a.startedAt||0))
        .slice(0, 20);

      renderList(items);
    });
  });
}

/* =========================
   ADMIN: MANAGE MACHINES ✅ FIXED
========================= */
function initManageMachines(){
  if(!isAdminOrSuper()){
    toast("Admin only");
    return;
  }

  const listEl  = document.getElementById("machineList");
  const countEl = document.getElementById("machineCount");
  const qEl  = document.getElementById("mSearch");
  const stEl = document.getElementById("mFilterStatus");
  const grEl = document.getElementById("mFilterGroup");

  let cache = [];

  function rowMachine(m){
    const status = (m.status || "available");
    const badge =
      m.isActive === false
        ? `<span class="badge off">NONAKTIF</span>`
        : status === "available"
          ? `<span class="badge ok">available</span>`
          : `<span class="badge busy">in_use</span>`;

    return `
      <div class="list-item" style="margin:10px 0">
        <div style="display:flex;justify-content:space-between;gap:10px">
          <div>
            <div style="font-weight:900">${escapeHtml(m.name||"-")}</div>
            <div class="small">${escapeHtml(m.id)} • ${escapeHtml(m.group||"-")}</div>
          </div>
          ${badge}
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          <button class="secondary btnTiny"
            onclick="__toggleActive('${m.id}', ${m.isActive !== false})">
            ${m.isActive === false ? "Aktifkan" : "Nonaktifkan"}
          </button>

          <button class="secondary btnTiny"
            onclick="__forceAvailable('${m.id}')">
            Force Available
          </button>

          <button class="secondary btnTiny"
            onclick="__healMachine('${m.id}')">
            Heal Mesin
          </button>
        </div>
      </div>
    `;
  }

  function applyFilter(){
    let items = cache.slice();

    const q  = (qEl?.value||"").toLowerCase();
    const st = stEl?.value || "all";
    const gr = grEl?.value || "all";

    if(st !== "all"){
      items = items.filter(m => (m.status||"available") === st);
    }
    if(gr !== "all"){
      items = items.filter(m => (m.group||"") === gr);
    }
    if(q){
      items = items.filter(m =>
        [m.id,m.name,m.group].join(" ").toLowerCase().includes(q)
      );
    }

    countEl.textContent = items.length + " mesin";
    listEl.innerHTML = items.map(rowMachine).join("");
  }

  // 🔥 REALTIME LOAD
  db.ref("machines").on("value", snap=>{
    const data = snap.val() || {};
    cache = Object.entries(data)
      .map(([id,v])=>({id, ...(v||{})}))
      .sort((a,b)=>(a.id||"").localeCompare(b.id||""));

    applyFilter();
  });

  qEl?.addEventListener("input", applyFilter);
  stEl?.addEventListener("change", applyFilter);
  grEl?.addEventListener("change", applyFilter);
}

/* ========= UTIL ========= */
function _now(){ return Date.now(); }

function formatDuration(ms){
  if(!ms || ms < 0) return "-";
  const sec = Math.floor(ms/1000);
  const min = Math.floor(sec/60);
  const hr  = Math.floor(min/60);
  if(hr>0) return `${hr}j ${min%60}m`;
  if(min>0) return `${min}m`;
  return `${sec}s`;
}

function safeText(v){
  if(v===null || v===undefined) return "";
  return String(v);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
/* ================================
   RUNNING TEXT (pesan_running)
   - tampil di Home (index.html)
   - setting via pesan.html
=================================== */

function renderRunningTextHome(targetId="runningTextBox"){
  const box = document.getElementById(targetId);
  if(!box) return;

  db.ref("pesan_running").on("value", (snap)=>{
    const cfg = snap.val() || {};

    if(!cfg.active || !cfg.text){
      box.innerHTML = "";
      return;
    }

    const size = Number(cfg.size || 16);
    const speed = Number(cfg.speed || 16);
    const color = cfg.color || "#4aa3ff";
    const bg = cfg.bg || "rgba(255,255,255,0.04)";
    const dir = (cfg.dir || "left").toLowerCase();
    const blink = !!cfg.blink;

    const animClass = (dir === "right") ? "runningRightAnim" : "runningLeftAnim";
    const blinkClass = blink ? "runningBlink" : "";

    box.innerHTML = `
      <div class="runningBar" style="background:${escapeHtml(bg)}">
        <div class="runningTrack ${animClass}" style="animation-duration:${speed}s">
          <span class="runningText ${blinkClass}" style="font-size:${size}px;color:${escapeHtml(color)}">
            ${escapeHtml(cfg.text)}
          </span>
        </div>
      </div>
    `;
  });
}

// preview di pesan.html (supaya admin lihat sebelum save)
function renderRunningTextPreview(targetId, cfg){
  const box = document.getElementById(targetId);
  if(!box) return;

  const active = (cfg && cfg.active !== false);
  const text = (cfg && cfg.text) ? cfg.text : "Contoh pesan berjalan...";
  const size = Number((cfg && cfg.size) || 16);
  const speed = Number((cfg && cfg.speed) || 16);
  const color = (cfg && cfg.color) || "#4aa3ff";
  const bg = (cfg && cfg.bg) || "rgba(255,255,255,0.04)";
  const dir = String((cfg && cfg.dir) || "left").toLowerCase();
  const blink = !!(cfg && cfg.blink);

  if(!active){
    box.innerHTML = `<div class="small muted">Preview nonaktif</div>`;
    return;
  }

  const animClass = (dir === "right") ? "runningRightAnim" : "runningLeftAnim";
  const blinkClass = blink ? "runningBlink" : "";

  box.innerHTML = `
    <div class="runningBar" style="background:${escapeHtml(bg)}">
      <div class="runningTrack ${animClass}" style="animation-duration:${speed}s">
        <span class="runningText ${blinkClass}" style="font-size:${size}px;color:${escapeHtml(color)}">
          ${escapeHtml(text)}
        </span>
      </div>
    </div>
  `;
}
/* ==========================
   PESAN BAR (RTDB /pesan/current)
   ========================== */
function renderPesanBar(){
  const wrap = document.getElementById("pesanBarWrap");
  if(!wrap) return;

  db.ref("pesan/current").on("value", snap=>{
    const p = snap.val();

    if(!p || p.active === false || !p.text){
      wrap.style.display = "none";
      wrap.innerHTML = "";
      return;
    }

    const text = String(p.text || "").trim();
    const color = p.color || "#ffffff";
    const speed = Number(p.speed || 12);
    const blink = !!p.blink;

    wrap.style.display = "block";

    wrap.innerHTML = `
      <div class="pesanBar">
        <div
          class="pesanBarInner ${blink ? "pesanBlink" : ""}"
          style="color:${escapeHtml(color)};animation-duration:${Math.max(5, speed)}s"
        >
          ${escapeHtml(text)}
        </div>
      </div>
    `;
  });
}
function mountPesanBarGlobal(){
  // jangan duplikat
  if(document.getElementById("pesanBarWrap")) return;

  // cari tempat paling aman untuk ditaruh
  const topbar = document.querySelector(".topbar");
  if(!topbar) return;

  const wrap = document.createElement("div");
  wrap.id = "pesanBarWrap";
  wrap.style.display = "none";
  wrap.style.marginTop = "10px";
  wrap.style.width = "100%";

  // masukin setelah topbar
  topbar.insertAdjacentElement("afterend", wrap);

  renderPesanBar(); // panggil render realtime
}
function syncColorInputs(){
  // picker -> hex
  elTextColor.addEventListener("input", ()=>{
    elTextColorHex.value = elTextColor.value;
  });
  elBgColor.addEventListener("input", ()=>{
    elBgColorHex.value = elBgColor.value;
  });

  // hex -> picker (kalau input valid)
  elTextColorHex.addEventListener("input", ()=>{
    const v = (elTextColorHex.value||"").trim();
    if(/^#[0-9A-Fa-f]{6}$/.test(v)) elTextColor.value = v;
  });
  elBgColorHex.addEventListener("input", ()=>{
    const v = (elBgColorHex.value||"").trim();
    if(/^#[0-9A-Fa-f]{6}$/.test(v)) elBgColor.value = v;
  });
}
function getTextColorMode(mode, solidColor){
  // mode: "solid" | "rainbow" | "auto"
  // return: { className, styleColor }
  const m = (mode||"solid").toLowerCase();
  if(m==="rainbow" || m==="auto"){
    return { className:"text-rainbow", styleColor:"" };
  }
  return { className:"", styleColor:(solidColor||"#ffffff") };
}


function initPesanMarquee(targetId){
  const box = document.getElementById(targetId||"pesanMarqueeBox");
  if(!box){ return; }

  // container html (created once)
  if(!box.querySelector(".marqueeWrap")){
    box.innerHTML = `
      <div class="marqueeWrap" id="marqueeWrap">
        <div class="marqueeInner" id="marqueeInner"></div>
      </div>
    `;
  }

  const wrap = box.querySelector("#marqueeWrap");
  const inner = box.querySelector("#marqueeInner");

  db.ref("pesan_marquee").on("value", (snap)=>{
    const cfg = snap.val() || {};
    const enabled = (cfg.enabled ?? true);
    const text = (cfg.text || "").trim();

    if(!enabled || !text){
      box.style.display = "none";
      return;
    }
    box.style.display = "block";

    // style
    const fontSize = Number(cfg.fontSize || 18);
    const duration = Number(cfg.duration || 30); // seconds
    const direction = (cfg.direction || "left").toLowerCase(); // left/right
    const bg = (cfg.bgColor || "#0b1220");
    const blink = (cfg.blink ?? false);
    const colorMode = (cfg.colorMode || "solid");
    const solid = (cfg.textColor || "#ffffff");

    wrap.style.background = bg;
    wrap.style.setProperty("--marquee-duration", duration+"s");
    wrap.setAttribute("data-dir", direction);

    inner.style.fontSize = fontSize+"px";
    inner.classList.toggle("blink", !!blink);

    // color mode
    const c = getTextColorMode(colorMode, solid);
    inner.classList.toggle("text-rainbow", c.className==="text-rainbow");
    inner.style.color = c.styleColor || "";

    // set content
    inner.textContent = text;

    // restart animation
    inner.style.animation = "none";
    // force reflow
    void inner.offsetHeight;
    inner.style.animation = "";
  });
}
/* =========================
   ADMIN: MANAGE MEMBERS
   ========================= */
function initManageMembers(){
  if(!isAdminOrSuper()){
    toast("Admin only");
    return;
  }

  const listEl = document.getElementById("memberList");
  const countEl = document.getElementById("memberCount");

  const qEl = document.getElementById("uSearch");
  const roleEl = document.getElementById("uFilterRole");
  const gedungEl = document.getElementById("uFilterGedung");

  const uidEl = document.getElementById("editUid");
  const nameEl = document.getElementById("editName");
  const emailEl = document.getElementById("editEmail");
  const gedungInputEl = document.getElementById("editGedung");
  const roleInputEl = document.getElementById("editRole");

  const btnSave = document.getElementById("btnSaveUser");
  const btnDisable = document.getElementById("btnDisableUser");
  const btnForceEnd = document.getElementById("btnForceEndSession");

  if(!listEl){
    console.warn("memberList not found");
    return;
  }

  let cache = [];
  let selectedUid = "";

  function normRole(v){
    return String(v || "crew").toLowerCase();
  }

  function normGedung(v){
    return String(v || "").trim();
  }

  function clearForm(){
    selectedUid = "";
    if(uidEl) uidEl.value = "";
    if(nameEl) nameEl.value = "";
    if(emailEl) emailEl.value = "";
    if(gedungInputEl) gedungInputEl.value = "";
    if(roleInputEl) roleInputEl.value = "crew";
  }

  function fillForm(u){
    if(!u) return;
    selectedUid = u.uid || u.id || "";
    if(uidEl) uidEl.value = selectedUid;
    if(nameEl) nameEl.value = u.name || u.username || "";
    if(emailEl) emailEl.value = u.email || "";
    if(gedungInputEl) gedungInputEl.value = u.gedung || "";
    if(roleInputEl) roleInputEl.value = normRole(u.role);
  }

  function rowUser(u){
    const role = normRole(u.role);
    const gedung = normGedung(u.gedung) || "-";
    const active = (u.isActive !== false);

    const badgeRole = `
      <span class="badge" style="
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.10);
        color:rgba(255,255,255,.86);
        font-weight:900;
      ">${escapeHtml(role)}</span>
    `;

    const badgeActive = active
      ? `<span class="badge ok">active</span>`
      : `<span class="badge busy" style="background:rgba(255,80,80,.2);border:1px solid rgba(255,80,80,.4)">disabled</span>`;

    return `
      <div class="list-item" style="margin:10px 0;cursor:pointer"
        onclick="__pickMember('${escapeHtml(u.uid)}')"
      >
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
          <div style="flex:1">
            <div style="font-weight:950;font-size:16px">
              ${escapeHtml(u.name || u.username || "-")}
            </div>
            <div class="small" style="opacity:.8;margin-top:4px">
              ${escapeHtml(u.email || "-")}
            </div>
            <div class="small" style="margin-top:4px;opacity:.9">
              🏢 ${escapeHtml(gedung)}
            </div>
            <div class="small" style="margin-top:6px;opacity:.65">
              UID: ${escapeHtml(u.uid)}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
            ${badgeRole}
            ${badgeActive}
          </div>
        </div>
      </div>
    `;
  }

  function applyFilter(){
    const q = (qEl?.value || "").trim().toLowerCase();
    const r = (roleEl?.value || "all").toLowerCase();
    const g = (gedungEl?.value || "all");

    let items = cache.slice();

    if(r !== "all"){
      items = items.filter(x => normRole(x.role) === r);
    }
    if(g !== "all"){
      items = items.filter(x => (x.gedung || "") === g);
    }
    if(q){
      items = items.filter(x=>{
        const bag = [
          x.uid, x.name, x.username, x.email, x.gedung, x.role
        ].map(safeText).join(" ").toLowerCase();
        return bag.includes(q);
      });
    }

    if(countEl) countEl.textContent = `${items.length} anggota`;
    listEl.innerHTML = items.map(rowUser).join("");
  }

  window.__pickMember = function(uid){
    const u = cache.find(x => x.uid === uid);
    if(!u){
      toast("User tidak ditemukan");
      return;
    }
    fillForm(u);
    toast("Dipilih: " + (u.name || u.username || uid));
  };

  if(btnSave) btnSave.onclick = ()=>{
    const uid = (uidEl?.value || "").trim();
    if(!uid){
      toast("Pilih anggota dulu dari list");
      return;
    }

    const newName = (nameEl?.value || "").trim();
    const newGedung = (gedungInputEl?.value || "").trim();
    const newRole = normRole(roleInputEl?.value || "crew");

    if(!newName){
      toast("Nama tidak boleh kosong");
      return;
    }

    const payload = {
      name: newName,
      gedung: newGedung,
      role: newRole,
      updatedAt: Date.now()
    };

    db.ref("users/"+uid).update(payload)
      .then(()=>{
        toast("User disimpan ✅");
      })
      .catch(e=>toast("Gagal simpan: " + e.message));
  };

  if(btnDisable) btnDisable.onclick = async ()=>{
    const uid = (uidEl?.value || "").trim();
    if(!uid){
      toast("Pilih anggota dulu");
      return;
    }

    const snap = await db.ref("users/"+uid).once("value");
    const u = snap.val();
    if(!u){
      toast("User tidak ada");
      return;
    }

    const newActive = (u.isActive === false) ? true : false;
    db.ref("users/"+uid).update({
      isActive: newActive,
      updatedAt: Date.now()
    }).then(()=>{
      toast(newActive ? "User diaktifkan ✅" : "User dinonaktifkan ✅");
    });
  };

  if(btnForceEnd) btnForceEnd.onclick = async ()=>{
    const uid = (uidEl?.value || "").trim();
    if(!uid){
      toast("Pilih anggota dulu");
      return;
    }

    const ok = confirm("Akhiri sesi user ini paksa?");
    if(!ok) return;

    // cari sesi aktif user
    const snapSess = await db.ref("active_sessions/"+uid).once("value");
    if(!snapSess.exists()){
      toast("User tidak punya sesi aktif");
      return;
    }
    const sess = snapSess.val() || {};
    const machineId = sess.machine_id || sess.machineId || "";

    const updates = {};
    updates["active_sessions/"+uid] = null;

    // balikin mesin kalau ada
    if(machineId){
      updates["machines/"+machineId+"/status"] = "available";
      updates["machines/"+machineId+"/currentUser"] = null;
      updates["machines/"+machineId+"/currentSessionId"] = null;
      updates["machines/"+machineId+"/updatedAt"] = Date.now();
    }

    // simpan history forced-end
    const histKey = db.ref("history").push().key;
    const now = Date.now();
    updates["history/"+histKey] = {
      ...sess,
      endAt: now,
      endedAt: now,
      endedBy: getUser()?.uid || "admin",
      endedByName: getUser()?.name || "admin",
      forcedEnd: true
    };

    db.ref().update(updates).then(()=>{
      toast("Sesi dipaksa selesai ✅");
      clearForm();
    }).catch(e=>toast("Gagal force end: " + e.message));
  };

  // realtime load users
  db.ref("users").on("value", (snap)=>{
    const data = snap.val() || {};
    cache = Object.entries(data).map(([uid,val])=>({
      uid,
      ...(val||{})
    }));

    cache.sort((a,b)=>safeText(a.name||a.username).localeCompare(safeText(b.name||b.username)));
    applyFilter();
  });

  qEl && qEl.addEventListener("input", applyFilter);
  roleEl && roleEl.addEventListener("change", applyFilter);
  gedungEl && gedungEl.addEventListener("change", applyFilter);
}

function initAdminPanel(){
  const u = getUser();
  if(!u || (u.role!=="admin" && u.role!=="superadmin")){
    toast("Akses ditolak (Admin only)");
    setTimeout(()=>go("index.html"), 900);
    return;
  }
}



function initToolsReset(){
  const u = getUser();
  if(!u || u.role!=="superadmin"){
    toast("Akses ditolak (Superadmin only)");
    setTimeout(()=>go("index.html"), 900);
    return;
  }

  async function doUpdate(label, updates){
    const ok = confirm("Yakin " + label + "?");
    if(!ok) return;
    try{
      await db.ref().update(updates);
      toast(label + " ✅");
    }catch(e){
      toast("Gagal: " + e.message);
    }
  }

  const btnResetPesanUser = document.getElementById("btnResetPesanUser");
  const btnForceEndAll = document.getElementById("btnForceEndAll");
  const btnResetRiwayat = document.getElementById("btnResetRiwayat");
  const btnResetStatusMesin = document.getElementById("btnResetStatusMesin");
  const btnResetBroadcast = document.getElementById("btnResetBroadcast");
  const btnResetOnlineCache = document.getElementById("btnResetOnlineCache");

  if(btnResetPesanUser) btnResetPesanUser.onclick = ()=> doUpdate("Reset Pesan User", {"user_messages": null});

  if(btnForceEndAll) btnForceEndAll.onclick = async ()=>{
    const ok = confirm("Force selesai semua sesi aktif?");
    if(!ok) return;

    const snap = await db.ref("active_sessions").once("value");
    const sessions = snap.val() || {};
    const updates = {};
    const now = Date.now();

    Object.keys(sessions).forEach(uid=>{
      const sess = sessions[uid] || {};
      const machineId = sess.machine_id || sess.machineId || "";
      updates["active_sessions/"+uid] = null;

      if(machineId){
        updates["machines/"+machineId+"/status"] = "available";
        updates["machines/"+machineId+"/currentUser"] = null;
        updates["machines/"+machineId+"/currentSessionId"] = null;
        updates["machines/"+machineId+"/updatedAt"] = now;
      }

      const key = db.ref("history").push().key;
      updates["history/"+key] = {
        ...sess,
        endAt: now,
        endedAt: now,
        forcedEndAll: true,
        endedBy: u.uid,
        endedByName: u.name || "superadmin"
      };
    });

    await db.ref().update(updates);
    toast("Semua sesi dipaksa selesai ✅");
  };

  if(btnResetRiwayat) btnResetRiwayat.onclick = ()=> doUpdate("Reset Riwayat Mesin", {"history": null});

  if(btnResetStatusMesin) btnResetStatusMesin.onclick = async ()=>{
    const ok = confirm("Reset status semua mesin jadi available?");
    if(!ok) return;
    const snap = await db.ref("machines").once("value");
    const data = snap.val() || {};
    const updates = {};
    const now = Date.now();
    Object.keys(data).forEach(id=>{
      updates["machines/"+id+"/status"]="available";
      updates["machines/"+id+"/currentUser"]=null;
      updates["machines/"+id+"/currentSessionId"]=null;
      updates["machines/"+id+"/updatedAt"]=now;
    });
    await db.ref().update(updates);
    toast("Status mesin direset ✅");
  };

  if(btnResetBroadcast) btnResetBroadcast.onclick = ()=> doUpdate("Reset Broadcast", {
    "broadcast": { active:false, title:"", message:"", type:"info", updatedAt:Date.now(), updatedByName:u.name||"superadmin" }
  });

  if(btnResetOnlineCache) btnResetOnlineCache.onclick = ()=> doUpdate("Reset Online Cache", {"online_cache": null});
}



function initDebugPanel(){
  const u = getUser();
  if(!u || u.role!=="superadmin"){
    toast("Akses ditolak (Superadmin only)");
    setTimeout(()=>go("index.html"), 900);
    return;
  }

  const elConn = document.getElementById("dbgConn");
  const elSync = document.getElementById("dbgSync");
  const elBuild = document.getElementById("dbgBuild");
  const elCounts = document.getElementById("dbgCounts");
  const elUser = document.getElementById("dbgUser");

  if(elBuild) elBuild.textContent = "DEBUG 002";

  try{
    db.ref(".info/connected").on("value", s=>{
      const ok = !!s.val();
      if(elConn) elConn.textContent = ok ? "ONLINE ✅" : "OFFLINE ❌";
      if(elConn) elConn.style.color = ok ? "#49e38f" : "#ff6b6b";
    });
  }catch(e){
    if(elConn) elConn.textContent = "UNKNOWN";
  }

  function renderCounters(obj){
    if(!elCounts) return;
    const rows = Object.entries(obj||{}).map(([k,v])=>`
      <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">
        <div style="opacity:.85">${escapeHtml(k)}</div>
        <div style="font-weight:900">${escapeHtml(String(v))}</div>
      </div>
    `).join("");
    elCounts.innerHTML = rows || `<div class="small muted">Tidak ada counter.</div>`;
  }

  Promise.all([
    db.ref("machines").once("value"),
    db.ref("users").once("value"),
    db.ref("active_sessions").once("value"),
    db.ref("history").once("value"),
  ]).then(([m,u2,a,h])=>{
    const machines = m.val()||{};
    const users = u2.val()||{};
    const act = a.val()||{};
    const hist = h.val()||{};
    renderCounters({
      machines: Object.keys(machines).length,
      users: Object.keys(users).length,
      active_sessions: Object.keys(act).length,
      history: Object.keys(hist).length
    });
    if(elSync) elSync.textContent = "Sinkron OK • " + new Date().toLocaleString();
  });

  if(elUser){
    elUser.innerHTML = `
      <div class="small">Nama: <b>${escapeHtml(u.name||"-")}</b></div>
      <div class="small">Role: <b>${escapeHtml(u.role||"-")}</b></div>
      <div class="small">UID: <b>${escapeHtml(u.uid||"-")}</b></div>
    `;
  }
}

function debugRefresh(){
  toast("Refresh…");
  initDebugPanel();
}
function clearLocalCache(){
  try{
    localStorage.clear();
    toast("Local cache dibersihkan ✅");
  }catch(e){
    toast("Gagal clear cache");
  }
}




/* =========================
   TOOLS RESET HELPERS (HTML onclick)
   - tools_reset.html memanggil: confirmReset(), resetUserMessages(), forceEndAllSessions(), resetHistory(),
     resetAllMachinesStatus(), resetBroadcast(), resetOnlineCache()
   - Pastikan function ada supaya tidak "not defined"
========================= */
function isSuperAdmin(){
  const u = getUser();
  return !!(u && u.role === "superadmin");
}

function confirmReset(message, callback){
  // Wajib ketik RESET (sesuai UI tools_reset.html)
  const ok = prompt((message||"Konfirmasi reset") + "\n\nKetik RESET untuk lanjut:","");
  if(ok !== "RESET"){
    toast("Dibatalkan");
    return;
  }
  try{
    if(typeof callback === "function") callback();
  }catch(e){
    console.warn("confirmReset callback error:", e);
    toast("Gagal: " + e.message);
  }
}

async function resetUserMessages(){
  if(!isSuperAdmin()){ toast("Superadmin only"); return; }
  const u = getUser() || {};
  try{
    await db.ref("user_messages").remove();
    toast("Pesan user direset ✅");
  }catch(e){
    toast("Gagal reset: " + e.message);
  }
}

async function resetHistory(){
  if(!isSuperAdmin()){ toast("Superadmin only"); return; }
  try{
    await db.ref("history").remove();
    toast("Riwayat mesin direset ✅");
  }catch(e){
    toast("Gagal reset: " + e.message);
  }
}

async function resetAllMachinesStatus(){
  if(!isSuperAdmin()){ toast("Superadmin only"); return; }
  try{
    const snap = await db.ref("machines").once("value");
    const data = snap.val() || {};
    const now = Date.now();
    const updates = {};
    Object.keys(data).forEach(id=>{
      updates["machines/"+id+"/status"] = "available";
      updates["machines/"+id+"/currentUser"] = null;
      updates["machines/"+id+"/currentSessionId"] = null;
      updates["machines/"+id+"/updatedAt"] = now;
    });
    await db.ref().update(updates);
    toast("Status semua mesin direset ✅");
  }catch(e){
    toast("Gagal reset status: " + e.message);
  }
}

async function resetBroadcast(){
  if(!isSuperAdmin()){ toast("Superadmin only"); return; }
  const u = getUser() || {};
  try{
    await db.ref("broadcast").set({
      active:false,
      title:"",
      message:"",
      type:"info",
      updatedAt: Date.now(),
      updatedByName: u.name || "superadmin"
    });
    toast("Broadcast direset ✅");
  }catch(e){
    toast("Gagal reset broadcast: " + e.message);
  }
}

async function resetOnlineCache(){
  if(!isSuperAdmin()){ toast("Superadmin only"); return; }
  try{
    await db.ref("online_cache").remove();
    toast("Online cache direset ✅");
  }catch(e){
    toast("Gagal reset online cache: " + e.message);
  }
}

async function forceEndAllSessions(){
  if(!isSuperAdmin()){ toast("Superadmin only"); return; }
  const u = getUser() || {};
  try{
    const snap = await db.ref("active_sessions").once("value");
    const sessions = snap.val() || {};
    const updates = {};
    const now = Date.now();

    Object.keys(sessions).forEach(uid=>{
      const sess = sessions[uid] || {};
      const machineId = sess.machine_id || sess.machineId || "";

      // hapus sesi aktif
      updates["active_sessions/"+uid] = null;

      // balikin mesin
      if(machineId){
        updates["machines/"+machineId+"/status"] = "available";
        updates["machines/"+machineId+"/currentUser"] = null;
        updates["machines/"+machineId+"/currentSessionId"] = null;
        updates["machines/"+machineId+"/updatedAt"] = now;
      }

      // simpan history forced end
      const key = db.ref("history").push().key;
      updates["history/"+key] = {
        ...sess,
        endAt: now,
        endedAt: now,
        forcedEndAll: true,
        endedBy: u.uid || "superadmin",
        endedByName: u.name || "superadmin"
      };
    });

    await db.ref().update(updates);
    toast("Semua sesi dipaksa selesai ✅");
  }catch(e){
    toast("Gagal force end all: " + e.message);
  }
}




/* === SESSION + HISTORY (PATCH) ===
   Adds missing session detail rendering, live timer, and end-session -> history logging.
   Compatible with existing base code.
*/
(function(){
  // safe helpers
  window._nowMs = window._nowMs || function(){ return Date.now(); };

  window.formatDuration = window.formatDuration || function(ms){
    ms = Math.max(0, Number(ms||0));
    const s = Math.floor(ms/1000);
    const m = Math.floor(s/60);
    const h = Math.floor(m/60);
    const ss = String(s%60).padStart(2,'0');
    const mm = String(m%60).padStart(2,'0');
    if(h>0) return `${h}j ${mm}m ${ss}d`;
    return `${m}m ${ss}d`;
  };

  window.escapeHtml = window.escapeHtml || function(str){
    str = String(str ?? "");
    return str.replace(/[&<>"']/g, (m)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  };

  // Render active session UI into container (My Session page)
  window.renderMyActiveSession = window.renderMyActiveSession || function(containerId){
    const box = document.getElementById(containerId);
    if(!box) return;

    firebase.auth().onAuthStateChanged((u)=>{
      if(!u){ box.innerHTML = `<div class="small">Silakan login.</div>`; return; }

      db.ref("active_sessions/" + u.uid).on("value", (snap)=>{
        const s = snap.val();
        box.innerHTML = "";

        if(!s){
          box.innerHTML = `<div class="small">Tidak ada session aktif ✅</div>`;
          return;
        }

        const machineName = s.machine_name || s.machineName || "-";
        const machineId   = s.machine_id || s.machineId || "-";
        const username    = s.username || s.userName || (u.email||"-");
        const tujuan      = s.tujuan || "-";
        const lokasi      = s.lokasiTujuan || s.lokasi || "-";
        const startAt     = s.startAt || s.startedAt || s.start_time || s.started || 0;

        const wrap = document.createElement("div");
        wrap.className = "card";
        wrap.style.padding = "14px";
        wrap.style.borderRadius = "14px";

        wrap.innerHTML = `
          <div style="font-weight:950;font-size:18px">${escapeHtml(machineName)}</div>
          <div class="small" style="opacity:.8;margin-top:2px">${escapeHtml(machineId)} • ${escapeHtml(username)}</div>

          <div class="small" style="margin-top:10px">🎯 ${escapeHtml(tujuan)}</div>
          <div class="small" style="margin-top:6px">📍 ${escapeHtml(lokasi)}</div>

          <div class="small" style="margin-top:12px;opacity:.9">
            ⏱ Durasi: <span id="liveDurText">-</span>
          </div>

          <button id="btnEndSession" class="btn btn-danger" style="margin-top:14px;width:100%">
            Selesai Pakai Mesin
          </button>
        `;

        box.appendChild(wrap);

        // live timer
        const durEl = wrap.querySelector("#liveDurText");
        const tick = ()=>{
          if(!startAt){ durEl.textContent = "-"; return; }
          durEl.textContent = formatDuration(_nowMs() - startAt);
        };
        tick();
        if(window._sessTimer) clearInterval(window._sessTimer);
        window._sessTimer = setInterval(tick, 1000);

        // end handler
        const btn = wrap.querySelector("#btnEndSession");
        btn.onclick = async ()=>{
          btn.disabled = true;
          try{
            await window.endMyActiveSession();
          }catch(e){
            console.error(e);
            alert("Gagal mengakhiri sesi: " + (e.message||e));
          }finally{
            btn.disabled = false;
          }
        };
      });
    });
  };

  // End session: write history, reset machine, remove active_sessions
  window.endMyActiveSession = window.endMyActiveSession || async function(){
    const u = firebase.auth().currentUser;
    if(!u) throw new Error("Belum login");

    const snap = await db.ref("active_sessions/" + u.uid).once("value");
    const s = snap.val();
    if(!s) return;

    const machineId = s.machine_id || s.machineId;
    const machineName = s.machine_name || s.machineName || "-";
    const username = s.username || s.userName || (u.email||"-");
    const tujuan = s.tujuan || "-";
    const lokasiTujuan = s.lokasiTujuan || s.lokasi || "-";
    const startAt = s.startAt || s.startedAt || 0;
    const endAt = _nowMs();

    // 1) push history (global)
    const hRef = db.ref("history").push();
    await hRef.set({
      machine_id: machineId || "-",
      machine_name: machineName,
      username: username,
      tujuan: tujuan,
      lokasiTujuan: lokasiTujuan,
      startAt: startAt || endAt,
      endAt: endAt
    });

    // 2) reset machine (if exists)
    if(machineId){
      await db.ref("machines/" + machineId).update({
        status: "available",
        available: true,
        currentUser: null,
        currentUserId: null,
        currentSessionId: null
      });
    }

    // 3) remove active session
    await db.ref("active_sessions/" + u.uid).remove();

    // optional: refresh UI
    try{ toast && toast("✅ Sesi selesai. Riwayat tersimpan."); }catch(_){}
  };

})();



/* === PATCH: Kendala functions restore === */
(function(){
  // Render OPEN kendala list (latest)
  window.renderKendalaReportsList = window.renderKendalaReportsList || function(containerId){
    const box = document.getElementById(containerId);
    if(!box) return;

    db.ref("kendala_reports")
      .limitToLast(50)
      .on("value", (snap)=>{
        const data = snap.val() || {};
        const items = Object.values(data).filter(Boolean);

        // OPEN only
        const openItems = items.filter((k)=> (k.status||"OPEN").toUpperCase() === "OPEN");

        openItems.sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));

        box.innerHTML = "";
        if(openItems.length === 0){
          box.innerHTML = `<div class="small">Tidak ada kendala OPEN ✅</div>`;
          return;
        }

        const wrap = document.createElement("div");
        wrap.style.maxHeight="340px";
        wrap.style.overflowY="auto";
        wrap.style.paddingRight="4px";

        openItems.slice(0,40).forEach((k)=>{
          const mName = k.machine_name || k.machineName || k.machine_id || "-";
          const mId = k.machine_id || k.machineId || "-";
          const level = (k.level||k.severity||"RINGAN").toUpperCase();
          const by = k.username || k.userName || k.userEmail || "-";
          const lokasi = k.lokasiTujuan || k.lokasi || "-";
          const isi = k.isi || k.description || k.kendala || "-";
          const t = k.createdAt ? new Date(k.createdAt).toLocaleString() : "-";

          const row = document.createElement("div");
          row.className="list-item";
          row.style.margin="10px 0";
          row.innerHTML = `
            <div style="font-weight:950;font-size:15px">${escapeHtml(mName)} <span class="badge" style="margin-left:8px">${escapeHtml(level)}</span></div>
            <div class="small" style="opacity:.8;margin-top:3px">${escapeHtml(mId)} • ${escapeHtml(by)}</div>
            <div class="small" style="margin-top:8px">📍 ${escapeHtml(lokasi)}</div>
            <div class="small" style="margin-top:6px">🛠️ ${escapeHtml(isi)}</div>
            <div class="small" style="margin-top:8px;opacity:.85">${escapeHtml(t)}</div>
          `;
          wrap.appendChild(row);
        });

        box.appendChild(wrap);
      });
  };

  // Submit kendala report (used by button)
  window.submitKendalaReport = window.submitKendalaReport || async function(){
    const u = firebase.auth().currentUser;
    if(!u) throw new Error("Belum login");

    const machineSel = document.getElementById("kendalaMachine") || document.getElementById("machineSelect");
    const levelSel  = document.getElementById("kendalaLevel") || document.getElementById("levelKendala");
    const lokasiIn  = document.getElementById("kendalaLokasi") || document.getElementById("lokasiTujuan") || document.getElementById("lokasi");
    const isiIn     = document.getElementById("kendalaIsi") || document.getElementById("isiKendala") || document.getElementById("kendalaText");

    const machine_id = machineSel ? machineSel.value : "";
    const level = levelSel ? levelSel.value : "RINGAN";
    const lokasiTujuan = lokasiIn ? lokasiIn.value : "";
    const isi = isiIn ? isiIn.value : "";

    if(!machine_id) { alert("Pilih mesin dulu."); return; }
    if(!isi.trim()) { alert("Isi kendala wajib diisi."); return; }

    const mSnap = await db.ref("machines/" + machine_id).once("value");
    const m = mSnap.val() || {};
    const machine_name = m.name || m.machine_name || machine_id;

    const ref = db.ref("kendala_reports").push();
    const payload = {
      id: ref.key,
      machine_id,
      machine_name,
      level: String(level||"RINGAN").toUpperCase(),
      lokasiTujuan,
      isi,
      status: "OPEN",
      username: u.displayName || u.email || "-",
      userId: u.uid,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updates = {};
    updates["kendala_reports/" + ref.key] = payload;
    updates["kendala_reports_by_user/" + u.uid + "/" + ref.key] = payload;

    // Lock machine when BERAT
    if(payload.level === "BERAT"){
      updates["machines/" + machine_id + "/status"] = "kendala_berat";
      updates["machines/" + machine_id + "/available"] = false;
      updates["machines/" + machine_id + "/kendalaLevel"] = "BERAT";
      updates["machines/" + machine_id + "/kendalaOpenId"] = ref.key;
      updates["machines/" + machine_id + "/updatedAt"] = Date.now();
    }

    await db.ref().update(updates);

    // reset input
    if(lokasiIn) lokasiIn.value = "";
    if(isiIn) isiIn.value = "";
    try{ toast && toast("✅ Kendala terkirim"); }catch(_){}
  };

})();



/* === PATCH: Kendala resolve hybrid (kendala_reports + kendala legacy) === */
window.resolveKendalaAdmin = window.resolveKendalaAdmin || function(kid){
  const u = (typeof getUser === "function" ? getUser() : null) || {};
  const adminName = u.email || u.username || "admin";

  const tryNew = ()=> db.ref("kendala_reports/" + kid).once("value")
    .then(snap => ({ path:"kendala_reports", data:snap.val() }));

  const tryOld = ()=> db.ref("kendala/" + kid).once("value")
    .then(snap => ({ path:"kendala", data:snap.val() }));

  return tryNew()
    .then(res => res.data ? res : tryOld())
    .then(res=>{
      const k = res.data;
      if(!k){ toast("Kendala tidak ditemukan"); return; }

      const updates = {};
      const level = String(k.level || "").toUpperCase();
      const code = k.machine_id || k.machine_code || "";

      // DONE (new/old)
      updates[`${res.path}/${kid}/status`] = "DONE";
      updates[`${res.path}/${kid}/doneAt`] = Date.now();
      updates[`${res.path}/${kid}/doneBy`] = adminName;
      updates[`${res.path}/${kid}/updatedAt`] = Date.now();

      // mirror khusus path baru
      if(res.path === "kendala_reports" && k.userId){
        updates[`kendala_reports_by_user/${k.userId}/${kid}/status`] = "DONE";
        updates[`kendala_reports_by_user/${k.userId}/${kid}/doneAt`] = Date.now();
        updates[`kendala_reports_by_user/${k.userId}/${kid}/doneBy`] = adminName;
        updates[`kendala_reports_by_user/${k.userId}/${kid}/updatedAt`] = Date.now();
      }

      // unlock mesin jika BERAT
      if(level === "BERAT" && code){
        updates[`machines/${code}/status`] = "available";
        updates[`machines/${code}/available`] = true;

        // reset versi baru
        updates[`machines/${code}/kendalaLevel`] = null;
        updates[`machines/${code}/kendalaOpenId`] = null;

        // reset versi lama (compat)
        updates[`machines/${code}/hasIssue`] = false;
        updates[`machines/${code}/issueLevel`] = null;
        updates[`machines/${code}/issueId`] = null;
        updates[`machines/${code}/issueText`] = null;

        updates[`machines/${code}/updatedAt`] = Date.now();
      }

      return db.ref().update(updates).then(()=>toast("Kendala diselesaikan ✅"));
    })
    .catch(e=>toast("Gagal: " + e.message));
};
function healMachine(machineId){
  const now = Date.now();
  return db.ref("machines/" + machineId).update({
    lockedByKendala: false,
    lockedLevel: null,
    kendalaOpenId: null,
    hasIssue: false,
    available: true,
    status: "available",
    isActive: false,
    updatedAt: now
  });
}
window.__toggleActive = function(id, isActiveNow){
  db.ref("machines/"+id).update({
    isActive: !isActiveNow,
    updatedAt: Date.now()
  }).then(()=>{
    toast(isActiveNow ? "Mesin dinonaktifkan" : "Mesin diaktifkan");
  });
};
window.__forceAvailable = function(id){
  if(!confirm("Reset status mesin jadi available?")) return;
  db.ref("machines/"+id).update({
    status: "available",
    currentUser: null,
    currentSessionId: null,
    updatedAt: Date.now()
  }).then(()=>toast("Status reset"));
};
window.__healMachine = function(id){
  if(!confirm("Heal TOTAL mesin ini?")) return;

  const now = Date.now();
  const updates = {};
  updates["machines/"+id+"/status"] = "available";
  updates["machines/"+id+"/isActive"] = true;
  updates["machines/"+id+"/lockedByKendala"] = false;
  updates["machines/"+id+"/lockedLevel"] = null;
  updates["machines/"+id+"/currentUser"] = null;
  updates["machines/"+id+"/currentSessionId"] = null;
  updates["machines/"+id+"/updatedAt"] = now;

  db.ref().update(updates)
    .then(()=>toast("Mesin berhasil di-HEAL 🔧"));
};
console.log("APP.JS LOADED - VERSION STABLE 001");

function toast(msg){
  const t=document.createElement("div");
  t.className="toast";
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),1800);
}

function go(url){ location.href=url; }

function getUser(){
  try { return JSON.parse(localStorage.getItem("mesinku_user")); }
  catch(e){ return null; }
}

function requireLogin(){
  if(!getUser()) go("login.html");
}

function isAdmin(){
  const u=getUser();
  return u && (u.role==="admin" || u.role==="superadmin");
}
/* ======================================================
   MANAGE MACHINES - STABLE VERSION
====================================================== */

function initManageMachines() {
  console.log("[ManageMachines] init");

  const el = {
    list: document.getElementById("machineList"),
    count: document.getElementById("machineCount"),
    search: document.getElementById("mSearch"),
    filterStatus: document.getElementById("mFilterStatus"),
    filterActive: document.getElementById("mFilterActive"),

    id: document.getElementById("machineId"),
    name: document.getElementById("machineName"),
    code: document.getElementById("machineCode"),
    group: document.getElementById("machineGroup"),

    btnSave: document.getElementById("btnSaveMachine"),
    btnClear: document.getElementById("btnClearMachine"),
  };

  // === GUARD (anti silent fail)
  for (const k in el) {
    if (!el[k]) {
      console.error("[ManageMachines] Missing element:", k);
      return;
    }
  }

  // === EVENTS
  el.btnSave.type = "button";
  el.btnClear.type = "button";

  el.btnSave.addEventListener("click", saveMachine);
  el.btnClear.addEventListener("click", clearForm);

  el.search.addEventListener("input", renderList);
  el.filterStatus.addEventListener("change", renderList);
  el.filterActive.addEventListener("change", renderList);

  // === DATA
  const ref = db.ref("machines");
  let machines = {};

  ref.on("value", snap => {
    machines = snap.val() || {};
    renderList();
  });

  /* ===============================
     FUNCTIONS
  =============================== */

  function renderList() {
    el.list.innerHTML = "";

    const q = el.search.value.toLowerCase();
    const fs = el.filterStatus.value;
    const fa = el.filterActive.value;

    let items = Object.entries(machines);

    items = items.filter(([id, m]) => {
      if (!m) return false;

      if (q) {
        const text = `${id} ${m.name || ""} ${m.code || ""} ${m.group || ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      if (fs !== "all" && m.status !== fs) return false;
      if (fa !== "all" && String(!!m.active) !== fa) return false;

      return true;
    });

    el.count.textContent = `${items.length} mesin`;

    if (!items.length) {
      el.list.innerHTML = `<div class="small muted">Tidak ada mesin</div>`;
      return;
    }

    items.forEach(([id, m]) => {
      const row = document.createElement("div");
      row.className = "card";
      row.style.marginBottom = "8px";
      row.innerHTML = `
        <b>${m.name || id}</b>
        <div class="small muted">${m.code || "-"} • ${m.group || "-"}</div>
        <div class="small">${m.status || "unknown"} • ${m.active ? "aktif" : "nonaktif"}</div>
      `;
      row.onclick = () => fillForm(id, m);
      el.list.appendChild(row);
    });
  }

  function fillForm(id, m) {
    el.id.value = id;
    el.name.value = m.name || "";
    el.code.value = m.code || "";
    el.group.value = m.group || "";
  }

  function clearForm() {
    el.id.value = "";
    el.name.value = "";
    el.code.value = "";
    el.group.value = "";
  }

  function saveMachine() {
    const id = el.id.value.trim();
    if (!id) {
      toast("ID mesin wajib diisi");
      return;
    }

    const payload = {
      name: el.name.value.trim(),
      code: el.code.value.trim(),
      group: el.group.value.trim(),
      active: true,
      status: "available",
      updatedAt: Date.now(),
    };

    console.log("[ManageMachines] save", id, payload);

    ref.child(id).update(payload)
      .then(() => {
        toast("Mesin disimpan ✅");
        clearForm();
      })
      .catch(err => {
        console.error(err);
        toast("Gagal menyimpan mesin");
      });
  }
}