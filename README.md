# L&A Coiffure — site web

Site vitrine du salon **L&A Coiffure**, boulevard de Pérolles 22, 1700 Fribourg.
Site statique (HTML, CSS, JavaScript natif), sans dépendance ni étape de compilation, prêt pour GitHub Pages.

## Arborescence

```
/
├── index.html               Page principale (une seule page, ancres #salon #prestations #avis #acces)
├── mentions-legales.html    Mentions légales et protection des données (noindex)
├── css/style.css            Styles, mobile-first ; couleurs, polices et espacements dans :root
├── js/main.js               Menu mobile, onglets des tarifs, statut « ouvert/fermé », carte, animations
├── assets/
│   ├── fonts/jost-latin.woff2   Police Jost auto-hébergée (aucun appel à Google Fonts)
│   └── images/                  Photos du salon (AVIF + JPEG de secours), logo, image de partage
├── favicon-32.png, apple-touch-icon.png
├── robots.txt
└── .nojekyll                Désactive le traitement Jekyll de GitHub Pages
```

`assets/images/logo-original.jpg` est le fichier source du logo (fond noir), conservé comme référence.

## Fonctionnalités

| Élément | Fonctionnement |
|---|---|
| Réservation | Tous les boutons « Réserver » ouvrent la page Salonkee du salon (`https://salonkee.ch/salon/la-coiffure`) dans un nouvel onglet. |
| Appel | Liens `tel:+41794380883` (ouvrent l'application téléphone sur mobile). |
| Tarifs | Onglets accessibles au clavier (flèches, Début, Fin). Sans JavaScript, toutes les catégories s'affichent l'une sous l'autre. |
| Statut d'ouverture | Calculé à l'heure de Zurich à partir du tableau des horaires (`data-open` / `data-close`). Ne connaît pas les jours fériés : une mention le précise. |
| Carte | OpenStreetMap, chargée uniquement après un clic (pas de requête tierce par défaut). |
| Itinéraire | Liens Google Maps et Apple Plans. |
| Barre mobile | « Réserver / Appeler » fixée en bas de l'écran sur smartphone, après l'accueil. |

Le site ne contient **aucun formulaire**, aucun cookie et aucun outil de statistiques.

## Mettre à jour le contenu

Tout se modifie directement dans `index.html` ; les blocs sont commentés.

- **Tarifs** : section `<!-- PRESTATIONS & TARIFS -->`. Chaque prestation est un `<li class="svc">`. Pensez à mettre à jour la date « relevés le … » sous la carte.
- **Horaires** : le tableau `data-hours` est la **seule source** utilisée par le statut « ouvert/fermé ». Modifiez l'heure dans le texte **et** dans `data-open` / `data-close` (format `HH:MM`). Mettez aussi à jour le pied de page et le bloc JSON-LD dans `<head>`.
- **Avis** : note, répartition (`--v` = pourcentage) et date de relevé dans la section `<!-- AVIS -->`.
- **Couleurs / polices** : variables en tête de `css/style.css`.
- **Photos** : fournir chaque photo en AVIF et JPEG, avec des **dimensions paires** (un AVIF de hauteur impaire généré par `sips` s'affichait vide pendant les tests).

## Publication sur GitHub Pages

1. Créer un dépôt (par ex. `la-coiffure`) et y pousser le contenu de ce dossier (sans `.claude/`).
2. Sur GitHub : **Settings → Pages → Build and deployment → Source : Deploy from a branch**, branche `main`, dossier `/ (root)`.
3. Attendre la publication (1 à 2 minutes) : `https://UTILISATEUR.github.io/la-coiffure/`.

Tous les chemins sont relatifs : le site fonctionne dans un sous-dossier comme sur un domaine propre.

### Après publication (URL définitive connue)

Ces éléments exigent une URL absolue, inconnue au moment du développement :

1. Dans `index.html`, remplacer `content="assets/images/og-image.jpg"` par l'URL complète, par ex. `https://UTILISATEUR.github.io/la-coiffure/assets/images/og-image.jpg` (aperçus WhatsApp, Facebook…).
2. Ajouter dans `<head>` : `<link rel="canonical" href="https://…/">` et `<meta property="og:url" content="https://…/">`.
3. Dans le JSON-LD, ajouter `"url": "https://…/"` et `"image": "https://…/assets/images/vitrine-1200.jpg"`.
4. Avec un domaine propre (ex. `la-coiffure.ch`) : le configurer dans Settings → Pages et activer « Enforce HTTPS ». `robots.txt` n'est lu par les moteurs qu'à la racine d'un domaine : il n'a d'effet qu'avec un domaine propre.
5. Déclarer le site dans **Google Search Console** et l'ajouter au **profil Google Business** du salon.

## Checklist après publication

- [ ] La page s'affiche à l'adresse publiée, avec police, photos et logo.
- [ ] Les boutons « Réserver » ouvrent bien la page Salonkee du salon.
- [ ] Le lien téléphone lance un appel sur smartphone.
- [ ] Les liens Itinéraire / Plans ouvrent la bonne adresse.
- [ ] « Afficher la carte » charge la carte.
- [ ] Le lien « Mentions légales » fonctionne, ainsi que « Retour au site ».
- [ ] L'aperçu du lien est correct (après l'étape og:image), par ex. en l'envoyant sur WhatsApp.
- [ ] Contrôle Lighthouse (Chrome → DevTools → Lighthouse) sur mobile.

## Tests effectués (19 octobre 2026)

Servi en local depuis un **sous-dossier** `/Leta-coiffure/` pour reproduire GitHub Pages, dans le navigateur intégré (Chromium).

- Largeurs contrôlées : 320, 375, 390, 768, 1024, 1440 px. Aucun débordement horizontal mesuré, aucun bouton sur deux lignes.
- Toutes les ressources se chargent depuis le sous-dossier (police, AVIF, logo, CSS, JS) ; aucune erreur console.
- Onglets : clic, flèches, Début/Fin, bouclage ; un seul panneau visible.
- Menu mobile : ouverture, focus sur le premier lien, Échap, retour du focus sur le bouton.
- Statut d'ouverture : lundi → « Fermé · ouvre demain à 9h00 », ligne « Lundi » mise en avant.
- Carte OpenStreetMap : chargée après clic, marqueur sur le boulevard de Pérolles.
- Navigation active au défilement ; barre mobile visible après l'accueil, masquée près de l'appel final.
- Audit automatique : un seul H1, hiérarchie des titres cohérente, `alt` et dimensions sur toutes les images, aucun lien sans nom, aucune ancre cassée.
- Contrastes calculés : texte secondaire 6,5 à 8,3:1 ; texte noir sur bouton argent ≥ 5,7:1.
- Stabilité : CLS mesuré à 0. Poids d'une première visite mobile : environ 150 Ko (HTML, CSS et JS compressés, police, photo d'accueil, logo).
- **Non testés** : Lighthouse (Node.js absent de la machine), LCP réel (non mesurable dans le panneau masqué), Safari/iOS et Firefox, lecteur d'écran réel.

