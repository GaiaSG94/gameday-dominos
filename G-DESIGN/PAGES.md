# PAGES — Dominos

> Déduit de `IDEE.md` (mécanique, boucle quotidienne, carte de fin) et de `CRITERES.md` (UI dans le viewport, streaks, commentaires).
> Proposé le 2026-11-18. **4 pages validées par Gaia le 2026-11-18. Style verrouillé (/lock).**

| # | Page | Rôle | Contenu clé | Statut |
|---|------|------|-------------|--------|
| 1 | **Jeu** (page principale) | Jouer la chaîne du jour ; une seule règle lisible en 5 s | Scène des 8 pièces, pièce visée + flèche au sol, compteur en mini-pièces, nombre de poussées, consigne, bouton Push | **Validée** (Encre, 2026-11-18) · `planches/v2/encre/01-jeu.html` |
| 2 | **Post** | État du post dans le feed avant d'y toucher | En-tête de post, titre du jour (#n + date), aperçu figé de la chaîne, appel « Play » | À dessiner |
| 3 | **Carte de fin** | Clore la partie et donner envie de revenir / commenter | Résultat (x/8, poussées, ordre), série, commentaire pré-rempli en un geste, compte à rebours | **Validée** · `planches/v2/encre/03-fin.html` |
| 4 | **Séries & classement** | Montrer la communauté | Série + calendrier 4 semaines, joueurs du jour, % qui ont tout fait tomber, répartition des poussées | **Validée** · `planches/v2/encre/04-series.html` |

## Questions produit ouvertes (non tranchées, absentes de `IDEE.md`)

1. **Limite de poussées** : y a-t-il un nombre maximal de poussées (ou un « par ») ? Les planches affichent seulement le compteur, sans limite.
2. **Résultat** : qu'est-ce qui est noté sur la carte de fin, le nombre de pièces tombées, le nombre de poussées, ou les deux ?
3. **Classement** : sur quelle valeur classe-t-on la communauté (poussées, temps, réussite oui/non) ?
4. **Post vs Jeu** : le post dans le feed doit-il être un écran distinct (aperçu + Play) ou le jeu directement jouable dans le feed ? Hypothèse V2, reprise de l'implémentation de référence `gameday-signal` (« splash inline + game expanded ») : le post affiche l'aperçu, et le jeu s'ouvre en vue étendue. À confirmer.

> Périmètre (décision Gaia, 2026-11-18) : **desktop seul**. Le hackathon ne demande pas de mobile (« fit the UI in the viewport » seulement). Le cadre 390 × 844 du brief §6 est retiré.
