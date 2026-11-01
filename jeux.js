/* Rubrique Jeux. Textes dans jeux-donnees.js, photos et noms dans APPS. Records et badges gardés sur le téléphone. */
(function(){
const D=JEUX_DONNEES,racine=$("#jeuxApp");
const doux=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
const reglages={dureeNettoyage:180,dureeQuiz:90,dureeVF:60,dureeAliments:60,dureePlaque:45,dureeAttrape:45,dureeChrono:60};
const imgJeu=a=>"images/appareils/jeux/"+a.id+".jpg";
/* Photos pour Le grand nettoyage et Tape la plaque : [gauche, haut, largeur, hauteur] de la partie gardée */
const SCENES=[{nom:"Les dents",img:"images/appareils/jeux/pul.jpg",cadre:[.03,.05,.33,.9]},{nom:"Les bagues",img:"images/appareils/jeux/elastiques.jpg",cadre:[.04,.1,.92,.8],attaches:true},{nom:"La gouttière",img:"images/appareils/jeux/gouttieres.jpg",cadre:[.14,.25,.76,.5]}];

/* Progression */
const vide={points:0,badges:[],records:{},joues:[],jour:null,serie:0,defi:{},langue:null};
function lire(){const p=store.get("jeux",null);if(!p||typeof p!=="object")return{...vide};const o={...vide,...p};o.points=+o.points||0;o.serie=+o.serie||0;["badges","joues"].forEach(k=>{if(!Array.isArray(o[k]))o[k]=[]});["records","defi"].forEach(k=>{if(!o[k]||typeof o[k]!=="object")o[k]={}});return o}
let P=lire();
const sauver=()=>store.set("jeux",P);
const dateDe=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const auj=()=>dateDe(new Date());
const hier=()=>{const d=new Date();d.setDate(d.getDate()-1);return dateDe(d)};
function visiter(){if(P.jour===auj())return;P.serie=P.jour===hier()?P.serie+1:1;P.jour=auj();if(P.serie>=3)gagnerBadge("serie3");if(P.serie>=7)gagnerBadge("serie7");sauver()}
const BADGES=window.BADGES_JEUX;
function gagnerBadge(id){if(P.badges.includes(id))return false;P.badges.push(id);sauver();return true}

/* Hasard */
const melange=(l,r=Math.random)=>{const a=[...l];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function graine(s){let h=1779033703;for(const c of s)h=Math.imul(h^c.charCodeAt(0),3432918353);return()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return(h>>>0)/4294967296}}

/* Minuteries du jeu en cours : toutes arrêtées quand on quitte */
let arrets=[];
const apres=(f,ms)=>{const i=setTimeout(f,ms);arrets.push(()=>clearTimeout(i));return i};
const chaque=(f,ms)=>{const i=setInterval(f,ms);arrets.push(()=>clearInterval(i));return i};
const image=f=>{let r=0;const b=t=>{f(t);r=requestAnimationFrame(b)};r=requestAnimationFrame(b);arrets.push(()=>cancelAnimationFrame(r))};
function quitter(){arrets.forEach(f=>f());arrets=[]}
const mmss=t=>Math.floor(t/60)+":"+String(Math.max(0,t)%60).padStart(2,"0");
const etoilesTxt=n=>"★".repeat(n)+"☆".repeat(3-n);
const pl=(n,s,p)=>n+" "+(n>1?p:s);

/* Chrono visible à rebours. Il sert aussi à accélérer le jeu. */
function chrono(el,duree,fin){let reste=duree;el.textContent=mmss(reste);chaque(()=>{reste--;el.textContent=mmss(reste);if(reste<=0)fin()},1000);return{reste:()=>reste,ecoule:()=>duree-reste}}

function cadre(j,regle){
  $("#v-jeux").classList.add("en-jeu");
  racine.innerHTML=`<div class="jeu"><button class="back" type="button" data-menu>← Tous les jeux</button>
    <div class="hero"><h2>${esc(j.nom)}</h2></div><p class="regle">${esc(regle)}</p><div id="scene"></div></div>`;
  window.scrollTo(0,0);
  return racine.querySelector("#scene");
}
/* Écran de fin : record personnel, jamais de classement */
function finir(j,opts){
  quitter();
  const{score,unite="points",plusPetit=false,etoiles=0,points=0,message,extra="",cle=j.id}=opts;
  const ancien=P.records[cle];
  const record=score!==undefined&&score>0&&(ancien===undefined||(plusPetit?score<ancien:score>ancien));
  const avant=[...P.badges];
  if(record)P.records[cle]=score;
  P.points+=points;
  if(!P.joues.includes(j.id))P.joues.push(j.id);
  gagnerBadge("premier");
  if(record&&ancien!==undefined)gagnerBadge("record");
  if(P.joues.length>=4)gagnerBadge("curieux");
  if(P.joues.length>=CATALOGUE.length)gagnerBadge("explorateur");
  (opts.badges||[]).forEach(gagnerBadge);
  sauver();
  const neufs=P.badges.filter(b=>!avant.includes(b));
  const aff=v=>plusPetit?mmss(v):v+" "+unite;
  const s=racine.querySelector("#scene")||racine;
  s.innerHTML=`<div class="card resultat"><p class="grandes-etoiles" aria-label="${etoiles} étoiles sur 3">${etoilesTxt(etoiles)}</p>
    <h3>${esc(message)}</h3>
    ${record?`<p class="pill now">Nouveau record !</p>`:P.records[cle]!==undefined?`<p class="stars">Ton record : ${esc(aff(P.records[cle]))}</p>`:""}
    ${points?`<p class="stars">+${points} points</p>`:""}
    ${neufs.map(b=>`<p class="pill now">Nouveau badge : ${esc(BADGES[b][0])}</p>`).join("")}${extra}
    <button class="btn" type="button" data-rejouer>Rejouer</button><button class="btn ghost" type="button" data-menu>Tous les jeux</button>
    <p class="note">Les jeux ne remplacent jamais l'avis de ta docteure.</p></div>`;
  s.querySelector("[data-rejouer]").onclick=()=>lancer(j.id,opts.rejouer);
  if((etoiles>=2||opts.fete)&&window.Espace)Espace.confettis(record?120:60);
  window.scrollTo(0,0);
}
const etoilesDe=(b,t)=>{const r=t?b/t:0;return r>=.9?3:r>=.6?2:r>0?1:0};
const persoImg=q=>`images/personnages/${q==="leo"?"leo":"max"}.svg`;

/* Une explication dite par un personnage, puis on continue */
function expliquer(el,ok,txt,qui,suite){
  el.innerHTML=`<div class="bulle ${ok?"ok":"non"}" role="status"><img src="${persoImg(qui)}" alt=""><p><b>${ok?"Bravo !":"Pas tout à fait."}</b> ${esc(txt)}</p></div><button class="btn" type="button" data-suite>Continuer</button>`;
  el.querySelector("[data-suite]").onclick=suite;
}

/* 1. Le grand nettoyage */
function nettoyage(j,num=0){
  const sc=SCENES[num%SCENES.length];
  const s=cadre(j,"Frotte les dents avec le doigt, comme une brosse. Cherche bien partout"+(sc.attaches?", surtout autour des attaches":"")+" : il y a des zones cachées.");
  s.innerHTML=`<div class="seg" role="group" aria-label="Choisir la photo">${SCENES.map((x,i)=>`<button type="button" data-sc="${i}" aria-pressed="${i===num}">${esc(x.nom)}</button>`).join("")}</div>
    <div class="tableau"><span class="timer" id="t">${mmss(reglages.dureeNettoyage)}</span><span class="stars" id="pc">0 %</span></div>
    <div class="photo-jeu" id="zone"><img id="ph" alt="" src="${sc.img}"><canvas id="sale" aria-label="Dents à nettoyer"></canvas></div>`;
  s.querySelectorAll("[data-sc]").forEach(b=>b.onclick=()=>{quitter();nettoyage(j,+b.dataset.sc)});
  const ph=s.querySelector("#ph");
  const pret=()=>{
    if(!s.isConnected||!s.querySelector("#sale"))return;
    const zone=s.querySelector("#zone"),c=s.querySelector("#sale"),[fx,fy,fw,fh]=sc.cadre;
    const W=zone.clientWidth,H=Math.round(W*(ph.naturalHeight*fh)/(ph.naturalWidth*fw));
    zone.style.height=H+"px";
    ph.style.width=(W/fw)+"px";ph.style.left=(-fx*W/fw)+"px";ph.style.top=(-fy*H/fh)+"px";
    c.width=W;c.height=H;
    zone.scrollIntoView({block:"center"});
    const g=c.getContext("2d",{willReadFrequently:true});
    const rnd=(a,b)=>a+Math.random()*(b-a);
    /* Plaque : voile jaune tacheté, avec des bouts de nourriture */
    for(let i=0;i<220;i++){g.fillStyle=`rgba(${rnd(205,235)|0},${rnd(180,205)|0},${rnd(95,135)|0},${rnd(.5,.85)})`;g.beginPath();g.ellipse(rnd(0,W),rnd(H*.08,H*.92),rnd(16,46),rnd(12,32),rnd(0,3),0,7);g.fill()}
    for(let i=0;i<46;i++){g.fillStyle=["#7A4A23","#A9743A","#3E7B3A","#C9472F","#E8D9A8"][i%5];g.beginPath();g.ellipse(rnd(8,W-8),rnd(H*.1,H*.9),rnd(2,7),rnd(2,5),rnd(0,3),0,7);g.fill()}
    /* Zones cachées : plus épaisses, il faut repasser */
    for(let i=0;i<(sc.attaches?14:8);i++){const x=rnd(.08,.92)*W,y=sc.attaches?(i%2?.38:.62)*H+rnd(-10,10):rnd(.2,.8)*H;g.fillStyle="rgba(190,160,80,.97)";g.beginPath();g.arc(x,y,rnd(11,17),0,7);g.fill()}
    const restant=()=>{const d=g.getImageData(0,0,W,H).data;let n=0;for(let i=3;i<d.length;i+=32)n+=d[i];return n};
    const total=restant()||1;
    let fin=false,dernier=null;
    const pcEl=s.querySelector("#pc");
    const propre=()=>Math.min(100,Math.round((1-restant()/total)*100/.98));
    const fr=(x,y)=>{g.globalCompositeOperation="destination-out";g.lineCap="round";g.lineWidth=Math.max(26,W*.085);g.strokeStyle="rgba(0,0,0,.42)";g.beginPath();g.moveTo(dernier?dernier[0]:x,dernier?dernier[1]:y);g.lineTo(x+.01,y);g.stroke();g.globalCompositeOperation="source-over";dernier=[x,y]};
    const pos=e=>{const r=c.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
    c.addEventListener("pointerdown",e=>{e.preventDefault();try{c.setPointerCapture(e.pointerId)}catch(x){}dernier=null;fr(...pos(e))});
    c.addEventListener("pointermove",e=>{if(e.buttons||e.pointerType==="touch"){e.preventDefault();fr(...pos(e))}});
    c.addEventListener("pointerup",()=>{dernier=null});
    c.addEventListener("pointercancel",()=>{dernier=null});
    const cl=chrono(s.querySelector("#t"),reglages.dureeNettoyage,()=>clore());
    function clore(){if(fin)return;fin=true;const p=propre();
      finir(j,{score:p,cle:"nettoyage"+num,unite:"%",etoiles:p>=99?3:p>=80?2:p>0?1:0,points:p,badges:p>=99?["brillant"]:[],rejouer:num,message:p>=99?"Tes dents brillent !":p+" % nettoyé. Il reste des zones cachées.",extra:`<p class="note">En vrai aussi : brosse-toi 3 minutes après chaque repas.</p>`})}
    chaque(()=>{const p=propre();pcEl.textContent=p+" %";if(p>=99)clore()},400);
  };
  if(ph.complete&&ph.naturalWidth)pret();else ph.onload=pret;
}

/* 2. Le quiz malin */
function quiz(j){
  const liste=melange(D.quiz).slice(0,10);
  const s=cadre(j,"10 questions tirées au hasard. Touche la bonne réponse.");
  let i=0,bon=0,fin=false;
  const clore=()=>{if(fin)return;fin=true;finir(j,{score:bon,unite:"sur 10",etoiles:etoilesDe(bon,10),points:bon*5,badges:bon===10?["quiz"]:[],message:pl(bon,"bonne réponse","bonnes réponses")+" sur 10."})};
  s.innerHTML=`<div class="tableau"><span class="timer" id="t"></span><span class="stars" id="n"></span></div><div id="qz"></div>`;
  chrono(s.querySelector("#t"),reglages.dureeQuiz,clore);
  const qz=s.querySelector("#qz");
  (function suivante(){
    if(i>=liste.length)return clore();
    const q=liste[i++],ch=melange(q.choix),app=APPS.find(a=>a.id===q.img);
    s.querySelector("#n").textContent=i+" / "+liste.length;
    qz.innerHTML=`<div class="card">${app?`<img class="q-img" src="${imgJeu(app)}" alt="">`:""}<h3>${esc(q.q)}</h3><div class="gros-choix">${ch.map((c,k)=>`<button class="grand" type="button" data-c="${k}"><span aria-hidden="true">${c.emoji}</span>${esc(c.t)}</button>`).join("")}</div><div class="retour"></div></div>`;
    qz.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{
      const c=ch[+b.dataset.c];if(c.ok)bon++;
      qz.querySelectorAll("[data-c]").forEach(x=>{x.disabled=true;if(ch[+x.dataset.c].ok)x.classList.add("juste");else if(x===b)x.classList.add("faux")});
      expliquer(qz.querySelector(".retour"),c.ok,q.pourquoi,q.qui,suivante);
    });
  })();
}

/* 3. Les bons aliments */
function aliments(j,app){
  const ids=Object.keys(D.aliments);
  if(!app){
    const s=cadre(j,"Quel appareil portes-tu ?");
    s.innerHTML=`<div class="gros-choix">${ids.map(id=>{const a=APPS.find(x=>x.id===id);return `<button class="grand" type="button" data-a="${id}"><img src="${imgJeu(a)}" alt="">${esc(a.nom)}</button>`}).join("")}</div>`;
    s.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>aliments(j,b.dataset.a));
    return;
  }
  const liste=melange(D.aliments[app]);
  const s=cadre(j,"Avec cet appareil, on le mange ? Touche la bonne réponse.");
  let i=0,bon=0,fin=false;
  const clore=()=>{if(fin)return;fin=true;finir(j,{score:bon,cle:"aliments"+app,unite:"bonnes réponses",rejouer:app,etoiles:etoilesDe(bon,liste.length),points:bon*5,message:pl(bon,"bonne réponse","bonnes réponses")+" sur "+liste.length+"."})};
  s.innerHTML=`<div class="tableau"><span class="timer" id="t"></span><span class="stars" id="n"></span></div><div id="al"></div>`;
  chrono(s.querySelector("#t"),reglages.dureeAliments,clore);
  const al=s.querySelector("#al");
  (function suivant(){
    if(i>=liste.length)return clore();
    const a=liste[i++];s.querySelector("#n").textContent=i+" / "+liste.length;
    al.innerHTML=`<div class="card aliment"><div class="gros" aria-hidden="true">${a.emoji}</div><h3>${esc(a.nom)}</h3><div class="gros-choix"><button class="grand vert" type="button" data-r="oui">Oui</button><button class="grand jaune" type="button" data-r="morceaux">En petits morceaux</button><button class="grand rouge" type="button" data-r="non">Non</button></div><div class="retour"></div></div>`;
    al.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{const ok=b.dataset.r===a.rep;if(ok)bon++;al.querySelectorAll("[data-r]").forEach(x=>{x.disabled=true;if(x.dataset.r===a.rep)x.classList.add("juste");else if(x===b)x.classList.add("faux")});expliquer(al.querySelector(".retour"),ok,a.pourquoi,"max",suivant)});
  })();
}

