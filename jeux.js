/* Rubrique Jeux. Textes dans jeux-donnees.js, photos et consignes dans APPS et EX (index.html). Progression gardée sur le téléphone. */
(function(){
const D=JEUX_DONNEES,racine=$("#jeuxApp");
const doux=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
const reglages={dureeBrossage:120,dureeDefi:60,dureeAttrape:40};

/* Progression */
const vide={points:0,badges:[],scores:{},joues:[],jour:null,serie:0,defi:{},langue:null};
function lire(){const p=store.get("jeux",null);return p&&typeof p==="object"?{...vide,...p}:{...vide}}
let P=lire();
const sauver=()=>store.set("jeux",P);
const dateDe=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const auj=()=>dateDe(new Date());
const hier=()=>{const d=new Date();d.setDate(d.getDate()-1);return dateDe(d)};
function visiter(){
  if(P.jour===auj())return;
  P.serie=P.jour===hier()?P.serie+1:1;P.jour=auj();
  if(P.serie>=3)gagnerBadge("serie3");
  if(P.serie>=7)gagnerBadge("serie7");
  sauver();
}
const BADGES={
  premier:["Premier jeu","Vous avez terminé un jeu"],
  defi:["Défi relevé","Vous avez relevé un défi du jour"],
  langue:["Langue en forme","Vous avez fait le défi de la langue"],
  brossage:["Mission réussie","Toutes les zones sont brossées"],
  quiz:["Expert du quiz","3 étoiles au quiz expert"],
  curieux:["Curieux","5 jeux différents terminés"],
  explorateur:["Explorateur","Les 11 jeux terminés"],
  serie3:["3 jours de suite","Revenez 3 jours de suite"],
  serie7:["7 jours de suite","Revenez 7 jours de suite"]
};
function gagnerBadge(id){if(P.badges.includes(id))return false;P.badges.push(id);sauver();return true}

/* Hasard */
const melange=(l,r=Math.random)=>{const a=[...l];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function graine(s){let h=1779033703;for(const c of s)h=Math.imul(h^c.charCodeAt(0),3432918353);return()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return(h>>>0)/4294967296}}

/* Minuteries du jeu en cours : toutes arrêtées quand on quitte */
let arrets=[],jeuEnCours=null;
const apres=(f,ms)=>{const i=setTimeout(f,ms);arrets.push(()=>clearTimeout(i));return i};
const chaque=(f,ms)=>{const i=setInterval(f,ms);arrets.push(()=>clearInterval(i));return i};
function quitter(){arrets.forEach(f=>f());arrets=[]}
const mmss=t=>Math.floor(t/60)+":"+String(t%60).padStart(2,"0");
const etoilesTxt=n=>"★".repeat(n)+"☆".repeat(3-n);
const NIV=[["facile","Facile"],["moyen","Moyen"],["expert","Expert"]];

/* Cadre d'un jeu */
function cadre(j,niv,regle){
  $("#v-jeux").classList.add("en-jeu");
  racine.innerHTML=`<div class="jeu"><button class="back" type="button" data-menu>← Tous les jeux</button>
    <div class="hero"><span class="eyebrow">Jeu</span><h2>${esc(j.nom)}</h2></div>
    ${j.niveaux?`<div class="seg" role="group" aria-label="Choisir le niveau">${NIV.map(([k,l])=>`<button type="button" data-niveau="${k}" aria-pressed="${k===niv}">${l}</button>`).join("")}</div>`:""}
    <p class="regle">${esc(regle)}</p><div id="scene"></div></div>`;
  window.scrollTo(0,0);
  return racine.querySelector("#scene");
}
function finir(j,niv,etoiles,points,message,extra=""){
  quitter();
  const cle=j.id+":"+niv;
  P.scores[cle]=Math.max(P.scores[cle]||0,etoiles);
  P.points+=points;
  if(!P.joues.includes(j.id))P.joues.push(j.id);
  const avant=[...P.badges];
  gagnerBadge("premier");
  if(P.joues.length>=5)gagnerBadge("curieux");
  if(P.joues.length>=CATALOGUE.length)gagnerBadge("explorateur");
  if(j.id==="quiz"&&niv==="expert"&&etoiles===3)gagnerBadge("quiz");
  if(j.id==="brossage"&&etoiles===3)gagnerBadge("brossage");
  if(j.id==="defi")gagnerBadge("defi");
  sauver();
  const neufs=P.badges.filter(b=>!avant.includes(b));
  const s=racine.querySelector("#scene")||racine;
  s.innerHTML=`<div class="card resultat"><p class="grandes-etoiles" aria-label="${etoiles} étoiles sur 3">${etoilesTxt(etoiles)}</p>
    <h3>${esc(message)}</h3><p class="stars">+${points} points</p>
    ${neufs.map(b=>`<p class="pill now">Nouveau badge : ${esc(BADGES[b][0])}</p>`).join("")}${extra}
    <button class="btn" type="button" data-rejouer>Rejouer</button><button class="btn ghost" type="button" data-menu>Tous les jeux</button></div>`;
  s.querySelector("[data-rejouer]").onclick=()=>lancer(j.id,niv);
}
function etoilesDe(bon,total){const r=total?bon/total:0;return r>=.9?3:r>=.6?2:r>0?1:0}

/* Une question à choix, partagée par plusieurs jeux */
function question(el,q,choix,bonne,explication,suite,opts={}){
  el.innerHTML=`<div class="card"><h3>${esc(q)}</h3><div class="choix">${choix.map((c,i)=>`<button class="btn ghost" type="button" data-c="${i}">${esc(c)}</button>`).join("")}</div>${opts.pied||""}<div class="retour" aria-live="polite"></div></div>`;
  el.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{
    const i=+b.dataset.c,ok=i===bonne;
    el.querySelectorAll("[data-c]").forEach(x=>{x.disabled=true;const n=+x.dataset.c;if(n===bonne)x.classList.add("juste");else if(n===i)x.classList.add("faux")});
    if(opts.pied)el.querySelector(".jokers")?.remove();
    const r=el.querySelector(".retour");
    r.innerHTML=`<p class="${ok?"ok":"non"}"><b>${ok?"Bravo !":"Pas tout à fait."}</b> ${esc(explication)}</p><button class="btn" type="button" data-suite>Continuer</button>`;
    r.querySelector("[data-suite]").onclick=()=>suite(ok);
    if(opts.choisi)opts.choisi(ok);
  });
}
const compteur=(el,txt)=>{el.textContent=txt};
const pl=(n,sing,plur)=>n+" "+(n>1?plur:sing);

/* 1. Mission brossage */
function brossage(j,niv){
  const faces=["Dehors","Dedans","Dessus"],cotes=niv==="facile"?[""]:["gauche","droite"];
  const zones=[];
  ["Haut","Bas"].forEach(a=>cotes.forEach(c=>faces.forEach(f=>zones.push({a,c,f,p:0}))));
  const ordre=niv==="expert";
  const s=cadre(j,niv,"Faites glisser la brosse sur chaque zone jusqu'à ce qu'elle s'allume : dehors, dedans et dessus, en haut et en bas."+(ordre?" Niveau expert : suivez la zone entourée.":""));
  const duree=reglages.dureeBrossage,besoin=duree/zones.length*.85;
  const groupe=a=>`<div class="arcade"><b>Dents du ${a==="Haut"?"haut":"bas"}</b><div class="zones" style="grid-template-columns:repeat(3,1fr)">${zones.map((z,i)=>z.a===a?`<div class="zone" data-z="${i}" tabindex="0" role="button" aria-label="${z.f} ${z.a} ${z.c}"><i></i><span>${z.f}${z.c?`<small>${z.c}</small>`:""}</span></div>`:"").join("")}</div></div>`;
  s.innerHTML=`<div class="tableau"><span class="timer" id="brChrono">${mmss(duree)}</span><span class="stars" id="brFaites">0 / ${zones.length}</span></div>
    <div class="bouche" id="bouche">${groupe("Haut")}${groupe("Bas")}<div class="brosse" id="brosse" aria-hidden="true">🪥</div></div>`;
  const bouche=s.querySelector("#bouche"),brosse=s.querySelector("#brosse");
  s.scrollIntoView({block:"start"});
  let reste=duree,fin=false,dernier=0,cible=-1;
  const prochaine=()=>zones.findIndex(z=>z.p<1);
  function maj(){
    const cur=prochaine();
    s.querySelectorAll(".zone").forEach((el,i)=>{const z=zones[i];el.querySelector("i").style.width=Math.min(z.p,1)*100+"%";el.classList.toggle("allumee",z.p>=1);el.classList.toggle("cible",ordre&&i===cur)});
    compteur(s.querySelector("#brFaites"),zones.filter(z=>z.p>=1).length+" / "+zones.length);
  }
  function terminer(){
    if(fin)return;fin=true;
    const n=zones.filter(z=>z.p>=1).length;
    finir(j,niv,n===zones.length?3:Math.min(2,etoilesDe(n,zones.length)),n*5,n===zones.length?"Mission réussie : tout est propre !":"Le temps est écoulé : "+pl(n,"zone","zones")+" sur "+zones.length+".");
  }
  function frotter(i,dt){
    if(fin||i<0||(ordre&&i!==prochaine()))return;
    zones[i].p+=dt/besoin;maj();
    if(prochaine()<0)terminer();
  }
  bouche.addEventListener("pointermove",e=>{
    const r=bouche.getBoundingClientRect();
    brosse.style.transform=`translate(${e.clientX-r.left-18}px,${e.clientY-r.top-18}px)`;brosse.style.opacity=1;
    const el=document.elementFromPoint(e.clientX,e.clientY)?.closest(".zone");
    cible=el?+el.dataset.z:-1;dernier=performance.now();
    e.preventDefault();
  });
  bouche.addEventListener("pointerdown",e=>{if(e.target.hasPointerCapture&&e.target.hasPointerCapture(e.pointerId))e.target.releasePointerCapture(e.pointerId)});
  bouche.addEventListener("pointerleave",()=>{cible=-1});
  /* Au clavier : maintenir Entrée sur une zone */
  bouche.addEventListener("keydown",e=>{const el=e.target.closest(".zone");if(el&&(e.key==="Enter"||e.key===" ")){e.preventDefault();cible=+el.dataset.z;dernier=performance.now()}});
  chaque(()=>{if(cible>=0&&performance.now()-dernier<500)frotter(cible,.1)},100);
  chaque(()=>{reste--;compteur(s.querySelector("#brChrono"),mmss(reste));if(reste<=0)terminer()},1000);
  maj();
}

/* 2. Sauve tes bagues ! */
function bagues(j,niv){
  const temps={facile:7,moyen:5,expert:3}[niv],liste=melange(D.aliments);
  const s=cadre(j,niv,"Gardez ce qui ne risque rien pour vos bagues. Écartez ce que nos fiches déconseillent.");
  let i=0,vies=3,bon=0;
  function suivant(){
    quitter();
    if(i>=liste.length||vies<=0)return finir(j,niv,vies<=0?Math.min(1,bon):etoilesDe(bon,liste.length),bon*5,vies<=0?"Vos bagues ont besoin de vous : réessayez !":"Vos bagues sont sauvées : "+pl(bon,"bonne réponse","bonnes réponses")+".");
    const a=liste[i++];let reste=temps*10,fini=false;
    s.innerHTML=`<div class="tableau"><span class="stars" aria-label="${vies} vies">${"♥".repeat(vies)}${"♡".repeat(3-vies)}</span><span class="stars">${i} / ${liste.length}</span></div>
      <div class="meter"><i id="bgT" style="width:100%"></i></div>
      <div class="card aliment"><div class="gros" aria-hidden="true">${a.emoji}</div><h3>${esc(a.nom)}</h3>
      <div class="choix deux"><button class="btn" type="button" data-g="1">Je garde</button><button class="btn sun" type="button" data-g="0">J'écarte</button></div><div class="retour" aria-live="polite"></div></div>`;
    const repondre=g=>{
      if(fini)return;fini=true;quitter();
      const ok=g===a.bon;if(ok)bon++;else vies--;
      s.querySelectorAll("[data-g]").forEach(b=>b.disabled=true);
      const r=s.querySelector(".retour");
      r.innerHTML=`<p class="${ok?"ok":"non"}"><b>${g===null?"Trop tard !":ok?"Bravo !":"Attention."}</b> ${esc(a.pourquoi)}</p><button class="btn" type="button" data-suite>Continuer</button>`;
      r.querySelector("[data-suite]").onclick=suivant;
    };
    s.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>repondre(b.dataset.g==="1"));
    chaque(()=>{reste--;s.querySelector("#bgT").style.width=reste/(temps*10)*100+"%";if(reste<=0)repondre(null)},100);
  }
  suivant();
}

