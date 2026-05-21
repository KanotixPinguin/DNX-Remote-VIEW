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

  const r = await fetch("/static/static/sources.json");

  return await r.json();

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

 let down=false;

 let ox=0;
 let oy=0;

 handle.addEventListener("mousedown",function(e){

  down=true;

  ox=e.clientX-el.offsetLeft;
  oy=e.clientY-el.offsetTop;

  handle.style.cursor="grabbing";

 });

 document.addEventListener("mouseup",function(){

  if(!down) return;

  down=false;

  handle.style.cursor="grab";

  savePos(id,el);

 });

 document.addEventListener("mousemove",function(e){

  if(!down) return;

  el.style.left=(e.clientX-ox)+"px";
  el.style.top=(e.clientY-oy)+"px";

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

 let frame=document.createElement("iframe");

 if(src.type==="vnc"){

   frame.src=
    "http://" +
    location.hostname +
    ":" +
    src.bridge_port +
    "/vnc.html?autoconnect=1&resize=remote&view_only=1";

 }else{

   frame.src=src.url;

 }

 frame.style.cssText=
  "width:100%;" +
  "height:calc(100% - 42px);" +
  "border:0;" +
  "background:black;";

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

 draggable(btn,btn,"dnx_remote_btn");

 btn.onclick=function(){

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
   "border:1px solid #1f6aa5;" +
   "border-radius:14px;" +
   "padding:12px;" +
   "display:flex;" +
   "flex-direction:column;" +
   "gap:8px;" +
   "box-shadow:0 0 25px rgba(0,180,255,.35);";



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
<li>iframe</li>
<li>VNC</li>
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
<li>iframe</li>
<li>VNC</li>
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

    add.onclick=function(){

      let type=prompt(
        "Source type: iframe or vnc",
        "iframe"
      );

      if(!type) return;

      type=type.toLowerCase();

      let title=prompt(
        "Source title:"
      );

      if(!title) return;

      let visibility=prompt(
        "Visibility: public/private/shared",
        "private"
      );

      if(!visibility) return;

      alert(
        "Runtime source wizard next stage."
      );

    };

    sec.body.appendChild(add);

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
<li>iframe</li>
<li>VNC</li>
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
<li>iframe</li>
<li>VNC</li>
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

    add.onclick=function(){

      let type=prompt(
        "Source type: iframe or vnc",
        "iframe"
      );

      if(!type) return;

      type=type.toLowerCase();

      let title=prompt("Source title:");

      if(!title) return;

      let visibility=prompt(
        "Visibility: public or private",
        "private"
      );

      if(!visibility) return;

      visibility=
        visibility.toLowerCase();

      if(type==="vnc"){

        let host=prompt("VNC Host:");

        if(!host) return;

        let port=prompt("VNC Port:","5900");

        if(!port) return;

        fetch(
          "http://" +
          location.hostname +
          ":8099/create_bridge",
          {
            method:"POST",
            headers:{
              "Content-Type":"application/json"
            },
            body:JSON.stringify({
              host:host,
              port:parseInt(port)
            })
          }
        )
        .then(r=>r.json())
        .then(data=>{

          runtimeSources.push({

            id:"src"+Date.now(),

            title:title,

            visibility:visibility,

            owner:getDNXUser(),

            type:"vnc",

            host:host,

            port:parseInt(port),

            bridge_port:data.bridge_port,

            width:900,

            height:600,

            left:120,

            top:180,

            enabled:true

          });

          saveRuntimeSources(runtimeSources);

          alert(
            "VNC source created on bridge port " +
            data.bridge_port
          );

          location.reload();

        });

      }else{

        let url=prompt("Source URL:");

        if(!url) return;

        runtimeSources.push({

          id:"src"+Date.now(),

          title:title,

          visibility:visibility,

          owner:getDNXUser(),

          type:"iframe",

          url:url,

          width:900,

          height:600,

          left:120,

          top:180,

          enabled:true

        });

        saveRuntimeSources(runtimeSources);

        alert("Source added.");

        location.reload();

      }

    };

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
