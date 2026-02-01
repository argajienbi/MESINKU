
/* Laporan Mesin Excel (Copy TSV) */
let __machineRows = [];
let __rangeDays = 7;

function fmtTime(ts){
  if(!ts) return "-";
  try{ return new Date(ts).toLocaleString(); }catch(e){ return "-"; }
}

function toggleMachineRaw(){
  const ta=document.getElementById("machineRawTSV");
  if(!ta) return;
  ta.style.display = (ta.style.display==="none"||!ta.style.display) ? "block" : "none";
}

function selectMachineRaw(){
  const ta=document.getElementById("machineRawTSV");
  if(!ta) return;
  ta.style.display="block";
  ta.focus();
  ta.select();
  try{ document.execCommand("copy"); toast("✅ Copied TSV"); }catch(e){}
}

function setRangeDays(days){
  __rangeDays = Number(days||7);
  loadMachineReport();
}

function buildMachineRow(h){
  const name = h.machine_name || h.machineName || h.machine_id || "-";
  const code = h.machine_id || h.machineId || "-";
  const user = h.username || h.userName || h.userEmail || "-";
  const tujuan = h.tujuan || "-";
  const lokasi = h.lokasiTujuan || h.lokasi || "-";
  const started = h.startAt || h.startedAt || 0;
  const ended = h.endAt || h.endedAt || 0;

  let durText = "-";
  let status = "DONE";
  if(started && ended){
    if(typeof formatDuration==="function") durText = formatDuration(ended-started);
    else durText = String(Math.round((ended-started)/60000))+" menit";
  }else if(started && !ended){
    status = "IN_USE";
    durText = "⏳ sedang dipakai";
  }else{
    status = "UNKNOWN";
  }

  const waktu = fmtTime(ended || started || 0);

  return {
    waktu, name, code, user, tujuan, lokasi,
    start: fmtTime(started),
    end: fmtTime(ended),
    durasi: durText,
    status
  };
}

function renderMachineTable(rows){
  const tb=document.getElementById("machineTbody");
  if(!tb) return;

  tb.innerHTML="";
  if(rows.length===0){
    tb.innerHTML='<tr><td colspan="10" class="small">Belum ada data.</td></tr>';
    return;
  }

  rows.forEach(r=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td class="mono">${escapeHtml(r.waktu)}</td>
      <td>${escapeHtml(r.name)}</td>
      <td class="mono">${escapeHtml(r.code)}</td>
      <td>${escapeHtml(r.user)}</td>
      <td>${escapeHtml(r.tujuan)}</td>
      <td>${escapeHtml(r.lokasi)}</td>
      <td class="mono">${escapeHtml(r.start)}</td>
      <td class="mono">${escapeHtml(r.end)}</td>
      <td>${escapeHtml(r.durasi)}</td>
      <td>${escapeHtml(r.status)}</td>
    `;
    tb.appendChild(tr);
  });
}

function copyMachineTSV(){
  const header = ["Waktu","Mesin","Kode","User","Tujuan","Lokasi","Start","End","Durasi","Status"];
  const lines=[header.join("\t")];
  __machineRows.forEach(r=>{
    lines.push([
      r.waktu, r.name, r.code, r.user, r.tujuan, r.lokasi,
      r.start, r.end, r.durasi, r.status
    ].join("\t"));
  });
  const tsv=lines.join("\n");

  const ta=document.getElementById("machineRawTSV");
  if(ta){
    ta.value=tsv;
    ta.style.display="block";
    ta.focus();
    ta.select();
    try{ document.execCommand("copy"); toast("✅ Copied TSV"); return; }catch(e){}
  }
  alert("Copy gagal. Silakan copy manual dari Raw.");
}

function loadMachineReport(){
  const info=document.getElementById("rangeInfo");
  if(info) info.textContent = `Range: ${__rangeDays} hari terakhir`;

  const now=Date.now();
  const from= now - (__rangeDays*86400000);

  db.ref("history").limitToLast(800).once("value").then(snap=>{
    const data=snap.val() || {};
    const items=Object.values(data).filter(Boolean);

    const filtered = items.filter(h=>{
      const t = h.endedAt||h.endAt||h.startedAt||h.startAt||0;
      return t>=from;
    });

    filtered.sort((a,b)=>(b.endedAt||b.endAt||b.startedAt||b.startAt||0)-(a.endedAt||a.endAt||a.startedAt||a.startAt||0));

    const rows = filtered.map(buildMachineRow);
    __machineRows = rows;
    renderMachineTable(rows);
  }).catch(e=>toast("Gagal load laporan: "+e.message));
}

function initLaporanMesinExcel(){
  setRangeDays(7);
}


// === FIXED BOTTOM BAR BUTTONS ===
document.addEventListener("DOMContentLoaded", ()=>{
  const a = document.getElementById("btnToggleRawFixed");
  const b = document.getElementById("btnSelectRawFixed");
  const oldA = document.getElementById("btnToggleRaw");
  const oldB = document.getElementById("btnSelectRaw");

  if(a){
    a.addEventListener("click", ()=>{ try{ toggleRaw(); }catch(e){} });
  }
  if(b){
    b.addEventListener("click", ()=>{ try{ selectRaw(); }catch(e){} });
  }
  // optional hide old buttons container if exists
  if(oldA){ oldA.style.display="none"; }
  if(oldB){ oldB.style.display="none"; }
});