/* 3. Urgence orthodontique */
function urgence(j,niv){
  const liste=melange(D.urgences);
  const s=cadre(j,niv,"Que faites-vous dans cette situation ? Les réponses viennent de notre rubrique Urgences.");
  let i=0,bon=0;
  (function suivant(){
    if(i>=liste.length)return finir(j,niv,etoilesDe(bon,liste.length),bon*5,pl(bon,"bonne conduite","bonnes conduites")+" sur "+liste.length+".",`<button class="btn ghost" type="button" data-go="urgences">Voir la rubrique Urgences</button>`);
    const u=liste[i++],ch=melange(u.choix);
    question(s,u.situation,ch.map(c=>c.t),ch.findIndex(c=>c.ok),u.explication,ok=>{if(ok)bon++;suivant()});
  })();
}

/* 4. Devine l'appareil */
function devine(j,niv){
  const zoom={facile:220,moyen:320,expert:460}[niv],liste=melange(APPS).slice(0,6);
  const s=cadre(j,niv,"Cette photo montre un détail d'un appareil. Lequel est-ce ?");
  let i=0,bon=0;
  (function suivant(){
    if(i>=liste.length)return finir(j,niv,etoilesDe(bon,liste.length),bon*5,pl(bon,"appareil reconnu","appareils reconnus")+" sur "+liste.length+".");
    const a=liste[i++],autres=melange(APPS.filter(x=>x.id!==a.id)).slice(0,3),ch=melange([a,...autres]);
    const x=30+Math.random()*40,y=30+Math.random()*40;
    s.innerHTML=`<div class="detail" id="detail" role="img" aria-label="Détail de la photo d'un appareil"></div><div id="dq"></div>`;
    const det=s.querySelector("#detail");det.style.backgroundImage=`url("${a.img}")`;det.style.backgroundSize=zoom+"%";det.style.backgroundPosition=x+"% "+y+"%";
    const dq=s.querySelector("#dq");
    question(dq,"Quel est cet appareil ?",ch.map(c=>c.nom),ch.indexOf(a),a.nom+" : "+a.sous+". "+a.obj+".",ok=>{if(ok)bon++;suivant()},{
      pied:`<button class="vlink jokers" type="button" id="indice">Voir un indice</button>`,
      choisi:()=>{det.style.backgroundSize="contain";det.style.backgroundRepeat="no-repeat";det.style.backgroundPosition="center"}
    });
    dq.querySelector("#indice").onclick=e=>{e.target.outerHTML=`<p class="note">${esc(D.indices[a.id])}</p>`};
  })();
}

