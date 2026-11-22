(function(){

"use strict";

const STATUS_ID="dnx-live-status";

function makeDraggable(el){

 let isDown=false;

 let offsetX=0;
 let offsetY=0;

 el.addEventListener("mousedown",function(e){

  isDown=true;

  offsetX=e.clientX-el.offsetLeft;
  offsetY=e.clientY-el.offsetTop;

  el.style.cursor="grabbing";

 });

 document.addEventListener("mouseup",function(){

  isDown=false;

  el.style.cursor="grab";

  localStorage.setItem(
   "dnx_status_pos",
   JSON.stringify({
    left:el.style.left,
    top:el.style.top
   })
  );

 });

 document.addEventListener("mousemove",function(e){

  if(!isDown) return;

  el.style.left=(e.clientX-offsetX)+"px";
  el.style.top=(e.clientY-offsetY)+"px";

 });

}

function restorePosition(el){

 try{

  let p=JSON.parse(
   localStorage.getItem("dnx_status_pos")
  );

  if(p){

   el.style.left=p.left||"20px";
   el.style.top=p.top||"20px";

  }

 }catch(e){}

}

async function buildStatus(){

 let old=document.getElementById(STATUS_ID);
if(old){updateOnly(old);return;}

 if(old) old.remove();

 let el=document.createElement("div");

 el.id=STATUS_ID;

 el.style.cssText=
  "position:fixed;" +
  "left:20px;" +
  "top:20px;" +
  "z-index:999999;" +
  "padding:8px 16px;" +
  "border-radius:12px;" +
  "background:rgba(0,0,0,.65);" +
  "backdrop-filter:blur(4px);" +
  "color:#fff;" +
  "font-size:14px;" +
  "font-weight:700;" +
  "white-space:nowrap;" +
  "cursor:grab;" +
  "user-select:none;" +
  "box-shadow:0 0 18px rgba(0,180,255,.35);";

 document.body.appendChild(el);

 restorePosition(el);

 makeDraggable(el);

 try{

  let cfg=await fetch(
   "/static/static/settings.json?ts="+Date.now(),
   {cache:"no-store"}
  ).then(r=>r.json());

  let sdrs=cfg.sdrs||{};

  let profiles=0;

  Object.values(sdrs).forEach(function(v){

   profiles += Object.keys(v.profiles||{}).length;

  });

  let devices=Object.keys(sdrs).length;

  el.innerHTML=
   "DNX STATUS | " + (cfg.receiver_name||"unknown") +
   " | 📡 " + profiles + " Profile" +
   " | 🟢 " + Math.round(profiles/2) + " Profile aktiv" +
   " | 📻 Devices: " + devices +
   " | 👤 USER: 0" +
   " | 🔌 Connections: 0";

 }catch(e){

  el.innerHTML="DNX STATUS ERROR";

 }

}

setTimeout(function(){

 buildStatus();

 setInterval(buildStatus,3000);

},3000);

})();

async function updateOnly(el){

 try{

  let cfg=await fetch(
   "/static/static/settings.json?ts="+Date.now(),
   {cache:"no-store"}
  ).then(r=>r.json());

  let sdrs=cfg.sdrs||{};

  let profiles=0;

  Object.values(sdrs).forEach(function(v){

   profiles += Object.keys(v.profiles||{}).length;

  });

  let devices=Object.keys(sdrs).length;

  el.innerHTML=
   "DNX STATUS | " + (cfg.receiver_name||"unknown") +
   " | 📡 " + profiles + " Profile" +
   " | 🟢 " + Math.round(profiles/2) + " Profile aktiv" +
   " | 📻 Devices: " + devices +
   " | 👤 USER: 0" +
   " | 🔌 Connections: 0";

 }catch(e){

  el.innerHTML="DNX STATUS ERROR";

 }

}
