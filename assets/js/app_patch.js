console.log("🧩 app_patch.js loaded");

(function(){

  if(typeof firebase === "undefined") return;
  if(typeof db === "undefined") return;

  db.ref("app_patch").once("value").then(snap=>{
    const p = snap.val();
    if(!p || p.enabled !== true) return;

    showPatchPopup(p);
  });

  function showPatchPopup(p){
    const wrap = document.createElement("div");
    wrap.style = `
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.65);
      z-index:99999;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
    `;

    const box = document.createElement("div");
    box.style = `
      max-width:420px;
      width:100%;
      background:#0f1b33;
      color:#e8eefc;
      border-radius:18px;
      padding:18px;
      box-shadow:0 20px 50px rgba(0,0,0,.5);
    `;

    box.innerHTML = `
      <div style="font-weight:900;font-size:18px">${p.title || "Update"}</div>
      <div style="margin-top:10px;white-space:pre-wrap;line-height:1.4">
        ${p.message || ""}
      </div>

      ${p.downloadUrl ? `
        <a href="${p.downloadUrl}" target="_blank"
          style="display:block;margin-top:14px;
          padding:12px;border-radius:12px;
          background:#3b82f6;color:#fff;
          text-align:center;font-weight:700;
          text-decoration:none">
          ${p.downloadLabel || "Download"}
        </a>
      ` : ""}

      ${p.force !== true ? `
        <button id="btnClosePatch"
          style="margin-top:10px;width:100%"
          class="secondary">
          Tutup
        </button>
      ` : `
        <div style="margin-top:10px;font-size:12px;opacity:.8">
          Update wajib dilakukan
        </div>
      `}
    `;

    wrap.appendChild(box);
    document.body.appendChild(wrap);

    const btn = box.querySelector("#btnClosePatch");
    if(btn){
      btn.onclick = ()=> wrap.remove();
    }
  }

})();