(function(){
  "use strict";
  if(window.__dnxRemoteViewRow) return; window.__dnxRemoteViewRow = true;
  function hasCustomPos(){
    try{ var p = JSON.parse(localStorage.getItem("dnx_remote_btn") || "null"); return !!(p && p.left && p.top); }catch(e){ return false; }
  }
  function ensure(){
    if(hasCustomPos()) return;
    let host=document.getElementById('dnx-line-toggle-box');
    if(!host){
      let r=document.getElementById('openwebrx-panel-receiver'); if(!r) return;
      host=document.createElement('div'); host.id='dnx-line-toggle-box';
      host.style.cssText='display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:6px 0 8px';
      r.insertBefore(host,r.firstChild);
    }
    let b=document.getElementById('dnx-remote-view-btn'); if(!b) return;
    if(b.parentNode!==host) host.appendChild(b);
    let css={position:'relative',left:'auto',right:'auto',top:'auto',bottom:'auto','z-index':'auto','min-width':'0',height:'26px',padding:'0 10px','border-radius':'999px',margin:'0',display:'inline-flex','align-items':'center','justify-content':'center','line-height':'1',cursor:'grab'};
    Object.keys(css).forEach(k=>b.style.setProperty(k,css[k],'important'));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ensure,{once:true}); else ensure();
  setInterval(ensure,500);
})();
