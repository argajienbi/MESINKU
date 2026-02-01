/* =====================================================
   MesinKu - Chat Broadcast FINAL
===================================================== */

console.log("✅ chat_broadcast.js FINAL");

/* ===== STATE ===== */
let CHAT_REPLY = null;
let LAST_SEND_AT = 0;
const COOLDOWN = 4000;

/* ===== INIT ===== */
function initChatBroadcast(){
  listenMessages();
}

/* ===== LOAD ===== */
function listenMessages(){
  const box = document.getElementById("notifList");
  if(!box) return;

  const myUid = getUser().uid;

  db.ref("user_messages").limitToLast(200).on("value", snap=>{
    const data = snap.val() || {};
    const items = Object.entries(data)
      .map(([id,v])=>({id,...v}))
      .sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));

    if(items.length===0){
      box.innerHTML = `<div class="small muted">Belum ada chat.</div>`;
      return;
    }

    box.innerHTML = items.map(m=>{
      const mine = m.createdBy===myUid;
      const name = mine ? "Kamu" : (m.createdByName||"User");
      const time = new Date(m.createdAt||0).toLocaleTimeString();

      const reply = m.replyText
        ? `<div class="replyBox">${escapeHtml(m.replyText)}</div>`
        : "";

      return `
        <div class="bubbleWrap ${mine?'right':'left'}">
          <div class="bubble ${mine?'mine':'other'}">
            <div class="small muted">${escapeHtml(name)}</div>
            ${reply}
            <div style="margin-top:4px">${escapeHtml(m.message||"")}</div>
            <div class="bubbleMeta">
              <span>${time}</span>
              <button onclick="setReply('${escapeHtml(m.message||"")}')">↩</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    box.scrollTop = box.scrollHeight;
  });
}

/* ===== REPLY ===== */
function setReply(text){
  CHAT_REPLY = text;
  const box = document.getElementById("replyPreview");
  box.style.display="block";
  box.innerHTML = `
    <div>
      Membalas:
      <div class="replyText">${escapeHtml(text)}</div>
      <button onclick="clearReply()">Batal</button>
    </div>
  `;
}
function clearReply(){
  CHAT_REPLY=null;
  const box=document.getElementById("replyPreview");
  box.style.display="none";
  box.innerHTML="";
}

/* ===== SEND ===== */
function sendChatBroadcastMessage(text){
  const u=getUser();
  if(!u) return;

  const now=Date.now();
  if(now-LAST_SEND_AT<COOLDOWN){
    toast("Tunggu sebentar…");
    return;
  }

  const msg=(text||"").trim();
  if(!msg) return;

  LAST_SEND_AT=now;

  db.ref("user_messages").push({
    message: msg,
    replyText: CHAT_REPLY || null,
    createdAt: now,
    createdBy: u.uid,
    createdByName: u.name||u.username||"User",
    role: u.role||"crew",
    gedung: u.gedung||"-"
  }).then(clearReply);
}