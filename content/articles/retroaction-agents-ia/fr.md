---
title: "Agents IA : progresser grâce à la rétroaction"
date: 2026-11-23
summary: Un agent ne devient pas fiable parce qu'il enchaîne des actions. Il lui faut un objectif clair, des retours vérifiables, des limites et une place pour la décision humaine.
tags: IA, Agents
type: Réflexion
related: projets/equipe-agents-ia.html | Une équipe d'agents IA
related: projets/assistante-ia-locale.html | Orélia, assistante personnelle souveraine
draft: false
---

Donner une tâche à un agent IA ne garantit pas qu'il saura reconnaître une erreur, encore moins la corriger sans conséquence. Ce qui m'intéresse, ce n'est pas seulement sa capacité à produire une réponse ou à utiliser un outil : c'est la manière dont on organise **le retour entre une action, son résultat et la décision suivante**.

> **L'idée à retenir** : une boucle de rétroaction rend un travail plus vérifiable lorsqu'elle s'appuie sur des critères explicites, des limites d'action et une validation adaptée au risque.

## Un agent n'est pas une boîte magique

Un agent peut être conçu pour recevoir un objectif, consulter des informations, proposer des étapes et utiliser certains outils. Selon le système, ses possibilités et son degré d'autonomie varient. Un enchaînement d'actions impressionnant n'est pas une preuve que le résultat est correct, complet ou autorisé.

Le contexte compte : quels documents sont accessibles ? Quel outil peut être appelé ? La sortie est-elle une simple proposition ou une modification réelle ? Sans réponses à ces questions, une « autonomie » affichée peut surtout déplacer le risque.

## Une boucle simple : proposer, observer, évaluer, ajuster

Prenons un **exemple fictif** : un agent prépare un brouillon de compte rendu de maintenance à partir de notes mises à sa disposition. Il propose une synthèse, la confronte à des critères, signale les informations manquantes et ajuste le brouillon. Une personne vérifie ensuite ce qui doit être retenu.

:::figure boucle-agents "Démonstration fictive : une proposition passe par l'observation, l'évaluation et l'ajustement, avec contrôle humain."

Dans cette figure, « agir » peut simplement vouloir dire **préparer une proposition**. L'envoi d'un document, la modification d'un fichier ou toute autre action ayant un effet réel doivent relever des autorisations et validations définies pour le contexte.

## Qu'est-ce qu'un bon retour ?

Un retour utile donne de quoi décider de la suite. « Réessaie » est moins exploitable que « la date manque, et la cause indiquée n'apparaît pas dans les notes fournies ». Mais un contrôle n'est fiable que s'il est lui-même pertinent.

| Retour possible | Ce qu'il apporte | Limite |
| --- | --- | --- |
| Résultat d'un outil | Une sortie, une erreur ou un état observable. | L'outil peut échouer ou ne couvrir qu'une partie du problème. |
| Règle explicite | Un format attendu, un champ obligatoire ou une contrainte vérifiable. | Une règle respectée ne prouve pas que le fond est juste. |
| Source citée | Un passage à confronter à la proposition. | Une source peut être absente, périmée ou inadaptée. |
| Avis humain | Une lecture du contexte, des conséquences et des priorités. | La personne a aussi besoin d'informations et de temps. |

Il est important de conserver la distinction entre **ce qui a été observé**, **ce qui est déduit** et **ce qui reste inconnu**. Si les notes ne permettent pas d'identifier une cause, une réponse utile doit pouvoir le dire plutôt que la fabriquer.

## Ajuster ne veut pas dire réentraîner le modèle

Le mot « apprendre » peut prêter à confusion. Dans une boucle d'exécution, un système peut utiliser un retour pour modifier sa prochaine proposition ou sa prochaine étape, sans que les paramètres du modèle soient modifiés. On parle alors d'ajustement du travail en cours, pas nécessairement d'apprentissage automatique.

Un réentraînement ou un ajustement des paramètres est une démarche distincte, qui nécessite ses propres données, évaluations et décisions. Rien dans cet article ne suppose qu'un projet présenté sur ce site modifie automatiquement un modèle.

## Mettre les limites au bon endroit

Pour une tâche réelle, quelques garde-fous concrets sont plus utiles qu'une promesse vague d'autonomie :

- Définir les outils autorisés et limiter les droits au strict nécessaire.
- Séparer les contenus consultés des instructions qui ont autorité sur le système.
- Prévoir un nombre limité de tentatives et une condition d'arrêt en cas d'incertitude ou d'erreur répétée.
- Demander une validation humaine avant les actions sensibles ou difficiles à annuler.
- Conserver une trace des sources, des décisions, des appels d'outils et des échecs pertinents.

Un document externe peut contenir des instructions trompeuses destinées à influencer un modèle. Des consignes textuelles seules ne constituent pas une garantie ; les permissions des outils et les contrôles autour du système comptent aussi.

## Évaluer l'ensemble du travail

La question n'est pas seulement « l'agent a-t-il terminé ? ». Il faut aussi examiner si la réponse répond au besoin, si ses sources sont vérifiables, si les actions étaient autorisées et si l'intervention humaine reste proportionnée.

Pour commencer, une tâche bornée et réversible est un bon terrain d'essai : préparer un brouillon, le comparer à quelques critères, puis observer les corrections apportées par une personne. Les cas difficiles et les échecs sont aussi utiles que les démonstrations réussies pour comprendre les limites.

La rétroaction n'a pas pour but d'effacer l'humain de la boucle. Elle peut, au contraire, rendre son intervention plus informée et mieux placée.

## Pour aller plus loin

Cette réflexion développe mon [post d'origine sur la rétroaction des agents IA](https://www.linkedin.com/feed/update/urn:li:activity:7524918307263635456/). Pour les risques liés aux instructions présentes dans les contenus consultés : [OWASP, Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/).

Les pages [Équipe d'agents IA](/projets/equipe-agents-ia.html) et [Orélia](/projets/assistante-ia-locale.html) présentent mes projets ; cette réflexion générale ne leur attribue pas automatiquement les mécanismes décrits ici.
