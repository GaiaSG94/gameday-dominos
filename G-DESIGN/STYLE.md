# STYLE — Dominos · direction « Encre »

> Validée par Gaia le 2026-11-18 (planche `planches/v2/02-encre.html`). Source unique du style pour toutes les pages.
> Périmètre : desktop seul (1440 × 900). Aucune version mobile tant que le hackathon ne la demande pas.

## 1. Idée

Des pièces en **laque noire** posées sur un **plâtre couleur os**, sous une lumière douce venue de la gauche. Une pièce qui tombe montre sa face, et **ses points comptent son rang dans la chute**. Le rouge sert à une seule chose : l'action (la poussée).

## 2. Palette (une seule couleur d'accent)

| Rôle | Hex | Usage |
|------|-----|-------|
| Plâtre (sol) | `#e9e2d4` | Fond de toutes les scènes, toujours avec grain |
| Os (texte clair, points) | `#f0ede6` | Points des pièces, texte sur fond encre |
| Encre | `#141210` | Texte principal, logo |
| Encre 2 | `#6d665b` | Texte secondaire, métadonnées |
| Laque, dessus | `#2b2723` | Face supérieure des pièces |
| Laque, tranche claire | `#1d1a17` | Tranche tournée vers la lumière |
| Laque, tranche sombre | `#0b0a09` | Tranche à l'ombre |
| Rainure | `#4d463f` | Ligne centrale, gravure |
| Étain (pivot) | `#9a8f80` | Pivot central des pièces |
| **Rouge (accent)** | `#d6402f` | Pièce poussée (ses points), visée, bouton principal, 1er point du logo |
| Rouge ombré | `#8f2a1e` | Tranche du bouton principal |
| Ombre portée | `#3a2e20` à 32 % | Ombres floues des pièces |
| Pastille | `#f0ece4` à 80 % | Fond des consignes posées sur la scène |

Interdits : second accent, dégradé décoratif, pur blanc `#fff` en grande surface, pur noir `#000`.

## 3. Matière et lumière

- **Grain** : bruit fractal fin (fréquence 0,6, 3 octaves) à 16 % sur tout le plâtre. Pas de surface lisse.
- **Lumière** : douce, venue du coin haut gauche. Une flaque plus claire (blanc à 60 % au centre, nulle au bord) éclaire la zone de jeu.
- **Ombres** : longues (1,1 × la hauteur), floutées (σ 5), portées vers la droite. C'est le motif « en cascade ».
- **Brillance** : un liseré blanc à 32 % sur le bord du dessus des pièces (effet laque).

## 4. La pièce (composant central)

- Proportions : 9 (épaisseur) × 24 (largeur) × 46 (hauteur). Rendu isométrique (30°).
- **Debout** : on voit la tranche et le dos, avec une rainure gravée à mi-hauteur.
- **Couchée** : la face est visible. Une moitié porte les points du **rang de chute** (grille 3 × 3, de 1 à 8), l'autre moitié est vide. Un pivot en étain marque le centre.
- **Poussée** : mêmes règles, mais ses points sont **rouges**.
- **Visée** : un cercle rouge en pointillé au sol (qui tourne lentement), et une flèche rouge au sol qui part de derrière la pièce et montre le sens de chute.
- **Mini-pièce d'interface** (compteurs, séries, graphiques) : rectangle laque `#2b2723`, filet clair à 18 %, tranche `#0b0a09` de 2 px. Debout 8 × 26, couchée 20 × 9.

## 5. Typographie (une seule famille, grotesque forte)

Famille cible : grotesque libre embarquée (à choisir à l'implémentation, par exemple Inter Tight ou Archivo). Les planches utilisent Liberation Sans.

| Niveau | Taille / graisse | Usage |
|--------|------------------|-------|
| Logo | 48 px, gras, approche −0,05 em | « D●MIN●S » : les deux O sont des points de domino, le premier rouge |
| Chiffre héros | 96–120 px, gras, approche −0,05 em, tabulaire | Résultat (8/8), série |
| Titre | 28 px, gras, approche −0,02 em | Titres de carte |
| Bouton | 20 px, gras | Push, Play |
| Corps | 15 px, normal | Consignes, phrases |
| Étiquette | 12 px, gras, capitales, espacement 0,12 em | Date, métadonnées, légendes |

Tous les chiffres sont **tabulaires**.

## 6. Grille et mise en page

- Le jeu s'ouvre en **vue étendue** au-dessus du feed : 1080 × 760, coins 18 px. Le post dans le feed fait 740 × 512.
- **La scène remplit le cadre**. L'interface est posée dessus, dans trois zones seulement : haut gauche (logo + date), haut droite (compteur), bas centre (consigne + bouton).
- Marges intérieures : 36 px sur les côtés, 30 px en haut, 34 px en bas.
- Les cartes (fin, séries) sont des **pièces géantes** : laque noire, coins 14 px, rainure horizontale qui sépare deux moitiés, pivot au centre.

## 7. Composants

- **Bouton principal** : pilule rouge `#d6402f`, texte blanc 20 px gras, tranche `#8f2a1e` de 5 px dessous (un objet qu'on enfonce). Un seul par écran.
- **Bouton secondaire** : pilule à filet encre 1,5 px, texte encre. Sur fond laque : filet os.
- **Pastille de consigne** : fond os à 80 %, flou d'arrière-plan 6 px, texte 15 px.
- **Compteur** : 8 mini-pièces (couchées = tombées, debout = restantes) + étiquette « 4 OF 8 DOWN · 1 PUSH ».
- **Série** : une rangée de mini-pièces, une par jour. Jour joué = couchée. Jour manqué = contour seul. Aujourd'hui = point rouge.

## 8. Mouvement (pour l'implémentation)

- **Chute** : la pièce bascule autour de son arête avant, 220 ms, en accélérant (ease-in), puis un petit rebond de 40 ms. Chaque pièce suivante part 90 ms plus tard. C'est la percussion.
- **Révélation** : les points apparaissent un par un (30 ms d'écart) quand la face se pose.
- **Visée** : le pointillé tourne en continu (1,6 s par tour).
- **Bouton** : il s'enfonce de 3 px quand on clique (la tranche se réduit).
- `prefers-reduced-motion` : pas de rotation ni de cascade, les pièces passent directement à l'état couché.

## 9. États

| État | Rendu |
|------|-------|
| Aucune pièce visée | Bouton « Tap a piece to aim » en secondaire (filet), consigne visible |
| Pièce visée | Cercle + flèche rouges, bouton Push rouge actif |
| Chaîne en cours de chute | Bouton masqué, consigne « … » |
| Chaîne arrêtée (trou) | La dernière pièce tombée reste en place, la consigne invite à repousser |
| 8/8 | Passage à la carte de fin, la scène reste visible derrière |
