# Articles : mode d'emploi

Les articles sont de simples fichiers texte (Markdown) dans ce dossier : mes articles, réflexions, idées et retours sur projets. Un script les transforme en pages du site : GitHub Pages n'a pas de base de données, donc **on écrit, on génère, on publie**.

## Publier un article

1. Copier le dossier `_modele` et le renommer, par exemple `mon-article` (minuscules, chiffres et tirets). Ce nom devient une partie de l'adresse de la page.
2. Écrire l'article dans `fr.md`. La version anglaise `en.md` est facultative : sans elle, l'article n'apparaît que dans la version française.
3. Depuis la racine du dépôt, lancer :

   ```
   python tools/build_articles.py
   ```

   Le script contrôle l'article (il indique le fichier et la ligne en cas d'erreur) puis génère les pages, le sommaire, le bandeau de l'accueil et le plan du site.
4. Vérifier en local si besoin, puis publier :

   ```
   git add -A
   git commit -m "Article : mon titre"
   git push origin main
   ```

   Le site est mis à jour environ une minute après le `push`.

Pour seulement vérifier sans rien écrire : `python tools/build_articles.py --check`.

## L'en-tête de chaque fichier

Entre deux lignes `---`, en haut du fichier :

| Champ | Obligatoire | Rôle |
| --- | --- | --- |
| `title` | oui | titre de l'article |
| `date` | oui | date de publication, au format `AAAA-MM-JJ` (classe le sommaire) |
| `summary` | oui | résumé de 1 à 2 phrases (sommaire, accueil, aperçu de partage) |
| `tags` | non | thèmes séparés par des virgules (filtres du sommaire) |
| `type` | non | nature du texte : `Article`, `Réflexion`, `Idée`, `Retour d'expérience`, `Projet`… (affiché en tête de l'article et dans le sommaire ; « Article » par défaut) |
| `updated` | non | date de mise à jour, `AAAA-MM-JJ` |
| `image` | non | image d'aperçu de partage, ex. `assets/img/articles/mon-article/apercu.png` (1200 × 630) |
| `related` | non | page liée, à répéter si besoin : `projets/page.html \| Libellé` |
| `slug` | non | impose l'adresse de la page (par défaut : le nom du dossier) |
| `draft` | non | `true` : l'article n'est pas publié |

## Mise en forme

- `## Titre` : titre de section. Chaque section alimente le **sommaire** de l'article (colonne de gauche).
- `### Titre` : sous-titre. Le titre de l'article vient de l'en-tête : ne pas utiliser `#`.
- `**gras**`, `*italique*`, `` `code` ``, `[texte](adresse)`.
- Un lien commençant par `/` pointe vers une page du site : `[Orélia](/projets/assistante-ia-locale.html)`.
- Listes : `- puce` ou `1. étape`. Pour une phrase sur plusieurs lignes dans une puce, indenter la ligne suivante.
- `> texte` : encadré mis en avant.
- Tableaux : `| A | B |` suivi de la ligne `| --- | --- |`.
- Image seule sur une ligne : `![description](/assets/img/articles/mon-article/image.png "légende")`. Déposer les images dans `assets/img/articles/<nom-de-l-article>/`.
- Le premier paragraphe, avant tout `##`, devient l'introduction.
- Les `#hashtags` collés au texte sont acceptés tels quels.

## Ce que le site fait tout seul

- La page **Articles** (sommaire) liste tous les articles, du plus récent au plus ancien, regroupés par année.
- À partir de **3 articles**, le dernier est mis en avant. À partir de **4 articles**, des filtres par thème et une recherche apparaissent.
- Les trois derniers articles sont présentés sur l'**accueil**, dans la section « Articles ».
- Le **plan du site** (`sitemap.xml`) et les aperçus de partage sont mis à jour.
- Les pages générées portent un commentaire « ne pas modifier à la main » : toute modification manuelle serait écrasée à la prochaine génération. Modifier le fichier `.md`, puis relancer le script.

## Points d'attention

- **Brouillons** : `draft: true` empêche la publication de la page, mais le fichier `.md` reste lisible dans le dépôt public. Ne rien y écrire de confidentiel.
- **Aucun article** : la section « Articles » de l'accueil disparaît (la numérotation des sections suivantes s'ajuste) et la page Articles affiche « Les premiers articles arrivent bientôt ».
- **Modifier ou retirer un article** : modifier le `.md` (ou supprimer son dossier), relancer le script, puis publier. Les pages devenues inutiles sont supprimées automatiquement.
- Le script n'a besoin que de Python 3.8 ou plus récent, sans installation supplémentaire.