/* 4. Le puzzle : on glisse les pièces */
function puzzle(j,n=3){
  const a=melange(APPS)[0];
  const s=cadre(j,"Fais glisser une pièce sur une autre pour les échanger.");
  s.innerHTML=`<div class="seg" role="group" aria-label="Choisir le nombre de pièces">${[3,4,5].map(k=>`<button type="button" data-n="${k}" aria-pressed="${k===n}">${k*k} pièces</button>`).join("")}</div><div class="tableau"><span class="timer" id="t">0:00</span><span class="stars" id="c">0 échange</span></div><div id="pz"></div>`;
  s.querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>{quitter();puzzle(j,+b.dataset.n)});
  const img=new Image();
  img.onload=()=>{
    const total=n*n;let ordre,sec=0,coups=0,fini=false;
    do{ordre=melange(Array.from({length:total},(_,i)=>i))}while(ordre.every((v,i)=>v===i));
    const box=s.querySelector("#pz");
    box.innerHTML=`<div class="puzzle" style="aspect-ratio:${img.naturalWidth}/${img.naturalHeight};grid-template-columns:repeat(${n},1fr);grid-auto-rows:1fr">${ordre.map((v,i)=>`<div class="piece" data-p="${i}" role="button" tabindex="0" aria-label="Pièce ${i+1}"></div>`).join("")}</div>`;
    box.querySelector(".puzzle").scrollIntoView({block:"center"});
    const grille=box.querySelector(".puzzle"),pieces=[...box.querySelectorAll(".piece")];
    const peindre=()=>pieces.forEach((p,i)=>{const v=ordre[i],x=v%n,y=Math.floor(v/n);p.style.backgroundImage=`url("${imgJeu(a)}")`;p.style.backgroundSize=n*100+"% "+n*100+"%";p.style.backgroundPosition=x/(n-1)*100+"% "+y/(n-1)*100+"%"});
    peindre();
    chaque(()=>{sec++;s.querySelector("#t").textContent=mmss(sec)},1000);
    const echanger=(x,y)=>{if(x===y)return;[ordre[x],ordre[y]]=[ordre[y],ordre[x]];coups++;s.querySelector("#c").textContent=pl(coups,"échange","échanges");peindre();
      if(ordre.every((v,k)=>v===k)&&!fini){fini=true;
        finir(j,{fete:true,score:Math.max(1,sec),plusPetit:true,cle:"puzzle"+n,rejouer:n,etoiles:coups<=total?3:coups<=total*1.6?2:1,points:n*n,badges:n===5?["puzzle"]:[],message:D.appareilIntro[a.id]||a.nom,extra:`<img class="photo" src="${a.img}" alt="Photo : ${esc(a.nom)}"><button class="btn sun" type="button" id="fiche">Voir ma fiche</button>`});
        s.querySelector("#fiche").onclick=()=>{go("conseils");showApp(a.id)};
      }};
    /* Glisser au doigt, ou toucher deux pièces l'une après l'autre */
    let dep=-1,doigt=null,fantome=null,bouge=false,choisie=-1,x0=0,y0=0;
    const sous=(x,y)=>{const r=grille.getBoundingClientRect();if(x<r.left||y<r.top||x>=r.right||y>=r.bottom)return-1;return Math.floor((y-r.top)/r.height*n)*n+Math.floor((x-r.left)/r.width*n)};
    grille.addEventListener("pointerdown",e=>{e.preventDefault();const p=e.target.closest(".piece");if(!p||dep>=0)return;doigt=e.pointerId;dep=+p.dataset.p;bouge=false;x0=e.clientX;y0=e.clientY;try{grille.setPointerCapture(e.pointerId)}catch(x){}
      fantome=p.cloneNode();fantome.classList.add("fantome");const r=p.getBoundingClientRect();fantome.style.width=r.width+"px";fantome.style.height=r.height+"px";fantome.style.left=e.clientX-r.width/2+"px";fantome.style.top=e.clientY-r.height/2+"px";document.body.appendChild(fantome)});
    grille.addEventListener("pointermove",e=>{if(dep<0||!fantome||e.pointerId!==doigt)return;e.preventDefault();if(Math.hypot(e.clientX-x0,e.clientY-y0)>8)bouge=true;fantome.style.left=e.clientX-fantome.offsetWidth/2+"px";fantome.style.top=e.clientY-fantome.offsetHeight/2+"px"});
    const lacher=e=>{if(dep<0||e.pointerId!==doigt)return;fantome&&fantome.remove();fantome=null;const v=sous(e.clientX,e.clientY),d=dep;dep=-1;
      if(!bouge||v===d){if(bouge)return;if(choisie<0){choisie=d;pieces[d].classList.add("choisie")}else{pieces[choisie].classList.remove("choisie");const c=choisie;choisie=-1;echanger(c,d)}return}
      if(choisie>=0){pieces[choisie].classList.remove("choisie");choisie=-1}
      if(v>=0)echanger(d,v)};
    grille.addEventListener("pointerup",lacher);
    grille.addEventListener("pointercancel",e=>{if(e.pointerId!==doigt)return;fantome&&fantome.remove();fantome=null;dep=-1});
    arrets.push(()=>{fantome&&fantome.remove();fantome=null});
  };
  img.src=imgJeu(a);
}

