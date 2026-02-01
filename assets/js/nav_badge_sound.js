/* =========================================
   NAV BADGE + SOUND
   MesinKu
========================================= */

(function(){

  let soundPlayed = {}; // prevent spam per key

  function playSound(key){
    if(soundPlayed[key]) return;
    soundPlayed[key] = true;

    const audio = new Audio("assets/sound/notif.mp3");
    audio.volume = 0.6;
    audio.play().catch(()=>{});
  }

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

  function removeBadge(el, key){
    const b = el && el.querySelector(".nav-badge");
    if(b) b.remove();
    if(key) soundPlayed[key] = false;
  }

  function findNav(key){
    return document.querySelector(
      `[data-nav="${key}"], #nav${key.charAt(0).toUpperCase()+key.slice(1)}`
    );
  }

  /* ===============================
     CHAT BADGE + SOUND
  ================================ */
  function initChatBadgeSound(){
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

      if(last.createdBy !== u.uid){
        addBadge(nav);
        playSound("chat");
      }
    });

    nav.addEventListener("click", ()=>{
      removeBadge(nav, "chat");
    });
  }

  /* ===============================
     PATCH BADGE + SOUND
  ================================ */
  function initPatchBadgeSound(){
    if(typeof db==="undefined") return;

    const nav = findNav("home");
    if(!nav) return;

    db.ref