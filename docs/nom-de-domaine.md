# Brancher un nom de domaine en .fr

À faire le jour où le nom est acheté (exemple : heroinesdusourire.fr). L'adresse actuelle et l'affiche QR code continueront de marcher : GitHub redirige automatiquement `lesheroinesdusourire-dotcom.github.io` vers le nouveau nom, page par page.

1. **Chez le vendeur du nom de domaine** : ajouter les enregistrements DNS indiqués par GitHub dans sa documentation « Managing a custom domain for your GitHub Pages site » (4 lignes de type A, et une ligne CNAME pour `www`).
2. **Sur GitHub** : dépôt → Settings → Pages → Custom domain → écrire le nom → Save, attendre la vérification, puis cocher « Enforce HTTPS ».
3. **Dans le projet** : dans `tools/generer_pages.py`, mettre le nouveau nom dans `SITE`. Lancer `python3 tools/generer_pages.py`. Publier.
4. **Sur Google Search Console** : ajouter le nouveau nom, renvoyer `sitemap.xml`, puis utiliser l'outil « Changement d'adresse ».

Ne pas supprimer l'ancienne adresse et ne pas réimprimer l'affiche : son QR code reste valable tant que le dépôt GitHub garde le même nom.
