# RNCP 42 — optimiseur de parcours

Quelle liste de projets faire, la plus courte possible, pour décrocher un titre
RNCP de 42 ? Et quelle **combinaison** de titres coûte le moins cher ?

Le programme teste les **15 combinaisons** de `rncp6-1`, `rncp6-2`, `rncp7-1`,
`rncp7-2` — 4 titres seuls, 6 paires, 4 triplets, et les quatre ensemble — et
pour chacune cherche l'ensemble de projets **minimal** qui satisfait toutes les
conditions d'obtention.

```bash
python3 planner.py --level 14                        # tableau comparatif
python3 planner.py --combo rncp6-1+rncp7-2 -v        # le plan détaillé
python3 build.py --xp 167758 --done 1396,1405        # régénère index.html
open index.html
```

Aucune dépendance : Python 3 standard, branch & bound écrit à la main.

## Les quatre titres

| clé | titre | niveau | catégories (XP min + nb projets min) |
|---|---|---|---|
| `rncp6-1` | Développement web et mobile | 17 | Web 15k/2 · Mobile 10k/2 |
| `rncp6-2` | Développement applicatif | 17 | OOP 10k/2 · Fonctionnel 10k/2 · Impératif 10k/2 |
| `rncp7-1` | Système d'information et réseaux | 21 | Unix/Kernel 30k/2 · SysAdmin 50k/3 · Sécurité 50k/3 |
| `rncp7-2` | Architecture BDD et data | 21 | Web-Database 50k/2 · IA 70k/3 |

À quoi s'ajoute, pour chaque titre : le **niveau de cursus** (17 = 263 508 XP,
21 = 457 632 XP au total), **2 expériences pro** (stage / alternance / startup),
**1 projet « suite »**, et des **events** (10 ou 15 — non optimisables, ce ne
sont pas des projets).

Un même projet peut compter pour plusieurs catégories à la fois : c'est tout
l'intérêt de chercher les combinaisons plutôt que d'additionner les listes.

## Ce que le solveur optimise

Deux objectifs, affichés côte à côte parce qu'ils ne donnent pas le même plan :

- **min projets** — le moins de projets à valider. Le nombre est *prouvé*
  minimal (recherche par approfondissement itératif) ; à nombre égal, le plan le
  plus court est retenu, ce qui rend le résultat reproductible.
- **min temps** — la durée totale la plus courte, sans limite de nombre.
  Typiquement beaucoup de petits projets plutôt que quelques gros. Cette
  recherche-là a un budget de calcul borné : quand elle rend un plan plus long
  que celui à nombre minimal de projets, c'est ce dernier qui est affiché
  (il est valide et plus court).

Contraintes respectées : seuil d'XP de niveau, XP **et** nombre de projets par
catégorie, expériences, projet suite, et les **prérequis**.

### Prérequis : le coût est celui de toute la chaîne

Une chaîne ne peut être prise que **par préfixe**. On ne peut pas « prendre
kfs-4 » : le solveur n'a le choix qu'entre kfs-1, kfs-1→2, kfs-1→3, kfs-1→4…
Prendre kfs-4 coûte donc 4 projets et le temps des quatre, et c'est ce coût-là
qui entre dans la comparaison. La page affiche le rang de chaque maillon
(`kfs 4/10`) pour que ce soit lisible.

Chaque chaîne est **activable ou non depuis la page** : les plans sont
pré-calculés pour les 16 réglages possibles, donc basculer un prérequis met les
résultats à jour immédiatement. Si l'intra de ton campus n'enchaîne pas une
série, coupe-la et compare.

### Piscines

Une piscine compte pour **un** projet — l'intra la compte ainsi dans les listes
RNCP et on s'y inscrit une fois. Son XP est la somme de ses modules, les prendre
tous est obligatoire, et la page l'indique (`Mobile +6 modules`).

## Données

| fichier | source | contenu |
|---|---|---|
| `data/rncp_21.json` | dump API 42 | les vraies conditions des 4 titres |
| `data/projects_21.json` | dump API 42 | 367 projets : XP, durée, enfants |
| `data/experience_21.json` | dump API 42 | courbe niveau → XP |
| `data/rules.json` | **écrit à la main** | prérequis, tronc commun, exclusions |

