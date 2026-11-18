# PAGES — Dominos

> Déduit de `IDEE.md` (mécanique, boucle quotidienne, carte de fin) et de `CRITERES.md` (UI dans le viewport, streaks, commentaires).
> Proposé le 2026-11-18. À valider par Gaia.

| # | Page | Rôle | Contenu clé | Statut |
|---|------|------|-------------|--------|
| 1 | **Jeu** (page principale) | Jouer la chaîne du jour ; une seule règle lisible en 5 s | Champ des 8 pièces, pièce visée + sens de poussée, compteur « x/8 down », nombre de poussées, ordre de chute (8 cases), consigne, bouton Push | En revue (V2 : 3 directions matière, desktop seul) |
| 2 | **Post** | État du post dans le feed avant d'y toucher | En-tête de post, titre du jour (#n + date), aperçu figé de la chaîne, appel « Play » | À dessiner |
| 3 | **Carte de fin** | Clore la partie et donner envie de revenir / commenter | Résultat (x/8, poussées), série (streak), invitation à commenter en un geste | À dessiner |
| 4 | **Séries & classement** | Montrer la communauté | Série personnelle, scores de la communauté sur la chaîne du jour | À dessiner |

## Questions produit ouvertes (non tranchées, absentes de `IDEE.md`)

1. **Limite de poussées** : y a-t-il un nombre maximal de poussées (ou un « par ») ? Les planches affichent seulement le compteur, sans limite.
2. **Résultat** : qu'est-ce qui est noté sur la carte de fin, le nombre de pièces tombées, le nombre de poussées, ou les deux ?
3. **Classement** : sur quelle valeur classe-t-on la communauté (poussées, temps, réussite oui/non) ?
4. **Post vs Jeu** : le post dans le feed doit-il être un écran distinct (aperçu + Play) ou le jeu directement jouable dans le feed ? Hypothèse V2, reprise de l'implémentation de référence `gameday-signal` (« splash inline + game expanded ») : le post affiche l'aperçu, et le jeu s'ouvre en vue étendue. À confirmer.

> Périmètre (décision Gaia, 2026-11-18) : **desktop seul**. Le hackathon ne demande pas de mobile (« fit the UI in the viewport » seulement). Le cadre 390 × 844 du brief §6 est retiré.
