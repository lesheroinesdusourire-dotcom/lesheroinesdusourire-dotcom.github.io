# Le nom de domaine lesheroinesdusourire.fr

**Adresse officielle : https://lesheroinesdusourire.fr** (nom acheté chez OVH, branché le 31/10/2026).

## Comment c'est branché
- **OVH** : 4 lignes A vers GitHub (185.199.108.153, .109, .110, .111) pour `lesheroinesdusourire.fr`, et les mêmes pour `www`.
- **GitHub** : Settings → Pages → Custom domain = `lesheroinesdusourire.fr`, et « Enforce HTTPS » à cocher.
- **Projet** : le fichier `CNAME` contient le nom. Ne jamais le supprimer. Faire `git pull` avant toute modification.

## L'ancienne adresse
`lesheroinesdusourire-dotcom.github.io` renvoie automatiquement vers le nouveau nom, page par page. L'affiche déjà imprimée reste donc valable, tant que le dépôt GitHub garde le même nom. Ne jamais renommer ni supprimer ce dépôt.

## Si l'adresse change un jour
1. Dans `tools/generer_pages.py`, changer `SITE`, puis lancer `python3 tools/generer_pages.py`.
2. Dans `index.html`, changer l'adresse par défaut du QR code (`qrUrl`).
3. Refaire le QR code et le texte de `affiche.html`, puis `affiche.pdf`.
4. Sur Google Search Console : ajouter la nouvelle adresse, renvoyer `sitemap.xml`, et utiliser l'outil « Changement d'adresse ».
