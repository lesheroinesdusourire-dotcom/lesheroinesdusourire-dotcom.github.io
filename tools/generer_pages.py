#!/usr/bin/env python3
"""Fabrique les pages pour Google à partir de index.html et partenaires.js.
Lancer depuis le dossier du projet : python3 tools/generer_pages.py
Ne jamais modifier à la main les pages produites : elles seraient écrasées."""
import base64, html, json, os, re, shutil
from datetime import date

# Pour un nom de domaine : changer cette adresse (voir docs/nom-de-domaine.md).
SITE = "https://lesheroinesdusourire.fr"
# Code donné par Google Search Console (méthode « Balise HTML »), à coller ici.
GOOGLE_VERIFICATION = ""

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOM = "Les Héroïnes du Sourire"
e = lambda t: html.escape(str(t), quote=True)

src = open(os.path.join(ROOT, "index.html"), encoding="utf8").read()
APPS = json.loads(re.search(r"const APPS=(\[.*?\]);\n", src, re.S).group(1))
EPS = json.loads(re.search(r"const EPS=(\[.*?\]);\n", src, re.S).group(1))
NIVEAUX = json.loads(re.search(r"const NIVEAUX=(\[.*?\]);\n", src, re.S).group(1))
part = open(os.path.join(ROOT, "partenaires.js"), encoding="utf8").read()

def cabinet(ville):
    for ligne in part.splitlines():
        if 'type:"cabinet"' in ligne and f'ville:"{ville}"' in ligne:
            return dict(re.findall(r'(\w+):"([^"]*)"', ligne)) | dict(re.findall(r'(lat|lng):([\d.]+)', ligne))
    raise SystemExit("Cabinet introuvable : " + ville)

CABINETS = [
    {"slug": "le-chesnay-rocquencourt", "doc": "Dr Johana Lichaa", "doctolib": "https://www.doctolib.fr/dentiste/le-chesnay-rocquencourt/johana-lichaa", **cabinet("Le Chesnay-Rocquencourt")},
    {"slug": "villeneuve-le-roi", "doc": "Dr Clara Salem Melloul", "doctolib": "https://www.doctolib.fr/orthodontiste/villeneuve-le-roi/clara-salem-melloul", **cabinet("Villeneuve-le-Roi")},
]

def schema(c):
    return {"@context": "https://schema.org", "@type": "Dentist", "name": f"Cabinet d'orthodontie {c['doc']}",
            "url": f"{SITE}/cabinets/{c['slug']}/", "telephone": c["tel"],
            "address": {"@type": "PostalAddress", "streetAddress": c["adresse"], "postalCode": c["cp"], "addressLocality": c["ville"], "addressCountry": "FR"},
            "geo": {"@type": "GeoCoordinates", "latitude": float(c["lat"]), "longitude": float(c["lng"])},
            "sameAs": [c["doctolib"]]}

def jsonld(o):
    return '<script type="application/ld+json">' + json.dumps(o, ensure_ascii=False).replace("</", "<\\/") + "</script>"

pages = []  # adresses pour le sitemap

def page(chemin, titre, description, corps, h1, extra="", app="", photo=""):
    assert titre not in {p[1] for p in pages}, titre
    assert description not in {p[2] for p in pages}, description
    prof = chemin.count("/")
    base = "../" * prof
    pages.append((chemin, titre, description))
    rdv = "".join(f'<a class="btn" href="{e(c["doctolib"])}" rel="noopener">Rendez-vous {e(c["doc"])}<small>{e(c["cp"])} {e(c["ville"])}</small></a>' for c in CABINETS)
    verif = f'<meta name="google-site-verification" content="{e(GOOGLE_VERIFICATION)}">\n' if GOOGLE_VERIFICATION else ""
    og = f'<meta property="og:image" content="{SITE}/{photo}">\n' if photo else ""
    contenu = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(titre)}</title>
