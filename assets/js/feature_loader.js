/* =================================================
   FEATURE LOADER – MesinKu
   Tujuan:
   - Inject fitur tanpa bongkar HTML
   - Semua fitur modular & aman
   - Tidak sentuh app.js
================================================= */

(function(){

  // ===== REGISTRY =====
  const FEATURES = [];

  /**
   * Daftarkan fitur
   * @param {Object} def
   * def = {
   *   id: string,
   *   pages: ["index.html","*"],
   *   needLogin: true | false | undefined,
   *   run: function
   * }
   */
  window.registerFeature = function(def){
    if(!def || !def.id || typeof def.run!=="function"){
      console.warn("Feature invalid:", def);
      return;
    }
    FEATURES.push(def);
  };

  // ===== UTIL =====
  function getPage(){
    const p = location.pathname.split("/").pop();
    return p || "index.html";
  }

  function isLoggedIn(){
    try{
      return (typeof getUser==="function" && !!getUser());
    }catch(e){
      return false;
    }
  }

  function canRun(feature, page, logged){
    if(feature.pages){
      if(!feature.pages.includes("*") && !feature.pages.includes(page)){
        return false;
      }
    }

    if(feature.needLogin === true && !logged) return false;
    if(feature.needLogin === false && logged) return false;

    return true;
  }

  // ===== EXECUTOR =====
  function runFeatures(){
    const page = getPage();
    const logged = isLoggedIn();

    FEATURES.forEach(f=>{
      if(!canRun(f, page, logged)) return;

      try{
        console.log("▶ Feature:", f.id);
        f.run();
      }catch(err){
        console.error("❌ Feature error:", f.id, err);
      }
    });
  }

  // ===== INIT =====
  document.addEventListener("DOMContentLoaded", ()=>{
    runFeatures();
  });

})();