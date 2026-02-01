/* =========================================
   NAV BADGE SYSTEM
   MesinKu
========================================= */

(function(){

  function addBadge(el){
    if(!el || el.querySelector(".nav-badge")) return;

    const b = document.createElement("span");
    b.className = "nav-badge";
    b.textContent = "●";
    el.style.position = "relative";

    b.style.cssText = `
      position:absolute;
      top:4px;
      right:6px;
      font-size:12px;
      color:#22c55e;
      pointer-events:none;
    `;

    el.appendChild(b);
  }

  function removeBadge(el){
    const b = el && el.querySelector(".nav-badge");
    if(b) b.remove();
  }

  function findNav(key){
    return document.querySelector(
      `[data-nav="${key}"], #nav${key.charAt(0).toUpperCase()+key.slice(1)}`
    );
  }

  // ===========================
  // CHAT BADGE (REALTIME)
  // ===========================
  function initChatBadge(){
    if(typeof db==="undefined" || typeof getUser!=="function") return;

    const u = getUser();
    if(!u) return;

    const nav = findNav("chat");
    if(!nav) return;

    db.ref("user_messages").limitToLast(1).on("value", snap=>{
      const data = snap.val();
      if(!data) return;

      const last = Object.values(data).pop();
      if(!last) return;

      // kalau pesan bukan dari diri sendiri → badge
      if(last.createdBy !== u.uid){
        addBadge(nav);
      }
    });

    nav.addEventListener("click", ()=>{
      removeBadge(nav);
    });
  }

  // ===========================
  // PATCH BADGE
  // ===========================
  function initPatchBadge(){
    if(typeof db==="undefined") return;

    const nav = findNav("home");
    if(!nav) return;

    db.ref("patch_gate").once("value").then(s=>{
      const cfg = s.val();
      if(cfg && cfg.enabled){
        addBadge(nav);
      }
    });
  }

  // ===========================
  // INIT
  // ===========================
  document.addEventListener("DOMContentLoaded", ()=>{
    setTimeout(()=>{
      initChatBadge();
      initPatchBadge();
    }, 300); // tunggu navbar()
  });

})();