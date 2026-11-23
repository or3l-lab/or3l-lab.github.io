---
title: "Souveraineté numérique : préparer son plan B"
date: 2026-11-23
summary: Maîtriser ses outils et ses données, c'est aussi savoir continuer quand un service devient indisponible. Une réflexion sur les dépendances, les sauvegardes et la reprise.
tags: Souveraineté, Résilience
type: Réflexion
related: projets/assistante-ia-locale.html | Orélia, assistante personnelle souveraine
draft: false
---

Un outil numérique peut devenir indispensable sans que l'on mesure toutes ses dépendances. Que se passe-t-il si le service, la connexion ou le système d'authentification n'est plus disponible ? La souveraineté numérique ne se résume pas à choisir un fournisseur ou à installer un logiciel : elle pose aussi la question de notre capacité à comprendre, protéger et reprendre nos activités.

> **L'idée à retenir** : disposer d'un plan B ne signifie pas pouvoir tout maintenir sans interruption. Cela signifie connaître ses priorités, ses limites et les moyens réellement testés pour reprendre.

## Dépendre n'est pas le problème ; l'ignorer, si

Il est normal de s'appuyer sur des solutions externes. Elles peuvent apporter des compétences, de la maintenance et des services qu'une organisation ne souhaite pas ou ne peut pas assurer seule. Le risque apparaît lorsqu'une dépendance essentielle reste invisible jusqu'au jour où elle manque.

Un outil peut dépendre de plusieurs maillons à la fois : réseau, fournisseur, compte d'accès, licence, format propriétaire, matériel, prestataire ou personne qui connaît la procédure. Une sauvegarde de fichiers, par exemple, ne suffit pas nécessairement si l'on ne dispose plus du logiciel ou des droits permettant de les ouvrir.

La bonne question n'est donc pas « tout faire soi-même ? », mais **quelles dépendances accepte-t-on, pour quels usages, avec quelles alternatives ?**

## Imaginer une interruption avant qu'elle arrive

Dans cette **simulation fictive**, une équipe consulte habituellement un service documentaire. Le service devient indisponible. Une copie de secours et une procédure de travail dégradé, si elles ont été préparées et testées, peuvent aider à poursuivre une partie de l'activité. Au retour du service, les modifications sont rapprochées avant de reprendre le fonctionnement normal.

:::figure plan-b "Scénario fictif : service indisponible, continuité préparée, puis vérification avant le retour à la normale."

La figure ne représente ni une panne réelle ni une bascule automatique garantie. Elle montre une succession de décisions possibles, qui dépend des outils et des procédures disponibles.

## Cartographier ce qui compte vraiment

Tout ne doit pas être restauré au même moment. Commencer par les activités permet de poser des questions plus utiles qu'un simple inventaire de logiciels :

- Quelles décisions ou opérations deviennent difficiles si cet outil s'arrête ?
- Qui utilise les données, et quelles informations sont indispensables ?
- Où se trouvent les données et dans quel format peut-on les récupérer ?
- Quels accès, logiciels et personnes sont nécessaires pour les exploiter ?
- Quelle solution de repli existe, et quelles sont ses limites ?

Cette cartographie met souvent en évidence des dépendances croisées : une sauvegarde dans un service accessible avec le même compte que l'application principale, par exemple, peut être inaccessible si ce compte est indisponible. L'important est de repérer ces points communs, puis de choisir des protections adaptées.

## Une sauvegarde utile est une sauvegarde restaurable

Sauvegarder, ce n'est pas simplement copier. Il faut définir **quoi**, **à quelle fréquence**, **où**, **avec quels droits** et **comment restaurer**. Selon le risque, une copie déconnectée ou autrement isolée peut réduire l'exposition à certains incidents. Sa protection et sa disponibilité doivent être vérifiées.

Deux repères aident à discuter des priorités :

| Repère | Question à se poser |
| --- | --- |
| Perte de données acceptable | Quel intervalle de données peut-on se permettre de perdre entre deux sauvegardes ? |
| Délai de reprise visé | En combien de temps une activité doit-elle pouvoir reprendre, au moins partiellement ? |

Ces objectifs ne remplacent pas un exercice de restauration. Un test permet de vérifier les accès, l'intégrité, le logiciel nécessaire et la compréhension de la procédure. Il révèle aussi le temps réellement nécessaire et les éventuels écarts avec l'objectif.

## Local, cloud : raisonner en maîtrise, pas en étiquette

Une solution locale peut réduire certaines dépendances à une connexion ou à un service distant. Elle introduit aussi des responsabilités : matériel, mises à jour, sauvegardes, sécurité et compétences. À l'inverse, un service cloud peut simplifier certains aspects tout en créant d'autres dépendances contractuelles, techniques ou géographiques.

« Local » ne veut pas automatiquement dire « souverain ». La maîtrise dépend notamment des accès, des formats d'export, des contrats, du lieu et des conditions de traitement des données, ainsi que de la capacité à changer de solution. Le bon équilibre dépend de la sensibilité des informations et des exigences de continuité.

## Un plan B qui se pratique

Un plan de continuité n'a pas besoin d'être compliqué pour être utile, mais il doit être concret :

1. Nommer les activités prioritaires, les responsables et les moyens de les contacter.
2. Décrire le mode dégradé : ce qui continue, ce qui s'arrête et ce qui nécessite une validation.
3. Prévoir des copies protégées, les outils de lecture et les accès nécessaires.
4. Garder une trace des opérations réalisées pendant l'interruption.
5. Tester la restauration et organiser le rapprochement des modifications au retour.

Un exercice peut commencer par un scénario simple, puis être amélioré avec les personnes concernées. L'objectif n'est pas de promettre le risque zéro : c'est de réduire la part d'improvisation au moment où elle coûte le plus.

## Pour aller plus loin

Cette réflexion prolonge mon [post d'origine sur la souveraineté numérique](https://www.linkedin.com/feed/update/urn:li:activity:7527280198258458624/). Les recommandations de [Cybermalveillance.gouv.fr sur les sauvegardes](https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/sauvegardes) détaillent notamment la protection et les tests.

La souveraineté se mesure aussi à une question très concrète : si l'outil s'arrête, savons-nous ce que nous pouvons encore faire ?
