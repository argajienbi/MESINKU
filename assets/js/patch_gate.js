registerFeature({
  id: "patch-gate",

  pages: ["*"],        // semua halaman
  needLogin: false,    // justru jalan sebelum login

  run(){
    if(typeof db==="undefined") return;

    const PREVIEW_KEY = "patch_preview"; // dipakai admin panel

    function alreadySeen(version){
      const seen = JSON.parse(localStorage.getItem("patch_seen")||"{}");
      return !!seen[version];
    }

    function markSeen(version){
      const seen = JSON.parse(localStorage.getItem("patch_seen")||"{}");
      seen[version] = Date.now();
      localStorage.setItem("patch_seen", JSON.stringify(seen));
    }

    function render(cfg, isPreview=false){
      if(!cfg || cfg.enabled===false) return;
      if(!isPreview && alreadySeen(cfg.version)) return;

      const force = cfg.type==="force";

      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:9999;
        background:rgba(0,0,0,.65);
        display:flex;align-items:center;justify-content:center;
      `;

      overlay.innerHTML = `
        <div style="
          max-width:420px;width:92%;
          background:#0b1220;color:#fff;
          border-radius:18px;padding:18px;
          box-shadow:0 20px 50px rgba(0,0,0,.5)">
          
          <div style="font-size:18px;font-weight:900">
            ${cfg.title || "Pembaruan Aplikasi"}
          </div>

          <div class="small muted" style="margin-top:4px">
            Versi ${cfg.version || "-"}
          </div>

          <div style="margin-top:12px;line-height:1.45">
            ${cfg.message || ""}
          </div>

          ${cfg.actionUrl ? `
            <button style="margin-top:14px"
              onclick="window.open('${cfg.actionUrl}','_blank')">
              ${cfg.actionText || "Download"}
            </button>
          ` : ""}

          ${!force ? `
            <button class="secondary" style="margin-top:10px"
              id="patchCloseBtn">
              Tutup
            </button>
          ` : ""}
        </div>
      `;

      document.body.appendChild(overlay);

      if(!force){
        const btn = overlay.querySelector("#patchCloseBtn");
        btn.onclick = ()=>{
          markSeen(cfg.version);
          overlay.remove();
        };
      }

      // force = disable login
      if(force){
        const loginBtn = document.getElementById("btnLogin");
        if(loginBtn) loginBtn.disabled = true;
      }
    }

    // ===== PREVIEW MODE (DARI ADMIN PANEL) =====
    const previewRaw = sessionStorage.getItem(PREVIEW_KEY);
    if(previewRaw){
      sessionStorage.removeItem(PREVIEW_KEY);
      try{
        render(JSON.parse(previewRaw), true);
      }catch(e){}
      return;
    }

    // ===== NORMAL MODE (RTDB) =====
    db.ref("patch_gate").once("value").then(snap=>{
      render(snap.val(), false);
    });
  }
});