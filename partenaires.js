/* ─────────────────────────────────────────────────────────────
   LA CARTE : tous les points sont dans ce tableau.

   Pour ajouter un correspondant, copiez ce modèle dans le tableau,
   puis remplacez le texte. type = cabinet, kine ou orthophoniste.

   {nom:"Prénom Nom", type:"orthophoniste", adresse:"1 rue Exemple", ville:"Versailles", cp:"78000", tel:"01 00 00 00 00", lat:48.8, lng:2.1},

   lat et lng = latitude et longitude : sur Google Maps, clic droit sur le lieu, puis cliquez sur les chiffres pour les copier.
   N'inventez jamais une adresse ou un numéro.
   Sans lat et lng, la personne apparaît dans la liste, mais pas sur la carte.
   ───────────────────────────────────────────────────────────── */
var PARTENAIRES=[
  /* Adresses et téléphones confirmés par les docteures le 31/10/2026. */
  {nom:"Dr Johana Lichaa", type:"cabinet", adresse:"44 ter boulevard Saint-Antoine", ville:"Le Chesnay-Rocquencourt", cp:"78150", tel:"01 61 12 19 40", lat:48.817181, lng:2.124121},
  {nom:"Dr Clara Salem Melloul", type:"cabinet", adresse:"2 place Louis Jacquard", ville:"Villeneuve-le-Roi", cp:"94290", tel:"01 49 61 11 11", lat:48.734077, lng:2.416758},

  /* Ajoutez les kinés et les orthophonistes ici. */
];

/* Annuaire de la SIKLOMF affiché avec le filtre Kinés */
var ANNUAIRE_SIKLOMF="https://siklomf.fr/fr/annuaire";