/* 5. Le bon aligneur */
function aligneur(j,niv){
  const n={facile:4,moyen:6,expert:8}[niv];
  const s=cadre(j,niv,"Touchez les gouttières dans l'ordre, de la première à la dernière.");
  let suivante=1,erreurs=0;
  const ordre=melange(Array.from({length:n},(_,i)=>i+1));
  s.innerHTML=`<div class="rail" id="rail">${Array.from({length:n},(_,i)=>`<span class="case" data-c="${i+1}"></span>`).join("")}</div>
    <div class="plateau">${ordre.map(v=>`<button class="aligneur" type="button" data-a="${v}" aria-label="Gouttière ${v}"><svg viewBox="0 0 64 40" aria-hidden="true"><path d="M6 8Q32 52 58 8" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></svg><b>${v}</b></button>`).join("")}</div>
    <p class="note" id="alRetour" aria-live="polite">Quelle gouttière vient en premier ?</p>`;
  s.querySelector(".plateau").onclick=e=>{
    const b=e.target.closest("[data-a]");if(!b||b.disabled)return;
    if(+b.dataset.a!==suivante){erreurs++;b.classList.add("secoue");apres(()=>b.classList.remove("secoue"),400);s.querySelector("#alRetour").textContent="Pas encore : cherchez la gouttière "+suivante+".";return}
    b.disabled=true;b.classList.add("posee");
    s.querySelector(`.case[data-c="${suivante}"]`).textContent=suivante;s.querySelector(`.case[data-c="${suivante}"]`).classList.add("pleine");
    suivante++;s.querySelector("#alRetour").textContent=suivante<=n?"Bien. Et ensuite ?":"";
    if(suivante>n)apres(()=>finir(j,niv,erreurs===0?3:erreurs<=2?2:1,n*3,"Les gouttières sont dans l'ordre !",`<p>${esc(D.aligneurs)}</p>`),doux()?0:500);
  };
}

