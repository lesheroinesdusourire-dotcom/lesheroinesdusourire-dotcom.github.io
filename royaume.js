/* Le Royaume du Sourire : conquête (onglet Langue), couronne et carnet (Mon espace), message des Héroïnes (accueil),
   rubrique « Le souffle du dragon ».
   RÈGLE ABSOLUE : tout reste dans ce téléphone (localStorage, clé « royaume »). Rien n'est envoyé sur internet.
   On ne change jamais les textes des exercices (tableau NIVEAUX de index.html) : on les reprend tels quels. */
(function(){
const doux=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
/* Traduction : la phrase française est la clé de i18n/en.js et i18n/es.js ; {n} est remplacé après */
const R=(s,v)=>{let t=window.LANGUE!=="fr"&&window.TRAD&&Object.prototype.hasOwnProperty.call(TRAD,s)?TRAD[s]:s;if(v)t=t.replace(/\{(\w+)\}/g,(_,k)=>v[k]);return t};
const pl=(n,un,plus)=>R(n>1?plus:un,{n});
const estObjet=o=>o&&typeof o==="object"&&!Array.isArray(o);
const estDate=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s);
const dateDe=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const auj=()=>dateDe(new Date());
const dLoc=s=>new Date(s+"T00:00:00");
const plusJours=(s,k)=>{const d=dLoc(s);d.setDate(d.getDate()+k);return dateDe(d)};

/* ─── Données ─── */
const CLE="royaume";
const BUT=120; /* joyaux pour conquérir un lieu : 1 séance faite = 1 joyau */
const LIEUX=[
  {n:1,cle:"village",nom:"Le Village",de:"le Village"},
  {n:2,cle:"foret",nom:"La Forêt",de:"la Forêt"},
  {n:3,cle:"chateau",nom:"Le Château",de:"le Château"}
];
function lireR(){
  const o=store.get(CLE,null),r=estObjet(o)?o:{};
  return{v:1,jours:estObjet(r.jours)?r.jours:{},victoires:Array.isArray(r.victoires)?r.victoires.filter(n=>[1,2,3].includes(n)):[],couronne:r.couronne===true,dernier:estObjet(r.dernier)&&[1,2,3].includes(r.dernier.n)&&estDate(r.dernier.date)?r.dernier:null};
}
let D=lireR();
const sauverR=()=>store.set(CLE,D);
const sommeJour=j=>estObjet(j)?[1,2,3].reduce((t,n)=>t+(+j[n]||0),0):0;
function totaux(){const t={1:0,2:0,3:0};Object.values(D.jours).forEach(j=>{if(estObjet(j))[1,2,3].forEach(n=>t[n]+=+j[n]||0)});return t}
const actif=d=>sommeJour(D.jours[d])>0;
const joursActifs=()=>Object.keys(D.jours).filter(actif).sort();
function serie(){let d=auj();if(!actif(d))d=plusJours(d,-1);let n=0;while(actif(d)){n++;d=plusJours(d,-1)}return n}
/* La date de « ex3 » est écrite par index.html (minuit local en heure UTC) : on retrouve le vrai jour du téléphone */
function jourLocalDe(cle){for(const k of [0,1,-1]){const x=dLoc(cle);x.setDate(x.getDate()+k);if(dkey(x)===cle)return dateDe(x)}return cle}
function compter(j){const c={};NIVEAUX.forEach(nv=>{c[nv.n]=nv.ex.reduce((t,e)=>t+casesDe(j,e.n).length,0)});return c}

/* Appelée par index.html à chaque séance cochée ou décochée */
function noter(j,silence){
  if(!estObjet(j)||!estObjet(j.s))return;
  const d=estDate(j.day)?jourLocalDe(j.day):auj(),avant=totaux(),avantJour=sommeJour(D.jours[d]);
  const c=compter(j);
  if(sommeJour(c)>0)D.jours[d]=c;else delete D.jours[d];
  const cles=Object.keys(D.jours).sort();if(cles.length>1000)cles.slice(0,cles.length-1000).forEach(k=>delete D.jours[k]);
  const apres=totaux();let gagne=null;
  LIEUX.forEach(l=>{if(apres[l.n]>=BUT&&!D.victoires.includes(l.n)){D.victoires.push(l.n);if(avant[l.n]<BUT){gagne=l.n;D.dernier={n:l.n,date:auj()}}}});
  sauverR();
  if(!silence){
    if(sommeJour(D.jours[d])>avantJour)joyauVole();
    if(gagne)setTimeout(()=>victoire(gagne),900);
  }
  renderCarte();
}

/* ─── Dessins (couleurs : variables de index.html) ─── */
const GEMME=`<svg class="gemme" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10l5 6-10 12L2 9z" fill="var(--sun)" stroke="var(--sun-ink)" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 9h20M7 3l5 18 5-18" fill="none" stroke="var(--sun-ink)" stroke-width="1" stroke-linejoin="round" opacity=".55"/></svg>`;
function dessinLieu(cle,x,y,k){
  const g=`<g transform="translate(${x} ${y}) scale(${k})">`;
  if(cle==="village")return g+`<ellipse cx="0" cy="22" rx="46" ry="9" fill="var(--teal)" opacity=".35"/>
    <path d="M-40 20v-22h24v22z" fill="var(--surface)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/><path d="M-44 0l16-16 16 16z" fill="var(--coral)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/><rect x="-31" y="8" width="7" height="12" rx="3" fill="var(--accent)"/>
    <path d="M-12 20v-30h30v30z" fill="var(--surface)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/><path d="M-17-8l20-20 20 20z" fill="var(--sun)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/><rect x="-2" y="6" width="9" height="14" rx="4" fill="var(--accent)"/><circle cx="3" cy="-8" r="3.5" fill="var(--teal)"/>
    <path d="M22 20v-18h20v18z" fill="var(--surface)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/><path d="M19 3l13-13 13 13z" fill="var(--teal)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/></g>`;
  if(cle==="foret")return g+`<ellipse cx="0" cy="22" rx="46" ry="9" fill="var(--teal)" opacity=".35"/>
    <rect x="-30" y="2" width="6" height="20" rx="3" fill="var(--muted)"/><circle cx="-27" cy="-6" r="15" fill="var(--teal)" stroke="var(--accent)" stroke-width="3"/>
    <rect x="25" y="4" width="6" height="18" rx="3" fill="var(--muted)"/><circle cx="28" cy="-3" r="13" fill="var(--teal)" stroke="var(--accent)" stroke-width="3"/>
    <rect x="-3" y="-2" width="7" height="24" rx="3" fill="var(--muted)"/><path d="M0-36l17 26H-17z" fill="var(--ok)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/><path d="M0-24l20 26H-20z" fill="var(--ok)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="-31" cy="-10" r="2.5" fill="var(--coral)"/><circle cx="-22" cy="-2" r="2.5" fill="var(--coral)"/><circle cx="31" cy="-7" r="2.5" fill="var(--sun)"/></g>`;
  return g+`<ellipse cx="0" cy="22" rx="48" ry="9" fill="var(--teal)" opacity=".35"/>
    <path d="M-40 20v-34h-4v-8h7v5h5v-5h6v5h5v-5h7v8h-4v34z" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M18 20v-34h-4v-8h7v5h5v-5h6v5h5v-5h7v8h-4v34z" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M-22 20v-24h44v24z" fill="var(--surface)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M-12-4v-24h-4v-8h7v5h5v-5h8v5h5v-5h7v8h-4v24z" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M-8 20v-12a8 8 0 0 1 16 0v12z" fill="var(--accent)"/><path d="M0-36v-16" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/><path d="M1-52h15l-5 5 5 5H1z" fill="var(--coral)"/>
    <circle cx="-29" cy="-4" r="3.5" fill="var(--sun)"/><circle cx="29" cy="-4" r="3.5" fill="var(--sun)"/></g>`;
}
function avatarCarte(){
  const p=store.get("profil",null),av=estObjet(p)?p.avatar:"dent",img={leo:"images/personnages/leo.svg",max:"images/personnages/max.svg",dixon:"images/personnages/dixon.svg"}[av];
  return `<circle r="17" fill="var(--surface)" stroke="var(--coral)" stroke-width="3"/>`+(img?`<image href="${img}" x="-14" y="-14" width="28" height="28"/>`:`<use href="#dent" x="-10" y="-14" width="20" height="28"/>`);
}

/* ─── 1. La conquête du Royaume (onglet Langue) ─── */
const POS={1:[70,178],2:[178,118],3:[282,62]};
function renderCarte(){
  const box=document.getElementById("royaumeCarte");if(!box)return;
  const t=totaux(),nv=typeof niveau==="number"?niveau:1,l=LIEUX[nv-1],tot=t[1]+t[2]+t[3];
  const fait=n=>t[n]>=BUT||D.victoires.includes(n);
  const seg=(a,b)=>`M${POS[a][0]} ${POS[a][1]}C${POS[a][0]+60} ${POS[a][1]} ${POS[b][0]-60} ${POS[b][1]+30} ${POS[b][0]} ${POS[b][1]}`;
  const lieu=x=>{const[px,py]=POS[x.n],ok=fait(x.n),pct=Math.min(1,t[x.n]/BUT);
    return `<g class="lieu${x.n===nv?" ici":""}" role="button" tabindex="0" data-lieu="${x.n}" aria-label="${R(x.nom)} : ${pl(t[x.n],"{n} joyau","{n} joyaux")} / ${BUT}">
      ${dessinLieu(x.cle,px,py-14,.78)}
      <rect x="${px-34}" y="${py+16}" width="68" height="8" rx="4" fill="var(--surface)" stroke="var(--line)"/><rect x="${px-34}" y="${py+16}" width="${Math.max(pct?8:0,68*pct)}" height="8" rx="4" fill="var(--sun)"/>
      <text x="${px}" y="${py+40}" text-anchor="middle" class="lieu-nom">${R(x.nom)}</text>
      ${ok?`<g transform="translate(${px+30} ${py-40})"><path d="M0 0v-18" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/><path d="M1-18h13l-4 4 4 4H1z" fill="var(--sun)" stroke="var(--sun-ink)" stroke-width="1"/></g>`:""}</g>`};
  const[ax,ay]=POS[nv];
  box.innerHTML=`<div class="conquete">
    <div class="conq-tete"><div><span class="eyebrow">${R("La conquête du Royaume")}</span><h3>${R("Chaque séance faite vous rapporte un joyau")}</h3></div><span class="tresor" aria-label="${pl(tot,"{n} joyau","{n} joyaux")}">${GEMME}<b>${tot}</b></span></div>
    <svg class="carte-royaume" viewBox="0 0 340 240" role="group" aria-label="${R("Le chemin du Village au Château")}">
      <rect width="340" height="240" rx="26" fill="var(--accent-soft)"/>
      <circle cx="306" cy="200" r="70" fill="var(--teal)" opacity=".18"/><circle cx="30" cy="40" r="60" fill="var(--coral)" opacity=".14"/><circle cx="40" cy="44" r="12" fill="var(--sun)"/>
      <path d="${seg(1,2)}" class="chemin"/><path d="${seg(2,3)}" class="chemin"/>
      ${fait(1)?`<path d="${seg(1,2)}" class="chemin fait"/>`:""}${fait(2)?`<path d="${seg(2,3)}" class="chemin fait"/>`:""}
      ${LIEUX.map(lieu).join("")}
      <g class="moi-carte" transform="translate(${ax-46} ${ay-44})" aria-hidden="true">${avatarCarte()}</g>
    </svg>
    <div class="conq-niv"><p><b>${R(l.nom)}</b> · ${R(NIVEAUX[nv-1].nom)}</p><p class="stars">${GEMME} ${t[nv]} / ${BUT}</p>
      <div class="meter"><i style="width:${Math.min(100,t[nv]/BUT*100)}%;background:var(--sun)"></i></div>
      <p class="note">${fait(nv)?R("Lieu conquis ! Continuez vos séances pour garder votre langue en forme."):R("Encore {n} pour conquérir {lieu}.",{n:pl(BUT-t[nv],"{n} joyau","{n} joyaux"),lieu:R(l.de)})}</p>
      ${fait(nv)?`<button class="btn ghost" type="button" data-revoir="${nv}">${R("Revoir l'écran de victoire")}</button>`:""}</div>
  </div>`;
}
document.addEventListener("click",e=>{
  const l=e.target.closest("[data-lieu]");if(l){const b=document.querySelector(`[data-niv="${l.dataset.lieu}"]`);if(b)b.click();return}
  const r=e.target.closest("[data-revoir]");if(r){victoire(+r.dataset.revoir);return}
});
document.addEventListener("keydown",e=>{const l=e.target.closest&&e.target.closest("[data-lieu]");if(l&&(e.key==="Enter"||e.key===" ")){e.preventDefault();l.dispatchEvent(new MouseEvent("click",{bubbles:true}))}});

/* +1 joyau qui s'envole doucement */
function joyauVole(){
  if(doux())return;
  const g=document.createElement("div");g.className="joyau-vole";g.setAttribute("aria-hidden","true");g.innerHTML=GEMME+"<b>+1</b>";document.body.appendChild(g);setTimeout(()=>g.remove(),1600);
}

/* Écran de victoire */
const VICTOIRE={
  1:["Le Village est conquis !","Bravo ! Séance après séance, votre langue a conquis le Village. Nous sommes très fières de vous !"],
  2:["La Forêt est conquise !","Quelle force ! Vous avez traversé toute la Forêt sans lâcher. Le Château n'est plus très loin."],
  3:["Le Château est à vous !","Vous êtes un vrai Héros du Royaume du Sourire. Bravo pour tout ce travail, nous sommes fières de vous !"]
};
function victoire(n){
  document.querySelector(".victoire")?.remove();
  const l=LIEUX[n-1],[titre,msg]=VICTOIRE[n],avant=document.activeElement;
  const v=document.createElement("div");v.className="victoire";v.setAttribute("role","dialog");v.setAttribute("aria-modal","true");v.setAttribute("aria-labelledby","vicTitre");
  v.innerHTML=`<div class="vic-in">
    <svg class="vic-dessin" viewBox="-80 -70 160 110" aria-hidden="true"><circle cx="0" cy="-10" r="62" fill="var(--sun)" opacity=".35"/>${dessinLieu(l.cle,0,0,1.25)}</svg>
    <span class="eyebrow">${R("Le message des Héroïnes")}</span>
    <h2 id="vicTitre">${R(titre)}</h2>
    <p class="vic-msg">${R(msg)}</p>
    <p class="vic-sig">${R("Dr Johana et Dr Clara, les Héroïnes du Sourire")}</p>
    <p class="note">${n<3?R("Passez au niveau suivant seulement quand votre docteure vous le dit."):R("Pour la suite, suivez les conseils de votre docteure.")}</p>
    <button class="btn sun" type="button" id="vicOk">${R("Continuer")}</button></div>`;
  document.body.appendChild(v);
  const fermer=()=>{v.remove();document.removeEventListener("keydown",clavier);if(avant&&avant.focus)avant.focus()};
  const clavier=e=>{if(e.key==="Escape")fermer();if(e.key==="Tab"){e.preventDefault();v.querySelector("#vicOk").focus()}};
  document.addEventListener("keydown",clavier);
  v.querySelector("#vicOk").onclick=fermer;
  v.addEventListener("click",e=>{if(e.target===v)fermer()});
  v.querySelector("#vicOk").focus();
  if(window.Espace)Espace.confettis(220);
}

/* ─── 2. Ta couronne de Héros (Mon espace) ─── */
const PIERRES=["--teal","--coral","--accent","--ok","--alert"];
function etatCouronne(){
  const a=joursActifs().length;
  if(a<7)return{a,rang:"carton",nom:"Couronne en carton",pierres:0,prochain:7,suite:"Couronne en argent"};
  if(a<15)return{a,rang:"argent",nom:"Couronne en argent",pierres:0,prochain:15,suite:"Couronne en or"};
  const p=Math.min(5,Math.floor((a-15)/7));
  return{a,rang:"or",nom:p?"Couronne en or et pierres":"Couronne en or",pierres:p,prochain:p<5?22+7*p:null,suite:"Une nouvelle pierre de couleur"};
}
function couronneSVG(c,cls){
  const fond={carton:"var(--carton)",argent:"var(--argent)",or:"var(--sun)"}[c.rang];
  const xs=[50,34,66,20,80].slice(0,c.pierres);
  return `<svg class="${cls||"couronne"}" viewBox="0 0 100 74" aria-hidden="true">
    <path d="M10 66V24l20 18L50 8l20 34 20-18v42z" fill="${fond}" stroke="var(--ink)" stroke-width="3.5" stroke-linejoin="round"/>
    ${c.rang==="carton"?`<path d="M18 50h64M18 58h64" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="4 5" opacity=".35"/>`:`<path d="M18 30l8 7M44 22l5-8" stroke="var(--surface)" stroke-width="4" stroke-linecap="round" opacity=".7"/>`}
    <rect x="10" y="54" width="80" height="12" fill="${fond}" stroke="var(--ink)" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="10" cy="22" r="5" fill="${fond}" stroke="var(--ink)" stroke-width="3"/><circle cx="50" cy="7" r="5" fill="${fond}" stroke="var(--ink)" stroke-width="3"/><circle cx="90" cy="22" r="5" fill="${fond}" stroke="var(--ink)" stroke-width="3"/>
    ${xs.map((x,i)=>`<circle cx="${x}" cy="60" r="5" fill="var(${PIERRES[i]})" stroke="var(--ink)" stroke-width="2"/>`).join("")}
  </svg>`;
}
function couronneSurAvatar(){return D.couronne?couronneSVG(etatCouronne(),"couronne-av"):""}
function htmlCouronne(){
  const c=etatCouronne(),s=serie();
  const reste=c.prochain?c.prochain-c.a:0;
  return `<div class="card couronne-carte"><span class="eyebrow">${R("Ta couronne de Héros")}</span>
    <div class="couronne-ligne">${couronneSVG(c)}<div><h3>${R(c.nom)}</h3><p class="stars">${pl(c.a,"{n} jour d'exercices","{n} jours d'exercices")}</p>${s>1?`<p class="note">${R("{n} jours de suite en ce moment.",{n:s})}</p>`:""}</div></div>
    ${c.prochain?`<div class="meter"><i style="width:${Math.min(100,(c.a/c.prochain)*100)}%;background:var(--sun)"></i></div><p class="note">${R("{suite} : encore {n}.",{suite:R(c.suite),n:pl(reste,"{n} jour d'exercices","{n} jours d'exercices")})}</p>`:`<p class="note">${R("Votre couronne est complète. Quelle régularité !")}</p>`}
    <p class="note">${R("Chaque jour avec au moins une séance de langue fait grandir votre couronne.")}</p>
    <button class="btn ghost" type="button" data-couronne aria-pressed="${D.couronne}">${D.couronne?R("Enlever la couronne de mon avatar"):R("Poser la couronne sur mon avatar")}</button></div>`;
}

/* ─── 3. Le carnet du Héros (Mon espace) ─── */
let moisVu=null;
const STICKERS=[
  /* étoile souriante */ `<path d="M20 5l4.4 9 9.6 1.3-7 6.7 1.7 9.5L20 27l-8.7 4.5L13 22l-7-6.7 9.6-1.3z" fill="var(--sun)" stroke="var(--sun-ink)" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 19.5q4 3.5 8 0" fill="none" stroke="var(--sun-ink)" stroke-width="1.6" stroke-linecap="round"/>`,
  /* joyau */ `<path d="M12 9h16l6 8-14 16L6 17z" fill="var(--teal)" stroke="var(--teal-ink)" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 17h28M12 9l8 24 8-24" fill="none" stroke="var(--teal-ink)" stroke-width="1" opacity=".6"/>`,
  /* petite couronne */ `<path d="M7 29V14l7 6 6-10 6 10 7-6v15z" fill="var(--sun)" stroke="var(--sun-ink)" stroke-width="1.6" stroke-linejoin="round"/><circle cx="20" cy="24" r="2.6" fill="var(--coral)"/>`,
  /* la dent héroïne */ `<use href="#dent" x="9" y="5" width="22" height="31"/>`,
  /* coeur */ `<path d="M20 32S7 24 7 15.5A6.5 6.5 0 0 1 20 12a6.5 6.5 0 0 1 13 3.5C33 24 20 32 20 32z" fill="var(--coral)" stroke="var(--coral-ink)" stroke-width="1.6" stroke-linejoin="round"/>`,
  /* souffle du dragon */ `<circle cx="14" cy="22" r="7" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.6"/><circle cx="23" cy="17" r="8" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.6"/><circle cx="28" cy="25" r="6" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.6"/>`
];
const sticker=(i,cls)=>`<svg class="${cls||"sticker"}" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="${cls==="sticker vide"?"3 3":"0"}"/>${cls==="sticker vide"?"":STICKERS[i%STICKERS.length]}</svg>`;
const lundiDe=s=>{const d=dLoc(s),k=(d.getDay()+6)%7;d.setDate(d.getDate()-k);return dateDe(d)};
const semaineComplete=lundi=>[0,1,2,3,4,5,6].every(k=>actif(plusJours(lundi,k)));
const numSemaine=lundi=>Math.round(dLoc(lundi)/6048e5);
function semainesCompletes(){const vues=new Set(),res=[];joursActifs().forEach(d=>{const l=lundiDe(d);if(!vues.has(l)){vues.add(l);if(semaineComplete(l))res.push(l)}});return res}
const SOURIRE=`<svg class="sourire" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="var(--teal)"/><circle cx="8.5" cy="9.5" r="1.6" fill="var(--teal-ink)"/><circle cx="15.5" cy="9.5" r="1.6" fill="var(--teal-ink)"/><path d="M7 14q5 5 10 0" fill="none" stroke="var(--teal-ink)" stroke-width="2" stroke-linecap="round"/></svg>`;
function htmlCarnet(){
  const now=new Date();if(!moisVu)moisVu={y:now.getFullYear(),m:now.getMonth()};
  const premier=new Date(moisVu.y,moisVu.m,1),dernier=new Date(moisVu.y,moisVu.m+1,0),a=auj();
  const t0=premier.toLocaleDateString(LOCALE,{month:"long",year:"numeric"}),titre=t0.charAt(0).toUpperCase()+t0.slice(1);
  const entetes=[0,1,2,3,4,5,6].map(k=>new Date(2024,0,1+k).toLocaleDateString(LOCALE,{weekday:"narrow"}));
  let lundi=lundiDe(dateDe(premier)),lignes="",nbMois=0;
  while(dLoc(lundi)<=dernier){
    let cases="";
    for(let k=0;k<7;k++){const d=plusJours(lundi,k),dd=dLoc(d),dans=dd.getMonth()===moisVu.m;
      if(!dans){cases+=`<span class="jour hors"></span>`;continue}
      const ok=actif(d),lbl=dd.toLocaleDateString(LOCALE,{day:"numeric",month:"long"})+" : "+(ok?R("séance faite"):d>a?R("à venir"):R("pas de séance"));
      if(ok)nbMois++;
      cases+=`<span class="jour${ok?" fait":""}${d===a?" auj":""}" role="gridcell" aria-label="${lbl}">${ok?SOURIRE:`<span class="num">${dd.getDate()}</span>`}</span>`}
    const comp=semaineComplete(lundi);
    lignes+=`<div class="sem" role="row">${cases}<span class="jour st" role="gridcell" aria-label="${comp?R("Semaine complète : sticker gagné !"):R("Semaine pas encore complète")}">${comp?sticker(numSemaine(lundi)):sticker(0,"sticker vide")}</span></div>`;
    lundi=plusJours(lundi,7);
  }
  const st=semainesCompletes(),estMoisActuel=moisVu.y===now.getFullYear()&&moisVu.m===now.getMonth();
  return `<div class="card carnet"><span class="eyebrow">${R("Le carnet du Héros")}</span>
    <div class="carnet-nav"><button type="button" class="rond-nav" data-mois="-1" aria-label="${R("Mois précédent")}">‹</button><h3>${titre}</h3><button type="button" class="rond-nav" data-mois="1" aria-label="${R("Mois suivant")}" ${estMoisActuel?"disabled":""}>›</button></div>
    <div class="grille" role="grid" aria-label="${titre}"><div class="sem tete" role="row">${entetes.map(h=>`<span role="columnheader">${h}</span>`).join("")}<span role="columnheader" aria-label="${R("Sticker de la semaine")}">★</span></div>${lignes}</div>
    <p class="note">${R("Un sourire = au moins une séance ce jour-là. Une semaine complète, du lundi au dimanche = un sticker.")}</p>
    <p class="stars">${pl(nbMois,"{n} jour avec sourire ce mois-ci","{n} jours avec sourire ce mois-ci")}</p>
    <div><span class="etiquette">${R("Mes stickers")} (${st.length})</span>${st.length?`<div class="stickers">${st.slice(-18).map(l=>sticker(numSemaine(l))).join("")}</div>`:`<p class="note">${R("Faites au moins une séance chaque jour pendant une semaine pour gagner votre premier sticker.")}</p>`}</div></div>`;
}
function htmlEspace(){return htmlCouronne()+htmlCarnet()}
function majEspace(){if(window.Espace&&!$("#v-espace").hidden)Espace.renderEspace()}
document.addEventListener("click",e=>{
  const c=e.target.closest("[data-couronne]");if(c){D.couronne=!D.couronne;sauverR();majEspace();setTimeout(()=>{const b=document.querySelector("[data-couronne]");if(b)b.focus()},0);return}
  const m=e.target.closest("[data-mois]");if(m&&!m.disabled){const d=new Date(moisVu.y,moisVu.m+ +m.dataset.mois,1);moisVu={y:d.getFullYear(),m:d.getMonth()};const vieux=document.querySelector(".carnet");if(vieux){const tmp=document.createElement("div");tmp.innerHTML=htmlCarnet();vieux.replaceWith(tmp.firstElementChild);const b=document.querySelector(`.carnet [data-mois="${m.dataset.mois}"]`);if(b&&!b.disabled)b.focus()}}
});

/* ─── 5. Le message des Héroïnes (accueil) ─── */
function renderMessage(){
  const box=document.getElementById("homeMessage");if(!box)return;
  const p=store.get("profil",null);if(!estObjet(p)||!p.etat){box.innerHTML="";return}
  const s=serie(),aujFait=actif(auj()),a=joursActifs().length,prenom=typeof p.prenom==="string"&&p.prenom?esc(p.prenom.slice(0,30)):"";
  let msg;
  if(D.dernier&&(dLoc(auj())-dLoc(D.dernier.date))/864e5<7)msg=R({1:"Le Village est conquis ! Nous sommes très fières de vous.",2:"La Forêt est conquise ! Votre langue devient très forte.",3:"Le Château est à vous ! Vous êtes un vrai Héros du Royaume."}[D.dernier.n]);
  else if(aujFait&&s>=3)msg=R("{n} jours de suite : votre régularité fait briller tout le Royaume !",{n:s});
  else if(aujFait)msg=R("Bravo pour votre séance d'aujourd'hui. Chaque joyau vous rapproche du Château !");
  else if(!a)msg=R("Bienvenue dans le Royaume du Sourire ! Votre première séance d'exercices de langue vous rapportera vos premiers joyaux.");
  else if(s>=2)msg=R("Déjà {n} jours de suite. Une séance aujourd'hui, et la série continue !",{n:s});
  else msg=R("Votre langue vous attend : une petite séance aujourd'hui, et le Royaume avance avec vous.");
  box.innerHTML=`<div class="message-heroines"><svg viewBox="0 0 88 124" aria-hidden="true"><use href="#dent" width="88" height="124"/></svg><div>
    <span class="eyebrow">${prenom?R("Le message des Héroïnes pour {p}",{p:prenom}):R("Le message des Héroïnes")}</span>
    <p class="mh-texte">${msg}</p>
    <p class="mh-sig">${R("Dr Johana et Dr Clara")}</p>
    <button class="btn" type="button" data-go="langue">${aujFait?R("Voir ma conquête"):R("Faire une séance")}</button></div></div>`;
}

/* ─── 4. Le souffle du dragon : reprend l'exercice « Respiration par le nez » tel quel ─── */
const EXD=()=>EX.find(e=>e.t==="Respiration par le nez");
let chronoD=null;
function stopD(){if(chronoD){clearInterval(chronoD.id);chronoD=null}document.querySelector(".dragon-souffle")?.classList.remove("souffle")}
function renderDragon(){
  const box=document.getElementById("dragonEx"),e=EXD();if(!box||!e)return;
  const j=jour(),fait=casesDe(j,e.n).length,sc=seances(e),t=chronoD?chronoD.t:e.s;
  box.innerHTML=`<div class="card ex${exFait(j,e)?" done":""}"><span class="eyebrow">${R("L'exercice")}</span>
    <h3>${esc(e.t)}</h3><div class="meta"><span>${esc(e.dose)}</span><span>${esc(e.freq)}</span></div>
    <p>${esc(e.d)}</p>
    <div class="row" style="align-items:center"><div><span class="timer" id="dragonTm">${fmtT(t)}</span></div><button class="btn" type="button" id="dragonGo">${chronoD?R("Pause"):R("Lancer")}</button></div>
    <p class="stars">${R("Séances du jour : {n} sur {max}",{n:fait,max:sc.max})}</p>
    <p class="note">${R("Chaque séance faite ici compte aussi dans vos exercices du niveau Avancé, et vous rapporte un joyau.")}</p></div>`;
  $("#dragonGo").onclick=()=>{
    if(chronoD){stopD();renderDragon();return}
    if(typeof son!=="undefined"&&!son&&(window.AudioContext||window.webkitAudioContext))son=new(window.AudioContext||window.webkitAudioContext)();
    if(typeof son!=="undefined"&&son&&son.state==="suspended")son.resume();
    stopChrono();
    chronoD={t:e.s,id:setInterval(()=>{
      if($("#v-dragon").hidden){stopD();return}
      chronoD.t--;const el=$("#dragonTm");if(el)el.textContent=fmtT(chronoD.t);
      if(chronoD.t<=0){stopD();bip();const j2=jour();cocherSeance(j2,e);setJour(j2);if(window.Espace)Espace.bravo();renderDragon()}
    },1000)};
    document.querySelector(".dragon-souffle")?.classList.add("souffle");
    renderDragon();
  };
}

/* Appelée par go() dans index.html */
function vue(v){
  if(v!=="dragon")stopD();
  if(v==="dragon")renderDragon();
  if(v==="langue")renderCarte();
  if(v==="accueil")renderMessage();
}

/* Démarrage : on garde la progression déjà enregistrée (séances d'aujourd'hui ou du dernier jour) */
if(store.get(CLE,null)===null){const x=store.get("ex3",null);if(estObjet(x)&&estDate(x.day)&&estObjet(x.s)&&estObjet(x.c))noter(x,true);else sauverR()}
else{const x=store.get("ex3",null);if(estObjet(x)&&estDate(x.day)&&estObjet(x.s))noter(x,true)}

window.Royaume={noter,renderCarte,renderMessage,htmlEspace,couronneSurAvatar,vue,victoire,ASSAINIR(o){
  if(!estObjet(o))return null;const jours={};
  if(estObjet(o.jours))Object.keys(o.jours).forEach(k=>{const j=o.jours[k];if(estDate(k)&&estObjet(j)){const c={};[1,2,3].forEach(n=>{const v=parseInt(j[n],10);c[n]=v>=0&&v<=99?v:0});if(sommeJour(c))jours[k]=c}});
  return{v:1,jours,victoires:Array.isArray(o.victoires)?[...new Set(o.victoires.filter(n=>[1,2,3].includes(n)))]:[],couronne:o.couronne===true,dernier:estObjet(o.dernier)&&[1,2,3].includes(o.dernier.n)&&estDate(o.dernier.date)?{n:o.dernier.n,date:o.dernier.date}:null};
}};
renderCarte();renderMessage();
const h=location.hash.slice(1);if(h==="dragon")renderDragon();
})();
