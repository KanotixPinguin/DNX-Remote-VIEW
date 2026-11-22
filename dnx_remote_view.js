(function(){

"use strict";

const BTN_ID="dnx-remote-view-btn";


function getDNXUser(){

 let u=localStorage.getItem("dnx_user");

 if(!u){

   u="guest";

   localStorage.setItem(
    "dnx_user",
    u
   );

 }

 return u;

}

function setDNXUser(user){

 localStorage.setItem(
    "dnx_user",
    user
 );

 location.reload();

}



async function loadGlobalState(){

 try{

   let globalReq=await fetch(
    "http://" +
    location.hostname +
    ":8099/load_global"
   );

   let globalState=
    await globalReq.json();

   let user=getDNXUser();

   if(user==="guest"){

      return globalState;

   }

   let userReq=await fetch(
    "http://" +
    location.hostname +
    ":8099/load_user/" +
    user
   );

   let userState=
    await userReq.json();

   globalState.sources=
    (globalState.sources||[])
    .concat(userState.sources||[]);

   return globalState;

 }catch(e){

   console.error("DNX state load failed",e);

   return {};

 }

}

async function saveGlobalState(state){

 try{

   let user=getDNXUser();

   let endpoint=
    user==="guest"
    ? "/save_global"
    : "/save_user/" + user;

   await fetch(
    "http://" +
    location.hostname +
    ":8099" +
    endpoint,
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(state)
    }
   );

 }catch(e){

   console.error("DNX state save failed",e);

 }

}



const DNX_ADMIN =
 new URLSearchParams(location.search)
 .get("dnxadmin")==="1";

function getRuntimeSources(cfg){

 try{

  let local=JSON.parse(
   localStorage.getItem("dnx_runtime_sources")
  );

  if(local && local.length){

   return local;

  }

 }catch(e){}

 return cfg.sources || [];

}

function saveRuntimeSources(sources){

 localStorage.setItem(
  "dnx_runtime_sources",
  JSON.stringify(sources)
 );

}



let DNX_Z=1000602;


let DNX_LAST_STATE="";

async function startLiveSync(){

 setInterval(async function(){

   let state=await loadGlobalState();

   let hash=JSON.stringify(state);

   if(!hash) return;

   if(hash===DNX_LAST_STATE) return;

   DNX_LAST_STATE=hash;

   console.log("DNX LIVE SYNC UPDATE",state);

   if(state.sources){

      localStorage.setItem(
        "dnx_runtime_sources",
        JSON.stringify(state.sources)
      );

      state.sources.forEach(function(src){

        let win=document.getElementById(
          "dnx-window-" + src.id
        );

        if(!win) return;

        win.style.left=src.left+"px";
        win.style.top=src.top+"px";
        win.style.width=src.width+"px";
        win.style.height=src.height+"px";

      });

      let old=document.getElementById(
        "dnx-source-panel"
      );

      if(old) old.remove();

   }

 },3000);

}



function ensureTaskbar(){

 let tb=document.getElementById("dnx-taskbar");

 if(tb) return tb;

 tb=document.createElement("div");

 tb.id="dnx-taskbar";

 tb.style.cssText=
  "position:fixed;" +
  "left:20px;" +
  "top:calc(100vh - 70px);" +
  "height:42px;" +
  "z-index:1000700;" +
  "display:flex;" +
  "align-items:center;" +
  "gap:8px;" +
  "padding:0 10px;" +
  "border-radius:14px;" +
  "background:linear-gradient(90deg,#001018,#002c3d);" +
  "border:1px solid #1f6aa5;" +
  "box-shadow:0 0 20px rgba(0,180,255,.35);";

 restorePos(
   "dnx_taskbar",
   tb,
   {
     left:"20px",
     top:"calc(100vh - 70px)"
   }
 );

 draggable(
   tb,
   tb,
   "dnx_taskbar"
 );

 document.body.appendChild(tb);

 return tb;

}

function addTaskbarButton(win,src){

 let tb=ensureTaskbar();

 let b=document.createElement("button");

 b.innerHTML=src.title;

 b.style.cssText=
  "padding:6px 14px;" +
  "border-radius:999px;" +
  "border:1px solid #1f6aa5;" +
  "background:#002c3d;" +
  "color:#fff;" +
  "font-weight:700;" +
  "cursor:pointer;";

 b.onclick=function(){

   win.style.display="block";

   focusWindow(win);

 };

 tb.appendChild(b);

 return b;

}


function focusWindow(w){

 DNX_Z++;

 w.style.zIndex=DNX_Z;

}


async function loadSources(){

 try{

  var urls=["/static/plugins/receiver/dnx_remote_view/sources.json","/static/static/sources.json"];for(var i=0;i<urls.length;i++){try{var r=await fetch(urls[i]);if(r.ok)return await r.json();}catch(err){}}return {sources:[]};

 }catch(e){

  console.error("DNX Remote VIEW source load failed",e);

  return {sources:[]};

 }

}

function savePos(id,el,src,runtimeSources){

 let pos={
   left:el.style.left,
   top:el.style.top,
   width:el.style.width,
   height:el.style.height
 };

 localStorage.setItem(
  id,
  JSON.stringify(pos)
 );

 if(src){

   src.left=parseInt(el.style.left);

   src.top=parseInt(el.style.top);

   src.width=parseInt(el.style.width);

   src.height=parseInt(el.style.height);

   saveRuntimeSources(runtimeSources);

   saveGlobalState({

      sources:runtimeSources

   });

 }

}

function restorePos(id,el,defaults){

 try{

  let p=JSON.parse(localStorage.getItem(id));

  if(p){

   Object.assign(el.style,p);

   return;

  }

 }catch(e){}

 Object.assign(el.style,defaults);

}

function draggable(el,handle,id){
 let down=false, moved=false, sx=0, sy=0, ol=0, ot=0;
 handle.addEventListener("mousedown",function(e){
  if(e.button!==0) return;
  down=true; moved=false; var r=el.getBoundingClientRect();
  sx=e.clientX; sy=e.clientY; ol=r.left; ot=r.top;
  handle.style.cursor="grabbing";
 });
 document.addEventListener("mousemove",function(e){
  if(!down) return;
  var dx=e.clientX-sx, dy=e.clientY-sy;
  if(!moved && Math.abs(dx)+Math.abs(dy)<=5) return;
  moved=true;
  if(el.id===BTN_ID && el.parentNode!==document.body){
    document.body.appendChild(el);
    el.style.setProperty("position","fixed","important");
    el.style.setProperty("right","auto","important");
    el.style.setProperty("bottom","auto","important");
    el.style.setProperty("z-index","1000650","important");
  }
  el.style.setProperty("left",Math.max(4,Math.min(window.innerWidth-el.offsetWidth-4,Math.round(ol+dx)))+"px","important");
  el.style.setProperty("top",Math.max(4,Math.min(window.innerHeight-el.offsetHeight-4,Math.round(ot+dy)))+"px","important");
 });
 document.addEventListener("mouseup",function(){
  if(!down) return; down=false; handle.style.cursor="grab";
  if(moved){
    savePos(id,el);
    el.dataset.dnxSuppress="1";
    setTimeout(function(){ delete el.dataset.dnxSuppress; }, 220);
  }
 });
}






function snapWindow(win){

 const margin=30;
 const ww=window.innerWidth;
 const wh=window.innerHeight;

 const l=win.offsetLeft;
 const t=win.offsetTop;

 if(l < margin){
   win.style.left="0px";
   win.style.top="0px";
   win.style.width=Math.floor(ww/2)+"px";
   win.style.height=wh+"px";
   return;
 }

 if(l + win.offsetWidth > ww - margin){
   win.style.left=Math.floor(ww/2)+"px";
   win.style.top="0px";
   win.style.width=Math.floor(ww/2)+"px";
   win.style.height=wh+"px";
   return;
 }

 if(t < margin){
   win.style.left="0px";
   win.style.top="0px";
   win.style.width=ww+"px";
   win.style.height=wh+"px";
   return;
 }

}

function addResizeHandle(win,src,runtimeSources,id){

 const dirs=[
  "n","s","e","w",
  "nw","ne","sw","se"
 ];

 dirs.forEach(function(dir){

   let h=document.createElement("div");

   let css=
    "position:absolute;" +
    "z-index:999999;" +
    "background:transparent;";

   if(dir==="n"){
     css+="left:10px;right:10px;top:-3px;height:6px;cursor:n-resize;";
   }

   if(dir==="s"){
     css+="left:10px;right:10px;bottom:-3px;height:6px;cursor:s-resize;";
   }

   if(dir==="e"){
     css+="top:10px;bottom:10px;right:-3px;width:6px;cursor:e-resize;";
   }

   if(dir==="w"){
     css+="top:10px;bottom:10px;left:-3px;width:6px;cursor:w-resize;";
   }

   if(dir==="nw"){
     css+="left:-4px;top:-4px;width:12px;height:12px;cursor:nwse-resize;";
   }

   if(dir==="ne"){
     css+="right:-4px;top:-4px;width:12px;height:12px;cursor:nesw-resize;";
   }

   if(dir==="sw"){
     css+="left:-4px;bottom:-4px;width:12px;height:12px;cursor:nesw-resize;";
   }

   if(dir==="se"){
     css+="right:-4px;bottom:-4px;width:12px;height:12px;cursor:nwse-resize;";
   }

   h.style.cssText=css;

   let down=false;

   let sx=0;
   let sy=0;

   let sw=0;
   let sh=0;

   let sl=0;
   let st=0;

   h.addEventListener("mousedown",function(e){

      e.preventDefault();

      down=true;

      sx=e.clientX;
      sy=e.clientY;

      sw=win.offsetWidth;
      sh=win.offsetHeight;

      sl=win.offsetLeft;
      st=win.offsetTop;

   });

   document.addEventListener("mouseup",function(){

      if(!down) return;

      down=false;

      savePos(id,win,src,runtimeSources);

   });

   document.addEventListener("mousemove",function(e){

      if(!down) return;

      let dx=e.clientX-sx;
      let dy=e.clientY-sy;

      let nw=sw;
      let nh=sh;

      let nl=sl;
      let nt=st;

      if(dir.includes("e")){
        nw=sw+dx;
      }

      if(dir.includes("s")){
        nh=sh+dy;
      }

      if(dir.includes("w")){
        nw=sw-dx;
        nl=sl+dx;
      }

      if(dir.includes("n")){
        nh=sh-dy;
        nt=st+dy;
      }

      nw=Math.max(nw,400);
      nh=Math.max(nh,300);

      win.style.width=nw+"px";
      win.style.height=nh+"px";

      win.style.left=nl+"px";
      win.style.top=nt+"px";

   });

   win.appendChild(h);

 });

}

function buildSourceWizardHtml(){
 return '<div style="font-weight:800;margin-bottom:8px;color:#77eaff">Neue Quelle anlegen (7 Protokolle &amp; Webcam-Chat)</div>'+
  '<div style="display:grid;grid-template-columns:120px 1fr;gap:8px;align-items:center">'+
  '<label>Protokoll</label><select class="rv-w-type" style="padding:6px;border-radius:6px;background:#0f283b;color:#fff;border:1px solid #2b6e9e">'+
  '<option value="webcam">🎥 webcam – Webcam-Chat / WebRTC (Jitsi, Talk, VDO.Ninja)</option>'+
  '<option value="vnc">🖥 vnc – noVNC / websockify Remote-Desktop</option>'+
  '<option value="stream">📹 stream – Live-Kamera (MJPEG / HLS / MP4 / OBS)</option>'+
  '<option value="terminal">⌨ terminal – Web-SSH / Konsole (ttyd / Wetty)</option>'+
  '<option value="rdp">🖥 rdp – RDP / Gateway (Apache Guacamole)</option>'+
  '<option value="chat">💬 chat – Web-Chat / Matrix Element</option>'+
  '<option value="iframe">🌐 iframe – Web-App / HTTPS-Dashboard</option>'+
  '</select>'+
  '<label>Titel</label><input class="rv-w-title" placeholder="z. B. Funkrunde Webcam-Chat" style="padding:6px;border-radius:6px;background:#0f283b;color:#fff;border:1px solid #2b6e9e">'+
  '<label>URL / Port</label><input class="rv-w-url" placeholder="https://meet.jit.si/Raum oder host:port (VNC)" style="padding:6px;border-radius:6px;background:#0f283b;color:#fff;border:1px solid #2b6e9e">'+
  '<label>Sichtbarkeit</label><select class="rv-w-vis" style="padding:6px;border-radius:6px;background:#0f283b;color:#fff;border:1px solid #2b6e9e"><option value="private">private</option><option value="shared">shared</option><option value="public">public</option></select>'+
  '</div><div style="display:flex;gap:8px;margin-top:10px">'+
  '<button type="button" class="rv-w-create" style="padding:7px 14px;border-radius:999px;border:1px solid #4ee6ff;background:#0b5d3b;color:#fff;font-weight:700;cursor:pointer">✓ Quelle speichern &amp; öffnen</button>'+
  '<button type="button" class="rv-w-cancel" style="padding:7px 12px;border-radius:999px;border:1px solid #ffffff44;background:#263744;color:#fff;cursor:pointer">Abbrechen</button></div>';
}

function createWindow(src,runtimeSources){

 let id="dnx-window-"+src.id;

 let old=document.getElementById(id);

 if(old){

  old.style.display=
   old.style.display==="none"
   ? "block"
   : "none";

  return;

 }

 let win=document.createElement("div");

 win.id=id;

 win.style.cssText=
  "position:fixed;" +
  "z-index:1000602;" +
  "border-radius:14px;" +
  "overflow:hidden;" +
  "border:1px solid #1f6aa5;" +
  "background:#05070a;" +
  "box-shadow:0 0 30px rgba(0,180,255,.35);" +
  "backdrop-filter:blur(4px);";

 restorePos(
  id,
  win,
  {
   left:src.left+"px",
   top:src.top+"px",
   width:src.width+"px",
   height:src.height+"px"
  }
 );

 let bar=document.createElement("div");

 bar.style.cssText=
  "height:42px;" +
  "display:flex;" +
  "align-items:center;" +
  "justify-content:space-between;" +
  "padding:0 14px;" +
  "background:linear-gradient(90deg,#001018,#002c3d);" +
  "color:#fff;" +
  "font-weight:700;" +
  "cursor:grab;" +
  "border-bottom:1px solid #1f6aa5;";

 let title=document.createElement("span");

 title.innerHTML=src.title;

 let minimize=document.createElement("button");

 minimize.innerHTML="—";

 let maximize=document.createElement("button");

 maximize.innerHTML="□";

 let close=document.createElement("button");

 close.innerHTML="✕";

 close.style.cssText=
  "border:1px solid #fff;" +
  "background:#1f2cc9;" +
  "color:#fff;" +
  "border-radius:999px;" +
  "padding:4px 10px;" +
  "cursor:pointer;";

 let taskBtn=
  addTaskbarButton(win,src);

 let maximized=false;

 let oldState={};

 maximize.onclick=function(){

   if(!maximized){

     oldState={
       left:win.style.left,
       top:win.style.top,
       width:win.style.width,
       height:win.style.height
     };

     win.style.left="0px";
     win.style.top="0px";
     win.style.width=window.innerWidth+"px";
     win.style.height=window.innerHeight+"px";

     maximize.innerHTML="❐";

     maximized=true;

   }else{

     Object.assign(win.style,oldState);

     maximize.innerHTML="□";

     maximized=false;

   }

   savePos(id,win,src,runtimeSources);

 };

 minimize.onclick=function(){

   win.style.display="none";

 };

 close.onclick=function(){

   win.remove();

   if(taskBtn) taskBtn.remove();

 };

 const TYPE_BADGES={
   iframe:"🌐 Web/HTTPS", vnc:"🖥 noVNC", webcam:"🎥 Webcam-Chat",
   stream:"📹 Live-Stream", terminal:"⌨ Web-SSH", rdp:"🖥 RDP/Gateway", chat:"💬 Web-Chat"
 };
 const sType=(src.type||"iframe").toLowerCase();
 title.innerHTML=(TYPE_BADGES[sType] ? '<span style="font-size:11px;padding:2px 7px;border-radius:999px;background:#0e4766;border:1px solid #4ee6ff66;margin-right:8px;">'+TYPE_BADGES[sType]+'</span>' : '') + src.title;

 let frame;
 const rawUrl=(src.url||"").trim();
 if(sType==="stream" && /\.(mjpg|mjpeg)(\?|$)|action=stream|snapshot/i.test(rawUrl)){
   frame=document.createElement("img"); frame.src=rawUrl; frame.alt=src.title||"Live-Stream";
   frame.style.cssText="width:100%;height:calc(100% - 42px);object-fit:contain;background:#000;display:block;";
 } else if(sType==="stream" && /\.(mp4|webm|ogg)(\?|$)/i.test(rawUrl)){
   frame=document.createElement("video"); frame.src=rawUrl; frame.controls=true; frame.autoplay=true; frame.playsInline=true;
   frame.style.cssText="width:100%;height:calc(100% - 42px);background:#000;display:block;";
 } else {
   frame=document.createElement("iframe");
   if(sType==="vnc"){
     frame.src=location.protocol+"//"+location.hostname+":"+src.bridge_port+"/vnc.html?autoconnect=1&resize=remote&view_only=1";
   } else {
     frame.src=rawUrl;
   }
   if(sType==="webcam" || sType==="chat") frame.allow="camera; microphone; display-capture; autoplay; fullscreen; clipboard-write";
   else if(sType==="rdp" || sType==="terminal") frame.allow="clipboard-read; clipboard-write; fullscreen; autoplay";
   else frame.allow="fullscreen; autoplay";
   frame.style.cssText="width:100%;height:calc(100% - 42px);border:0;background:black;";
 }

 bar.appendChild(title);
 bar.appendChild(minimize);
 bar.appendChild(maximize);
 bar.appendChild(close);

 win.appendChild(bar);

 win.appendChild(frame);

 document.body.appendChild(win);

 focusWindow(win);

 win.addEventListener("mousedown",function(){

  focusWindow(win);

 });

 draggable(win,bar,id);

 addResizeHandle(
   win,
   src,
   runtimeSources,
   id
 );

 window.addEventListener("mouseup",function(){

   snapWindow(win);

   savePos(id,win,src,runtimeSources);

 });

}

async function createButton(){

 if(document.getElementById(BTN_ID)) return;

 const cfg=await loadSources();

 let btn=document.createElement("button");

 btn.id=BTN_ID;

 btn.innerHTML="DNX Remote VIEW";

 btn.style.cssText=
  "position:fixed;" +
  "left:20px;" +
  "top:140px;" +
  "z-index:1000601;" +
  "padding:10px 18px;" +
  "border-radius:999px;" +
  "border:1px solid #1f6aa5;" +
  "background:linear-gradient(90deg,#001018,#002c3d);" +
  "color:#fff;" +
  "font-weight:700;" +
  "cursor:grab;" +
  "box-shadow:0 0 18px rgba(0,180,255,.35);" +
  "backdrop-filter:blur(4px);";

 btn.title="Klick = Remote VIEW · Ziehen = Button frei verschieben · Doppelklick = Standardposition";
 try{
   var bp=JSON.parse(localStorage.getItem("dnx_remote_btn")||"null");
   if(bp&&bp.left&&bp.top){ btn.style.left=bp.left; btn.style.top=bp.top; btn.style.right="auto"; }
 }catch(e){}
 draggable(btn,btn,"dnx_remote_btn");
 btn.addEventListener("dblclick",function(e){
   e.preventDefault(); e.stopPropagation();
   try{ localStorage.removeItem("dnx_remote_btn"); }catch(err){}
   btn.style.left="20px"; btn.style.top="140px"; btn.style.right="auto";
 });

 btn.onclick=function(){
  if(btn.dataset.dnxSuppress) return;
  let old=document.getElementById("dnx-source-panel");

  if(old){

   old.remove();

   return;

  }

  let panel=document.createElement("div");

  panel.id="dnx-source-panel";

  panel.style.cssText=
   "position:fixed;" +
   "left:20px;" +
   "top:260px;" +
   "width:340px;" +
   "height:70vh;" +
   "z-index:99999999;" +
   "background:#081522;" +

   "border-radius:14px;" +

   "padding:12px;" +

   "display:flex;" +

   "flex-direction:column;" +
"overflow:hidden;" +
"gap:10px;";

  restorePos(
    "dnx_main_panel",
    panel,
    {
      left:"20px",
      top:"260px",
      width:"340px",
      height:"420px"
    }
  );
  panel.style.border="1px solid #1f6aa5"; panel.style.boxShadow="0 0 25px rgba(0,180,255,.35)";



  let topbar=document.createElement("div");

  topbar.style.cssText=
   "display:flex;" +
   "gap:8px;" +
   "margin-bottom:12px;" +
   "flex-wrap:wrap;";

  

function openLoginPanel(){

 let old=document.getElementById(
   "dnx-login-panel"
 );

 if(old){
   old.remove();
   return;
 }

 let p=document.createElement("div");

 p.id="dnx-login-panel";

 p.style.cssText=
   "position:absolute;" +
   "left:10px;" +
   "top:60px;" +
   "width:260px;" +
   "padding:14px;" +
   "border-radius:14px;" +
   "background:#081522;" +
   "border:1px solid #1f6aa5;" +
   "display:flex;" +
   "flex-direction:column;" +
   "gap:10px;" +
   "z-index:999999;";

 let title=document.createElement("div");

 title.innerHTML=
   "DNX LOGIN";

 title.style.cursor="move";

 title.style.cssText=
   "font-weight:700;" +
   "font-size:18px;" +
   "color:#fff;";

 let u=document.createElement("input");

 u.placeholder="Username";

 let pw=document.createElement("input");

 pw.placeholder="Password";

 pw.type="password";

 [u,pw].forEach(function(i){

   i.style.cssText=
    "padding:10px;" +
    "border-radius:10px;" +
    "border:1px solid #1f6aa5;" +
    "background:#001018;" +
    "color:#fff;";

 });

 let btn=document.createElement("button");

 btn.innerHTML="LOGIN";

 btn.style.cssText=
   "padding:10px;" +
   "border-radius:999px;" +
   "border:1px solid #1f6aa5;" +
   "background:#003a22;" +
   "color:#fff;" +
   "font-weight:700;" +
   "cursor:pointer;";

 btn.onclick=async function(){

   let r=await fetch(
    "http://" +
    location.hostname +
    ":8099/login",
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        username:u.value,
        password:pw.value
      })
    }
   );

   let data=await r.json();

   if(!data.ok){

      alert("Login failed");

      return;

   }

   localStorage.setItem(
    "dnx_user",
    data.username
   );

   localStorage.setItem(
    "dnx_role",
    data.role
   );

   alert(
    "Logged in as " +
    data.username
   );

   location.reload();

 };

 p.appendChild(title);
 p.appendChild(u);
 p.appendChild(pw);
 p.appendChild(btn);

 draggable(
   p,
   title,
   "dnx_login_panel"
 );

 document.body.appendChild(p);

}

