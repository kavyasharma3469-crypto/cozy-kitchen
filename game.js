const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const MENU=[["Strawberry shortcake","🍰",6,"Soft sponge, whipped cream and fresh berries."],["Pink cupcake","🧁",4,"Vanilla cake with rosewater frosting."],["Caramel flan","🍮",5,"Silky custard under glossy caramel."],["Glazed donut","🍩",4,"Pillowy, warm and dipped in strawberry glaze."],["Vanilla sundae","🍨",6,"Two scoops, hot fudge and a cherry."],["Apple pie slice","🥧",5,"Cinnamon apples in flaky, buttery crust."]];
let cart=[],order=null,rating=0,orderN=1040;
const REVS=[["Anya",5,"The mac & cheese tasted like a hug."],["Sam",4,"Fries arrived crispy. Loved the game while waiting!"],["Mia",5,"Cutest kitchen ever, and fast delivery."]];
const money=n=>"$"+n.toFixed(2);
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),1800)}

/* routing */
function route(){
  const p=(location.hash||"#home").slice(1);
  const page=["home","menu","track","ratings","about"].includes(p)?p:"home";
  $$("[data-page]").forEach(s=>s.classList.toggle("on",s.dataset.page===page));
  $("#top").hidden=page==="home";
  $$("#top nav a").forEach(a=>a.classList.toggle("cur",a.getAttribute("href")==="#"+page));
  $("#cartbar").classList.toggle("on",cart.length>0&&page!=="home");
  if(page==="track")renderTrack();
  scrollTo(0,0);
}
addEventListener("hashchange",route);
$$("[data-go]").forEach(b=>b.onclick=()=>location.hash=b.dataset.go);

/* home kitchen */
const room=$("#room"),bub=$("#bubble");
$$("[data-box]").forEach(el=>{
  const [l,t,w,h]=el.dataset.box.split(",").map(Number);
  if(!el.classList.contains("door"))Object.assign(el.style,{left:l+"%",top:t+"%",width:w+"%",height:h+"%"});
  Object.assign(el.style,{backgroundSize:(10000/w)+"% "+(10000/h)+"%",backgroundPosition:(l/(100-w)*100)+"% "+(t/(100-h)*100)+"%"});
});
const box=el=>el.dataset.box.split(",").map(Number);
function say(el,txt,ms){const b=box(el);bub.textContent=txt;bub.style.left=(b[0]+b[2]/2)+"%";bub.style.top=b[1]+"%";bub.classList.add("on");clearTimeout(say.t);say.t=setTimeout(()=>bub.classList.remove("on"),ms||2000)}
function puff(el,emoji,n){const b=box(el);for(let i=0;i<n;i++){const s=document.createElement("span");s.className="part";s.textContent=emoji;s.style.left=(b[0]+Math.random()*b[2])+"%";s.style.top=(b[1]+b[3]*.3)+"%";s.style.setProperty("--dx",(Math.random()*40-20)+"px");s.style.animationDelay=(i*120)+"ms";room.appendChild(s);setTimeout(()=>s.remove(),1800+i*120)}}
let ac;
function tone(f1,f2,dur,type,vol){try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),l=ac.createOscillator(),lg=ac.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.linearRampToValueAtTime(f2,t+dur);l.frequency.value=14;lg.gain.value=40;l.connect(lg);lg.connect(o.frequency);g.gain.setValueAtTime(vol,t);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(g);g.connect(ac.destination);o.start();l.start();o.stop(t+dur);l.stop(t+dur)}catch(e){}}
const vib=(el,ms)=>{el.classList.add("vib");setTimeout(()=>el.classList.remove("vib"),ms)};

const kettle=$("#kettle");
kettle.onpointerenter=()=>{vib(kettle,600);puff(kettle,"☁️",2)};
kettle.onclick=()=>{vib(kettle,1800);puff(kettle,"☁️",6);tone(1500,2100,1.5,"sine",.15);say(kettle,"Tea’s ready! ☕",2000)};

const mixer=$("#mixer");
mixer.onpointerenter=()=>{mixer.classList.add("vib");puff(mixer,"✨",3)};
mixer.onpointerleave=()=>mixer.classList.remove("vib");
mixer.onclick=()=>{puff(mixer,"🧁",4);tone(90,140,1,"sawtooth",.08);say(mixer,"Whipping up something sweet…",2000)};

