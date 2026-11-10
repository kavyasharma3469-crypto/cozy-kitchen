const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const MENU=[["Creamy mac & cheese","🧀",7],["Masala fries","🍟",5],["Pink pasta","🍝",8],["Veggie burger","🍔",7],["Mango lassi","🥭",4],["Brownie jar","🍫",5]];
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

/* home interactivity */
const pot=$("#pot");
pot.onclick=()=>{pot.classList.remove("hop");void pot.offsetWidth;pot.classList.add("hop");toast("Hehe, that tickles!")};
pot.onkeydown=e=>{if(e.key==="Enter"||e.key===" ")pot.click()};
addEventListener("pointermove",e=>{
  if(!$("#home").classList.contains("on"))return;
  const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
  $$("[data-d]").forEach(el=>{
    const d=+el.dataset.d;let tx=-x*d*4,ty=-y*d*4;
    if(el.classList.contains("fl")){
      const r=el.getBoundingClientRect(),cx=r.left+r.width/2-(el._x||0),cy=r.top+r.height/2-(el._y||0);
      const dx=cx-e.clientX,dy=cy-e.clientY,dist=Math.hypot(dx,dy)||1;
      if(dist<150){const f=(150-dist)/150*60;tx+=dx/dist*f;ty+=dy/dist*f}
    }
    el._x=tx;el._y=ty;el.style.transform=`translate(${tx}px,${ty}px)`;
  });
  $$(".eye").forEach(eye=>{
    const r=eye.getBoundingClientRect(),a=Math.atan2(e.clientY-(r.top+13),e.clientX-(r.left+13));
    eye.firstElementChild.style.transform=`translate(${Math.cos(a)*5}px,${Math.sin(a)*5}px)`;
  });
  $$(".sign").forEach(s=>{const r=s.getBoundingClientRect();s.style.setProperty("--r",((e.clientX-(r.left+r.width/2))/innerWidth*8).toFixed(1)+"deg")});
});

/* menu + cart */
$("#menugrid").innerHTML=MENU.map((m,i)=>`<div class="card dish"><span class="em">${m[1]}</span><h3>${m[0]}</h3><p>${money(m[2])}</p><button class="btn" data-add="${i}">Add to cart</button></div>`).join("");
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
