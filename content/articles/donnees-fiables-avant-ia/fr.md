---
title: "Une IA utile commence par des données fiables"
date: 2026-11-23
summary: Avant de choisir un modèle, il faut comprendre, rapprocher et fiabiliser les données qui alimenteront les décisions. Voici une démarche concrète, du signal aux usages.
tags: Données, IA
type: Réflexion
related: articles/capter-fiabiliser-decider.html | La boucle : capter, fiabiliser, décider
related: projets/kpi-usine-power-bi.html | KPI centralisé usine
draft: false
---

On parle volontiers de modèles, d'agents et d'intelligence artificielle. Mais avant de demander à un outil de nous aider à décider, une question mérite toute notre attention : **sur quelles données va-t-il s'appuyer ?** Une réponse rapide ne vaut pas grand-chose si elle repose sur des informations incomplètes, contradictoires ou sorties de leur contexte.

> **L'idée à retenir** : une donnée utile n'est pas seulement une donnée disponible. Elle doit être comprise, contrôlée et adaptée à la décision qu'elle est censée éclairer.

## Une donnée peut sembler juste sans l'être

Dans une organisation industrielle, les informations se trouvent souvent à plusieurs endroits : logiciels métiers, historiques de production, fichiers partagés, relevés manuels ou encore données issues des équipements. Chaque source a été créée pour répondre à un besoin précis. Les réunir ne suffit pas à leur donner automatiquement le même sens.

Prenons un **exemple fictif** : deux fichiers mentionnent une même référence de pièce, mais l'un utilise une ancienne désignation et l'autre la désignation actuelle. Un troisième contient une date sans préciser le fuseau horaire. Les valeurs sont bien présentes ; pourtant, les rapprocher trop vite peut produire un résultat trompeur.

Une anomalie n'est pas toujours une erreur à effacer. Un doublon apparent peut représenter deux événements distincts. Une valeur absente peut signaler une mesure non réalisée. Avant de corriger, il faut comprendre l'histoire de la donnée avec les personnes qui la connaissent.

## Du signal à un usage partagé

La figure suit un chemin volontairement simplifié : des sources différentes, un diagnostic, une préparation, puis des usages par les métiers et, lorsque c'est pertinent, par l'IA. Les données montrées sont fictives.

:::figure donnees-ia "Démonstration fictive : repérer les écarts, préparer les données et les mettre au service des métiers et de l'IA."

Dans [La boucle : capter, fiabiliser, décider](/articles/capter-fiabiliser-decider.html), je présente l'ensemble de la démarche. Ici, je m'arrête sur le maillon intermédiaire : ce qui rend un signal compréhensible et exploitable.

## Diagnostiquer avant de nettoyer

Le premier travail consiste à observer ce qui existe, sans supposer que toutes les sources parlent de la même chose.

| Question | Ce qu'elle permet de vérifier |
| --- | --- |
| D'où vient la donnée ? | La source, son responsable et la façon dont la valeur est produite. |
| Que représente-t-elle ? | La définition métier, l'unité, le périmètre et la période. |
| Peut-on la rapprocher ? | Les identifiants, les formats, les correspondances et les éventuels doublons. |
| Est-elle utilisable maintenant ? | La fraîcheur, les valeurs manquantes, les droits d'accès et les contrôles disponibles. |

Ce diagnostic peut révéler des formats différents, des champs vides ou des ruptures dans l'historique. Il peut aussi montrer que deux indicateurs portant le même nom ne mesurent pas exactement la même chose. La bonne réaction n'est pas de choisir arbitrairement l'un des deux : il faut clarifier leur définition et leur usage.

## Fiabiliser sans effacer le contexte

Préparer les données, c'est rendre les transformations explicites et reproductibles : harmoniser les formats, rapprocher les références, documenter les règles et contrôler le résultat. Certaines corrections peuvent être automatisées ; d'autres demandent une vérification métier.

Quelques principes me paraissent essentiels :

- **Conserver la provenance** : savoir retrouver la source et comprendre les transformations appliquées.
- **Signaler l'incertitude** : distinguer une valeur manquante, estimée ou corrigée d'une valeur réellement observée.
- **Définir les règles avec les métiers** : un contrôle technique ne remplace pas la connaissance du processus.
- **Gérer les accès** : partager ce qui est nécessaire, avec des droits adaptés à la sensibilité des données.
- **Contrôler dans la durée** : une source ou une règle peut évoluer ; la fiabilité n'est pas acquise une fois pour toutes.

Une donnée « propre » n'est donc pas forcément une donnée parfaite. C'est une donnée dont on connaît suffisamment la signification, les limites et le niveau de confiance pour l'usage envisagé.

## Un socle commun, plusieurs décisions

Une même base préparée peut servir à éclairer des questions différentes : suivre une activité, comprendre un écart, prioriser une analyse ou alimenter une expérience d'IA. Le besoin n'est pas identique dans chaque cas : un indicateur de pilotage et un modèle prédictif n'exigent pas nécessairement la même profondeur d'historique, la même fréquence ou les mêmes contrôles.

Un tableau de bord partagé peut aider plusieurs métiers à discuter à partir de définitions communes. L'IA peut, selon le cas, aider à rechercher, résumer ou examiner des informations. **Aucun de ces outils ne garantit à lui seul que la donnée est juste**, et tous les problèmes ne nécessitent pas un modèle d'IA.

Le projet [KPI centralisé usine](/projets/kpi-usine-power-bi.html) présente une application de la mise en commun des données pour le pilotage. Il ne faut pas en déduire, pour autant, qu'un modèle prédictif est déployé ou que toutes les données sont adaptées à tous les usages.

## Par où commencer ?

1. Choisir une décision concrète à améliorer et les personnes concernées.
2. Identifier les sources nécessaires et expliciter ce que mesure chaque champ important.
3. Examiner quelques écarts avec les métiers avant d'automatiser les corrections.
4. Documenter les transformations, les contrôles, les responsables et les limites connues.
5. Tester le résultat sur un usage réel, puis suivre les évolutions dans le temps.

Commencer petit n'empêche pas de voir grand. Au contraire, un premier périmètre maîtrisé permet de construire une confiance qui pourra ensuite être étendue.

## Pour aller plus loin

Cette réflexion développe mon [post d'origine sur les données et l'IA](https://www.linkedin.com/feed/update/urn:li:activity:7528898259067625472/). Pour approfondir les questions de confiance et de gestion des risques de l'IA : [AI Risk Management Framework du NIST](https://www.nist.gov/itl/ai-risk-management-framework).

La performance ne commence pas au moment où l'IA répond. Elle commence quand les personnes peuvent comprendre et interroger les données qui nourrissent cette réponse.