<meta name="description" content="{e(description)}">
<link rel="canonical" href="{SITE}/{chemin}">
{verif}<meta property="og:title" content="{e(titre)}">
<meta property="og:description" content="{e(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{SITE}/{chemin}">
{og}<meta name="theme-color" content="#5A22C4">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700&display=swap">
<link rel="stylesheet" href="{base}pages.css">
{extra}</head>
<body>
<header><a class="logo" href="{base}">{NOM}</a></header>
<main>
<nav class="fil" aria-label="Fil d'Ariane"><a href="{base}">Accueil</a>{"" if prof < 2 or not chemin.startswith("appareils/") else f' › <a href="{base}appareils/">Les appareils</a>'} › {e(h1)}</nav>
<h1>{e(h1)}</h1>
{corps}
<section class="carte"><h2>Prendre rendez-vous</h2>{rdv}</section>
<a class="btn clair" href="{base}{app}">Ouvrir l'appli patients</a>
</main>
<footer><nav aria-label="Toutes les pages"><a href="{base}appareils/">Les appareils</a> · <a href="{base}urgences-orthodontiques/">Urgences</a> · <a href="{base}reeducation-langue/">Rééducation de la langue</a> · <a href="{base}videos-orthodontie/">Vidéos</a> · <a href="{base}jeux-orthodontie/">Jeux</a> · <a href="{base}cabinets/le-chesnay-rocquencourt/">Orthodontiste au Chesnay-Rocquencourt</a> · <a href="{base}cabinets/villeneuve-le-roi/">Orthodontiste à Villeneuve-le-Roi</a></nav></footer>
</body>
</html>
'''
    dossier = os.path.join(ROOT, chemin)
    os.makedirs(dossier, exist_ok=True)
    open(os.path.join(dossier, "index.html"), "w", encoding="utf8").write(contenu)

def liste(items, cls=""):
    return f'<ul{cls}>' + "".join(f"<li>{e(x)}</li>" for x in items) + "</ul>"

# Dossiers fabriqués : repartir de zéro à chaque fois
for d in ["appareils", "cabinets", "urgences-orthodontiques", "reeducation-langue", "videos-orthodontie", "jeux-orthodontie"]:
    shutil.rmtree(os.path.join(ROOT, d), ignore_errors=True)

# Photos des appareils en fichiers légers pour les pages
photos = os.path.join(ROOT, "images", "appareils")
os.makedirs(photos, exist_ok=True)
for a in APPS:
    m = re.match(r"data:image/(\w+);base64,(.*)", a["img"], re.S)
    a["fichier"] = f"images/appareils/{a['id']}.jpg"
    open(os.path.join(ROOT, a["fichier"]), "wb").write(base64.b64decode(m.group(2)))

# ─── Appareils ─── mots-clés propres à chaque appareil
SEO = {
    "gouttieres": ("Gouttières d'orthodontie (aligneurs transparents) : conseils", "Gouttières transparentes : à quoi elles servent, 22 h sur 24, nettoyage et règles à suivre. Les conseils de vos orthodontistes au Chesnay et à Villeneuve-le-Roi."),
    "bagues": ("Bagues dentaires : brossage, aliments à éviter et conseils", "Appareil fixe : comment brosser ses bagues, quels aliments éviter et que faire si une bague se décolle. Conseils de vos orthodontistes."),
    "elastiques": ("Élastiques d'orthodontie : quand et comment les changer", "Élastiques orthodontiques : à quoi ils servent, quand les changer et pourquoi ne jamais les doubler. Les règles expliquées simplement aux patients."),
    "carriere": ("Appareil Carrière : à quoi il sert et comment le porter", "Appareil Carrière : son rôle pour les dents du fond, le port des élastiques et de la gouttière, et les consignes de brossage."),
    "plaque": ("Plaque orthodontique : activation, port et entretien", "Plaque orthodontique avec vis : à quoi elle sert, comment l'activer, l'entretenir et la ranger. Conseils pour les enfants et les parents."),
    "activateur": ("Activateur orthodontique : durée de port et entretien", "Activateur : comment il aide la mâchoire du bas à grandir, combien d'heures le porter et comment l'entretenir. Conseils pour les parents."),
    "pul": ("Appareil PUL en orthodontie : port, règles et entretien", "Appareil PUL : son rôle pour la mâchoire du bas, quand le porter, quand l'enlever et comment l'entretenir au quotidien."),
    "disjoncteur": ("Disjoncteur chez l'enfant : tours de clé et conseils", "Disjoncteur enfant : à quoi il sert, comment tourner la clé, ce qui est normal et comment l'entretenir. Les réponses de vos orthodontistes."),
    "eln": ("ELN, enveloppe linguale nocturne : port et conseils", "Enveloppe linguale nocturne (ELN) : apprendre à bien avaler, durée de port, entraînement et entretien de l'appareil."),
}
EPMAP = json.loads(re.search(r"const EPMAP=(\{.*?\});", src).group(1))
for a in APPS:
    t, d = SEO[a["id"]]
    c = f'<p class="intro">{e(a["sous"])}</p><img class="photo" src="../../{a["fichier"]}" alt="Photo : {e(a["nom"])}" width="800" height="600" loading="lazy">'
    c += f'<section class="carte"><h2>À quoi ça sert ?</h2><p>{e(a["obj"])}.</p><h2>Quand le porter ?</h2><p>{e(a["quand"])}.</p></section>'
    c += f'<section class="carte"><h2>À retenir</h2>{liste(a["regles"])}</section>'
    if a["non"]:
        c += f'<section class="carte"><h2>À éviter</h2>{liste(a["non"])}</section>'
    if a["ent"]:
        c += f'<section class="carte"><h2>Entretien</h2><p>{e(a["ent"])}</p></section>'
    c += f'<section class="or"><h2>La règle d\'or</h2><p>{e(a["gold"])}.</p></section>'
    if a["perte"]:
        c += f'<p class="note">{e(a["perte"])}</p>'
    page(f"appareils/{a['id']}/", f"{t} | {NOM}", d, c, a["nom"], app="#conseils", photo=a["fichier"])

grille = '<div class="grille">' + "".join(f'<a class="tuile" href="{a["id"]}/"><img src="../{a["fichier"]}" alt="" loading="lazy"><b>{e(a["nom"])}</b><span>{e(a["sous"])}</span></a>' for a in APPS) + "</div>"
page("appareils/", f"Les appareils d'orthodontie expliqués aux parents | {NOM}", "Gouttières, bagues, disjoncteur, plaque, activateur, PUL, ELN : à quoi sert chaque appareil d'orthodontie et comment bien le porter.", '<p class="intro">Touchez un appareil pour voir à quoi il sert et ses règles.</p>' + grille, "Les appareils d'orthodontie", app="#conseils")

# ─── Rubriques : les textes viennent de la page principale ───
urg = re.search(r'<section class="view" id="v-urgences".*?</section>', src, re.S).group(0)
hero_p = re.search(r"<h2>.*?</h2><p>(.*?)</p>", urg, re.S).group(1)
corps = f'<p class="intro">{hero_p}</p>'
for m in re.finditer(r'<details[^>]*><summary>(.*?)</summary><div>(.*?)</div></details>', urg, re.S):
    corps += f'<section class="carte"><h2>{m.group(1)}</h2>{m.group(2)}</section>'
call = re.search(r'<div class="call">(.*?)</div>', urg, re.S).group(1).replace("<strong>", "<h2>").replace("</strong>", "</h2>")
corps += f'<section class="urgent">{call}</section>'
page("urgences-orthodontiques/", f"Urgences orthodontiques : que faire si… | {NOM}", "Fil qui pique, bague décollée, gouttière perdue, douleur : que faire tout de suite, et quand appeler le cabinet ou le 15.", corps, "Urgences orthodontiques : que faire si…", app="#urgences")

lang = re.search(r'<section class="view" id="v-langue".*?</section>', src, re.S).group(0)
intro = re.search(r"<h2>.*?</h2><p>(.*?)</p>", lang, re.S).group(1)
cles = re.search(r'<ol class="keys">(.*?)</ol>', lang, re.S).group(1)
corps = f'<p class="intro">{intro}</p><section class="carte"><h2>Bien avaler en 3 clés</h2><ol>{cles}</ol></section>'
for x in NIVEAUX:
    corps += f'<section class="carte"><h2>{e(x["nom"])} : {e(x["quand"])}</h2><p>Objectif : {e(x["but"])}</p>'
    for ex in x["ex"]:
        al = f' ({e(ex["alias"])})' if ex["alias"] else ""
        corps += f'<h3>{ex["n"]}. {e(ex["t"])}{al}</h3><p>{e(ex["d"])}</p><p class="note">{e(ex["dose"])} · {e(ex["freq"])}</p>'
    corps += "</section>"
page("reeducation-langue/", f"Rééducation de la langue : 21 exercices | {NOM}", "Bien placer la langue et bien avaler : les 3 clés et 21 exercices en 3 niveaux, du débutant à l'avancé, validés par vos orthodontistes.", corps, "Rééducation de la langue", app="#langue")

corps = '<p class="intro">Saison 1 du Royaume du Sourire : une série de 24 vidéos de 30 secondes, bientôt en ligne. Les appareils se présentent eux-mêmes.</p>'
for g in EPS:
    corps += f'<section class="carte"><h2>{e(g["g"])}</h2><ul>' + "".join(f'<li><b>{e(p["t"])}</b> : {e(p["d"])}</li>' for p in g["eps"]) + "</ul></section>"
page("videos-orthodontie/", f"Vidéos d'orthodontie pour les enfants : Le Royaume du Sourire | {NOM}", "Le Royaume du Sourire : 24 vidéos de 30 secondes, bientôt en ligne, pour comprendre l'orthodontie, les appareils, la langue et les bons gestes.", corps, "Le Royaume du Sourire", app="#videos")

JEUX = [("Le défi du jour", "60 secondes, et un nouveau défi chaque jour."), ("Mission brossage", "Brosser toutes les faces des dents."), ("Sauve tes bagues !", "Garder les bons aliments et écarter ceux qui abîment l'appareil."), ("Urgence orthodontique", "Choisir la bonne conduite."), ("Devine l'appareil", "Reconnaître un appareil à partir d'un détail."), ("Le bon aligneur", "Remettre les gouttières dans l'ordre."), ("Memory", "Associer chaque photo d'appareil à son nom."), ("Puzzle des appareils", "Assembler les pièces pour découvrir un appareil."), ("Vrai ou faux", "Un quiz à niveaux, avec une explication après chaque réponse."), ("Attrape les bonnes habitudes", "Attraper la brosse et la brossette, éviter le soda."), ("La roue du sourire", "Une question, un défi d'hygiène ou un exercice de langue.")]
corps = '<p class="intro">Des jeux gratuits pour apprendre à prendre soin de son appareil. Les réponses viennent des fiches du cabinet. La progression reste sur le téléphone, sans compte.</p><section class="carte"><ul>' + "".join(f"<li><b>{e(a)}</b> : {e(b)}</li>" for a, b in JEUX) + "</ul></section>"
page("jeux-orthodontie/", f"Jeux d'orthodontie gratuits pour les enfants | {NOM}", "Quiz, memory, puzzle et défi du jour : 11 jeux gratuits pour apprendre à bien s'occuper de son appareil dentaire, sans compte.", corps, "Les jeux", app="#jeux")

# ─── Cabinets ───
for c, titre, desc, h1 in (
    (CABINETS[0], "Orthodontiste au Chesnay-Rocquencourt : Dr Johana Lichaa", "Dr Johana Lichaa, orthodontiste au Chesnay-Rocquencourt (78150) : adresse, téléphone et rendez-vous en ligne sur Doctolib, pour enfants et adultes.", "Orthodontiste au Chesnay-Rocquencourt"),
    (CABINETS[1], "Orthodontiste à Villeneuve-le-Roi : Dr Clara Salem Melloul", "Dr Clara Salem Melloul, orthodontiste à Villeneuve-le-Roi (94290) : adresse, téléphone et rendez-vous en ligne sur Doctolib, pour enfants et adultes.", "Orthodontiste à Villeneuve-le-Roi"),
):
    adresse = f"{c['adresse']}, {c['cp']} {c['ville']}"
    tel = re.sub(r"\D", "", c["tel"])
    corps = f'<p class="intro">{e(c["doc"])} vous accueille dans son cabinet d&#39;orthodontie.</p><section class="carte"><h2>Le cabinet</h2><p>{e(c["doc"])}<br>{e(c["adresse"])}<br>{e(c["cp"])} {e(c["ville"])}</p><p>Téléphone : <a href="tel:{tel}">{e(c["tel"])}</a></p>'
    corps += f'<a class="btn clair" href="https://www.google.com/maps/dir/?api=1&amp;destination={e(adresse.replace(" ", "%20").replace(",", "%2C"))}" rel="noopener">Itinéraire</a></section>'
    corps += '<section class="carte"><h2>Pour vous aider pendant le traitement</h2><p><a href="../../appareils/">Les appareils</a>, <a href="../../urgences-orthodontiques/">les urgences</a>, <a href="../../reeducation-langue/">la rééducation de la langue</a> et <a href="../../jeux-orthodontie/">les jeux</a>.</p></section>'
    page(f"cabinets/{c['slug']}/", f"{titre} | {NOM}", desc, corps, h1, extra=jsonld(schema(c)) + "\n", app="#contact")

# ─── Page principale : adresse officielle, données structurées, code Google ───
index = src
index = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{SITE}/">', index, count=1)
bloc = "<!-- DONNEES-STRUCTUREES -->" + jsonld({"@context": "https://schema.org", "@graph": [schema(c) for c in CABINETS]}) + "<!-- /DONNEES-STRUCTUREES -->"
index, n = re.subn(r"<!-- DONNEES-STRUCTUREES -->(?:.*?<!-- /DONNEES-STRUCTUREES -->)?", lambda m: bloc, index, count=1, flags=re.S)
assert n == 1
verif = "<!-- VERIFICATION-GOOGLE -->" + (f'<meta name="google-site-verification" content="{e(GOOGLE_VERIFICATION)}">' if GOOGLE_VERIFICATION else "") + "<!-- /VERIFICATION-GOOGLE -->"
index, n = re.subn(r"<!-- VERIFICATION-GOOGLE -->(?:.*?<!-- /VERIFICATION-GOOGLE -->)?", lambda m: verif, index, count=1, flags=re.S)
assert n == 1
open(os.path.join(ROOT, "index.html"), "w", encoding="utf8").write(index)

# ─── sitemap.xml et robots.txt ───
auj = date.today().isoformat()
urls = [""] + [p[0] for p in pages]
open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf8").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{SITE}/{u}</loc><lastmod>{auj}</lastmod></url>\n" for u in urls) + "</urlset>\n")
open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf8").write(
    f"User-agent: *\nAllow: /\nDisallow: /docs/\nDisallow: /tools/\nDisallow: /.claude/\nDisallow: /CLAUDE.md\n\nSitemap: {SITE}/sitemap.xml\n")
print(len(urls), "pages dans le sitemap")