const fr=$("#fridge");
$("#fridge .door").onclick=()=>{fr.classList.toggle("open");if(fr.classList.contains("open"))say(fr,"Chilled desserts inside! 🍓",1800)};
$$("#fridge .inside button").forEach(b=>b.onclick=()=>toast(b.dataset.t));

const dr=$("#drawer"),mn=$("#menus");
function menusOpen(on){
  if(on){
    mn.classList.add("open","nt");
    const d=dr.getBoundingClientRect(),dx=d.left+d.width/2,dy=d.top+d.height/2;
    $$(".sign",mn).forEach((s,i)=>{s.style.setProperty("--i",i);const r=s.getBoundingClientRect();s.style.setProperty("--fx",(dx-(r.left+r.width/2))+"px");s.style.setProperty("--fy",(dy-(r.top+r.height/2))+"px")});
    mn.classList.remove("open");void mn.offsetWidth;mn.classList.remove("nt");void mn.offsetWidth;mn.classList.add("open");
  }else mn.classList.remove("open");
  room.classList.toggle("mo",on);dr.classList.toggle("open",on);dr.classList.remove("pulse");dr.setAttribute("aria-expanded",on);
}
dr.onclick=()=>menusOpen(!mn.classList.contains("open"));
$(".scrim").onclick=()=>menusOpen(false);
addEventListener("hashchange",()=>{menusOpen(false);fr.classList.remove("open")});

/* menu + cart */
$("#menugrid").innerHTML=MENU.map((m,i)=>`<div class="card dish"><span class="em">${m[1]}</span><h3>${m[0]}</h3><p class="d">${m[3]}</p><p><b>${money(m[2])}</b></p><button class="btn" data-add="${i}">Add to cart</button></div>`).join("");
$("#menugrid").onclick=e=>{const b=e.target.closest("[data-add]");if(!b)return;const m=MENU[b.dataset.add];addCart(m[0],m[1],m[2])};
function addCart(n,em,p){cart.push({n,em,p});toast(em+" "+n+" added");updCart()}
function updCart(){
  const t=cart.reduce((s,c)=>s+c.p,0);
  $("#carttxt").textContent=cart.length+" item"+(cart.length>1?"s":"")+" · "+money(t);
  $("#cartbar").classList.toggle("on",cart.length>0&&location.hash!==""&&location.hash!=="#home");
}
$("#place").onclick=()=>{
  order={id:++orderN,items:cart.slice(),t0:Date.now()};cart=[];updCart();openGame(true);
};

/* modal + pantry game */
const ING={P:["🥔","Potato"],O:["🫒","Oil"],M:["🫙","Mayo"],S:["🌶️","Spices"]};
let pick=new Set(),stirs=0;
function dishFor(s){
  const p=s.has("P"),o=s.has("O"),m=s.has("M"),sp=s.has("S");
  if(p){
    if(o&&m&&sp)return["Loaded masala fries & dip","🍟",9];
    if(o&&m)return["Fries with creamy dip","🍟",8];
    if(o&&sp)return["Spicy potato wedges","🥔",7];
    if(o)return["Golden fries","🍟",5];
    if(m&&sp)return["Masala potato salad","🥗",6];
    if(m)return["Creamy potato salad","🥗",6];
    if(sp)return["Spiced roast potato","🥔",5];
    return["Plain boiled potato","🥔",3];
  }
  if(m&&sp)return["Spicy mayo dip","🌶️",3];
  if(o&&sp)return["Chili oil","🔥",3];
  return["Mystery bowl","🥣",2];
}
function openGame(placed){
  pick=new Set();stirs=0;
  $("#mbox").innerHTML=(placed?`<h3 style="font-size:1.5rem">Order #${order.id} is cooking! 🎉</h3><p>While you wait, invent a dish from our pantry. If you love it, add it to your next order.</p>`:`<h3 style="font-size:1.5rem">Pantry game</h3>`)+
  `<div class="pantry">${Object.entries(ING).map(([k,v])=>`<button data-i="${k}">${v[0]}<small>${v[1]}</small></button>`).join("")}</div>
  <div id="gstage"><p id="ghint">Tap ingredients to toss them in the pan.</p></div>
  <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px">
  <button class="btn" id="gtrack">Track my order</button><button class="btn alt" id="gclose">Close</button></div>`;
  $("#modal").classList.add("on");
  $("#mbox").onclick=e=>{
    const b=e.target.closest("[data-i]");
    if(b){b.classList.toggle("in");pick.has(b.dataset.i)?pick.delete(b.dataset.i):pick.add(b.dataset.i);stirs=0;pan();}
    if(e.target.id==="gclose")$("#modal").classList.remove("on");
    if(e.target.id==="gtrack"){$("#modal").classList.remove("on");location.hash="track"}
    if(e.target.id==="gagain")openGame(placed);
    if(e.target.id==="gadd"){const d=dishFor(pick);addCart(d[0],d[1],d[2]);$("#modal").classList.remove("on")}
    if(e.target.id==="pan"){stirs++;e.target.classList.remove("shake");void e.target.offsetWidth;e.target.classList.add("shake");
      $("#gbar").style.width=Math.min(stirs/6*100,100)+"%";if(stirs>=6)reveal();}
  };
}
function pan(){
  const g=$("#gstage");
  if(!pick.size){g.innerHTML='<p id="ghint">Tap ingredients to toss them in the pan.</p>';return}
  g.innerHTML=`<div style="font-size:26px">${[...pick].map(k=>ING[k][0]).join(" ")}</div><button class="pan" id="pan" aria-label="Stir the pan">🍳</button><div class="bar"><i id="gbar"></i></div><p>Tap the pan 6 times to stir!</p>`;
}
function reveal(){
  const d=dishFor(pick);
  $("#gstage").innerHTML=`<div style="font-size:70px">${d[1]}</div><h3>${d[0]}</h3><p>${money(d[2])}</p><button class="btn" id="gadd">Add to cart</button> <button class="btn alt" id="gagain">Make another</button>`;
}
$("#modal").onclick=e=>{if(e.target.id==="modal")$("#modal").classList.remove("on")};

