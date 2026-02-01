// Firebase Compat init (HopWeb safe)
const firebaseConfig = {
  "apiKey": "AIzaSyDSOb-M_sP4iTam7zn0NQ9GAo-8eMGA5KM",
  "authDomain": "mesinku-2a32e.firebaseapp.com",
  "databaseURL": "https://mesinku-2a32e-default-rtdb.asia-southeast1.firebasedatabase.app",
  "projectId": "mesinku-2a32e",
  "storageBucket": "mesinku-2a32e.firebasestorage.app",
  "messagingSenderId": "354300380605",
  "appId": "1:354300380605:web:b213e42859ad27bda87ed4",
  "measurementId": "G-LKY6XK5F39"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

function toast(msg){
  const t=document.createElement("div");
  t.className="toast";
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),1800);
}

function go(url){ window.location.href=url; }

function getUser(){
  try { return JSON.parse(localStorage.getItem("mesinku_user")||"null"); }
  catch(e){ return null; }
}

function setUser(u){
  localStorage.setItem("mesinku_user", JSON.stringify(u));
}

function clearUser(){
  localStorage.removeItem("mesinku_user");
}

function requireLogin(){
  const u=getUser();
  if(!u){ window.location.href="login.html"; }
}

function isSuperAdmin(){
  const u=getUser();
  return u && u.role==="superadmin";
}

function isAdminOrSuper(){
  const u=getUser();
  return u && (u.role==="admin"||u.role==="superadmin");
}

// Presence via RTDB users_online
function setOnlinePresence(){
  const u=getUser();
  if(!u) return;

  const ref = db.ref("users_online/"+u.uid);
  const payload = {
    uid: u.uid,
    name: u.name,
    role: u.role || "crew",
    gedung: u.gedung || "",
    last_seen: Date.now()
  };

  // heartbeat
  ref.set(payload);
  if(window.__presenceTimer) clearInterval(window.__presenceTimer);
  window.__presenceTimer = setInterval(()=>{
    payload.last_seen = Date.now();
    ref.update({ last_seen: payload.last_seen, role: payload.role, name: payload.name });
  }, 15000);

  window.addEventListener("beforeunload", ()=>{
    ref.update({ last_seen: Date.now()-999999 });
  });
}

// Default machine list for seeding
const DEFAULT_MACHINES = [
  // AS
  ["AS-A","AS","A","Automatic Scrubber"],
  ["AS-B","AS","B","Automatic Scrubber"],
  ["AS-Dome","AS","Dome","Automatic Scrubber"],

  // PLS 11
  ["PLS-A1","PLS","A","Polisher Low Speed"],
  ["PLS-A2","PLS","A","Polisher Low Speed"],
  ["PLS-A3","PLS","A","Polisher Low Speed"],
  ["PLS-A4","PLS","A","Polisher Low Speed"],
  ["PLS-B1","PLS","B","Polisher Low Speed"],
  ["PLS-B2","PLS","B","Polisher Low Speed"],
  ["PLS-B3","PLS","B","Polisher Low Speed"],
  ["PLS-B4","PLS","B","Polisher Low Speed"],
  ["PLS-B5","PLS","B","Polisher Low Speed"],
  ["PLS-Dome1","PLS","Dome","Polisher Low Speed"],
  ["PLS-Dome2","PLS","Dome","Polisher Low Speed"],

  // PHS
  ["PHS-A","PHS","A","Polisher High Speed"],
  ["PHS-B","PHS","B","Polisher High Speed"],

  // BLW 8 (A4 B4)
  ["BLW-A1","BLW","A","Blower"],
  ["BLW-A2","BLW","A","Blower"],
  ["BLW-A3","BLW","A","Blower"],
  ["BLW-A4","BLW","A","Blower"],
  ["BLW-B1","BLW","B","Blower"],
  ["BLW-B2","BLW","B","Blower"],
  ["BLW-B3","BLW","B","Blower"],
  ["BLW-B4","BLW","B","Blower"],

  // CSG 4
  ["CSG-A1","CSG","A","Carpet Spotter / Goca"],
  ["CSG-A2","CSG","A","Carpet Spotter / Goca"],
  ["CSG-B1","CSG","B","Carpet Spotter / Goca"],
  ["CSG-B2","CSG","B","Carpet Spotter / Goca"],

  // VAC 3
  ["VAC-A","VAC","A","Vacuum Air"],
  ["VAC-B","VAC","B","Vacuum Air"],
  ["VAC-Dome","VAC","Dome","Vacuum Air"],

  // JET 2
  ["JET-A","JET","A","Jet Sprayer"],
  ["JET-B","JET","B","Jet Sprayer"],

  // EXT 4
  ["EXT-A1","EXT","A","Extractor"],
  ["EXT-A2","EXT","A","Extractor"],
  ["EXT-B1","EXT","B","Extractor"],
  ["EXT-B2","EXT","B","Extractor"],

  // HPL 3
  ["HPL-A","HPL","A","Hand Polisher"],
  ["HPL-B","HPL","B","Hand Polisher"],
  ["HPL-Dome","HPL","Dome","Hand Polisher"],
];

function seedMachinesIfEmpty(){
  return db.ref("machines").once("value").then(snap=>{
    if(snap.exists()) return false;
    const updates={};
    DEFAULT_MACHINES.forEach(([code,type,group,name])=>{
      updates["machines/"+code]={
        code,type,group,name,
        status:"available",
        currentUser:null,
        currentSessionId:null,
        updatedAt:Date.now(),
        isActive:true
      };
    });
    return db.ref().update(updates).then(()=>true);
  });
}

function logout(){
  const u=getUser();
  if(u) {
    db.ref("users_online/"+u.uid).remove();
  }
  auth.signOut().finally(()=>{
    clearUser();
    go("login.html");
  });
}