`fetch.py` rafraîchit les trois dumps depuis
[lucas-ht/42calculator](https://github.com/lucas-ht/42calculator).

### Pourquoi `rules.json` existe

L'API 42 **n'expose pas les prérequis entre projets**. Le champ `parent` des
dumps désigne un conteneur de piscine (`Day 00` → `Piscine PHP Symfony`), pas un
prérequis. Les chaînes sont donc curées à la main, avec un niveau de confiance :

- `certain` — chaîne `kfs`, périodes d'apprentissage
- `likely` — série malware (`woody-woodpacker → famine → pestilence → war →
  death`). **À vérifier sur l'intra de ton campus** ; si ce n'est pas chaîné
  chez toi, vide le tableau `projects` de cette entrée.

`rules.json` porte aussi :

- le **tronc commun**, considéré comme déjà fait (atteindre le niveau 17 l'implique) ;
- les **exclusions** : doublons de gestion qui fausseraient tout. Les lignes
  « FR - Alternance - RNCP7 - 2 ans » valent 180 000 XP en un seul projet et font
  doublon avec la structure `Apprentissage` : les garder rendait tout plan trivial ;
- des **durées curées** : l'intra enregistre 9 jours par période d'évaluation
  d'alternance. Sans correction, l'optimiseur croyait qu'une alternance de 2 ans
  se faisait en 9 jours et la choisissait systématiquement.

### Le temps est une estimation, pas une donnée

Le champ `duration` de l'intra est incohérent : de **0,37 à 20 jours pour
1000 XP** selon les projets, soit un facteur 50 pour un effort comparable
(`bomberman`, 25 200 XP, est donné pour 0,4 jour). Il est donc borné entre 0,5×
et 2× une estimation proportionnelle (médiane mesurée : ~2,7 j / 1000 XP).

Trois modèles disponibles via `--time-model` : `clamped` (défaut), `xp`
(strictement proportionnel), `raw` (brut de l'intra, pour comparaison).

Traite les durées comme un ordre de grandeur relatif. Le nombre de projets, lui,
est exact.

## Adapter à ta situation

```bash
python3 planner.py --xp 187000                    # ton XP réel plutôt qu'un niveau
python3 planner.py --done 1396,1405 -v            # projets déjà validés
python3 planner.py --chains-off virus             # ignorer une chaîne de prérequis
python3 build.py --xp 187000 --done 1396,1405     # regénérer la page
python3 build.py --level 17 --no-variants         # 1 seul réglage, bien plus rapide
```

Les ids se lisent dans `data/projects_21.json`. `index.html` est généré pour un
état de départ précis : il porte le niveau et les projets déjà validés en
en-tête, et se régénère en une commande.

## Vérifier

```bash
python3 test_planner.py
```

Ne teste pas que ça tourne, mais que les plans sont valides : conditions
satisfaites, prérequis respectés (préfixes de chaîne seulement), piscines
entières, aucune décision retirable sans casser une condition (au bon grain : on
ne peut pas retirer un module de piscine seul, ni un maillon au milieu d'une
chaîne), monotonie du niveau de départ, et — sur les cas assez petits pour être
énumérés — vérification exhaustive qu'aucun ensemble plus petit ne convient.

## Limites assumées

- Les **events** ne sont pas planifiés (ce ne sont pas des projets).
- La durée totale est **cumulée**, pas parallélisée : à 42 on mène souvent deux
  projets en même temps, donc lis-la comme un budget d'effort.
- Les projets jamais validés par personne (0 completion) sont marqués
  `0 validation` : ils sont dans les listes officielles mais peut-être fermés
  sur ton campus.
- Pour les combinaisons les plus contraintes (3 ou 4 titres surtout), le nombre
  minimal n'est pas toujours *prouvé* dans le budget de calcul : il s'affiche
  alors suivi de `~`, c'est un majorant et l'optimum est peut-être plus bas.
  Augmente `--budget` / `--big-budget`.
- Les 16 réglages de prérequis multiplient le calcul par 16. `--no-variants` ne
  calcule que le réglage par défaut (toutes chaînes actives) et va bien plus vite.