/* 6. Memory */
function memory(j,niv){
  const n={facile:4,moyen:6,expert:9}[niv],choix=melange(APPS).slice(0,n);
  const s=cadre(j,niv,"Retrouvez les paires : la photo de chaque appareil et son nom.");
  const cartes=melange(choix.flatMap(a=>[{id:a.id,type:"photo",a},{id:a.id,type:"nom",a}]));
  s.innerHTML=`<div class="tableau"><span class="stars" id="meCoups">0 coup</span></div><div class="memory" style="grid-template-columns:repeat(${n>=9?3:n>=6?3:2},1fr)">${cartes.map((c,i)=>`<button class="carte" type="button" data-i="${i}" aria-label="Carte ${i+1}"><span class="dos" aria-hidden="true">?</span><span class="face">${c.type==="photo"?`<img src="${c.a.img}" alt="Photo : ${esc(c.a.nom)}">`:`<b>${esc(c.a.nom)}</b>`}</span></button>`).join("")}</div>`;
  let ouv=[],coups=0,faites=0,bloque=false;
  s.querySelector(".memory").onclick=e=>{
    const b=e.target.closest("[data-i]");if(!b||bloque||b.classList.contains("ouverte"))return;
    b.classList.add("ouverte");b.setAttribute("aria-label",cartes[+b.dataset.i].a.nom);ouv.push(b);
    if(ouv.length<2)return;
    coups++;compteur(s.querySelector("#meCoups"),coups+" coup"+(coups>1?"s":""));
    const[x,y]=ouv;ouv=[];
    if(cartes[+x.dataset.i].id===cartes[+y.dataset.i].id){
      x.classList.add("trouvee");y.classList.add("trouvee");faites++;
      if(faites===n)apres(()=>finir(j,niv,coups<=n*1.6?3:coups<=n*2.4?2:1,n*4,"Toutes les paires en "+pl(coups,"coup","coups")+" !"),doux()?0:600);
    }else{bloque=true;apres(()=>{[x,y].forEach(c=>{c.classList.remove("ouverte");c.setAttribute("aria-label","Carte "+(+c.dataset.i+1))});bloque=false},900)}
  };
}

