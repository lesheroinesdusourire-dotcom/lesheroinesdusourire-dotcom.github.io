/* Première ouverture, Mon espace, suivis, rappels, fête et recherche des Urgences.
   RÈGLE ABSOLUE : tout reste dans ce téléphone (localStorage). Aucune de ces données n'est envoyée, ni aux statistiques. */
(function(){
const doux=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
const CLES=["profil","ex3","exNiv","al","wear","jeux"];
const vide={etat:null,prenom:"",appareils:[],avatar:"dent",pose:"",rdv:"",notes:"",suivi:{}};
function lire(){const p=store.get("profil",null);return p&&typeof p==="object"&&!Array.isArray(p)?{...vide,...p,appareils:Array.isArray(p.appareils)?p.appareils.filter(a=>APPS.some(x=>x.id===a)):[],suivi:p.suivi&&typeof p.suivi==="object"?p.suivi:{}}:{...vide}}
let P=lire();
const sauver=()=>store.set("profil",P);
const AVATARS=[["dent","La petite dent",null],["leo","Léo la Langue","images/personnages/leo.svg"],["max","Max","images/personnages/max.svg"],["dixon","Dixon","images/personnages/dixon.svg"]];
function avatarHTML(id){const a=AVATARS.find(x=>x[0]===id)||AVATARS[0];return a[2]?`<img src="${a[2]}" alt="">`:`<svg viewBox="0 0 88 124" aria-hidden="true"><use href="#dent" width="88" height="124"/></svg>`}
const SUIVIS={plaque:{jours:7,nom:"Plaque",frequence:"1 tour par semaine"},pul:{jours:7,nom:"PUL",frequence:"1 tour par semaine",vis:true},disjoncteur:{jours:1,nom:"Disjoncteur",frequence:"1 tour par jour"}};
/* Conseils d'hygiène : phrases exactes des fiches */
function hygiene(a){const m={bagues:[0,1,2],elastiques:[0],carriere:[1,2]}[a.id];return m?m.map(i=>a.regles[i]):a.ent?[a.ent]:[]}
const dateDe=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const auj=()=>dateDe(new Date());
const dLoc=s=>new Date(s+"T00:00:00");
const joli=s=>dLoc(s).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const ecartJours=(a,b)=>Math.round((dLoc(b)-dLoc(a))/864e5);

/* ─── Fête ─── */
const BRAVO=["Bravo ! Le Dr Johana est super fière de toi !","Bravo ! Le Dr Clara est super fière de toi !","Top ! Léo la Langue fait la fête !","Une étoile de plus pour ton sourire !","Champion ! Ta langue devient super forte !"];
let dernierBravo=-1;
function toast(msg,grand){
  document.querySelector(".toast")?.remove();
  const t=document.createElement("div");t.className="toast"+(grand?" grand":"");t.setAttribute("role","status");t.textContent=msg;document.body.appendChild(t);
  setTimeout(()=>t.remove(),grand?5000:3000);
}
function confettis(n){
  if(doux())return;
  const c=document.createElement("canvas");c.className="confettis";c.setAttribute("aria-hidden","true");c.width=innerWidth;c.height=innerHeight;document.body.appendChild(c);
  const css=getComputedStyle(document.documentElement),couleurs=["--coral","--sun","--teal","--accent"].map(v=>css.getPropertyValue(v).trim());
  const g=c.getContext("2d"),ps=Array.from({length:n},(_,i)=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.4,v:2+Math.random()*3,o:Math.random()*6,r:4+Math.random()*5,k:couleurs[i%4]}));
  const debut=performance.now();
  (function anim(t){
    g.clearRect(0,0,c.width,c.height);
    ps.forEach(p=>{p.y+=p.v;p.x+=Math.sin(p.o+p.y/40);g.fillStyle=p.k;g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill()});
    if(t-debut<2600)requestAnimationFrame(anim);else c.remove();
  })(debut);
}
function bravo(){let i;do{i=Math.floor(Math.random()*BRAVO.length)}while(i===dernierBravo);dernierBravo=i;toast(BRAVO[i]);confettis(60)}
function ajouterBadge(id){const j=store.get("jeux",null);const o=j&&typeof j==="object"?j:{};o.badges=Array.isArray(o.badges)?o.badges:[];if(o.badges.includes(id))return false;o.badges.push(id);store.set("jeux",o);return true}
function journee(){const n=P.prenom?" "+P.prenom:"";ajouterBadge("journee");toast("Grande fête"+n+" ! Tous tes exercices du jour sont faits. Nouveau badge : Journée parfaite !",true);confettis(200)}