function mkMenu(title){

    let b=document.createElement("button");

    b.innerHTML=title;

    b.style.cssText=
      "padding:8px 12px;" +
      "border-radius:999px;" +
      "border:1px solid #1f6aa5;" +
      "background:#002c3d;" +
      "color:#fff;" +
      "font-weight:700;" +
      "cursor:pointer;";

    return b;

  }

  let mSources=mkMenu("SOURCES");
  let mUser=mkMenu("USER");
  mUser.onclick=openLoginPanel;
  let mAdmin=mkMenu("ADMIN");
  let mShare=mkMenu("SHARE");
  let mSession=mkMenu("SESSION");
  let mHelp=mkMenu("? HELP");

  topbar.appendChild(mSources);
  topbar.appendChild(mUser);

  if(
    getDNXUser()==="admin"
  ){
    topbar.appendChild(mAdmin);
  }

  topbar.appendChild(mShare);
  topbar.appendChild(mSession);
  topbar.appendChild(mHelp);

  topbar.style.cursor="move";

  draggable(
    panel,
    topbar,
    "dnx_main_panel"
  );

  addResizeHandle(
    panel,
    null,
    [],
    "dnx_main_panel"
  );

  panel.appendChild(topbar);


  let content=document.createElement("div");

  content.id="dnx-runtime-content";

  content.style.cssText=
    "display:flex;" +
    "flex-direction:column;" +
    "gap:10px;" +
    "margin-top:10px;" +

    "flex:1 1 auto;" +

    "height:100%;" +

    "min-height:0;" +

    "overflow-y:scroll;" +

    "overflow-x:hidden;" +

    "padding-right:8px;" +

    "pointer-events:auto;" +

    "overscroll-behavior:contain;";

  panel.appendChild(content);

  