/* 7. Puzzle des appareils */
function puzzle(j,niv){
  const n={facile:2,moyen:3,expert:4}[niv],a=melange(APPS)[0];
  const s=cadre(j,niv,"Touchez deux pièces pour les échanger, jusqu'à découvrir l'appareil.");
  const img=new Image();
  img.onload=()=>{
    const total=n*n;let ordre;
    do{ordre=melange(Array.from({length:total},(_,i)=>i))}while(ordre.every((v,i)=>v===i));
    s.innerHTML=`<div class="puzzle" style="aspect-ratio:${img.naturalWidth}/${img.naturalHeight};grid-template-columns:repeat(${n},1fr)">${ordre.map((v,i)=>`<button type="button" class="piece" data-p="${i}" aria-label="Pièce ${i+1}"></button>`).join("")}</div><p class="stars" id="puCoups">0 échange</p>`;
    const pieces=[...s.querySelectorAll(".piece")];let sel=-1,coups=0;
    const peindre=()=>pieces.forEach((p,i)=>{const v=ordre[i],x=v%n,y=Math.floor(v/n);p.style.backgroundImage=`url("${a.img}")`;p.style.backgroundSize=n*100+"% "+n*100+"%";p.style.backgroundPosition=(n>1?x/(n-1)*100:0)+"% "+(n>1?y/(n-1)*100:0)+"%";p.classList.toggle("choisie",i===sel)});
    peindre();
    s.querySelector(".puzzle").onclick=e=>{
      const b=e.target.closest("[data-p]");if(!b)return;const i=+b.dataset.p;
      if(sel<0){sel=i;peindre();return}
      if(sel!==i){[ordre[sel],ordre[i]]=[ordre[i],ordre[sel]];coups++;compteur(s.querySelector("#puCoups"),coups+" échange"+(coups>1?"s":""))}
      sel=-1;peindre();
      if(ordre.every((v,k)=>v===k)){
        const lim=total;
        apres(()=>{finir(j,niv,coups<=lim?3:coups<=lim*2?2:1,n*5,"Vous avez découvert : "+a.nom+" !",`<img class="photo" src="${a.img}" alt="Photo : ${esc(a.nom)}"><p>${esc(a.obj)}.</p><button class="btn sun" type="button" id="puFiche">Voir sa fiche</button>`);
          s.querySelector("#puFiche").onclick=()=>{go("conseils");showApp(a.id)}},doux()?0:500);
      }
    };
  };
  img.src=a.img;
}

/* 8. Vrai ou faux, quiz à niveaux */
function quiz(j,niv){
  const liste=melange(D.quiz[niv]).slice(0,8);
  const s=cadre(j,niv,"Vrai ou faux, ou la bonne réponse parmi plusieurs. Une explication après chaque réponse, et deux jokers par partie.");
  let i=0,bon=0,joker5=true,jokerP=true;
  (function suivant(){
    if(i>=liste.length)return finir(j,niv,etoilesDe(bon,liste.length),bon*5,pl(bon,"bonne réponse","bonnes réponses")+" sur "+liste.length+".");
    const q=liste[i++],vf=q.type==="vf",ch=vf?["Vrai","Faux"]:q.choix;
    const zone=document.createElement("div");
    s.innerHTML=`<div class="tableau"><span class="stars">Question ${i} / ${liste.length}</span><span class="stars">${bon} ★</span></div>`;s.appendChild(zone);
    question(zone,q.q,ch,q.bonne,q.explication,ok=>{if(ok)bon++;suivant()},{pied:`<div class="jokers"><button class="btn ghost" type="button" id="j50" ${joker5&&!vf?"":"disabled"}>Joker 50/50</button><button class="btn ghost" type="button" id="jp" ${jokerP?"":"disabled"}>Joker : passer</button></div>`});
    zone.querySelector("#j50").onclick=()=>{joker5=false;melange(ch.map((_,k)=>k).filter(k=>k!==q.bonne)).slice(0,2).forEach(k=>{zone.querySelector(`[data-c="${k}"]`).disabled=true});zone.querySelector("#j50").disabled=true};
    zone.querySelector("#jp").onclick=()=>{jokerP=false;liste[--i]=melange(D.quiz[niv].filter(x=>!liste.includes(x)))[0]||q;suivant()};
  })();
}