/* ─── Première ouverture ─── */
let choix=[];
function afficherBienvenue(){
  document.body.classList.add("sans-onglets");
  const v=$("#v-bienvenue");
  v.innerHTML=`<svg class="scene" viewBox="0 0 520 170" aria-hidden="true"><rect width="520" height="170" fill="var(--accent-soft)"/><circle cx="46" cy="38" r="20" fill="var(--coral)"/><circle cx="476" cy="44" r="14" fill="var(--sun)"/><circle cx="440" cy="130" r="22" fill="var(--teal)"/><use href="#dent" x="206" y="18" width="108" height="140"/></svg>
    <div class="hero"><span class="eyebrow">Les Héroïnes du Sourire</span><h1>Bienvenue !</h1></div>
    <form class="card" id="bvNom"><label for="bvPrenom">Comment tu t'appelles ?<input id="bvPrenom" type="text" maxlength="30" autocomplete="off" autocapitalize="words" placeholder="Ton prénom"></label>
    <p class="note">Ton prénom reste sur ce téléphone. Rien n'est envoyé sur internet.</p><button class="btn" type="submit">Continuer</button></form>
    <button class="btn ghost" type="button" id="bvVisiteur">Entrer en visiteur</button>
    <p class="note">Pas encore d'appareil ? Entre en visiteur pour découvrir les vidéos, les jeux et la carte.</p>
    <button class="vlink" type="button" id="bvUrgence">Une urgence ? Voir que faire</button>`;
  $("#bvNom").addEventListener("submit",e=>{e.preventDefault();P.prenom=$("#bvPrenom").value.trim();etape2()});
  $("#bvVisiteur").onclick=()=>{P.etat="visiteur";sauver();entrer("accueil")};
  $("#bvUrgence").onclick=()=>{document.body.classList.remove("sans-onglets");go("urgences")};
  go("bienvenue");
}
function etape2(){
  choix=[];
  $("#v-bienvenue").innerHTML=`<div class="hero"><span class="eyebrow">${P.prenom?"Enchanté, "+esc(P.prenom)+" !":"Encore une question"}</span><h2>Quel appareil portes-tu ?</h2><p>Tu peux en choisir plusieurs.</p></div>
    ${grilleAppareils(P.appareils)}
    <div class="row"><button class="btn ghost" type="button" data-etat="aucun" aria-pressed="false">Je n'en ai pas encore</button><button class="btn ghost" type="button" data-etat="sais-pas" aria-pressed="false">Je ne sais pas</button></div>
    <button class="btn" type="button" id="bvEntrer">Entrer</button>`;
  const v=$("#v-bienvenue");let etat=null;
  v.querySelector(".apps").onclick=e=>{const b=e.target.closest("[data-coche]");if(!b)return;basculer(b);etat=null;v.querySelectorAll("[data-etat]").forEach(x=>x.setAttribute("aria-pressed","false"))};
  v.querySelectorAll("[data-etat]").forEach(b=>b.onclick=()=>{etat=b.dataset.etat;v.querySelectorAll("[data-etat]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));v.querySelectorAll("[data-coche]").forEach(x=>x.setAttribute("aria-pressed","false"))});
  $("#bvEntrer").onclick=()=>{
    P.appareils=[...v.querySelectorAll('[data-coche][aria-pressed="true"]')].map(x=>x.dataset.coche);
    P.etat=P.appareils.length?"patient":(etat||"sais-pas");P.proposer=P.appareils.filter(a=>SUIVIS[a]||a==="gouttieres");sauver();
    entrer(aSuivi()?"espace":"accueil");
  };
  window.scrollTo(0,0);
}
const estDate=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s);
const entier=(n,max)=>{const v=parseInt(n,10);return v>=0&&v<=max?v:0};
const mot=s=>typeof s==="string"&&/^[a-z0-9-]{1,30}$/.test(s);
const estObjet=o=>o&&typeof o==="object"&&!Array.isArray(o);
const ASSAINIR={
  profil(o){if(!estObjet(o))return null;const suivi={};if(estObjet(o.suivi))Object.keys(SUIVIS).forEach(k=>{const s=o.suivi[k];if(estObjet(s))suivi[k]={prevu:entier(s.prevu,999)||null,tours:Array.isArray(s.tours)?s.tours.filter(estDate):[],vis:s.vis===true}});
    const rappels={};if(estObjet(o.rappels))Object.keys(o.rappels).forEach(k=>{if(mot(k)&&/^\d\d:\d\d$/.test(o.rappels[k]))rappels[k]=o.rappels[k]});
    return{etat:["patient","visiteur","aucun","sais-pas"].includes(o.etat)?o.etat:"visiteur",prenom:typeof o.prenom==="string"?o.prenom.slice(0,30):"",appareils:Array.isArray(o.appareils)?o.appareils.filter(a=>APPS.some(x=>x.id===a)):[],avatar:AVATARS.some(a=>a[0]===o.avatar)?o.avatar:"dent",pose:estDate(o.pose)?o.pose:"",rdv:estDate(o.rdv)?o.rdv:"",notes:typeof o.notes==="string"?o.notes.slice(0,2000):"",suivi,rappels,proposer:[]}},
  ex3(o){if(!estObjet(o)||!estDate(o.day)||!estObjet(o.s)||!estObjet(o.c))return null;const s={},c={};EX.forEach(e=>{if(Array.isArray(o.s[e.n]))s[e.n]=o.s[e.n].filter(i=>Number.isInteger(i)&&i>=0&&i<5);if(o.c[e.n]!==undefined)c[e.n]=entier(o.c[e.n],99)});return{day:o.day,s,c,fete:o.fete===true}},
  exNiv(o){return[1,2,3].includes(o)?o:null},
  al(o){return estObjet(o)&&estDate(o.start)&&[7,10,14].includes(o.days)?{start:o.start,days:o.days,total:entier(o.total,99)||20}:null},
  wear(o){return Array.isArray(o)?o.filter(estDate):null},
  jeux(o){if(!estObjet(o))return null;const scores={},defi={};if(estObjet(o.scores))Object.keys(o.scores).forEach(k=>{if(/^[a-z]+:[a-z]+$/.test(k))scores[k]=entier(o.scores[k],3)});if(estObjet(o.defi))Object.keys(o.defi).forEach(k=>{if(estDate(k))defi[k]=entier(o.defi[k],99999)});return{points:entier(o.points,9999999),serie:entier(o.serie,99999),badges:Array.isArray(o.badges)?o.badges.filter(b=>BADGES_JEUX[b]):[],joues:Array.isArray(o.joues)?o.joues.filter(mot):[],scores,defi,jour:estDate(o.jour)?o.jour:null,langue:estDate(o.langue)?o.langue:null}}
};
function grilleAppareils(sel){return `<div class="apps">${APPS.map(a=>`<button class="app coche" type="button" data-coche="${a.id}" aria-pressed="${sel.includes(a.id)}"><img class="${a.fit}" src="${a.img}" alt="" loading="lazy"><span><b>${esc(a.nom)}</b><small>${esc(a.sous)}</small></span></button>`).join("")}</div>`}
function basculer(b){b.setAttribute("aria-pressed",String(b.getAttribute("aria-pressed")!=="true"))}
function entrer(v){document.body.classList.remove("sans-onglets");renderAccueil();trierUrgences();go(v)}
const aSuivi=()=>P.appareils.some(a=>SUIVIS[a]||a==="gouttieres");

/* ─── Tours de clé ─── */
function etatSuivi(id){const s=P.suivi[id]||(P.suivi[id]={prevu:null,tours:[],vis:false});if(!Array.isArray(s.tours))s.tours=[];return s}
function suiviActif(id){return id!=="pul"||etatSuivi("pul").vis}
function carteSuivi(id,compacte){
  const c=SUIVIS[id],s=etatSuivi(id),total=s.tours.length,dernier=s.tours[total-1];
  const nom=c.nom;
  if(c.vis&&!s.vis)return `<div class="card suivi"><h3>${nom}</h3><p>Ton PUL a-t-il une vis ?</p><button class="btn ghost" type="button" data-vis="${id}">Oui, il a une vis</button></div>`;
  const stop=s.prevu&&total>=s.prevu;
  const ecart=dernier?ecartJours(dernier,auj()):Infinity,fait=ecart<c.jours;
  const prochain=dernier?(()=>{const d=dLoc(dernier);d.setDate(d.getDate()+c.jours);return dateDe(d)})():null;
  const rate=P.rdv&&P.rdv<auj();
  if(compacte)return `<div class="card suivi"><h3>${nom} : tour de clé</h3>${stop?`<div class="stop" role="alert"><b>Stop !</b> Plus de tour de clé avant ton rendez-vous.</div>`:""}<p class="stars">${total} tour${total>1?"s":""}${s.prevu?` sur ${+s.prevu}`:""}</p>${stop||rate?"":`<button class="btn sun" type="button" data-tour="${id}" ${fait?"disabled":""}>${fait?"Tour de clé fait ✓":"Tour de clé fait"}</button>`}<button class="btn ghost" type="button" data-go="espace">Régler dans Mon espace</button></div>`;
  return `<div class="card suivi"><h3>${nom} : tour de clé</h3><p class="note">${c.frequence}, dans le sens de la flèche.</p>
    ${stop?`<div class="stop" role="alert"><b>Stop !</b> Plus de tour de clé avant ton rendez-vous.</div>`:""}
    <p class="stars">${total} tour${total>1?"s":""}${s.prevu?` sur ${+s.prevu}`:""}</p>${s.prevu?`<div class="meter"><i style="width:${Math.min(100,total/s.prevu*100)}%"></i></div>`:""}
    ${stop||rate?"":`<button class="btn sun" type="button" data-tour="${id}" ${fait?"disabled":""}>${fait?"Tour de clé fait ✓":"Tour de clé fait"}</button>${fait?`<p class="note">Prochain tour : ${c.jours===1?"demain":joli(prochain)}.</p>`:""}`}
    <label for="pr-${id}">Nombre de tours prévu par ta docteure<input id="pr-${id}" type="number" min="1" max="999" inputmode="numeric" value="${+s.prevu||""}" data-prevu="${id}"></label><p class="note">Ne change ce nombre que si ta docteure te le demande.</p>
    <p class="regle-rdv${rate?" fort":""}">${rate?`Ton rendez-vous était le ${joli(P.rdv)}. `:""}Rendez-vous raté = on arrête les tours de clé.${rate?" Tu es allé à ce rendez-vous ? Change la date dans Mes dates.":""}</p>
    ${total?`<button class="vlink" type="button" data-annule="${id}">Annuler le dernier tour</button>`:""}
    ${stop||rate?"":blocRappel(id)}</div>`;
}

/* ─── Rappels d'agenda ─── */
function blocRappel(id){
  const heure=/^\d\d:\d\d$/.test(P.rappels&&P.rappels[id])?P.rappels[id]:"19:00";
  return `<details class="rappel" ${P.proposer&&P.proposer.includes(id)?"open":""}><summary>Ajouter un rappel à mon agenda</summary><div>
    <div class="seg" role="group" aria-label="Moment du rappel"><button type="button" data-moment="${id}" data-h="08:00" aria-pressed="${heure<"12:00"}">Matin</button><button type="button" data-moment="${id}" data-h="19:00" aria-pressed="${heure>="12:00"}">Soir</button></div>
    <label for="h-${id}">À quelle heure ?<input id="h-${id}" type="time" value="${heure}"></label>
    <button class="btn" type="button" data-rappel="${id}">Ajouter le rappel à mon agenda</button>
    <p class="note">${texteFrequence(id)} Quand le traitement change, supprime le rappel dans ton agenda.${id==="gouttieres"?"":" Rendez-vous raté ou Stop : arrête les tours de clé, même si le rappel sonne."}</p></div></details>`;
}
function joursAligneur(){const a=store.get("al",null);if(!a||![7,10,14].includes(a.days)||!a.start)return null;return ecartJours(a.start,auj())/a.days>=(a.total||0)?null:a}
function texteFrequence(id){if(id==="gouttieres"){const a=joursAligneur();return a?`Rappel tous les ${a.days} jours.`:"Rappel selon ta prescription."}return SUIVIS[id].jours===1?"Rappel chaque jour.":"Rappel chaque semaine."}
function fichierICS(id,heure){
  const n=new Date(),hh=heure.replace(":","")+"00";
  let titre,regle,depart=new Date(n.getFullYear(),n.getMonth(),n.getDate());
  if(id==="gouttieres"){
    const a=joursAligneur();if(!a)return null;
    const debut=dLoc(a.start),passes=Math.max(0,Math.floor((depart-debut)/864e5/a.days))+1;
    depart=new Date(debut);depart.setDate(debut.getDate()+passes*a.days);
    const reste=Math.max(1,(a.total||1)-passes);
    titre="Changer de gouttière";regle=`FREQ=DAILY;INTERVAL=${a.days};COUNT=${reste}`;
  }else{
    const c=SUIVIS[id],s=etatSuivi(id);
    titre=`Tour de clé : ${c.nom}`;
    const d=s.tours[s.tours.length-1];
    if(d){const p=dLoc(d);p.setDate(p.getDate()+c.jours);if(p>depart)depart=p}
    if(dateDe(depart)===auj()&&heure<=String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0"))depart.setDate(depart.getDate()+1);
    regle=`FREQ=${c.jours===1?"DAILY":"WEEKLY"}`+(s.prevu?`;COUNT=${Math.max(1,s.prevu-s.tours.length)}`:"");
  }
  const j=dateDe(depart).replace(/-/g,""),stamp=n.toISOString().replace(/[-:]|\.\d+/g,"");
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Les Heroines du Sourire//Rappel//FR","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT",`UID:${id}-${stamp}@lesheroinesdusourire.fr`,`DTSTAMP:${stamp}`,`DTSTART:${j}T${hh}`,"DURATION:PT5M",`RRULE:${regle}`,`SUMMARY:${titre}`,"BEGIN:VALARM","ACTION:DISPLAY",`DESCRIPTION:${titre}`,"TRIGGER:PT0M","END:VALARM","END:VEVENT","END:VCALENDAR",""].join("\r\n");
}
function telecharger(contenu,nom,type){
  const u=URL.createObjectURL(new Blob([contenu],{type})),a=document.createElement("a");a.href=u;a.download=nom;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);
}

/* ─── Accueil adapté ─── */
function exerciceJour(){const x=NIVEAUX.find(y=>y.n===niveau)||NIVEAUX[0];let h=0;for(const c of auj())h=(h*31+c.charCodeAt(0))%9973;return x.ex[h%x.ex.length]}
function ligneGouttiere(){
  const a=store.get("al",null);if(!a||!a.start)return `<p>Renseigne ta date de pose pour savoir quand changer de gouttière.</p>`;
  const el=ecartJours(a.start,auj());if(el<0)return `<p>Ton traitement commence le ${joli(a.start)}.</p>`;
  const num=Math.floor(el/a.days)+1,reste=a.days-(el%a.days);
  if(num>a.total)return `<p>Tu as terminé ta série. Bravo !</p>`;
  return el>0&&el%a.days===0?`<p><b>C'est le jour !</b> Passe à la gouttière n°${num} ce soir.</p>`:`<p>Gouttière n°${num} · changement dans ${reste} jour${reste>1?"s":""}.</p>`;
}
function renderAccueil(){
  P=lire();
  const box=$("#homePerso"),tuiles=$("#v-accueil .tiles"),titre=$("#homeTitre"),intro=$("#homeIntro");
  const visiteur=P.etat==="visiteur"||P.etat==="aucun";
  tuiles.hidden=visiteur;
  titre.textContent=P.prenom?"Bonjour "+P.prenom+" !":"Les Héroïnes du Sourire";
  intro.textContent=P.etat==="patient"||P.etat==="sais-pas"?"Voici ton espace pour aujourd'hui.":"Bienvenue dans votre espace patient : tout ce qu'il faut pendant votre traitement, dans votre poche.";
  if(!P.etat||P.etat==="sais-pas"){box.innerHTML=P.etat?`<div class="card"><h3>Tu ne sais pas quel est ton appareil ?</h3><p>Regarde les photos ou demande au cabinet.</p><button class="btn ghost" type="button" data-go="conseils">Voir les appareils</button></div>`:"";return}
  if(visiteur){
    box.innerHTML=`<div class="tiles"><button class="tile" type="button" data-go="videos"><span class="dot sun">▶</span><b>Vidéos</b><span>Le Royaume du Sourire</span></button><button class="tile" type="button" data-go="jeux"><span class="dot coral">★</span><b>Jeux</b><span>Un défi chaque jour</span></button><button class="tile" type="button" id="homeAge"><span class="dot teal">?</span><b>À quel âge consulter ?</b><span>La vidéo de Léo la Langue</span></button><button class="tile" type="button" data-go="carte"><span class="dot">C</span><b>La carte</b><span>Cabinets et adresses utiles</span></button></div>`;
    $("#homeAge").onclick=()=>openEp(3);return;
  }
  const mes=P.appareils.map(id=>APPS.find(a=>a.id===id)).filter(Boolean);
  const hyg=[...new Set(mes.flatMap(hygiene))];
  const e=exerciceJour();
  box.innerHTML=`${P.appareils.filter(a=>SUIVIS[a]&&suiviActif(a)).map(a=>carteSuivi(a,true)).join("")}
    ${P.appareils.includes("gouttieres")?`<div class="card"><span class="eyebrow">Ma gouttière</span>${ligneGouttiere()}<button class="btn ghost" type="button" data-go="gouttiere">Ouvrir mon suivi</button></div>`:""}
    <div class="card"><h3>Mes appareils</h3><div class="mes-app">${mes.map(a=>`<button class="mon-app" type="button" data-fiche="${a.id}"><img class="${a.fit}" src="${a.img}" alt=""><span><b>${esc(a.nom)}</b><small>${esc(a.quand)}</small></span></button>`).join("")}</div></div>
    <button class="tile urgent" type="button" data-go="urgences"><span class="dot">!</span><b>Mes urgences</b><span>Que faire tout de suite</span></button>
    ${hyg.length?`<div class="card"><h3>Mon hygiène</h3><ul class="list">${hyg.map(h=>`<li><span>${esc(h)}</span></li>`).join("")}</ul></div>`:""}
    <div class="card"><span class="eyebrow">Mon exercice de langue du jour</span><h3>${esc(e.t)}</h3><p class="note">${esc(e.dose)} · ${esc(e.freq)}</p><button class="btn ghost" type="button" data-go="langue">Mes exercices</button></div>`;
}

/* ─── Mon espace ─── */
function renderEspace(){
  P=lire();
  const v=$("#v-espace"),j=store.get("jeux",null)||{},badges=Array.isArray(j.badges)?j.badges:[],ex=jour(),faits=EX.filter(e=>exFait(ex,e)).length;
  v.innerHTML=`<div class="hero"><span class="eyebrow">Mon espace</span><div class="moi"><span class="avatar">${avatarHTML(P.avatar)}</span><h2>${P.prenom?esc(P.prenom):"Moi"}</h2></div></div>
    <div class="card prive"><b>Tout reste dans ton téléphone.</b><p>Rien n'est envoyé sur internet : ni à nous, ni aux statistiques.</p></div>
    <div class="card"><label for="esPrenom">Mon prénom<input id="esPrenom" type="text" maxlength="30" autocomplete="off" value=""></label>
      <span class="etiquette">Mon avatar</span><div class="avatars">${AVATARS.map(a=>`<button type="button" class="avatar choix-av" data-av="${a[0]}" aria-pressed="${P.avatar===a[0]}" aria-label="${esc(a[1])}">${avatarHTML(a[0])}</button>`).join("")}</div></div>
    ${P.appareils.filter(a=>SUIVIS[a]).map(a=>carteSuivi(a)).join("")}
    ${P.appareils.includes("gouttieres")?`<div class="card suivi"><h3>Mes gouttières</h3>${ligneGouttiere()}<button class="btn ghost" type="button" data-go="gouttiere">Régler mon suivi</button>${joursAligneur()?blocRappel("gouttieres"):`<p class="note">Enregistre ta prescription dans ton suivi pour ajouter un rappel.</p>`}</div>`:""}
    <div class="card"><h3>Mes appareils</h3>${grilleAppareils(P.appareils)}<button class="btn ghost" type="button" id="esApp">Enregistrer mes appareils</button></div>
    <div class="card"><h3>Mes dates</h3><label for="esPose">Date de pose<input id="esPose" type="date" value="${esc(P.pose)}"></label><label for="esRdv">Prochain rendez-vous<input id="esRdv" type="date" value="${esc(P.rdv)}"></label></div>
    <div class="card"><h3>Mes exercices</h3><p class="stars">${faits} exercice${faits>1?"s":""} fait${faits>1?"s":""} aujourd'hui</p><button class="btn ghost" type="button" data-go="langue">Voir mes exercices</button></div>
    <div class="card"><h3>Mes badges et mes scores</h3><p class="stars">${+j.points||0} points · ${+j.serie||0} jour${(+j.serie||0)>1?"s":""} de suite</p>${badges.length?`<ul class="list">${badges.filter(b=>BADGES_JEUX[b]).map(b=>`<li><span><b>${esc(BADGES_JEUX[b][0])}</b> : ${esc(BADGES_JEUX[b][1])}</span></li>`).join("")}</ul>`:`<p>Pas encore de badge. Lance-toi !</p>`}<button class="btn ghost" type="button" data-go="jeux">Aller aux jeux</button></div>
    <div class="card"><label for="esNotes">Mes notes pour le prochain rendez-vous<textarea id="esNotes" rows="4" maxlength="2000"></textarea></label><p class="note">Pas de photo ni d'information sur une autre personne. Tes notes restent sur ce téléphone.</p></div>
    <div class="card"><h3>Sauvegarder ou restaurer</h3><p>Si tu changes de téléphone, garde ce petit fichier. Il contient tes informations : ne le partage pas.</p><button class="btn ghost" type="button" id="esSauve">Sauvegarder</button><label class="btn ghost" for="esFichier">Restaurer<input id="esFichier" type="file" accept=".json,application/json" hidden></label><p class="note" id="esMsg" role="status"></p></div>
    <button class="vlink efface" type="button" id="esEfface">Tout effacer sur ce téléphone</button>`;
  $("#esPrenom").value=P.prenom;$("#esNotes").value=P.notes||"";
  $("#esPrenom").onchange=e=>{P.prenom=e.target.value.trim().slice(0,30);sauver();renderEspace();renderAccueil()};
  $("#esPose").onchange=e=>{P.pose=e.target.value;sauver()};
  $("#esRdv").onchange=e=>{P.rdv=e.target.value;sauver();renderEspace();renderAccueil()};
  $("#esNotes").oninput=e=>{P.notes=e.target.value;sauver()};
  v.querySelector(".apps").onclick=e=>{const b=e.target.closest("[data-coche]");if(b)basculer(b)};
  $("#esApp").onclick=()=>{P.appareils=[...v.querySelectorAll('[data-coche][aria-pressed="true"]')].map(x=>x.dataset.coche);P.etat=P.appareils.length?"patient":(P.etat==="patient"?"aucun":P.etat);sauver();renderEspace();renderAccueil();trierUrgences()};
  $("#esSauve").onclick=()=>{const d={};CLES.forEach(k=>{const x=store.get(k,null);if(x!==null)d[k]=x});telecharger(JSON.stringify({appli:"heroines-du-sourire",version:1,date:auj(),donnees:d},null,1),"mon-espace-"+auj()+".json","application/json")};
  $("#esFichier").onchange=e=>{const f=e.target.files[0];if(!f)return;const msg=$("#esMsg");
    if(f.size>1e6){msg.textContent="Ce fichier est trop gros.";return}
    f.text().then(t=>{const o=JSON.parse(t);if(!o||o.appli!=="heroines-du-sourire"||!o.donnees||typeof o.donnees!=="object")throw 0;
      CLES.forEach(k=>{if(k in o.donnees){const v=ASSAINIR[k](o.donnees[k]);if(v!==null)store.set(k,v)}});location.reload()}).catch(()=>{msg.textContent="Ce fichier n'est pas une sauvegarde de l'appli. Rien n'a été changé."})};
  $("#esEfface").onclick=()=>{if(confirm("Tout effacer sur ce téléphone ? Ton prénom, tes appareils, tes suivis et tes badges seront supprimés."))try{CLES.forEach(k=>localStorage.removeItem(k));location.href="#";location.reload()}catch(e){}};
}
function rafraichir(){renderAccueil();if(!$("#v-espace").hidden)renderEspace()}
document.addEventListener("click",e=>{
  const t=e.target,a=t.closest("[data-av]"),tr=t.closest("[data-tour]"),an=t.closest("[data-annule]"),vi=t.closest("[data-vis]"),mo=t.closest("[data-moment]"),ra=t.closest("[data-rappel]"),fi=t.closest("[data-fiche]");
  if(a){P.avatar=a.dataset.av;sauver();rafraichir();return}
  if(tr){const id=tr.dataset.tour,s=etatSuivi(id);s.tours.push(auj());sauver();rafraichir();
    if(s.prevu&&s.tours.length>=s.prevu)toast("Stop ! Plus de tour de clé avant ton rendez-vous.",true);else toast(SUIVIS[id].jours===1?"Tour de clé noté. C'est tout pour aujourd'hui !":"Tour de clé noté. C'est tout pour cette semaine !");return}
  if(an){const s=etatSuivi(an.dataset.annule);if(confirm("Annuler le dernier tour de clé ?")){s.tours.pop();sauver();rafraichir()}return}
  if(vi){etatSuivi(vi.dataset.vis).vis=true;(P.proposer=P.proposer||[]).push(vi.dataset.vis);sauver();rafraichir();return}
  if(mo){const i=mo.closest(".rappel").querySelector("input[type=time]");if(i)i.value=mo.dataset.h;mo.parentElement.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b===mo)));return}
  if(ra){const id=ra.dataset.rappel,h=ra.closest(".rappel").querySelector("input[type=time]").value||"19:00",c=fichierICS(id,h);if(!c)return;(P.rappels=P.rappels||{})[id]=h;P.proposer=(P.proposer||[]).filter(x=>x!==id);sauver();telecharger(c,"rappel-"+id+".ics","text/calendar;charset=utf-8");return}
  if(fi){go("conseils");showApp(fi.dataset.fiche)}
});
document.addEventListener("change",e=>{const p=e.target.closest&&e.target.closest("[data-prevu]");if(p){const n=parseInt(p.value,10);etatSuivi(p.dataset.prevu).prevu=n>0?n:null;sauver();rafraichir()}});
$("#wearYes").addEventListener("click",bravo);