/* 5. Tape la plaque ! */
function plaque(j){
  const s=cadre(j,"Touche vite les taches de plaque. Attention : ne touche pas les étoiles !");
  s.innerHTML=`<div class="tableau"><span class="timer" id="t"></span><span class="stars" id="v" aria-label="3 vies">♥♥♥</span><span class="stars" id="sc">0</span></div><div class="photo-jeu tape" id="zone"><img alt="" src="${SCENES[0].img}"></div><p class="note" id="msg" role="status"></p>`;
  const zone=s.querySelector("#zone"),im=zone.querySelector("img");let score=0,vies=3,fin=false;
  const clore=()=>{if(fin)return;fin=true;finir(j,{score,unite:"taches",etoiles:score>=30?3:score>=15?2:score>0?1:0,points:score,message:pl(score,"tache touchée","taches touchées")+" !",extra:`<p class="note">En vrai, la plaque s'enlève avec la brosse.</p>`})};
  const pret=()=>{
    const[fx,fy,fw,fh]=SCENES[0].cadre,W=zone.clientWidth,H=Math.round(W*(im.naturalHeight*fh)/(im.naturalWidth*fw));
    zone.style.height=H+"px";im.style.width=(W/fw)+"px";im.style.left=(-fx*W/fw)+"px";im.style.top=(-fy*H/fh)+"px";
    zone.scrollIntoView({block:"center"});
    const cl=chrono(s.querySelector("#t"),reglages.dureePlaque,clore);
    const pose=()=>{
      if(fin)return;const piege=Math.random()<.2,e=cl.ecoule(),vie=Math.max(650,1500-e*22);
      const d=document.createElement("button");d.type="button";d.className="tache"+(piege?" piege":"");d.setAttribute("aria-label",piege?"Étoile, ne pas toucher":"Tache de plaque");if(piege)d.textContent="★";
      d.style.left=4+Math.random()*(W-70)+"px";d.style.top=4+Math.random()*(H-70)+"px";
      d.addEventListener("pointerdown",ev=>{ev.preventDefault();if(fin||d.dataset.pris)return;d.dataset.pris=1;d.remove();
        if(piege){vies--;s.querySelector("#v").textContent="♥".repeat(Math.max(0,vies))+"♡".repeat(3-Math.max(0,vies));s.querySelector("#msg").textContent="Une étoile, ce n'est pas de la plaque !";if(vies<=0)clore()}
        else{score++;s.querySelector("#sc").textContent=score}});
      zone.appendChild(d);apres(()=>d.remove(),vie);
      apres(pose,Math.max(330,850-e*11));
    };
    pose();
  };
  if(im.complete&&im.naturalWidth)pret();else im.onload=pret;
}

