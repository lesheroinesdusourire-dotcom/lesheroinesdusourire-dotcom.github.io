/* Traductions FR / EN / ES. Le français reste la source : les textes affichés sont remplacés d'après i18n/en.js et i18n/es.js.
   Le choix de langue reste sur le téléphone. */
(function(){
var L=null,LANGUES=["fr","en","es"];
try{
  var q=new URLSearchParams(location.search).get("lang");
  if(LANGUES.indexOf(q)>=0){localStorage.setItem("langue",JSON.stringify(q));history.replaceState(null,"",location.pathname+location.hash)}
  L=JSON.parse(localStorage.getItem("langue"));
}catch(e){}
if(LANGUES.indexOf(L)<0)L="fr";
window.LANGUE=L;
window.LOCALE={fr:"fr-FR",en:"en-GB",es:"es-ES"}[L];
document.documentElement.lang=L;
window.TRAD={};window.TRAD_MOTIFS=[];
if(L!=="fr")document.write('<script src="i18n/'+L+'.js"><\/script>');
})();

/* Traduit un texte complet, ou un texte variable d'après les motifs ("Bonjour (.+) !") */
window.T=function(s){
  if(typeof s!=="string"||LANGUE==="fr")return s;
  var c=s.trim();if(!c)return s;
  if(Object.prototype.hasOwnProperty.call(TRAD,c))return s.replace(c,function(){return TRAD[c]});
  for(var i=0;i<TRAD_MOTIFS.length;i++){
    var m=c.match(TRAD_MOTIFS[i].re);
    if(m){var r=TRAD_MOTIFS[i].t.replace(/\$(\d)/g,function(_,n){return T(m[+n]||"")});return s.replace(c,function(){return r})}
  }
  return s;
};
(function(){
var ATTR=["placeholder","aria-label","alt","title"];
function texte(n){var v=n.nodeValue,t=T(v);if(t!==v)n.nodeValue=t}
function elem(el){
  if(el.closest&&el.closest("[data-sans-trad],script,style,textarea"))return;
  ATTR.forEach(function(a){if(el.hasAttribute(a)){var v=el.getAttribute(a),t=T(v);if(t!==v)el.setAttribute(a,t)}});
}
function parcourir(rac){
  if(rac.nodeType===3){if(!rac.parentElement||!rac.parentElement.closest("[data-sans-trad],script,style,textarea"))texte(rac);return}
  if(rac.nodeType!==1)return;
  elem(rac);
  rac.querySelectorAll("*").forEach(elem);
  var w=document.createTreeWalker(rac,NodeFilter.SHOW_TEXT),n;
  while(n=w.nextNode())if(!n.parentElement.closest("[data-sans-trad],script,style,textarea"))texte(n);
}
window.traduirePage=function(){parcourir(document.documentElement);document.title=T(document.title)};
if(LANGUE!=="fr"){
  new MutationObserver(function(ms){ms.forEach(function(m){
    if(m.type==="characterData")parcourir(m.target);
    else if(m.type==="attributes")elem(m.target);
    else m.addedNodes.forEach(parcourir);
  })}).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTR});
}
/* Bouton de langue, en haut de l'appli */
document.addEventListener("DOMContentLoaded",function(){
  var b=document.createElement("nav");b.className="langues";b.setAttribute("aria-label","Langue");b.setAttribute("data-sans-trad","");
  ["fr","en","es"].forEach(function(k){var a=document.createElement("button");a.type="button";a.textContent=k.toUpperCase();a.lang=k;a.setAttribute("aria-pressed",String(k===LANGUE));
    a.addEventListener("click",function(){if(k===LANGUE)return;try{localStorage.setItem("langue",JSON.stringify(k))}catch(e){}location.reload()});b.appendChild(a)});
  var w=document.querySelector(".wrap");w.insertBefore(b,w.firstChild);
  if(LANGUE!=="fr"){
    var p=document.createElement("p");p.className="note trad-note";p.textContent="Traduction en cours de relecture. En cas de doute, appelez le cabinet.";w.insertBefore(p,b.nextSibling);
    var v=document.querySelector("#v-videos .hero");if(v){var q=document.createElement("p");q.className="note";q.textContent="Les vidéos sont en français pour l'instant.";v.appendChild(q)}
    traduirePage();
  }
});
})();
