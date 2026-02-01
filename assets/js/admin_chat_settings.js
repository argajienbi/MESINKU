console.log("✅ admin_chat_settings.js loaded");

const refSettings = db.ref("chat_broadcast/settings");

function initAdminChatSettings(){
  const u = getUser();
  if(!u || !isAdminOrSuper()){
    toast("Akses admin saja");
    go("index.html");
    return;
  }

  refSettings.once("value").then(snap=>{
    const s = snap.val() || {};

    enabled.checked = s.enabled !== false;
    allowReply.checked = s.allowReply !== false;
    allowLinks.checked = s.allowLinks !== false;
    pinnedEnabled.checked = s.pinnedEnabled === true;

    mode.value = s.mode || "public";
    maxLength.value = s.maxLength || 300;
    cooldownSeconds.value = s.cooldownSeconds || 0;

    hourStart.value = s.activeHours?.start || "06:00";
    hourEnd.value = s.activeHours?.end || "22:00";

    blockedWords.value = (s.blockedWords || []).join(",");
    pinnedText.value = s.pinnedText || "";
  });

  btnSave.onclick = saveSettings;
}

function saveSettings(){
  const data = {
    enabled: enabled.checked,
    allowReply: allowReply.checked,
    allowLinks: allowLinks.checked,
    pinnedEnabled: pinnedEnabled.checked,

    mode: mode.value,
    maxLength: Number(maxLength.value) || 300,
    cooldownSeconds: Number(cooldownSeconds.value) || 0,

    activeHours: {
      start: hourStart.value || "00:00",
      end: hourEnd.value || "23:59"
    },

    blockedWords: blockedWords.value
      .split(",")
      .map(x=>x.trim())
      .filter(Boolean),

    pinnedText: pinnedText.value || ""
  };

  refSettings.set(data)
    .then(()=>toast("Pengaturan disimpan ✅"))
    .catch(e=>toast("Gagal simpan: "+e.message));
}