/* 9. Attrape les bonnes habitudes */
function attrape(j,niv){
  const vit={facile:90,moyen:135,expert:185}[niv]*(doux()?.6:1),gap={facile:1500,moyen:1100,expert:800}[niv];
  const s=cadre(j,niv,"Déplacez le panier pour attraper les bonnes habitudes. Laissez tomber les autres.");
  s.innerHTML=`<div class="tableau"><span class="stars" id="atVies">♥♥♥</span><span class="timer" id="atT">${mmss(reglages.dureeAttrape)}</span><span class="stars" id="atS">0</span></div>
    <div class="terrain" id="terrain" tabindex="0" aria-label="Terrain de jeu : déplacez le panier avec le doigt ou les flèches"><div class="panier" id="panier" aria-hidden="true">🧺</div></div><p class="note retour-at" id="atRetour" aria-live="polite"></p>`;
  const t=s.querySelector("#terrain"),pan=s.querySelector("#panier"),W=()=>t.clientWidth,H=()=>t.clientHeight;
  s.scrollIntoView({block:"start"});
  let x=W()/2,score=0,vies=3,reste=reglages.dureeAttrape,objets=[],fin=false,prec=performance.now(),raf=0;
  const placer=()=>{x=Math.max(28,Math.min(W()-28,x));pan.style.transform=`translateX(${x-28}px)`};placer();
  t.addEventListener("pointermove",e=>{x=e.clientX-t.getBoundingClientRect().left;placer();e.preventDefault()});
  t.addEventListener("pointerdown",e=>{x=e.clientX-t.getBoundingClientRect().left;placer()});
  t.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"){x-=30;placer();e.preventDefault()}if(e.key==="ArrowRight"){x+=30;placer();e.preventDefault()}});
  const bilan=()=>{if(fin)return;fin=true;finir(j,niv,score>=14?3:score>=8?2:score>0?1:0,score*2,vies<=0?"Plus de vies : "+pl(score,"bonne habitude attrapée","bonnes habitudes attrapées")+".":pl(score,"bonne habitude attrapée","bonnes habitudes attrapées")+" !")};
  chaque(()=>{const h=D.habitudes[Math.floor(Math.random()*D.habitudes.length)],el=document.createElement("span");el.className="objet";el.innerHTML=h.emoji+`<small>${esc(h.nom)}</small>`;const ox=50+Math.random()*(W()-100);el.style.left=ox+"px";t.appendChild(el);objets.push({h,el,x:ox,y:-36})},gap);
  chaque(()=>{reste--;compteur(s.querySelector("#atT"),mmss(reste));if(reste<=0)bilan()},1000);
  arrets.push(()=>cancelAnimationFrame(raf));
  (function boucle(now){
    const dt=Math.min((now-prec)/1000,.05);prec=now;
    if(fin)return;
    objets=objets.filter(o=>{
      if(fin)return false;
      o.y+=vit*dt;o.el.style.transform=`translate(-50%,${o.y}px)`;
      if(o.y>H()-64&&o.y<H()-24&&Math.abs(o.x-x)<36){
        o.el.remove();
        if(o.h.bon){score++;compteur(s.querySelector("#atS"),score);compteur(s.querySelector("#atRetour"),"Bien : "+o.h.nom+".")}
        else{vies--;compteur(s.querySelector("#atVies"),"♥".repeat(vies)+"♡".repeat(3-vies));compteur(s.querySelector("#atRetour"),o.h.nom+" : "+o.h.pourquoi);if(vies<=0)bilan()}
        return false;
      }
      if(o.y>H()){o.el.remove();return false}
      return true;
    });
    if(!fin)raf=requestAnimationFrame(boucle);
  })(prec);
}

/* 10. La roue du sourire */
function roue(j,niv){
  const secteurs=[["Question","var(--coral)","var(--coral-ink)"],["Défi","var(--sun)","var(--sun-ink)"],["Langue","var(--teal)","var(--teal-ink)"],["Question","var(--coral)","var(--coral-ink)"],["Défi","var(--sun)","var(--sun-ink)"],["Langue","var(--teal)","var(--teal-ink)"]];
  const s=cadre(j,niv,"Lancez la roue : elle choisit une question, un défi d'hygiène ou un exercice de langue.");
  const pt=(a,r)=>[100+r*Math.sin(a),100-r*Math.cos(a)].map(v=>v.toFixed(1)).join(" ");
  const pas=Math.PI/3;
  let angle=0,gains=0,tours=0,tourne=false;
  s.innerHTML=`<div class="roue-cadre"><span class="fleche" aria-hidden="true">▼</span><svg class="roue" id="roue" viewBox="0 0 200 200" role="img" aria-label="La roue du sourire">${secteurs.map((c,i)=>`<path d="M100 100L${pt(i*pas,98)}A98 98 0 0 1 ${pt((i+1)*pas,98)}Z" fill="${c[1]}"/><text x="100" y="34" text-anchor="middle" transform="rotate(${i*60+30} 100 100)" font-size="13" font-weight="700" fill="${c[2]}" font-family="var(--display)">${c[0]}</text>`).join("")}<circle cx="100" cy="100" r="16" fill="var(--surface)"/></svg></div>
    <button class="btn" type="button" id="roueGo">Lancer la roue</button><button class="btn ghost" type="button" id="roueFin">Terminer et compter mes points</button><div id="roueRes" aria-live="polite"></div>`;
  const res=s.querySelector("#roueRes"),go1=s.querySelector("#roueGo");
  const gagner=n=>{gains+=n};
  s.querySelector("#roueFin").onclick=()=>tours===0?menu():finir(j,niv,tours>=5?3:tours>=3?2:tours>0?1:0,gains,tours+" tour"+(tours>1?"s":"")+" de roue !");
  go1.onclick=()=>{
    if(tourne)return;tourne=true;res.innerHTML="";go1.disabled=true;
    const i=Math.floor(Math.random()*6);
    angle+=(doux()?0:1440)+((360-(i*60+30)-angle%360)+360)%360;
    s.querySelector("#roue").style.transform=`rotate(${angle}deg)`;
    apres(()=>{tourne=false;go1.disabled=false;tours++;
      const type=secteurs[i][0];
      if(type==="Question"){const n=NIV[Math.floor(Math.random()*3)][0],l=D.quiz[n],q=l[Math.floor(Math.random()*l.length)];
        question(res,q.q,q.type==="vf"?["Vrai","Faux"]:q.choix,q.bonne,q.explication,()=>{res.innerHTML=""},{choisi:ok=>{if(ok)gagner(5)}})}
      else if(type==="Défi"){const d=D.defisHygiene[Math.floor(Math.random()*D.defisHygiene.length)];
        res.innerHTML=`<div class="card"><span class="eyebrow">Défi d'hygiène</span><h3>${esc(d.t)}</h3><button class="btn" type="button" id="defiOk">C'est fait</button></div>`;
        res.querySelector("#defiOk").onclick=()=>{gagner(5);res.innerHTML=""}}
      else{const e=EX[Math.floor(Math.random()*EX.length)];
        res.innerHTML=`<div class="card"><span class="eyebrow">Exercice de langue</span><h3>${esc(e.t)}</h3><p>${esc(e.d)}</p><p class="note">${esc(e.dose)} · ${esc(e.freq)}</p><button class="btn" type="button" id="exGo">Aller à l'exercice</button></div>`;
        res.querySelector("#exGo").onclick=()=>{P.points+=gains;gains=0;sauver();ouvrirExercice(e.n)}}
    },doux()?0:3200);
  };
}

