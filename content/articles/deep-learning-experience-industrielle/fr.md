---
title: "Deep learning et expérience industrielle : associer signaux et expertise"
date: 2026-11-23
summary: Des historiques aux hypothèses soumises aux métiers : ce que le deep learning pourrait apporter à l'industrie, et les conditions nécessaires pour en évaluer les limites.
tags: IA, Industrie
type: Réflexion
related: articles/capter-fiabiliser-decider.html | La boucle : capter, fiabiliser, décider
draft: false
---

Une installation produit des signaux, des événements et des historiques. Les personnes qui la connaissent, elles, apportent les circonstances, les changements et les nuances que les chiffres ne montrent pas toujours. Le deep learning peut être une piste pour analyser certains ensembles de données ; il ne remplace ni cette expertise ni la compréhension du processus.

> **L'idée à retenir** : un modèle peut aider à formuler une hypothèse. Il ne transforme pas, à lui seul, une corrélation en diagnostic ou en décision sûre.

## De quoi parle-t-on ?

Le deep learning, ou apprentissage profond, désigne une famille de méthodes d'apprentissage automatique fondées sur des réseaux de neurones comportant plusieurs couches. Selon le problème et les données, ces modèles peuvent être utilisés, par exemple, pour classer des images ou analyser des séries temporelles.

Ce n'est pas synonyme d'intelligence générale, et ce n'est pas forcément le meilleur choix pour chaque problème. Une règle claire, une analyse statistique ou un modèle plus simple peut être plus facile à expliquer, à maintenir et parfois suffisant. La méthode vient après la question métier, pas avant.

## Des signaux à une hypothèse à examiner

Imaginons une **situation fictive** : sur une ligne de production, on dispose de mesures de vibration et de température, d'états de marche et de notes d'intervention. Une analyse pourrait mettre en évidence une séquence inhabituelle et proposer de l'examiner. Une personne compétente la confronterait alors au contexte : changement de cadence, opération de maintenance, capteur remplacé ou autre explication possible.

:::figure signaux-expertise "Scénario fictif : des signaux contextualisés alimentent une analyse ; une hypothèse est soumise à l'expertise humaine."

Une séquence inhabituelle n'est pas nécessairement une panne. Et même si elle précède un arrêt dans un historique, cela ne prouve pas qu'elle en est la cause. L'intérêt de l'outil est d'aider à orienter l'examen, pas de conclure à la place des métiers.

## Les données racontent une partie de l'histoire

Pour étudier un usage, il faut d'abord comprendre ce que l'on possède :

- Les mesures, leurs unités, leur fréquence, leurs trous et les éventuels changements de capteur.
- Les événements de production : marche, arrêt, produit fabriqué, cadence ou changement de réglage, lorsqu'ils sont disponibles.
- Les interventions et les anomalies connues, avec leurs dates et le degré de confiance dans leur description.
- Les changements de procédé, d'équipement ou d'organisation qui rendent certaines périodes différentes.

Un historique long n'est pas automatiquement représentatif. Les pannes rares peuvent être peu documentées ; un événement peut être étiqueté après coup de façon imprécise. Les données absentes ou les changements de contexte doivent être identifiés avant de tirer des conclusions.

## Séparer entraînement et vérification

Un modèle apprend à partir d'un ensemble d'exemples. Pour évaluer s'il peut être utile sur des situations non vues, il faut lui réserver des données distinctes pour le réglage et pour un test final, sans laisser les informations futures influencer l'entraînement.

Dans une série temporelle, une séparation qui respecte l'ordre du temps est souvent plus pertinente qu'un mélange aléatoire : on entraîne sur le passé et on vérifie sur une période ultérieure, adaptée au cas étudié. Les transformations apprises à partir des données doivent elles aussi être calculées sans utiliser le futur réservé au test.

Cette précaution limite une forme de **fuite de données** : un résultat qui semble excellent parce que le modèle a indirectement eu accès à ce qu'il devait prédire. Elle ne garantit pas pour autant que les conditions futures ressembleront au passé.

## Mesurer une utilité, pas seulement un score

Une évaluation utile doit rapprocher les résultats des conséquences concrètes :

| Question | Pourquoi elle compte |
| --- | --- |
| Que se passe-t-il si l'alerte est fausse ? | Trop de vérifications inutiles peuvent rendre le système moins utile. |
| Que se passe-t-il si un événement est manqué ? | Le coût d'une absence d'alerte peut être très différent selon le contexte. |
| Sur quelles périodes et quels équipements a-t-on testé ? | Un résultat local ne se généralise pas automatiquement. |
| Les personnes peuvent-elles examiner les éléments proposés ? | Une hypothèse doit pouvoir être confrontée aux observations et au contexte. |
| Comment détecter un changement dans le temps ? | Le procédé ou les données peuvent évoluer après l'évaluation initiale. |

Il faut aussi regarder la confidentialité, les droits d'accès, les ressources nécessaires et les modalités de maintenance. Pour une décision ayant des conséquences importantes, le rôle de l'outil et la validation humaine doivent être définis avant toute mise en service.

## Commencer par une question utile

Une démarche progressive peut partir d'une question précise, d'un périmètre limité et d'un historique dont on comprend les limites. On compare ensuite plusieurs approches, y compris des méthodes simples, sur des données séparées. On examine les erreurs avec les métiers avant d'envisager un usage plus large.

Les exemples de cet article décrivent des **possibilités**, pas des fonctionnalités déclarées comme déployées dans mes projets. L'enjeu n'est pas de mettre du deep learning partout, mais de déterminer quand il apporte une aide vérifiable.

## Pour aller plus loin

Cette réflexion développe mon [post d'origine sur le deep learning et l'expérience industrielle](https://www.linkedin.com/feed/update/urn:li:activity:7524579115744677889/). La documentation de [scikit-learn sur la validation des séries temporelles](https://scikit-learn.org/stable/modules/cross_validation.html#time-series-split) explique pourquoi l'ordre du temps compte dans l'évaluation.

Les signaux apportent des indices ; l'expertise leur donne un contexte ; la décision reste une responsabilité.
