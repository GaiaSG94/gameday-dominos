# STATUS gameday-dominos
Phase: build (code fait)
Etat: app implementee, PR #3 mergee, CI main verte ; restent design-impl (ecart planches/produit), verification 04, app listing + demo post (bloquant humain Devvit/subreddit), description Devpost
Round: R1
Maj: 2026-11-20
Hackathon: reddit-gameday-2026 / Best Daily Game
Deadline: 2026-12-09 03:00

Slot projet 25/30 (decision H du 2026-11-16) : idee a produire (lot d'ideation a definir), soumission unique par projet.

Idees validees par H le 2026-11-17 (30/30) : passage en phase build.

## opencode

### 2026-11-20 — build (03-build, PR #3, mergee)

- Spec ecrite dans le dossier projet (`../SPEC.md`) : mecanique exacte, API,
  Redis, ecrans, criteres mappes 1-1, plan de test. Decisions produit tranchees
  dans la SPEC (issues du design verrouille) : pas de limite de poussees ;
  resultat = 8/8 + poussees + ordre ; repartition communautaire (jamais
  nominatif) ; splash inline + vue etendue ; premier 8/8 enregistre, rejeu
  verrouille (le par serait spolie).
- Jeu : chaine causale de 8 dominos (direction propre visible + trous), par
  calcule cote serveur (DP sur les 2^8 masques) et JAMAIS envoye au client ;
  generation deterministe UTC avec contraintes (2 <= par <= 4, >= 1 across,
  >= 1 trou, planche de repli) ; /api/submit rejoue l'ordre avant
  enregistrement (idempotent).
- Design verrouille « Encre » implante : scene isometrique SVG portage exact
  des planches v2/encre (C=0.866, S=0.5, T=9, W=24, H=46 ; laque noire,
  platre os, grain feTurbulence, ombres hull floutees, pips de rang de chute,
  visee anneau pointille + fleche) ; cascade animee 90 ms + reduced-motion ;
  splash inline (repli local si /api/init > 1,2 s) ; carte de fin piece
  geante ; serie + calendrier 4 semaines + repartition des poussees.
- Police Inter Tight embarquee (woff2 + OFL) : aucune requete externe client.
- 21 tests node --test (determinisme, cascades a la main, par DP vs brute
  force sur 400 jours, ordres illegaux, publicView sans spoiler, layout
  trous). README EN.
- PR #3 ouverte avec `## Scope`, mergee par Mergify (rebase, commit 9191544) ;
  CI verte sur PR et main (ci, CI/test, ci-budget, couche0).
- Gates locaux : tsc OK, lint 0 erreur 0 warning, tests 21/21, build OK,
  check-limits 0 probleme, ci-budget 0 erreur.
- Ecarts listes (a juger en verification 04 / 07b) : scene en ligne droite
  (layout derive des trous) au lieu du chemin courbe des planches de demo ;
  `start:{u}:{day}` (verrou SET NX) ajoute au contrat Redis ; bestStreak
  derive du zset days (pas de nouvelle cle) ; carte de fin 7 jours vs 4
  semaines completes en vue series (2 stats au lieu de 3).
- Bloquant humain (hors code) : app listing developers.reddit.com + demo post
  public (subreddit de test < 200 membres) + description Devpost (etape 08).

## Claude