/* ─── Urgences : les siennes d'abord ─── */
const URG=[
  {apps:["bagues","carriere"],mots:"fil pique piquer picote pointe joue griffe frotte blesse blessure cire arc ferraille"},
  {apps:["bagues","carriere"],mots:"bague attache decollee decole decolle tombee tombe partie boitier bracket"},
  {apps:["gouttieres","carriere"],mots:"gouttiere goutiere gouttier aligneur perdu perdue perd casse cassee fendue"},
  {apps:["disjoncteur"],mots:"rate manque rendez vous rdv disjoncteur dijoncteur"},
  {apps:["disjoncteur"],mots:"disjoncteur dijoncteur disjonteur mal douleur"},
  {apps:null,mots:"mal douleur sensible souffre gene reglage pression"},
  {apps:["disjoncteur","plaque","pul","activateur","eln","bagues","carriere"],mots:"bouge bouger tient decroche descelle detache appareil disjoncteur dijoncteur"}
];
const NOIR=new Set("ca ma mon mes le la les un une de du des je j ai a et il elle est me sur au en pour qui que ne pas ton ta fait tres trop fort beaucoup".split(" "));
const norm=s=>s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
function dist(a,b){const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
function scoreMot(q,mots){let m=0;for(const w of mots){if(w===q)return 3;if(q.length>=3&&w.startsWith(q))m=Math.max(m,2);else if(q.length>=4&&Math.abs(w.length-q.length)<=2&&dist(q,w)<=(q.length>=7?2:1))m=Math.max(m,2)}return m}
let lignesUrg=[];
function preparerUrgences(){
  const pile=$("#v-urgences .stack");
  lignesUrg=[...pile.querySelectorAll("details.emerg")].map((el,i)=>({el,i,mots:[...new Set(norm(URG[i].mots+" "+el.querySelector("summary").textContent).split(" "))],apps:URG[i].apps}));
  const box=document.createElement("div");box.className="recherche";
  box.innerHTML=`<label for="urgQ">Que se passe-t-il ? Tapez un mot.<input id="urgQ" type="search" autocomplete="off" placeholder="Fil, bague, perdu, mal…"></label><p class="note" id="urgMsg" role="status" hidden></p>`;
  pile.before(box);
  $("#urgQ").addEventListener("input",e=>chercher(e.target.value));
  trierUrgences();
}
/* Pas de consigne « gouttière » pour ces appareils */
const AUTRES=["plaque","activateur","pul","eln","masque","elastique","elastiques","disjoncteur","dijoncteur"];
/* Ces mots passent avant tout : encadré Vraie urgence, sans ouvrir de conseil */
const GRAVES=norm("choc coup accident gonfle gonflement gonflee gonfler visage fievre").split(" ");
const CALL=norm("choc coup accident gonfle gonflement gonflee visage fievre nuit soir week end ferie urgence").split(" ");
function chercher(txt){
  const qs=norm(txt).split(" ").filter(w=>w&&!NOIR.has(w)),msg=$("#urgMsg"),call=$("#v-urgences .call");
  call.classList.remove("vise");
  if(!qs.length){lignesUrg.forEach(l=>{l.el.hidden=false;l.el.open=false;l.el.querySelector("summary");});msg.hidden=true;trierUrgences();return}
  const mes=lire().appareils,miens=l=>l.apps&&l.apps.some(a=>mes.includes(a));
  /* À score égal : d'abord ses appareils, puis la réponse générale */
  const notes=lignesUrg.map(l=>{const b=qs.reduce((t,q)=>t+scoreMot(q,l.mots),0);const sansConsigne=l.i===2&&qs.some(q=>AUTRES.includes(q));return{l,s:b&&!sansConsigne?b+(l.apps?0:.5)+(miens(l)?(l.i===4?.75:.25):0):0}});
  const max=Math.max(...notes.map(n=>n.s));
  const vraie=qs.reduce((t,q)=>t+(q.length>=4||CALL.includes(q)?scoreMot(q,CALL):0),0);
  const grave=qs.some(q=>q.length>=3&&GRAVES.some(g=>g===q||(q.length>=4&&g.startsWith(q))))||(qs.includes("dent")||qs.includes("dents"))&&qs.some(q=>/^(cass|tomb)/.test(q));
  notes.forEach(n=>{n.l.el.hidden=n.s===0;n.l.el.open=false});
  if(max>0&&!grave)notes.filter(n=>n.s===max).sort((a,b)=>a.l.i-b.l.i)[0].l.el.open=true;
  if(vraie>0||grave)call.classList.add("vise");
  if(grave){msg.hidden=false;msg.textContent="Vraie urgence : regardez l'encadré ci-dessous."}
  else if(max===0){lignesUrg.forEach(l=>{l.el.hidden=false});msg.hidden=false;msg.textContent=vraie>0?"Regardez l'encadré « Vraie urgence » juste en dessous.":"Je n'ai pas de réponse pour cela ici. Regardez la liste, ou appelez le cabinet."}else{msg.hidden=vraie===0;msg.textContent=vraie>0?"Regardez aussi l'encadré « Vraie urgence ».":""}
}
function trierUrgences(){
  const mes=lire().appareils,pile=$("#v-urgences .stack");if(!pile||!lignesUrg.length)return;
  const miens=l=>l.apps&&l.apps.some(a=>mes.includes(a));
  [...lignesUrg].sort((a,b)=>(miens(b)-miens(a))||a.i-b.i).forEach(l=>{l.el.querySelector(".pour-toi")?.remove();pile.appendChild(l.el);
    if(miens(l))l.el.querySelector("summary").insertAdjacentHTML("afterbegin",`<span class="pour-toi">Pour vous</span>`)});
}

/* ─── Démarrage ─── */
window.BADGES_JEUX=Object.assign(window.BADGES_JEUX||{},{premier:["Premier jeu","Un jeu terminé"],
  defi:["Défi relevé","Un défi du jour relevé"],
  langue:["Langue en forme","Défi de la langue fait"],
  brossage:["Mission réussie","Toutes les zones sont brossées"],
  quiz:["Expert du quiz","3 étoiles au quiz expert"],
  curieux:["Curieux","5 jeux différents terminés"],
  explorateur:["Explorateur","Les 11 jeux terminés"],
  serie3:["3 jours de suite","3 jours de suite"],
  serie7:["7 jours de suite","7 jours de suite"],
  journee:["Journée parfaite","Tous les exercices du jour sont faits"]});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!$("#v-bienvenue").hidden)return;if(!document.hidden)rafraichir()});
window.Espace={trierUrgences,bravo,journee,renderEspace,renderAccueil,afficherBienvenue,fichierICS,chercher,toast};
preparerUrgences();renderAccueil();
const h=location.hash.slice(1);
if(!lire().etat&&(!h||h==="accueil"))afficherBienvenue();
else if(h==="espace")renderEspace();
else if(h==="bienvenue")go("accueil");
})();
