# DESIGN — Journal Dominos

> Versions datées, jamais écrasées. Écrit par Claude (directeur artistique).

## V1 — 2026-11-18 · Exploration de la page principale

**Livré**
- `PAGES.md` : 4 pages proposées (Jeu, Post, Carte de fin, Séries & classement) + 4 questions produit ouvertes.
- `REFS.md` : Shutabug décodé ; Sponge introuvable (domaine en vente), adresse demandée.
- 3 planches de la page **Jeu**, chacune avec le cadre desktop 1440 × 900 (post dans le feed) et le cadre mobile 390 × 844 :
  - `planches/v1/01-percussion.html` : os / encre / rouge, ombres en escalier, séquence numérotée (direction du brief).
  - `planches/v1/02-galerie.html` : pièces ivoire en volume sur un sol éclairé, trois-quarts, capitales étroites + mono.
  - `planches/v1/03-signal.html` : cobalt plein cadre, pièces blanches, jaune pour l'action, chaîne tracée d'un trait (écart au brief).

**Données de démo communes** (identiques sur les 3 planches, pour comparer à contenu égal)
- Chaîne #23, mercredi 18 novembre, 8 pièces. La pièce 4 ne touche pas la 5 (trou dans la chaîne), la 8 est isolée.
- Desktop : 1 poussée, 4/8 tombées, pièce 5 visée (sens de poussée affiché), bouton actif.
- Mobile : 2 poussées, 7/8 tombées, aucune pièce visée, bouton inactif.

**Décisions**
- Le post est montré dans un feed neutre (gris, sans logo ni couleur de marque) : seul le jeu porte l'identité.
- Les pièces tombées portent leur **numéro de chute** ; un repère d'accent marque chaque début de poussée, sur le champ comme dans la bande « Fall order ».
- Une seule couleur d'accent par direction, réservée à l'action (pièce visée, poussée, bouton).
- Aucune limite de poussées affichée : non définie dans `IDEE.md` (question ouverte n° 1).

**En attente** : choix de la direction par Gaia, réponses aux questions de `PAGES.md`, adresse de la référence Sponge.

## V2 — 2026-11-18 · Refonte après retour de Gaia

**Retour Gaia sur V1** : « slop IA », matière, couleurs et motifs non travaillés, pas d'identité visuelle ; mobile inutile sauf si le hackathon le demande ; aller voir les jeux de référence.

**Constats**
- Les V1 ressemblaient à un tableau de bord : un rectangle plat par pièce, un panneau de stats, une bande de cases. C'était de l'UI, pas un jeu.
- Le hackathon ne demande pas de mobile (page Devpost relue). Le « mobile first » venait d'`IDEE.md`, pas du règlement.
- Les jeux primés (voir `REFS.md`, section « Jeux de référence ») tiennent par un monde et un objet, avec très peu d'UI.

**Livré** (`planches/v2/`, desktop 1440 × 900 seul, post ouvert en grand au-dessus du feed)
- `01-cafe.html` : feutre vert, pièces en os ivoire, points noirs, pivot en laiton, titre en serif.
- `02-encre.html` : la palette du brief en matière. Laque noire sur plâtre os, points blancs, rouge pour la pièce poussée, ombres longues.
- `03-nuit.html` : salle noire, une lampe sur la prochaine poussée, ombres qui partent de la lampe, accent ambre.

**Décisions**
- Pièces dessinées en vrai volume (isométrie : dessus, deux tranches, rainure, pivot, points), ombres portées floues, grain de surface (bruit SVG, zéro fichier externe).
- **Motif central** : une pièce tombée montre sa face, et ses points comptent son rang de chute (1 à 8, grille de double-neuf). La pièce poussée a ses points en couleur d'accent.
- Logo « D●MIN●S » : les deux O sont des points de domino, le premier en accent.
- Pendant le jeu, seulement : logo + date (haut gauche), compteur de pièces debout/couchées (haut droite), consigne + bouton Push (bas).
- V1 conservée telle quelle (`planches/v1/`), jamais écrasée.

**En attente** : choix de la direction, questions de `PAGES.md`, adresse Sponge.