## Données vérifiées et écarts avec le brief

Toutes les informations proviennent de la page Salonkee du salon, consultée le 19 octobre 2026.

- **Avis** : 4,9/5 sur **222** avis vérifiés (215 à 5 étoiles), et non 5/5 sur 160 comme indiqué dans le brief.
- **Coupe enfant** : absente de la carte Salonkee actuelle. Elle n'apparaît donc pas sur le site ; à rajouter si le salon la propose toujours.
- **Frange** : sans réservation à l'avance (appeler le jour même), précisé sur le site.
- **Équipe** : Liri et Leila apparaissent sur Salonkee ; l'équipe n'est pas présentée faute d'informations validées.
- **Photos** : issues de la page Salonkee du salon. **Faire confirmer au salon** l'accord pour leur réutilisation.

## À fournir par le salon

- Accord pour la réutilisation des photos (voir ci-dessus).
- Raison sociale / nom du responsable pour les mentions légales.
- Adresse e-mail (si le salon souhaite l'afficher).
- Comptes Instagram / Facebook officiels (liens à ajouter dans le pied de page).
- Photos de l'équipe et de réalisations, si le salon souhaite une galerie.
- Confirmation de la coupe enfant et des horaires des jours fériés.

## Services tiers et confidentialité

- **Salonkee** : uniquement via des liens sortants (aucun script intégré).
- **OpenStreetMap** : iframe chargée seulement après un clic.
- **Google Maps / Apple Plans** : liens sortants.
- **GitHub Pages** : hébergeur, journalise les adresses IP (mentionné dans les mentions légales).

Les mentions légales décrivent ces traitements, mais n'ont pas fait l'objet d'une vérification juridique : à faire relire si nécessaire.
