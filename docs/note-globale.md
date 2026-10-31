# Note globale — demandes du 31/10/2026

Faire dans l'ordre. Chaque tâche indique l'agent responsable. **Montrer le résultat à la docteure avant de publier.**

## 1. Accueil — agent design-ui
- Retirer la carte « Ma gouttière » de l'accueil (elle reste dans l'onglet Gouttière).
- Boutons « Prendre rendez-vous » : ajouter le code postal et une photo ronde pour chaque docteure.
  - Dr Johana Lichaa – 78150 Le Chesnay-Rocquencourt – https://www.doctolib.fr/dentiste/le-chesnay-rocquencourt/johana-lichaa
  - Dr Clara Salem Melloul – 94290 Villeneuve-le-Roi – https://www.doctolib.fr/orthodontiste/villeneuve-le-roi/clara-salem-melloul
  - Photos fournies plus tard par les docteures (dossier `images/`). En attendant : initiales dans un rond.
- Une grande illustration en haut de l'accueil.

## 2. Nouveau look — agent design-ui
- Couleurs de l'univers des vidéos « Le Royaume du Sourire » : fond violet, bulles corail, jaune et turquoise. Texte toujours bien lisible, thème sombre conservé. Toutes les couleurs en variables CSS.
- Plus ludique : formes arrondies, petites animations douces (arrivée des cartes, bouton qui rebondit, à couper si l'utilisateur a demandé « moins d'animations »), bulles décoratives, titres plus fun. Rester rassurant pour les parents.
- Une image par rubrique. Créer `images/personnages/` pour les personnages des vidéos (Léo la Langue, Dixon, Max…) avec des emplacements prévus ; en attendant, illustrations simples en SVG.
- Repenser la barre d'onglets du bas pour qu'elle reste lisible avec les nouvelles rubriques (6 onglets maximum ; les autres rubriques via l'accueil ou un onglet « Plus »).

## 3. Rubrique « Les appareils » — agents design-ui + contenu-medical
- Mettre « Les appareils » dans la barre d'onglets, avec la photo et l'emplacement du personnage de chaque appareil.

## 4. Exercices de la langue — agents contenu-medical + design-ui
- Remplacer les 4 exercices actuels par les **21 exercices validés** du fichier `docs/exercices-langue.md` (ne pas modifier les textes validés).
- 3 niveaux en onglets ou badges : Débutant (semaines 1 à 4), Intermédiaire (5 à 8), Avancé (9 et plus).
- Chaque exercice : consigne, durée/répétitions, fréquence, puis
  - **minuteur** (bouton lecture/pause + petit son de fin, déclenché par un clic) pour les exercices marqués minuteur,
  - **compteur à taper** (0 → objectif) pour les exercices marqués compteur,
  - case « fait » du jour, et un emplacement `video` pour la future vidéo de démonstration.
- Garder en haut les « 3 clés pour bien avaler ». Progression du jour gardée sur le téléphone (localStorage), comme aujourd'hui.

## 5. Nouvelles rubriques — agent contenu-medical (puis design-ui)
- **Bruxisme / ATM** (serrer ou grincer des dents, articulation de la mâchoire).
- **Apnée du sommeil** (ronflements, respiration la nuit, lien avec la respiration par la bouche et l'orthodontie).
- Même format simple que les fiches : c'est quoi, les signes, ce qu'on peut faire, quand consulter.
- Les docteures n'ont pas encore donné de texte : rédiger un brouillon prudent et général, **le montrer aux docteures pour validation avant publication**, sans dosage ni promesse de résultat.

## 6. Onglet « Carte » — nouvel agent carte-partenaires (déjà créé dans `.claude/agents/`)
- Carte interactive Leaflet + OpenStreetMap.
- Les 2 cabinets (Le Chesnay-Rocquencourt, Villeneuve-le-Roi).
- Filtre « Kinés en rééducation linguale » : bouton vers l'annuaire officiel SIKLOMF https://siklomf.fr/fr/annuaire (ne pas recopier leur annuaire).
- Filtre « Orthophonistes partenaires » : tableau `PARTENAIRES` facile à remplir. Liste fournie plus tard par les docteures.
- Expliquer à la docteure, très simplement, comment ajouter un correspondant.

## 7. Contrôle et mise en ligne — agents verificateur puis publication
- Vérifier sur téléphone (380 px), thème clair et sombre, aucun lien cassé, pas de texte « à compléter » visible.
- Publier seulement après accord de la docteure.

## Plus tard (ne pas faire maintenant)
- Espace personnel par patient : demande un hébergeur certifié HDS (données de santé) et une validation juridique. Pas sur GitHub.
- Vidéos : ajouter les liens au fur et à mesure (agent videos).
- Affiche A5 du QR code déjà en ligne : `affiche.html` / `affiche.pdf` (à mettre aux nouvelles couleurs si le look change).
