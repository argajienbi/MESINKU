/* ===============================
   GLOBAL UI SETTINGS (RTDB)
   Berlaku untuk SEMUA halaman
   Tidak menyentuh app.js
================================ */

console.log("🌍 ui_global.js loaded");

function cssVar(name, value){
  document.documentElement.style.setProperty(name, value);
}

function applyThemePreset(preset){
  // === PRESET WARNA AMAN ===
  if(preset === "light"){
    cssVar("--bg", "#f5f7fb");
    cssVar("--card", "#ffffff");
    cssVar("--card2", "#eef2f7");

    cssVar("--text", "#0f172a");
    cssVar("--muted", "#475569");

    cssVar("--border", "rgba(0,0,0,.12)");

    cssVar("--accent", "#2563eb");
    cssVar("--accent-text", "#ffffff");
    return;
  }

  // === DEFAULT DARK ===
  cssVar("--bg", "#0b1220");
  cssVar("--card", "#0f1b33");
  cssVar("--card2", "#0f2143");

  cssVar("--text", "#e8eefc");
  cssVar("--muted", "#9fb0d0");

  cssVar("--border", "rgba(255,255,255,.12)");

  cssVar("--accent", "#3b82f6");
  cssVar("--accent-text", "#ffffff");
}

function initGlobalUI(){
  if(typeof db === "undefined"){
    console.warn("ui_global: db not ready");
    return;
  }

  db.ref("ui_global").on("value", snap=>{
    const cfg = snap.val();
    if(!cfg || cfg.enabled === false) return;

    /* ===============================
       THEME
    ============================== */
    if(cfg.preset){
      applyThemePreset(cfg.preset);
    } else if(cfg.theme){
      const t = cfg.theme;
      if(t.bg) cssVar("--bg", t.bg);
      if(t.card) cssVar("--card", t.card);
      if(t.card2) cssVar("--card2", t.card2);
      if(t.text) cssVar("--text", t.text);
      if(t.muted) cssVar("--muted", t.muted);
      if(t.accent) cssVar("--accent", t.accent);
    }

    /* ===============================
       LAYOUT
    ============================== */
    if(cfg.radius !== undefined){
      cssVar("--radius", cfg.radius + "px");
    }
    if(cfg.spacing !== undefined){
      cssVar("--spacing", cfg.spacing + "px");
    }

    /* ===============================
       FONT
    ============================== */
    if(cfg.fontSize){
      document.documentElement.style.fontSize = cfg.fontSize + "px";
    }
    if(cfg.fontFamily === "system"){
      document.body.style.fontFamily =
        "system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial";
    }

    /* ===============================
       EFFECT
    ============================== */
    document.body.classList.toggle("no-blur", cfg.blur === false);
    document.body.classList.toggle("no-anim", cfg.animation === false);
    document.body.classList.toggle("dense-ui", cfg.dense === true);
  });
}

document.addEventListener("DOMContentLoaded", initGlobalUI);