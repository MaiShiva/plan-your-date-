"use strict";
const $ = id => document.getElementById(id);
const welcome = $("welcome"), planner = $("planner"), result = $("result");
const yes = $("yes"), no = $("no"), hint = $("hint");
const form = $("date-form"), date = $("date"), time = $("time"), place = $("place"), activity = $("activity"), note = $("note");
const error = $("error"), status = $("status"), toast = $("toast");
let noCount = 0, toastTimer;

function screen(target) {
  [welcome, planner, result].forEach(el => el.classList.add("hidden"));
  target.classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
}
function notify(message) {
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
date.min = today(); date.value = today();
function hearts() {
  for(let i=0;i<12;i++) {
    const el=document.createElement("span"); el.className="heart"; el.textContent=["♡","♥","✦"][i%3];
    el.style.left=`${innerWidth/2+(Math.random()*170-85)}px`; el.style.top=`${innerHeight*.45+(Math.random()*45-22)}px`;
    el.style.fontSize=`${15+Math.random()*12}px`; document.body.appendChild(el); setTimeout(()=>el.remove(),1500);
  }
}
yes.addEventListener("click",()=>{hearts();screen(planner);notify("Yay! Let's make a lovely plan. ♡");});
function dodge() {
  noCount++;
  const x=Math.round(Math.random()*58-29), y=Math.round(Math.random()*22-11), r=Math.round(Math.random()*12-6);
  const from=no.style.transform||"translate(0px,0px) rotate(0deg)", to=`translate(${x}px,${y}px) rotate(${r}deg)`;
  no.animate([{transform:from},{transform:`translate(${-x}px,${y-4}px) rotate(${-r}deg)`},{transform:to}],{duration:340,easing:"ease-out",fill:"forwards"});
  no.style.transform=to;
  const hints=["Oops, missed me! Try the cute button. 😜","That little Yes is looking pretty good, right? 💗","I'm shy. Are you sure about that? 🙈","One more try? I believe in happy endings. ✨","The Yes button is right there, just saying. 😉"];
  hint.textContent=hints[(noCount-1)%hints.length];
}
no.addEventListener("click",dodge);
no.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse"&&matchMedia("(hover:hover)").matches)dodge();});

function fmtDate(v){const [y,m,d]=v.split("-").map(Number);return new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"long",year:"numeric"}).format(new Date(y,m-1,d));}
function fmtTime(v){const [h,m]=v.split(":").map(Number);const d=new Date();d.setHours(h,m,0,0);return new Intl.DateTimeFormat("en-IN",{hour:"numeric",minute:"2-digit",hour12:true}).format(d);}
function planText(){
  let s=`♡ OUR LITTLE DATE PLAN ♡\\n\\nDate: ${$("out-date").textContent}\\nTime: ${$("out-time").textContent}\\nPlace: ${$("out-place").textContent}\\nDate idea: ${$("out-activity").textContent}`;
  if($("out-note").textContent.trim())s+=`\\n\\nA little note: ${$("out-note").textContent.trim()}`;
  return s+"\\n\\nGood company. Good memories. Just us. ♡";
}
form.addEventListener("submit",e=>{
  e.preventDefault(); error.textContent="";
  if(!date.value||!time.value||!place.value.trim()){error.textContent="Please fill in the date, time, and location.";return;}
  if(date.value<today()){error.textContent="Choose today or a future date.";date.focus();return;}
  $("out-date").textContent=fmtDate(date.value); $("out-time").textContent=fmtTime(time.value);
  $("out-place").textContent=place.value.trim(); $("out-activity").textContent=activity.value;
  $("out-note").textContent=note.value.trim(); $("note-wrap").classList.toggle("hidden",!note.value.trim());
  status.textContent="";screen(result);hearts();notify("Your date plan is ready! ♡");
});
$("back").addEventListener("click",()=>{error.textContent="";screen(welcome);});
$("edit").addEventListener("click",()=>screen(planner));
$("restart").addEventListener("click",()=>{
  form.reset();date.min=today();date.value=today();error.textContent="";status.textContent="";hint.textContent="Psst... there's a right answer. Just saying. 🙂";
  noCount=0;no.getAnimations().forEach(a=>a.cancel());no.style.transform="";screen(welcome);notify("Fresh start. Maybe another lovely plan? ♡");
});
async function copy(text){
  if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return;}
  const t=document.createElement("textarea");t.value=text;t.style.position="fixed";t.style.left="-9999px";document.body.appendChild(t);t.select();
  const ok=document.execCommand("copy");t.remove();if(!ok)throw Error("Copy failed");
}
$("copy").addEventListener("click",async()=>{try{await copy(planText());status.textContent="Copied! Send your little plan to someone special. ♡";notify("Date details copied! ♡");}catch{status.textContent="Copy unavailable here. Please select the details manually."; }});
$("share").addEventListener("click",async()=>{
  const data={title:"Our Little Date Plan ♡",text:planText()};
  if(navigator.share){try{await navigator.share(data);status.textContent="Your plan is ready to share. ♡";}catch(e){if(e.name!=="AbortError")status.textContent="Sharing failed. Try Copy details instead.";}return;}
  try{await copy(planText());status.textContent="Sharing isn't supported here, so your plan was copied instead. ♡";notify("Plan copied — paste it into your chat!");}catch{status.textContent="Sharing unavailable. Try copying the details manually.";}
});