/* 6. Attrape les bons objets */
function attrape(j){
  const m=melange(D.missions)[0],ids=Object.keys(D.objets),bons=new Set(m.bons);
  const s=cadre(j,"Déplace le panier avec le doigt.");
  s.innerHTML=`<div class="mission"><span class="eyebrow">Ta mission</span><b>${esc(m.titre)}</b></div><div class="tableau"><span class="stars" id="v" aria-label="3 vies">♥♥♥</span><span class="timer" id="t"></span><span class="stars" id="sc">0</span></div>
    <div class="terrain" id="terrain" tabindex="0" aria-label="Terrain de jeu : déplace le panier avec le doigt ou les flèches"><div class="panier" id="pan" aria-hidden="true">🧺</div></div><p class="note" id="msg" role="status"></p>`;
  s.querySelector(".mission").scrollIntoView({block:"start"});
  const t=s.querySelector("#terrain"),pan=s.querySelector("#pan"),W=()=>t.clientWidth,H=()=>t.clientHeight,vitBase=doux()?60:95;
  let x=W()/2,score=0,vies=3,objets=[],fin=false,prec=performance.now();
  const placer=()=>{x=Math.max(32,Math.min(W()-32,x));pan.style.transform=`translateX(${x-28}px)`};placer();
  const viser=e=>{x=e.clientX-t.getBoundingClientRect().left;placer();e.preventDefault()};
  t.addEventListener("pointerdown",e=>{try{t.setPointerCapture(e.pointerId)}catch(z){}viser(e)});
  t.addEventListener("pointermove",viser);
  t.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"){x-=34;placer();e.preventDefault()}if(e.key==="ArrowRight"){x+=34;placer();e.preventDefault()}});
  const clore=()=>{if(fin)return;fin=true;finir(j,{score,unite:"objets",etoiles:score>=14?3:score>=7?2:score>0?1:0,points:score*2,message:vies<=0?"Plus de vies : "+pl(score,"objet attrapé","objets attrapés")+".":pl(score,"objet attrapé","objets attrapés")+" !"})};
  const cl=chrono(s.querySelector("#t"),reglages.dureeAttrape,clore);
  const lache=()=>{if(fin)return;const pool=Math.random()<.5?[...bons]:ids,id=pool[Math.floor(Math.random()*pool.length)],o=D.objets[id],el=document.createElement("span");el.className="objet";el.innerHTML=o.emoji+`<small>${esc(o.nom)}</small>`;const ox=48+Math.random()*(W()-96);el.style.left=ox+"px";t.appendChild(el);objets.push({id,o,el,x:ox,y:-50});apres(lache,Math.max(620,1350-cl.ecoule()*15))};
  lache();
  image(now=>{if(fin)return;const dt=Math.min((now-prec)/1000,.05);prec=now;const vit=vitBase+cl.ecoule()*(doux()?1:2.4);
    objets=objets.filter(b=>{if(fin)return false;b.y+=vit*dt;b.el.style.transform=`translate(-50%,${b.y}px)`;
      if(b.y>H()-96&&b.y<H()-30&&Math.abs(b.x-x)<46){b.el.remove();
        if(bons.has(b.id)){score++;s.querySelector("#sc").textContent=score;s.querySelector("#msg").textContent="Bien : "+b.o.nom+"."}
        else{vies--;s.querySelector("#v").textContent="♥".repeat(Math.max(0,vies))+"♡".repeat(3-Math.max(0,vies));s.querySelector("#msg").textContent=b.o.nom+" : ce n'est pas la mission !";if(vies<=0)clore()}
        return false}
      if(b.y>H()){b.el.remove();return false}return true})});
}