/* tracking */
const STEPS=[["📝","Order received"],["👩‍🍳","Cooking in the pot"],["📦","Packed with love"],["🛵","On the way"],["🏠","Delivered, enjoy!"]];
let tt;
function renderTrack(){
  clearInterval(tt);
  const b=$("#trackbody");
  if(!order){b.innerHTML='<div class="card"><p>No active order yet. Pick something tasty and it will show up here.</p><button class="btn" onclick="location.hash=\'menu\'">Browse the menu</button></div>';return}
  const draw=()=>{
    const s=Math.min(Math.floor((Date.now()-order.t0)/7000),4);
    b.innerHTML=`<div class="card"><h3>Order #${order.id}</h3><p>${order.items.map(i=>i.em+" "+i.n).join(", ")}</p>
    <ul class="steps">${STEPS.map((x,i)=>`<li class="${i<s?"done":i===s?"now":""}"><span class="dot">${i<s?"✓":x[0]}</span><span class="fr">${x[1]}</span></li>`).join("")}</ul>
    <button class="btn alt" id="tgame">Play the pantry game</button></div>`;
    $("#tgame").onclick=()=>openGame(false);
    if(s===4)clearInterval(tt);
  };
  draw();tt=setInterval(draw,1500);
}

/* ratings */
$("#stars").innerHTML=[1,2,3,4,5].map(n=>`<button data-n="${n}" aria-label="${n} stars">★</button>`).join("");
const paint=n=>$$("#stars button").forEach(b=>b.classList.toggle("f",+b.dataset.n<=n));
$("#stars").onmouseover=e=>{if(e.target.dataset.n)paint(+e.target.dataset.n)};
$("#stars").onmouseleave=()=>paint(rating);
$("#stars").onclick=e=>{if(e.target.dataset.n){rating=+e.target.dataset.n;paint(rating)}};
function revs(){
  const avg=REVS.reduce((s,r)=>s+r[1],0)/REVS.length;
  $("#avg").textContent="★ "+avg.toFixed(1)+" from "+REVS.length+" ratings";
  $("#revs").innerHTML=REVS.map(r=>`<div class="card rev"><b>${"★".repeat(r[1])}</b> <span class="fr">${r[0].replace(/</g,"&lt;")}</span><br>${r[2].replace(/</g,"&lt;")}</div>`).join("");
}
$("#rsend").onclick=()=>{
  if(!rating)return toast("Tap a star first ⭐");
  REVS.unshift([$("#rname").value.trim()||"A happy guest",rating,$("#rtext").value.trim()||"Yum!"]);
  rating=0;paint(0);$("#rname").value=$("#rtext").value="";revs();toast("Thank you! 💖");
};
revs();route();