/* 11. Le défi du jour : 60 secondes */
const POOLS=[
  ["Le quiz éclair",r=>melange([...D.quiz.facile,...D.quiz.moyen,...D.quiz.expert],r).map(q=>({q:q.q,ch:q.type==="vf"?["Vrai","Faux"]:q.choix,bonne:q.bonne,ex:q.explication}))],
  ["Les aliments éclair",r=>melange(D.aliments,r).map(a=>({q:a.nom+" : on garde ou on écarte ?",ch:["Je garde","J'écarte"],bonne:a.bon?0:1,ex:a.pourquoi}))],
  ["Les habitudes éclair",r=>melange(D.habitudes,r).map(a=>({q:a.nom+" : bonne habitude ?",ch:["Oui","Non"],bonne:a.bon?0:1,ex:a.pourquoi}))]
];
function defiDuJour(){const r=graine("defi"+auj()),p=POOLS[Math.floor(r()*POOLS.length)];return{nom:p[0],liste:p[1](r)}}
function defi(j,niv){
  const d=defiDuJour();
  const s=cadre(j,niv,d.nom+" : répondez à un maximum de questions en "+reglages.dureeDefi+" secondes. Nouveau défi chaque jour.");
  const deja=P.defi[auj()];
  if(deja!==undefined)s.insertAdjacentHTML("beforebegin",`<p class="pill ok">Déjà relevé aujourd'hui : ${deja} points. Vous pouvez rejouer pour le plaisir.</p>`);
  s.innerHTML=`<button class="btn sun" type="button" id="defiGo">Commencer le défi</button>`;
  s.querySelector("#defiGo").onclick=()=>{
    let i=0,bon=0,reste=reglages.dureeDefi;const erreurs=[];
    function poser(){
      const q=d.liste[i%d.liste.length];i++;
      s.innerHTML=`<div class="tableau"><span class="timer" id="dfT">${mmss(reste)}</span><span class="stars">${bon} ★</span></div><div class="card"><h3>${esc(q.q)}</h3><div class="choix">${q.ch.map((c,k)=>`<button class="btn ghost" type="button" data-c="${k}">${esc(c)}</button>`).join("")}</div></div>`;
      s.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{if(+b.dataset.c===q.bonne)bon++;else if(!erreurs.includes(q))erreurs.push(q);poser()});
    }
    chaque(()=>{reste--;const el=s.querySelector("#dfT");if(el)el.textContent=mmss(reste);
      if(reste<=0){
        const premier=P.defi[auj()]===undefined,pts=premier?bon*10:0;
        if(premier){P.defi[auj()]=pts;sauver()}
        finir(j,niv,bon>=10?3:bon>=5?2:bon>0?1:0,pts,pl(bon,"bonne réponse","bonnes réponses")+" en "+reglages.dureeDefi+" secondes !",
          (premier?"":`<p class="note">Les points ne comptent qu'une fois par jour.</p>`)+(erreurs.length?`<div class="revoir"><b>À revoir :</b><ul class="list">${erreurs.map(q=>`<li><span>${esc(q.q)} ${esc(q.ex)}</span></li>`).join("")}</ul></div>`:""));
      }},1000);
    poser();
  };
}

