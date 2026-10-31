# Les Héroïnes du Sourire — appli patients

## Le projet
Appli web pour les patients en orthodontie (enfants et adultes), ouverte avec un QR code au cabinet.
- Docteures : **Dr Johana Lichaa** (Le Chesnay-Rocquencourt et Herblay-sur-Seine) et **Dr Clara Salem Melloul** (Villeneuve-le-Roi).
- Site en ligne : https://lesheroinesdusourire-dotcom.github.io
- Dépôt GitHub : `lesheroinesdusourire-dotcom/lesheroinesdusourire-dotcom.github.io` (compte GitHub du cabinet, email lesheroinesdusourire@gmail.com). Le compte `drlichaa` est collaborateur.
- Hébergement : GitHub Pages, branche `main`, dossier racine. Un `git push` sur `main` met le site à jour en 1 à 2 minutes.

## Comment c'est construit
- **Un seul fichier : `index.html`** (HTML + CSS + JavaScript dans le même fichier). Pas de framework, pas de build.
- Les photos des appareils sont intégrées dans le fichier (images en base64, viennent du document de recommandations du cabinet du Chesnay).
- Seule dépendance externe : `qrcode-generator` 1.4.4 (cdnjs) pour le QR code, et les polices Google Fonts (Fredoka pour les titres, Nunito Sans pour le texte).
- `.nojekyll` : empêche GitHub de transformer le site.
- Couleurs : toutes en variables CSS dans `:root` (thème clair) + thème sombre automatique. Bleu principal `--accent`, jaune `--sun` pour les « règles d'or », rouge `--alert` pour les urgences.
- Mobile d'abord : barre d'onglets fixée en bas, une vue à la fois. Navigation par `#nom-de-vue` dans l'adresse.

## Les vues (sections `<section class="view" id="v-…">`)
1. **accueil** : titre, illustration sourire, carte « Ma gouttière », tuiles vers les autres rubriques.
2. **gouttiere** : suivi des aligneurs (date de pose, rythme 7/10/14 jours, nombre total) → numéro de gouttière actuel et jours avant le prochain changement. Série « j'ai porté mes gouttières 22 h ». Données gardées dans le navigateur du patient (localStorage).
3. **conseils** (« Mon appareil ») : grille de 9 appareils avec photo → fiche simple. Données dans le tableau JavaScript `APPS` (champs : `nom`, `sous`, `obj` = à quoi ça sert, `quand`, `regles`, `non` = à éviter, `ent` = entretien, `gold` = règle d'or, `perte` = prix si perdu, `img`).
4. **videos** : « Le Royaume du Sourire », saison 1 = 24 vidéos de 30 s. Données dans `EPS` (groupes → épisodes `n`, `t`, `who`, `d`, `video`). **Pour ajouter une vidéo : mettre l'adresse d'intégration dans `video`** (ex. `https://www.youtube.com/embed/ID`) → la vidéo s'affiche à la place du badge « Bientôt ». `EPMAP` relie chaque appareil à son épisode (bouton « Voir la vidéo de cet appareil »).
5. **urgences** : que faire si… (fil qui pique, bague décollée, gouttière perdue, douleur, disjoncteur : rendez-vous raté = arrêter les tours de clé, mail secretariat.lichaa@gmail.com si douleur forte). Vraie urgence → cabinet, ou le 15 le soir/week-end.
6. **langue** : les 3 clés pour bien avaler + 4 exercices avec minuteur (tableau `EX`), compteur du jour.
7. **contact** : adresse du cabinet du Chesnay (44 ter bd Saint-Antoine, 78150 Le Chesnay-Rocquencourt — à faire confirmer), horaires, boutons rendez-vous et itinéraire, QR code de l'appli.

## Règles de contenu
- Français simple, on vouvoie le patient, phrases courtes. Public : enfants et parents.
- Les infos médicales viennent des documents du cabinet (recommandations du Chesnay, scripts vidéo saison 1). Ne pas inventer de consignes médicales : en cas de doute, demander à la docteure.
- Personnages des vidéos : Léo la Langue (rose corail, coach), Dixon le disjoncteur (métal), Max le multi-attache (métal ou céramique).

## Ce qui reste à faire
- [ ] Ajouter les deux liens Doctolib (voir ci-dessous) — **à faire en premier**.
- [ ] Téléphone du cabinet du Chesnay, confirmer adresse et horaires.
- [ ] Ajouter le cabinet de Villeneuve-le-Roi (Dr Clara) dans Contact.
- [ ] Affiche A5 avec le QR code pour la salle d'attente.
- [ ] Nom de domaine perso (ex. heroinesdusourire.fr) branché sur GitHub Pages.
- [ ] Mettre les vidéos au fur et à mesure dans `EPS`.

Liens Doctolib :
- Dr Johana Lichaa (Le Chesnay-Rocquencourt) : https://www.doctolib.fr/dentiste/le-chesnay-rocquencourt/johana-lichaa
- Dr Clara Salem Melloul (Villeneuve-le-Roi) : https://www.doctolib.fr/orthodontiste/villeneuve-le-roi/clara-salem-melloul

## Comment parler à la propriétaire (Dr Johana)
- Elle n'a jamais codé : expliquer très simplement, mots simples, pas de jargon, étapes courtes une par une.
- Toujours dire dans quel terminal taper une commande (ex. « le terminal de VS Code : menu Terminal → New Terminal »).
- Réponses courtes et directes, en français.
- Après chaque modification : vérifier le fichier, puis `git add`, `git commit`, `git push` sur `main`, et lui dire de recharger le site dans 1 à 2 minutes.