/* 7. Vrai ou faux */
function vraiFaux(j){
  const liste=melange(D.vf);
  const s=cadre(j,"Vrai ou faux ? Une courte explication après chaque réponse.");
  let i=0,bon=0,fin=false;
  const clore=()=>{if(fin)return;fin=true;finir(j,{score:bon,unite:"bonnes réponses",etoiles:bon>=10?3:bon>=5?2:bon>0?1:0,points:bon*5,message:pl(bon,"bonne réponse","bonnes réponses")+" !"})};
  s.innerHTML=`<div class="tableau"><span class="timer" id="t"></span><span class="stars" id="sc">0 ★</span></div><div id="vf"></div>`;
  chrono(s.querySelector("#t"),reglages.dureeVF,clore);
  const z=s.querySelector("#vf");
  (function suite(){
    if(i>=liste.length)return clore();
    const q=liste[i++];
    z.innerHTML=`<div class="card"><h3>${esc(q.q)}</h3><div class="gros-choix deux"><button class="grand vert" type="button" data-v="1">Vrai</button><button class="grand rouge" type="button" data-v="0">Faux</button></div><div class="retour"></div></div>`;
    z.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{const ok=(b.dataset.v==="1")===q.vrai;if(ok)bon++;s.querySelector("#sc").textContent=bon+" ★";z.querySelectorAll("[data-v]").forEach(x=>{x.disabled=true;if((x.dataset.v==="1")===q.vrai)x.classList.add("juste");else if(x===b)x.classList.add("faux")});expliquer(z.querySelector(".retour"),ok,q.pourquoi,"max",suite)});
  })();
}