const CATALOGUE=[
  {id:"defi",nom:"Le défi du jour",sous:"60 secondes, chaque jour",f:defi,dot:"sun"},
  {id:"brossage",nom:"Mission brossage",sous:"Toutes les faces des dents",f:brossage,niveaux:true,dot:"teal"},
  {id:"bagues",nom:"Sauve tes bagues !",sous:"Les aliments à écarter",f:bagues,niveaux:true,dot:"coral"},
  {id:"urgence",nom:"Urgence orthodontique",sous:"La bonne conduite",f:urgence,dot:"coral"},
  {id:"devine",nom:"Devine l'appareil",sous:"Reconnaître un détail",f:devine,niveaux:true,dot:"sun"},
  {id:"aligneur",nom:"Le bon aligneur",sous:"Remettre dans l'ordre",f:aligneur,niveaux:true,dot:"teal"},
  {id:"memory",nom:"Memory",sous:"Photo et nom",f:memory,niveaux:true,dot:"sun"},
  {id:"puzzle",nom:"Puzzle des appareils",sous:"Découvrir un appareil",f:puzzle,niveaux:true,dot:"coral"},
  {id:"quiz",nom:"Vrai ou faux",sous:"Quiz, jokers et étoiles",f:quiz,niveaux:true,dot:"teal"},
  {id:"attrape",nom:"Attrape les bonnes habitudes",sous:"Le panier et les objets",f:attrape,niveaux:true,dot:"coral"},
  {id:"roue",nom:"La roue du sourire",sous:"Question, défi ou exercice",f:roue,dot:"sun"}
];

function ouvrirExercice(n){
  const x=NIVEAUX.find(y=>y.ex.some(e=>e.n===n));
  niveau=x.n;store.set("exNiv",niveau);go("langue");
  const c=document.querySelector(`[data-fait="${n}"]`);if(c)c.closest(".ex").scrollIntoView({block:"center"});
}
function exerciceDuJour(){const x=NIVEAUX.find(y=>y.n===niveau)||NIVEAUX[0];return x.ex[Math.floor(graine("langue"+auj())()*x.ex.length)]}

function lancer(id,niv){
  quitter();
  const j=CATALOGUE.find(x=>x.id===id);
  niv=j.niveaux?(niv&&niv!=="unique"?niv:"facile"):"unique";
  jeuEnCours=id;
  j.f(j,niv);
}
function menu(){
  quitter();P=lire();visiter();$("#v-jeux").classList.remove("en-jeu");
  const e=exerciceDuJour(),fait=exFait(jour(),e);
  if(fait&&P.langue!==auj()){P.langue=auj();P.points+=20;gagnerBadge("langue");sauver()}
  const etoilesJeu=id=>Math.max(0,...Object.entries(P.scores).filter(([k])=>k.split(":")[0]===id).map(([,v])=>v));
  const d=defiDuJour(),defiFait=P.defi[auj()]!==undefined;
  racine.innerHTML=`<div class="hero"><span class="eyebrow">Jeux</span><h2>Le terrain de jeu</h2><p>Revenez chaque jour : un nouveau défi vous attend.</p></div>
    <div class="tableau score"><span><b>${P.points}</b> points</span><span><b>${P.serie}</b> jour${P.serie>1?"s":""} de suite</span><span><b>${P.badges.length}</b> badge${P.badges.length>1?"s":""}</span></div>
    <div class="card defi-carte"><span class="eyebrow">Le défi du jour</span><h3>${esc(d.nom)}</h3><p>${defiFait?"Défi relevé. Rendez-vous demain !":"60 secondes pour gagner des points."}</p><button class="btn sun" type="button" data-jeu="defi">${defiFait?"Rejouer":"Relever le défi"}</button></div>
    <div class="card"><span class="eyebrow">Le défi de la langue</span><h3>${esc(e.t)}</h3><p class="note">${esc(e.dose)} · ${esc(e.freq)}</p><p>${fait?"Fait aujourd'hui : +20 points. Bravo !":"Faites cet exercice aujourd'hui pour gagner 20 points."}</p><button class="btn ghost" type="button" data-exo="${e.n}">Aller à l'exercice</button></div>
    <div class="tiles">${CATALOGUE.filter(x=>x.id!=="defi").map(x=>`<button class="tile" type="button" data-jeu="${x.id}"><span class="dot ${x.dot}">★</span><b>${esc(x.nom)}</b><span>${esc(x.sous)}</span><span class="mini-etoiles" aria-label="${etoilesJeu(x.id)} étoiles sur 3">${etoilesTxt(etoilesJeu(x.id))}</span></button>`).join("")}</div>
    <div class="card"><h3>Mes badges</h3><div class="badges">${Object.entries(BADGES).map(([k,[n,t]])=>`<div class="badge${P.badges.includes(k)?" gagne":""}"><span aria-hidden="true">${P.badges.includes(k)?"★":"☆"}</span><b>${esc(n)}</b><small>${esc(t)}</small></div>`).join("")}</div></div>
    <p class="note">Votre progression reste sur ce téléphone. Pas de compte, rien n'est envoyé.</p>`;
}
racine.addEventListener("click",e=>{
  const t=e.target;
  if(t.closest("[data-menu]")){menu();window.scrollTo(0,0);return}
  const a=t.closest("[data-jeu]");if(a){lancer(a.dataset.jeu);return}
  const x=t.closest("[data-exo]");if(x){ouvrirExercice(+x.dataset.exo);return}
  const n=t.closest("[data-niveau]");if(n){lancer(jeuEnCours,n.dataset.niveau)}
});
window.Jeux={menu,quitter,lancer,reglages,etat:()=>P,CATALOGUE};
})();
