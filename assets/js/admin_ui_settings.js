/* ===================================
   ADMIN UI SETTINGS (RTDB + PRESET)
=================================== */

console.log("⚙️ admin_ui_settings.js loaded");

function initAdminUISettings(){
  if(typeof db === "undefined") return;

  if(!isAdminOrSuper()){
    toast("Admin only");
    setTimeout(()=>go("index.html"),800);
    return;
  }

  const el = {
    preset: document.getElementById("ui_preset"),
    fontSize: document.getElementById("ui_fontSize"),
    dense: document.getElementById("ui_dense"),
    blur: document.getElementById("ui_blur"),
    anim: document.getElementById("ui_anim"),
    save: document.getElementById("btnSaveUI"),
    preview: document.getElementById("uiPreviewBox")
  };

  const ref = db.ref("ui_global");

  ref.once("value").then(snap=>{
    const cfg = snap.val() || {};

    el.preset.value = cfg.activePreset || "dark";
    el.fontSize.value = (cfg.font && cfg.font.baseSize) || 16;
    el.dense.checked = !!(cfg.layout && cfg.layout.dense);
    el.blur.checked = !(cfg.effect && cfg.effect.blur === false);
    el.anim.checked = !(cfg.effect && cfg.effect.animation === false);

    renderPreview(cfg.presets?.[el.preset.value]);
  });

  el.preset.onchange = ()=>{
    ref.child("presets/"+el.preset.value).once("value")
      .then(s=>renderPreview(s.val()));
  };

  function renderPreview(t){
    if(!t) return;

    el.preview.style.background = t.bg;
    el.preview.style.color = t.text;
    el.preview.style.borderRadius = el.dense.checked ? "8px" : "16px";
    el.preview.style.fontSize = el.fontSize.value + "px";

    el.preview.innerHTML = `
      <div style="font-weight:900">Preview (${el.preset.value})</div>
      <div class="small" style="margin-top:6px;color:${t.muted}">
        Background • Card • Accent
      </div>
      <button style="
        margin-top:10px;
        background:${t.accent};
        border:none;
        padding:8px 14px;
        border-radius:12px;
        color:white;
        font-weight:800
      ">
        Tombol
      </button>
    `;
  }

  el.save.onclick = ()=>{
    const payload = {
      enabled: true,
      activePreset: el.preset.value,
      font: { baseSize: Number(el.fontSize.value) || 16 },
      layout: { dense: el.dense.checked },
      effect: {
        blur: el.blur.checked,
        animation: el.anim.checked
      },
      updatedAt: Date.now()
    };

    ref.update(payload)
      .then(()=>toast("UI preset disimpan ✅"))
      .catch(e=>toast("Gagal: "+e.message));
  };
}

document.addEventListener("DOMContentLoaded", initAdminUISettings);