/* 8. 60 secondes chrono et le défi du jour : mini-défis mélangés */
const NOMS_REP={oui:"Oui",morceaux:"En petits morceaux",non:"Non"};
function miniDefis(r){
  const out=[];
  D.quiz.forEach(q=>out.push({q:q.q,img:APPS.some(a=>a.id===q.img)?"images/appareils/jeux/"+q.img+".jpg":"",ch:q.choix.map(c=>c.t),em:q.choix.map(c=>c.emoji),bonne:q.choix.findIndex(c=>c.ok),ex:q.pourquoi}));
  Object.entries(D.aliments).forEach(([app,l])=>l.forEach(a=>{const cles=["oui","morceaux","non"];out.push({q:(app==="bagues"?"Avec des bagues : ":"Avec le Carrière : ")+a.nom,gros:a.emoji,ch:cles.map(k=>NOMS_REP[k]),bonne:cles.indexOf(a.rep),ex:a.pourquoi})}));
  APPS.forEach(a=>{const autres=melange(APPS.filter(x=>x.id!==a.id),r).slice(0,2),ch=melange([a,...autres],r);out.push({q:"Quel est cet appareil ?",img:imgJeu(a),ch:ch.map(x=>x.nom),bonne:ch.indexOf(a),ex:a.nom+" : "+a.sous+"."})});
  return melange(out,r);
}
function chronoJeu(j,opts={}){
  const r=opts.r||Math.random,liste=miniDefis(r);
  const s=cadre(j,opts.regle||"Question flash, aliment à trier, appareil à reconnaître : réponds au maximum en 60 secondes.");
  const deja=opts.jour&&P.defi[auj()]!==undefined;
  if(deja)s.insertAdjacentHTML("beforebegin",`<p class="pill ok">Déjà relevé aujourd'hui. Tu peux rejouer pour le plaisir.</p>`);
  s.innerHTML=`<button class="grand sun" type="button" id="go">C'est parti !</button>`;
  s.querySelector("#go").onclick=()=>{
    let i=0,bon=0,fin=false;const erreurs=[];
    s.innerHTML=`<div class="tableau"><span class="timer" id="t"></span><span class="stars" id="sc">0 ★</span></div><div id="f"></div>`;
    const clore=()=>{if(fin)return;fin=true;
      const pts=opts.jour?(deja?0:bon*10):bon*5;
      if(opts.jour&&!deja){P.defi[auj()]=pts;sauver()}
      finir(j,{score:bon,unite:"bonnes réponses",etoiles:bon>=12?3:bon>=6?2:bon>0?1:0,points:pts,badges:opts.jour?["defi"]:[],message:pl(bon,"bonne réponse","bonnes réponses")+" !",extra:erreurs.length?`<div class="revoir"><b>À revoir :</b><ul class="list">${erreurs.slice(0,5).map(q=>`<li><span>${esc(q.ex)}</span></li>`).join("")}</ul></div>`:""})};
    chrono(s.querySelector("#t"),reglages.dureeChrono,clore);
    const f=s.querySelector("#f");
    (function pose(){
      const q=liste[i++%liste.length];
      f.innerHTML=`<div class="card">${q.img?`<img class="q-img" src="${q.img}" alt="">`:""}${q.gros?`<div class="gros" aria-hidden="true">${q.gros}</div>`:""}<h3>${esc(q.q)}</h3><div class="gros-choix">${q.ch.map((c,k)=>`<button class="grand" type="button" data-c="${k}">${q.em?`<span aria-hidden="true">${q.em[k]}</span>`:""}${esc(c)}</button>`).join("")}</div></div>`;
      f.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{if(+b.dataset.c===q.bonne){bon++;s.querySelector("#sc").textContent=bon+" ★"}else if(!erreurs.includes(q))erreurs.push(q);pose()});
    })();
  };
}
function defiJour(j){chronoJeu(j,{jour:true,r:graine("defi"+auj()),regle:"Le même défi toute la journée, un nouveau demain : réponds au maximum en 60 secondes."})}