function createSection(title){

  let wrap=document.createElement("div");

  wrap.style.cssText=
    "border:1px solid #1f6aa5;" +
    "border-radius:12px;" +
    "overflow:hidden;" +

   "max-height:70vh;" +
    "background:#001018;";

  let head=document.createElement("div");

  head.innerHTML="▼ " + title;

  head.style.cssText=
    "padding:10px;" +
    "background:#002c3d;" +
    "color:#fff;" +
    "font-weight:700;" +
    "cursor:pointer;" +
    "user-select:none;";

  let body=document.createElement("div");

  body.style.cssText=
    "padding:10px;" +
    "display:block;" +
    "color:#fff;";

  let open=true;

  head.onclick=function(){

    open=!open;

    body.style.display=
      open ? "block" : "none";

    head.innerHTML=
      (open ? "▼ " : "▶ ") +
      title;

  };

  wrap.appendChild(head);

  wrap.appendChild(body);

  return {
    wrap:wrap,
    body:body
  };

}

function clearRuntimeContent(){

    content.innerHTML="";

  }

  function activateTab(btn){

    topbar.querySelectorAll("button")
      .forEach(function(b){

        b.style.background="#002c3d";

      });

    btn.style.background="#1f6aa5";

  }

  mSources.onclick=function(){

  

  mHelp.onclick=function(){

    activateTab(mHelp);

    clearRuntimeContent();

    let sec=createSection(
      "DNX Remote VIEW Help"
    );

    sec.body.style.maxHeight="60vh";
    sec.body.style.overflowY="auto";
    sec.body.style.overflowX="hidden";
    sec.body.style.paddingRight="10px";
    sec.body.style.scrollBehavior="smooth";

    sec.body.innerHTML=`

<div style="line-height:1.7;color:#fff;font-size:14px;">

<h2>DNX Remote VIEW</h2>

<div style="
padding:12px;
border-radius:12px;
background:#2b1200;
border:1px solid #ff8800;
margin-bottom:14px;
line-height:1.6;
">

<b>🇩🇪 DISCLAIMER</b><br><br>

DNX Remote VIEW ist KEIN offizieller Bestandteil von
OpenWebRX oder OpenWebRX+.<br><br>

Dieses Projekt ist ein unabhängiges experimentelles
Runtime-, Remote- und Multiuser-System,
entwickelt von <b>KanotixPinguin</b>.<br><br>

Es dient ausschließlich:
<ul>
<li>Testzwecken</li>
<li>Entwicklungszwecken</li>
<li>experimentellen Runtime-Umgebungen</li>
</ul>

Die Nutzung erfolgt vollständig auf eigene Gefahr.<br><br>

Bitte kontaktiert NICHT die offiziellen Entwickler,
Programmierer oder Maintainer von OpenWebRX/OpenWebRX+
für Probleme, Fehler oder Support bezüglich
DNX Remote VIEW.<br><br>

DNX Remote VIEW gehört nicht zum offiziellen
OpenWebRX/OpenWebRX+ Projekt.

<hr style="margin:12px 0;">

<b>🇬🇧 DISCLAIMER</b><br><br>

DNX Remote VIEW is NOT an official part of
OpenWebRX or OpenWebRX+.<br><br>

This project is an independent experimental
runtime, remote and multiuser environment
developed by <b>KanotixPinguin</b>.<br><br>

It is intended only for:
<ul>
<li>testing</li>
<li>development</li>
<li>experimental runtime environments</li>
</ul>

Use entirely at your own risk.<br><br>

Please DO NOT contact the official
OpenWebRX/OpenWebRX+ developers,
programmers or maintainers for issues,
bugs or support related to DNX Remote VIEW.<br><br>

DNX Remote VIEW is not affiliated with the official
OpenWebRX/OpenWebRX+ project.

</div>

<p>
Browser-based SDR runtime and remote workspace environment.
</p>

<hr>

<h2>🇩🇪 DEUTSCH</h2>

<h3>OVERVIEW</h3>

<p>
DNX Remote VIEW ist ein browserbasiertes Runtime-,
Remote- und Multiuser-System für OpenWebRX+.
</p>

<ul>
<li>Runtime Windows</li>
<li>Movable Panels</li>
<li>Resizable Windows</li>
<li>Taskbar System</li>
<li>VNC Runtime Bridges</li>
<li>Shared SDR Sessions</li>
<li>Public/Private Sources</li>
<li>Runtime User Layer</li>
<li>Admin Runtime</li>
<li>Collaborative SDR Workspaces</li>
</ul>

<h3>INSTALLATION</h3>

<p>
Benötigte Pakete:
</p>

<ul>
<li>python3</li>
<li>python3-flask</li>
<li>websockify</li>
<li>novnc</li>
<li>git</li>
</ul>

<p>
Systemdienste:
</p>

<ul>
<li>dnx-remote-view.service</li>
<li>Runtime API</li>
<li>Bridge Restore System</li>
</ul>

<h3>USER GUIDE</h3>

<ul>
<li>SOURCES = Runtime Sources verwalten</li>
<li>USER = Login / Session</li>
<li>SHARE = Shared Runtime Sources</li>
<li>SESSION = Runtime Workspaces</li>
<li>ADMIN = globale Runtime Kontrolle</li>
</ul>

<h3>VNC SYSTEM</h3>

<p>
DNX Remote VIEW kann:
</p>

<ul>
<li>VNC Rechner</li>
<li>SDR PCs</li>
<li>Remote Kameras</li>
<li>SDRangel Systeme</li>
<li>Remote Linux Systeme</li>
</ul>

<p>
live im Browser darstellen.
</p>

<h3>MULTIUSER</h3>

<ul>
<li>guest = public runtime only</li>
<li>user = private runtime layer</li>
<li>admin = global runtime control</li>
</ul>

<h3>SHARING</h3>

<ul>
<li>public</li>
<li>private</li>
<li>shared</li>
</ul>

<h3>RUNTIME WINDOWS</h3>

<ul>
<li>movable</li>
<li>resizable</li>
<li>snap support</li>
<li>runtime taskbar</li>
<li>workspace persistence</li>
</ul>

<h3>TROUBLESHOOTING</h3>

<ul>
<li>Bridge offline → restart restore_bridges.py</li>
<li>API offline → restart dnx_runtime_api.py</li>
<li>VNC blackscreen → verify host/port</li>
<li>Window sync issue → reload runtime state</li>
</ul>

<hr>

<h2>🇬🇧 ENGLISH</h2>

<h3>OVERVIEW</h3>

<p>
DNX Remote VIEW is a browser-based runtime,
remote and multiuser environment for OpenWebRX+.
</p>

<ul>
<li>Runtime windows</li>
<li>Movable panels</li>
<li>Resizable windows</li>
<li>Taskbar system</li>
<li>VNC runtime bridges</li>
<li>Shared SDR sessions</li>
<li>Public/private sources</li>
<li>User runtime layers</li>
<li>Admin runtime</li>
<li>Collaborative SDR workspaces</li>
</ul>

<h3>INSTALLATION</h3>

<p>
Required packages:
</p>

<ul>
<li>python3</li>
<li>python3-flask</li>
<li>websockify</li>
<li>novnc</li>
<li>git</li>
</ul>

<h3>USER GUIDE</h3>

<ul>
<li>SOURCES = manage runtime sources</li>
<li>USER = login/session</li>
<li>SHARE = shared runtime sources</li>
<li>SESSION = runtime workspaces</li>
<li>ADMIN = global runtime control</li>
</ul>

<h3>VNC SYSTEM</h3>

<p>
DNX Remote VIEW can display:
</p>

<ul>
<li>VNC computers</li>
<li>SDR systems</li>
<li>Remote cameras</li>
<li>SDRangel systems</li>
<li>Linux remote systems</li>
</ul>

<p>
live in the browser.
</p>

<h3>MULTIUSER</h3>

<ul>
<li>guest = public runtime only</li>
<li>user = private runtime layer</li>
<li>admin = global runtime control</li>
</ul>

<h3>SHARING</h3>

<ul>
<li>public</li>
<li>private</li>
<li>shared</li>
</ul>

<h3>RUNTIME WINDOWS</h3>

<ul>
<li>movable</li>
<li>resizable</li>
<li>snap support</li>
<li>runtime taskbar</li>
<li>workspace persistence</li>
</ul>

<h3>TROUBLESHOOTING</h3>

<ul>
<li>Bridge offline → restart restore_bridges.py</li>
<li>API offline → restart dnx_runtime_api.py</li>
<li>VNC blackscreen → verify host/port</li>
<li>Window sync issue → reload runtime state</li>
</ul>

<hr>

<h3>ABOUT</h3>

<p>
DNX Remote VIEW evolved from a simple OpenWebRX+
plugin into a collaborative browser-based SDR runtime system.
</p>

</div>

<h3>🇩🇪 DEUTSCH</h3>

<b>DNX Remote VIEW</b><br>
Browserbasiertes Runtime- und Remote-System für:
<ul>
<li>OpenWebRX+</li>
<li>VNC Runtime</li>
<li>Remote SDR Workspaces</li>
<li>Multiuser Runtime</li>
<li>Shared SDR Sessions</li>
</ul>

<b>Funktionen:</b>
<ul>
<li>Movable Windows</li>
<li>Resizable Windows</li>
<li>Taskbar Runtime</li>
<li>VNC Bridges</li>
<li>Public/Private Sources</li>
<li>User Runtime Layer</li>
<li>Shared Sessions</li>
<li>Admin Runtime</li>
</ul>

<b>Source Types:</b>
<ul>
<li>iframe (Web-Apps / HTTPS)</li>
<li>vnc (noVNC / websockify)</li>
<li>webcam (Webcam-Chat / WebRTC: Jitsi, Talk, VDO.Ninja)</li>
<li>stream (MJPEG / HLS / OBS Live-Kamera)</li>
<li>terminal (Web-SSH / ttyd)</li>
<li>rdp (Apache Guacamole)</li>
<li>chat (Web-Chat / Matrix)</li>
</ul>

<b>User Rollen:</b>
<ul>
<li>guest = public only</li>
<li>user = private runtime</li>
<li>admin = global runtime control</li>
</ul>

<hr>

<h3>🇬🇧 ENGLISH</h3>

<b>DNX Remote VIEW</b><br>
Browser-based runtime and remote environment for:
<ul>
<li>OpenWebRX+</li>
<li>VNC runtime</li>
<li>Remote SDR workspaces</li>
<li>Multiuser runtime</li>
<li>Shared SDR sessions</li>
</ul>

<b>Features:</b>
<ul>
<li>Movable windows</li>
<li>Resizable windows</li>
<li>Taskbar runtime</li>
<li>VNC bridges</li>
<li>Public/private sources</li>
<li>User runtime layers</li>
<li>Shared sessions</li>
<li>Admin runtime</li>
</ul>

<b>Source Types:</b>
<ul>
<li>iframe (Web-Apps / HTTPS)</li>
<li>vnc (noVNC / websockify)</li>
<li>webcam (Webcam-Chat / WebRTC: Jitsi, Talk, VDO.Ninja)</li>
<li>stream (MJPEG / HLS / OBS Live-Kamera)</li>
<li>terminal (Web-SSH / ttyd)</li>
<li>rdp (Apache Guacamole)</li>
<li>chat (Web-Chat / Matrix)</li>
</ul>

<b>User Roles:</b>
<ul>
<li>guest = public only</li>
<li>user = private runtime</li>
<li>admin = global runtime control</li>
</ul>

</div>
`;

    content.appendChild(sec.wrap);

  };


  activateTab(mSources);

    clearRuntimeContent();

    let sec=createSection(
      "Runtime Sources"
    );

    let add=document.createElement("button");

    add.innerHTML="+ ADD SOURCE";

    add.style.cssText=
      "padding:10px 14px;" +
      "border-radius:999px;" +
      "border:1px solid #1f6aa5;" +
      "background:#003a22;" +
      "color:#fff;" +
      "font-weight:700;" +
      "cursor:pointer;";

    let wiz=document.createElement("div");
    wiz.style.cssText="margin-top:10px;padding:12px;border-radius:12px;background:#071724;border:1px solid #1f6aa5;display:none;color:#eaf6ff;";
    wiz.innerHTML=buildSourceWizardHtml();
    add.onclick=function(){ wiz.style.display=wiz.style.display==="none"?"block":"none"; };
    wiz.querySelector(".rv-w-cancel").onclick=function(){ wiz.style.display="none"; };
    wiz.querySelector(".rv-w-create").onclick=function(){
      let t=wiz.querySelector(".rv-w-type").value;
      let ttl=(wiz.querySelector(".rv-w-title").value||"").trim()||("Neue "+t+"-Quelle");
      let uv=(wiz.querySelector(".rv-w-url").value||"").trim();
      let vis=wiz.querySelector(".rv-w-vis").value;
      if(!uv){ alert("Bitte URL oder host:port angeben."); return; }
      let cur=getRuntimeSources({});
      let item={id:"src"+Date.now(),title:ttl,visibility:vis,owner:getDNXUser(),type:t,width:860,height:580,left:140,top:140,enabled:true};
      if(t==="vnc" && /^\d+$/.test(uv)) item.bridge_port=parseInt(uv,10); else item.url=uv;
      cur.push(item); saveRuntimeSources(cur); createWindow(item, cur); wiz.style.display="none";
    };
    sec.body.appendChild(add);
    sec.body.appendChild(wiz);

    content.appendChild(sec.wrap);

  };

  mUser.onclick=function(){

    activateTab(mUser);

    clearRuntimeContent();

    openLoginPanel();

  };

  mShare.onclick=function(){

    activateTab(mShare);

    clearRuntimeContent();

    let d=document.createElement("div");

    d.innerHTML=
      "DNX SHARE SYSTEM";

    d.style.color="#fff";

    content.appendChild(d);

  };

  mSession.onclick=function(){

    activateTab(mSession);

    clearRuntimeContent();

    let d=document.createElement("div");

    d.innerHTML=
      "DNX SESSION SYSTEM";

    d.style.color="#fff";

    content.appendChild(d);

  };

  if(getDNXUser()==="admin"){

    mAdmin.onclick=function(){

      activateTab(mAdmin);

      clearRuntimeContent();

      let d=document.createElement("div");

      d.innerHTML=
        "DNX ADMIN RUNTIME";

      d.style.color="#fff";

      content.appendChild(d);

    };

  }



  mHelp.onclick=function(){

    activateTab(mHelp);

    clearRuntimeContent();

    let sec=createSection(
      "DNX Remote VIEW Help"
    );

    sec.body.style.maxHeight="60vh";
    sec.body.style.overflowY="auto";
    sec.body.style.overflowX="hidden";
    sec.body.style.paddingRight="10px";
    sec.body.style.scrollBehavior="smooth";

    sec.body.innerHTML=`

<div style="line-height:1.7;color:#fff;font-size:14px;">

<h2>DNX Remote VIEW</h2>

<div style="
padding:12px;
border-radius:12px;
background:#2b1200;
border:1px solid #ff8800;
margin-bottom:14px;
line-height:1.6;
">

<b>🇩🇪 DISCLAIMER</b><br><br>

DNX Remote VIEW ist KEIN offizieller Bestandteil von
OpenWebRX oder OpenWebRX+.<br><br>

Dieses Projekt ist ein unabhängiges experimentelles
Runtime-, Remote- und Multiuser-System,
entwickelt von <b>KanotixPinguin</b>.<br><br>

Es dient ausschließlich:
<ul>
<li>Testzwecken</li>
<li>Entwicklungszwecken</li>
<li>experimentellen Runtime-Umgebungen</li>
</ul>

Die Nutzung erfolgt vollständig auf eigene Gefahr.<br><br>

Bitte kontaktiert NICHT die offiziellen Entwickler,
Programmierer oder Maintainer von OpenWebRX/OpenWebRX+
für Probleme, Fehler oder Support bezüglich
DNX Remote VIEW.<br><br>

DNX Remote VIEW gehört nicht zum offiziellen
OpenWebRX/OpenWebRX+ Projekt.

<hr style="margin:12px 0;">

<b>🇬🇧 DISCLAIMER</b><br><br>

DNX Remote VIEW is NOT an official part of
OpenWebRX or OpenWebRX+.<br><br>

This project is an independent experimental
runtime, remote and multiuser environment
developed by <b>KanotixPinguin</b>.<br><br>

It is intended only for:
<ul>
<li>testing</li>
<li>development</li>
<li>experimental runtime environments</li>
</ul>

Use entirely at your own risk.<br><br>

Please DO NOT contact the official
OpenWebRX/OpenWebRX+ developers,
programmers or maintainers for issues,
bugs or support related to DNX Remote VIEW.<br><br>

DNX Remote VIEW is not affiliated with the official
OpenWebRX/OpenWebRX+ project.

</div>

<p>
Browser-based SDR runtime and remote workspace environment.
</p>

<hr>

<h2>🇩🇪 DEUTSCH</h2>

<h3>OVERVIEW</h3>

<p>
DNX Remote VIEW ist ein browserbasiertes Runtime-,
Remote- und Multiuser-System für OpenWebRX+.
</p>

<ul>
<li>Runtime Windows</li>
<li>Movable Panels</li>
<li>Resizable Windows</li>
<li>Taskbar System</li>
<li>VNC Runtime Bridges</li>
<li>Shared SDR Sessions</li>
<li>Public/Private Sources</li>
<li>Runtime User Layer</li>
<li>Admin Runtime</li>
<li>Collaborative SDR Workspaces</li>
</ul>

<h3>INSTALLATION</h3>

<p>
Benötigte Pakete:
</p>

<ul>
<li>python3</li>
<li>python3-flask</li>
<li>websockify</li>
<li>novnc</li>
<li>git</li>
</ul>

<p>
Systemdienste:
</p>

<ul>
<li>dnx-remote-view.service</li>
<li>Runtime API</li>
<li>Bridge Restore System</li>
</ul>

<h3>USER GUIDE</h3>

<ul>
<li>SOURCES = Runtime Sources verwalten</li>
<li>USER = Login / Session</li>
<li>SHARE = Shared Runtime Sources</li>
<li>SESSION = Runtime Workspaces</li>
<li>ADMIN = globale Runtime Kontrolle</li>
</ul>

<h3>VNC SYSTEM</h3>

<p>
DNX Remote VIEW kann:
</p>

<ul>
<li>VNC Rechner</li>
<li>SDR PCs</li>
<li>Remote Kameras</li>
<li>SDRangel Systeme</li>
<li>Remote Linux Systeme</li>
</ul>

<p>
live im Browser darstellen.
</p>

<h3>MULTIUSER</h3>

<ul>
<li>guest = public runtime only</li>
<li>user = private runtime layer</li>
<li>admin = global runtime control</li>
</ul>

<h3>SHARING</h3>

<ul>
<li>public</li>
<li>private</li>
<li>shared</li>
</ul>

<h3>RUNTIME WINDOWS</h3>

<ul>
<li>movable</li>
<li>resizable</li>
<li>snap support</li>
<li>runtime taskbar</li>
<li>workspace persistence</li>
</ul>

<h3>TROUBLESHOOTING</h3>

<ul>
<li>Bridge offline → restart restore_bridges.py</li>
<li>API offline → restart dnx_runtime_api.py</li>
<li>VNC blackscreen → verify host/port</li>
<li>Window sync issue → reload runtime state</li>
</ul>

<hr>

<h2>🇬🇧 ENGLISH</h2>

<h3>OVERVIEW</h3>

<p>
DNX Remote VIEW is a browser-based runtime,
remote and multiuser environment for OpenWebRX+.
</p>

<ul>
<li>Runtime windows</li>
<li>Movable panels</li>
<li>Resizable windows</li>
<li>Taskbar system</li>
<li>VNC runtime bridges</li>
<li>Shared SDR sessions</li>
<li>Public/private sources</li>
<li>User runtime layers</li>
<li>Admin runtime</li>
<li>Collaborative SDR workspaces</li>
</ul>

<h3>INSTALLATION</h3>

<p>
Required packages:
</p>

<ul>
<li>python3</li>
<li>python3-flask</li>
<li>websockify</li>
<li>novnc</li>
<li>git</li>
</ul>

<h3>USER GUIDE</h3>

<ul>
<li>SOURCES = manage runtime sources</li>
<li>USER = login/session</li>
<li>SHARE = shared runtime sources</li>
<li>SESSION = runtime workspaces</li>
<li>ADMIN = global runtime control</li>
</ul>

<h3>VNC SYSTEM</h3>

<p>
DNX Remote VIEW can display:
</p>

<ul>
<li>VNC computers</li>
<li>SDR systems</li>
<li>Remote cameras</li>
<li>SDRangel systems</li>
<li>Linux remote systems</li>
</ul>

<p>
live in the browser.
</p>

<h3>MULTIUSER</h3>

<ul>
<li>guest = public runtime only</li>
<li>user = private runtime layer</li>
<li>admin = global runtime control</li>
</ul>

<h3>SHARING</h3>

<ul>
<li>public</li>
<li>private</li>
<li>shared</li>
</ul>

<h3>RUNTIME WINDOWS</h3>

<ul>
<li>movable</li>
<li>resizable</li>
<li>snap support</li>
<li>runtime taskbar</li>
<li>workspace persistence</li>
</ul>

<h3>TROUBLESHOOTING</h3>

<ul>
<li>Bridge offline → restart restore_bridges.py</li>
<li>API offline → restart dnx_runtime_api.py</li>
<li>VNC blackscreen → verify host/port</li>
<li>Window sync issue → reload runtime state</li>
</ul>

<hr>

<h3>ABOUT</h3>

<p>
DNX Remote VIEW evolved from a simple OpenWebRX+
plugin into a collaborative browser-based SDR runtime system.
</p>

</div>

<h3>🇩🇪 DEUTSCH</h3>

<b>DNX Remote VIEW</b><br>
Browserbasiertes Runtime- und Remote-System für:
<ul>
<li>OpenWebRX+</li>
<li>VNC Runtime</li>
<li>Remote SDR Workspaces</li>
<li>Multiuser Runtime</li>
<li>Shared SDR Sessions</li>
</ul>

<b>Funktionen:</b>
<ul>
<li>Movable Windows</li>
<li>Resizable Windows</li>
<li>Taskbar Runtime</li>
<li>VNC Bridges</li>
<li>Public/Private Sources</li>
<li>User Runtime Layer</li>
<li>Shared Sessions</li>
<li>Admin Runtime</li>
</ul>

<b>Source Types:</b>
<ul>
<li>iframe (Web-Apps / HTTPS)</li>
<li>vnc (noVNC / websockify)</li>
<li>webcam (Webcam-Chat / WebRTC: Jitsi, Talk, VDO.Ninja)</li>
<li>stream (MJPEG / HLS / OBS Live-Kamera)</li>
<li>terminal (Web-SSH / ttyd)</li>
<li>rdp (Apache Guacamole)</li>
<li>chat (Web-Chat / Matrix)</li>
</ul>

<b>User Rollen:</b>
<ul>
<li>guest = public only</li>
<li>user = private runtime</li>
<li>admin = global runtime control</li>
</ul>

<hr>

<h3>🇬🇧 ENGLISH</h3>

<b>DNX Remote VIEW</b><br>
Browser-based runtime and remote environment for:
<ul>
<li>OpenWebRX+</li>
<li>VNC runtime</li>
<li>Remote SDR workspaces</li>
<li>Multiuser runtime</li>
<li>Shared SDR sessions</li>
</ul>

<b>Features:</b>
<ul>
<li>Movable windows</li>
<li>Resizable windows</li>
<li>Taskbar runtime</li>
<li>VNC bridges</li>
<li>Public/private sources</li>
<li>User runtime layers</li>
<li>Shared sessions</li>
<li>Admin runtime</li>
</ul>

<b>Source Types:</b>
<ul>
<li>iframe (Web-Apps / HTTPS)</li>
<li>vnc (noVNC / websockify)</li>
<li>webcam (Webcam-Chat / WebRTC: Jitsi, Talk, VDO.Ninja)</li>
<li>stream (MJPEG / HLS / OBS Live-Kamera)</li>
<li>terminal (Web-SSH / ttyd)</li>
<li>rdp (Apache Guacamole)</li>
<li>chat (Web-Chat / Matrix)</li>
</ul>

<b>User Roles:</b>
<ul>
<li>guest = public only</li>
<li>user = private runtime</li>
<li>admin = global runtime control</li>
</ul>

</div>
`;

    content.appendChild(sec.wrap);

  };


  activateTab(mSources);


  let runtimeSources =
   getRuntimeSources(cfg);

  if(DNX_ADMIN || localStorage.getItem("dnx_admin")==="1"){

    let add=document.createElement("button");

    add.innerHTML="+ ADD SOURCE";

    add.style.cssText=
     "padding:10px 14px;" +
     "border-radius:999px;" +
     "border:1px solid #1f6aa5;" +
     "background:#1f2cc9;" +
     "color:#fff;" +
     "font-weight:700;" +
     "cursor:pointer;";

    let wiz2=document.createElement("div");
    wiz2.style.cssText="margin:8px 0;padding:12px;border-radius:12px;background:#071724;border:1px solid #1f6aa5;display:none;color:#eaf6ff;";
    wiz2.innerHTML=buildSourceWizardHtml();
    add.onclick=function(){ wiz2.style.display=wiz2.style.display==="none"?"block":"none"; };
    wiz2.querySelector(".rv-w-cancel").onclick=function(){ wiz2.style.display="none"; };
    wiz2.querySelector(".rv-w-create").onclick=function(){
      let t=wiz2.querySelector(".rv-w-type").value;
      let ttl=(wiz2.querySelector(".rv-w-title").value||"").trim()||("Neue "+t+"-Quelle");
      let uv=(wiz2.querySelector(".rv-w-url").value||"").trim();
      let vis=wiz2.querySelector(".rv-w-vis").value;
      if(!uv){ alert("Bitte URL oder host:port angeben."); return; }
      if(t==="vnc" && uv.indexOf(":")>-1 && !/^https?:/i.test(uv)){
        let pts=uv.split(":");
        fetch(location.protocol+"//"+location.hostname+":8099/create_bridge",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({host:pts[0],port:parseInt(pts[1]||"5900",10)})})
          .then(r=>r.json()).then(data=>{
            runtimeSources.push({id:"src"+Date.now(),title:ttl,visibility:vis,owner:getDNXUser(),type:"vnc",host:pts[0],port:parseInt(pts[1]||"5900",10),bridge_port:data.bridge_port,width:900,height:600,left:120,top:180,enabled:true});
            saveRuntimeSources(runtimeSources); location.reload();
          }).catch(()=>alert("Bridge API (:8099) nicht erreichbar."));
        return;
      }
      let item={id:"src"+Date.now(),title:ttl,visibility:vis,owner:getDNXUser(),type:t,width:900,height:600,left:120,top:180,enabled:true};
      if(t==="vnc" && /^\d+$/.test(uv)) item.bridge_port=parseInt(uv,10); else item.url=uv;
      runtimeSources.push(item); saveRuntimeSources(runtimeSources); location.reload();
    };
    panel.appendChild(wiz2);

    panel.appendChild(add);

  }

  runtimeSources
   .filter(s=>s.enabled)
   .forEach(function(src){

    let row=document.createElement("div");

    row.style.cssText=
     "display:flex;" +
     "gap:8px;" +
     "align-items:center;";

    let b=document.createElement("button");

    b.innerHTML=src.title;

    b.style.cssText=
     "padding:10px 14px;" +
     "border-radius:999px;" +
     "border:1px solid #1f6aa5;" +
     "background:linear-gradient(90deg,#001018,#002c3d);" +
     "color:#fff;" +
     "font-weight:700;" +
     "cursor:pointer;";

    b.onclick=function(){

      createWindow(src,runtimeSources);

    };

    row.appendChild(b);

    if(DNX_ADMIN || localStorage.getItem("dnx_admin")==="1"){

      let del=document.createElement("button");

      del.innerHTML="✕";

      del.style.cssText=
       "padding:8px 12px;" +
       "border-radius:999px;" +
       "border:1px solid #ff4040;" +
       "background:#550000;" +
       "color:#fff;" +
       "font-weight:700;" +
       "cursor:pointer;";

      del.onclick=function(){

        if(!confirm("Delete source?")) return;

        runtimeSources =
         runtimeSources.filter(x=>x.id!==src.id);

        saveRuntimeSources(runtimeSources);

        row.remove();

      };

      row.appendChild(del);

      let edit=document.createElement("button");

      edit.innerHTML="✎";

      edit.style.cssText=
       "padding:8px 12px;" +
       "border-radius:999px;" +
       "border:1px solid #1f6aa5;" +
       "background:#002c3d;" +
       "color:#fff;" +
       "font-weight:700;" +
       "cursor:pointer;";

      edit.onclick=function(){

        let nt=prompt(
         "Edit title:",
         src.title
        );

        if(!nt) return;

        let nu=prompt(
         "Edit URL:",
         src.url
        );

        if(!nu) return;

        src.title=nt;

        src.url=nu;

        saveRuntimeSources(runtimeSources);

        b.innerHTML=nt;

      };

      row.appendChild(edit);

    }

    panel.appendChild(row);

   });

  document.body.appendChild(panel);

 };

 document.body.appendChild(btn);

 let admin=document.createElement("button");

 admin.id="dnx-admin-btn";

 admin.innerHTML="⚙ DNX";

 admin.style.cssText=
  "position:fixed;" +
  "left:240px;" +
  "top:140px;" +
  "z-index:1000601;" +
  "padding:10px 16px;" +
  "border-radius:999px;" +
  "border:1px solid #1f6aa5;" +
  "background:#1f2cc9;" +
  "color:#fff;" +
  "font-weight:700;" +
  "cursor:pointer;" +
  "box-shadow:0 0 18px rgba(0,180,255,.35);";

 admin.onclick=function(){

   localStorage.setItem("dnx_admin","1");

   alert("DNX Admin Mode enabled. Reload page.");

 };

 // admin button removed

 let userBtn=document.createElement("button");

 userBtn.id="dnx-user-btn";

 userBtn.innerHTML=
   "👤 " + getDNXUser();

 userBtn.style.cssText=
  "position:fixed;" +
  "left:360px;" +
  "top:140px;" +
  "z-index:1000601;" +
  "padding:10px 16px;" +
  "border-radius:999px;" +
  "border:1px solid #1f6aa5;" +
  "background:#003a22;" +
  "color:#fff;" +
  "font-weight:700;" +
  "cursor:pointer;" +
  "box-shadow:0 0 18px rgba(0,255,120,.35);";

 userBtn.onclick=function(){

    let u=prompt(
      "DNX Username:",
      getDNXUser()
    );

    if(!u) return;

    setDNXUser(u);

 };

 // user button removed

}

startLiveSync();
setTimeout(createButton,3000);

})();
