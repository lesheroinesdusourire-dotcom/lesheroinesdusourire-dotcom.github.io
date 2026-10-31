# Les Héroïnes du Sourire — appli patients

## Le projet
Appli web pour les patients en orthodontie (enfants et adultes), ouverte avec un QR code au cabinet.
- Docteures : **Dr Johana Lichaa** (Le Chesnay-Rocquencourt et Herblay-sur-Seine) et **Dr Clara Salem Melloul** (Villeneuve-le-Roi).
- Site en ligne : https://lesheroinesdusourire-dotcom.github.io
- Dépôt GitHub : `lesheroinesdusourire-dotcom/lesheroinesdusourire-dotcom.github.io` (compte GitHub du cabinet, email lesheroinesdusourire@gmail.com). Le compte `drlichaa` est collaborateur.
- Hébergement : GitHub Pages, branche `main`, dossier racine. Un `git push` sur `main` met le site à jour en 1 à 2 minutes.

## Comment c'est construit
- **Page principale : `index.html`** (HTML + CSS + JavaScript dans le même fichier). Pas de framework, pas de build.
- **`partenaires.js`** : le tableau `PARTENAIRES`, les points de la carte (cabinets, kinés, orthophonistes).
- **`jeux.js`, `jeux.css`, `jeux-donnees.js`** : la rubrique Jeux. Toutes les questions sont dans `jeux-donnees.js`, avec leur source. Rien d'inventé.
- **`pages.css`, `tools/generer_pages.py`** : les pages pour Google. Après tout changement d'une fiche, d'un exercice, d'une adresse ou d'un téléphone, lancer `python3 tools/generer_pages.py`. Ne jamais modifier à la main les dossiers `appareils/`, `cabinets/`, `urgences-orthodontiques/`, `reeducation-langue/`, `videos-orthodontie/`, `jeux-orthodontie/`, ni `sitemap.xml` et `robots.txt`.
- **`images/`** : photos des docteures et `images/personnages/` pour les personnages des vidéos (mode d'emploi dans `images/README.md`).
- Les photos des appareils sont intégrées dans le fichier (images en base64, viennent du document de recommandations du cabinet du Chesnay).
- Dépendances externes : `qrcode-generator` 1.4.4 (cdnjs) pour le QR code, Leaflet 1.9.4 (cdnjs, chargé à l'ouverture de l'onglet Carte) avec le fond de carte OpenStreetMap, et les polices Google Fonts (Fredoka pour les titres, Nunito Sans pour le texte).
- `.nojekyll` : empêche GitHub de transformer le site.
- Couleurs : toutes en variables CSS dans `:root` (thème clair) + thème sombre automatique. Univers du Royaume du Sourire : fond violet, violet `--accent` pour les actions, bulles `--coral`, `--sun`, `--teal`, jaune `--sun` pour les « règles d'or », rouge `--alert` pour les urgences. Les animations s'arrêtent si le téléphone demande moins d'animations.
- Mobile d'abord : barre fixée en bas, 6 onglets maximum (Accueil, Appareils, Langue, Urgences, Carte, Plus). Les autres rubriques sont sur l'accueil et dans « Plus ». Une vue à la fois. Navigation par `#nom-de-vue` dans l'adresse.

## Les vues (sections `<section class="view" id="v-…">`)
1. **accueil** : grande illustration, titre, carte « Prendre rendez-vous » (2 boutons Doctolib, tableau `DOCS` : code postal et photo ronde, ou initiales si `photo` est vide), tuiles vers toutes les rubriques.
2. **gouttiere** : suivi des aligneurs (date de pose, rythme 7/10/14 jours, nombre total) → numéro de gouttière actuel et jours avant le prochain changement. Série « j'ai porté mes gouttières 22 h ». Données gardées dans le navigateur du patient (localStorage).
3. **conseils** (onglet « Appareils ») : grille de 9 appareils avec photo et personnage (tableau `PERSOS`) → fiche simple. Données dans le tableau JavaScript `APPS` (champs : `nom`, `sous`, `obj` = à quoi ça sert, `quand`, `regles`, `non` = à éviter, `ent` = entretien, `gold` = règle d'or, `perte` = prix si perdu, `img`).
4. **videos** : « Le Royaume du Sourire », saison 1 = 24 vidéos de 30 s. Données dans `EPS` (groupes → épisodes `n`, `t`, `who`, `d`, `video`). **Pour ajouter une vidéo : mettre l'adresse d'intégration dans `video`** (ex. `https://www.youtube.com/embed/ID`) → la vidéo s'affiche à la place du badge « Bientôt ». `EPMAP` relie chaque appareil à son épisode (bouton « Voir la vidéo de cet appareil »).
5. **urgences** : que faire si… (fil qui pique, bague décollée, gouttière perdue, douleur, disjoncteur : rendez-vous raté = arrêter les tours de clé, mail secretariat.lichaa@gmail.com si douleur forte). Vraie urgence → cabinet, ou le 15 le soir/week-end.
6. **langue** : les 3 clés pour bien avaler + 21 exercices validés en 3 niveaux (tableau `NIVEAUX`, textes copiés de `docs/exercices-langue.md`, à ne pas changer). Minuteur avec son de fin ou compteur à taper, une case par séance du jour (« 2 à 3 fois » = 3 cases, exercice fait à 2), champ `video` pour la future démonstration. Progression du jour dans le navigateur. Pour une fourchette (ex. « 10 à 15 »), l'objectif de l'appli est le bas de la fourchette : `s`, `but` et `max` dans `NIVEAUX`.
7. **contact** : une carte par docteure avec bouton Doctolib. Dr Johana : adresse du cabinet du Chesnay (44 ter bd Saint-Antoine, 78150 Le Chesnay-Rocquencourt), horaires, itinéraire. Dr Clara : adresse, téléphone, itinéraire. QR code de l'appli.
8. **carte** : carte Leaflet + OpenStreetMap. Les cabinets sont toujours affichés. Filtres « Kinés en rééducation linguale » (avec bouton vers l'annuaire SIKLOMF) et « Orthophonistes partenaires ». Toucher un point montre le nom, la profession, l'adresse, le téléphone et un bouton Itinéraire. Les mêmes fiches sont listées sous la carte.
9. **bruxisme** et **apnee** : fiches c'est quoi, signes, ce qu'on peut faire, quand consulter. Brouillons avec un badge « Brouillon à valider ». Aucun lien visible, pas de page Google : on les ouvre seulement avec `/#bruxisme` et `/#apnee`. Après validation des docteures : retirer le badge, remettre les tuiles sur l'accueil et dans « Plus », ajouter les pages.
10. **plus** : liens vers Jeux, Vidéos, Gouttière, Contact.
11. **jeux** : 11 jeux, défi du jour, défi de la langue, points et badges (gardés sur le téléphone). `reglages.dureeBrossage` en haut de `jeux.js` donne la durée du chrono de Mission brossage.

## Règles de contenu
- Français simple, on vouvoie le patient, phrases courtes. Public : enfants et parents.
- Les infos médicales viennent des documents du cabinet (recommandations du Chesnay, scripts vidéo saison 1). Ne pas inventer de consignes médicales : en cas de doute, demander à la docteure.
- Personnages des vidéos : Léo la Langue (rose corail, coach), Dixon le disjoncteur (métal), Max le multi-attache (métal ou céramique).

## Demandes en cours
Voir `docs/note-globale.md` (à traiter dans l'ordre) et `docs/exercices-langue.md` (21 exercices validés).

## Ce qui reste à faire
- [x] Ajouter les deux liens Doctolib (voir ci-dessous).
- [x] Adresses et téléphones des 2 cabinets (confirmés le 31/10/2026).
- [ ] Confirmer les horaires du Chesnay, donner ceux de Villeneuve-le-Roi.
- [ ] Trancher : chrono de 2 minutes dans Mission brossage, alors que la fiche Bagues dit 3 minutes.
- [ ] Inscrire le site sur Google Search Console.
- [x] Affiche A5 avec le QR code pour la salle d'attente (`affiche.html`, à mettre aux nouvelles couleurs).
- [ ] Faire valider les fiches Bruxisme et Apnée, puis retirer leur badge « Brouillon à valider ».
- [ ] Ajouter les photos des docteures et les dessins des personnages (`images/`).
- [ ] Ajouter les kinés et les orthophonistes dans `PARTENAIRES`.
- [ ] Nom de domaine perso (ex. heroinesdusourire.fr) branché sur GitHub Pages.
- [ ] Mettre les vidéos au fur et à mesure dans `EPS`.

## Plus tard
- Autres idées de jeux et de contenu : voir `docs/idees-plus-tard.md`.
- Nom de domaine en .fr : voir `docs/nom-de-domaine.md`.
- Espace personnel par patient : il demande un hébergeur certifié HDS (données de santé) et une validation juridique, donc pas sur GitHub.

Liens Doctolib :
- Dr Johana Lichaa (Le Chesnay-Rocquencourt) : https://www.doctolib.fr/dentiste/le-chesnay-rocquencourt/johana-lichaa
- Dr Clara Salem Melloul (Villeneuve-le-Roi) : https://www.doctolib.fr/orthodontiste/villeneuve-le-roi/clara-salem-melloul

## L'équipe d'agents (`.claude/agents/`)
Pour chaque demande, passer par les bons agents, dans cet ordre :
1. **contenu-medical** : tout texte destiné aux patients.
2. **design-ui** : toute modification visuelle ou nouvel écran.
3. **videos** : liste des épisodes et ajout des liens vidéo.
4. **verificateur** : toujours, juste avant de publier.
5. **publication** : seulement après « OK pour publier ».
6. **carte-partenaires** : onglet Carte et liste des correspondants.
7. **referencement** : pages pour Google, sitemap, Search Console, nom de domaine.

## Comment parler à la propriétaire (Dr Johana)
- Elle n'a jamais codé : expliquer très simplement, mots simples, pas de jargon, étapes courtes une par une.
- Toujours dire dans quel terminal taper une commande (ex. « le terminal de VS Code : menu Terminal → New Terminal »).
- Réponses courtes et directes, en français.
- Après chaque modification : vérifier le fichier, puis `git add`, `git commit`, `git push` sur `main`, et lui dire de recharger le site dans 1 à 2 minutes.