const CATALOGUE=[
  {id:"defi",nom:"Le défi du jour",f:defiJour},
  {id:"nettoyage",nom:"Le grand nettoyage",sous:"Frotte les dents avec le doigt",f:nettoyage,dot:"teal"},
  {id:"quiz",nom:"Le quiz malin",sous:"10 questions avec Léo et Max",f:quiz,dot:"sun"},
  {id:"aliments",nom:"Les bons aliments",sous:"Oui, en morceaux ou non",f:aliments,dot:"coral"},
  {id:"puzzle",nom:"Le puzzle",sous:"9, 16 ou 25 pièces",f:puzzle,dot:"teal"},
  {id:"plaque",nom:"Tape la plaque !",sous:"Vite, avant la fin du chrono",f:plaque,dot:"coral"},
  {id:"attrape",nom:"Attrape les bons objets",sous:"Suis la mission",f:attrape,dot:"sun"},
  {id:"vf",nom:"Vrai ou faux",sous:"Deux gros boutons",f:vraiFaux,dot:"teal"},
  {id:"chrono",nom:"60 secondes chrono",sous:"Des mini-défis mélangés",f:chronoJeu,dot:"coral"}
];
function ouvrirExercice(n){
  const x=NIVEAUX.find(y=>y.ex.some(e=>e.n===n));
  niveau=x.n;store.set("exNiv",niveau);go("langue");
  const c=document.querySelector(`[data-fait="${n}"]`);if(c)c.closest(".ex").scrollIntoView({block:"center"});
}
function exerciceDuJour(){const x=NIVEAUX.find(y=>y.n===niveau)||NIVEAUX[0];return x.ex[Math.floor(graine("langue"+auj())()*x.ex.length)]}
function lancer(id,arg){quitter();document.querySelectorAll(".confettis,.toast,.fantome").forEach(x=>x.remove());const j=CATALOGUE.find(x=>x.id===id);j.f(j,arg)}
function aRecord(id){return Object.keys(P.records).some(k=>k.startsWith(id))}
function menu(){
  quitter();P=lire();visiter();$("#v-jeux").classList.remove("en-jeu");
  const e=exerciceDuJour(),fait=exFait(jour(),e);
  if(fait&&P.langue!==auj()){P.langue=auj();P.points+=20;gagnerBadge("langue");sauver()}
  const defiFait=P.defi[auj()]!==undefined,nb=P.badges.filter(b=>BADGES[b]).length;
  racine.innerHTML=`<div class="hero"><span class="eyebrow">Jeux</span><h2>Le terrain de jeu</h2><p>Des parties courtes, et ton record à battre.</p></div>
    <div class="tableau score"><span><b>${+P.points}</b> points</span><span><b>${+P.serie}</b> ${P.serie>1?"jours de suite":"jour de suite"}</span><span><b>${nb}</b> ${nb>1?"badges":"badge"}</span></div>
    <div class="card defi-carte"><span class="eyebrow">Le défi du jour</span><h3>60 secondes</h3><p>${defiFait?"Défi relevé. Rendez-vous demain !":"Un nouveau défi chaque jour, avec des points à gagner."}</p><button class="btn sun" type="button" data-jeu="defi">${defiFait?"Rejouer":"Relever le défi"}</button></div>
    <div class="card"><span class="eyebrow">Le défi de la langue</span><h3>${esc(e.t)}</h3><p class="note">${esc(e.dose)} · ${esc(e.freq)}</p><p>${fait?"Fait aujourd'hui : +20 points. Bravo !":"Fais cet exercice aujourd'hui pour gagner 20 points."}</p><button class="btn ghost" type="button" data-exo="${e.n}">Aller à l'exercice</button></div>
    <div class="tiles">${CATALOGUE.filter(x=>x.id!=="defi").map(x=>`<button class="tile" type="button" data-jeu="${x.id}"><span class="dot ${x.dot}">★</span><b>${esc(x.nom)}</b><span>${esc(x.sous)}</span>${aRecord(x.id)?`<span class="mini-etoiles">Record à battre</span>`:""}</button>`).join("")}</div>
    <div class="card"><h3>Mes badges</h3><div class="badges">${Object.entries(BADGES).map(([k,[n,t]])=>`<div class="badge${P.badges.includes(k)?" gagne":""}"><span aria-hidden="true">${P.badges.includes(k)?"★":"☆"}</span><b>${esc(n)}</b><small>${esc(t)}</small></div>`).join("")}</div></div>
    <p class="note">Ta progression reste sur ce téléphone. Pas de compte, rien n'est envoyé. Les jeux ne remplacent jamais l'avis de ta docteure : en cas d'urgence, appelle le cabinet.</p>`;
}
racine.addEventListener("click",e=>{
  const t=e.target;
  if(t.closest("[data-menu]")){menu();window.scrollTo(0,0);return}
  const a=t.closest("[data-jeu]");if(a){lancer(a.dataset.jeu);return}
  const x=t.closest("[data-exo]");if(x)ouvrirExercice(+x.dataset.exo);
});
window.Jeux={menu,quitter,lancer,reglages,etat:()=>P,CATALOGUE};
})();
