---
title: "Rétro-ingénierie industrielle : comprendre avant de modifier"
date: 2026-11-23
summary: Un équipement peut tourner des années avec une documentation incomplète ou périmée. Comment retrouver ce qu'il fait vraiment, le valider contre la mesure, puis décider : réparer, fiabiliser, adapter ou remplacer.
tags: Automatisme, Fiabilité
type: Démarche
image: assets/img/og/retro-ingenierie-industrielle.png
related: competences/retro-ingenierie-industrielle.html | Compétence : rétro-ingénierie industrielle (avec démo)
related: competences.html | Toutes les compétences
---

Un équipement peut fonctionner pendant des années avec des plans incomplets, un programme jamais sauvegardé ou une documentation que plus personne n'a mise à jour. Tant que tout marche, cela ne se voit pas. Le jour d'un dépannage, d'une évolution ou d'un remplacement, tout devient un pari. Cet article décrit une démarche pour retrouver ce que fait vraiment l'équipement avant d'y toucher.

> **À savoir** : l'exemple suivi dans cet article (un convoyeur avec un vérin de poussée), ses chronogrammes et ses valeurs sont **fictifs**. Ils servent à illustrer la démarche, pas à décrire une installation réelle.

## Quand la documentation ne dit plus la vérité

Au départ, la documentation et l'installation coïncident. Puis viennent les dépannages en urgence, les petites évolutions, les remplacements de pièces : chacun ajoute un écart, rarement reporté dans les plans. Avec le temps, ce que l'on croit savoir de l'équipement s'éloigne de ce qu'il fait réellement.

:::figure derive "La documentation décrit l'installation d'origine ; l'installation réelle s'en éloigne à chaque intervention non reportée."

Quatre situations rendent cet écart critique :

- Les plans et schémas n'existent plus, ou ne reflètent pas l'installation réelle.
- Une pièce, un automate ou un variateur n'est plus fabriqué : il faut trouver un équivalent sans changer le comportement.
- Le programme n'a jamais été sauvegardé, ou son auteur n'est plus là.
- Au fil des dépannages, l'équipement a été modifié sans que la documentation suive.

## Le principe : comprendre avant de modifier

La rétro-ingénierie industrielle consiste à reconstituer le fonctionnement d'un équipement existant à partir de ce que l'on peut observer et mesurer, puis à le consigner. L'idée directrice tient en une phrase : **comprendre ce que fait réellement l'équipement, pas ce que l'on croit qu'il fait.**

La démarche se déroule en cinq étapes, avec un retour au modèle tant qu'un écart subsiste entre ce que l'on a reconstitué et ce que l'on mesure.

:::figure boucle "Cinq étapes ; si la validation révèle un écart, on retourne reconstituer le modèle."

Pour la suite, on suit un exemple fictif : un convoyeur amène une pièce, s'arrête, puis un vérin pousse la pièce vers un bac. Aucun schéma n'est disponible. Cinq signaux sont repérés : trois entrées (I1 pièce présente, I2 vérin sorti, I3 vérin rentré) et deux sorties (Q1 moteur du tapis, Q2 électrovanne du vérin).

## Observer et relever, sans rien toucher

La première règle est la lecture seule : on regarde fonctionner l'équipement sans rien forcer ni modifier. Cette observation fait naître une première liste de questions (« pourquoi le vérin attend-il avant de pousser ? »). Ensuite, on relève les signaux pendant plusieurs cycles pour obtenir un chronogramme.

:::figure chrono "Chronogramme fictif d'un cycle : la pièce est détectée à 2,4 s, mais le vérin ne démarre qu'à 3,2 s."

Sur ce relevé, un détail attire l'attention : le moteur s'arrête dès la détection de la pièce, mais le vérin ne sort que 0,8 s plus tard. Ce que l'on voit à l'écran ne suffit pas à l'expliquer : c'est exactement le genre d'élément qu'une documentation absente ne dit pas.

Aucune source ne suffit seule. C'est leur confrontation qui donne un modèle fiable :

| Source | Ce qu'elle apporte | Sa limite |
| --- | --- | --- |
| Schémas et plans | Le câblage prévu, les références | Peuvent ne plus refléter l'installation |
| Programme de l'automate | La logique, les variables, les temporisations | Peut être absent, ou différent de celui en service |
| Mesure sur l'installation | Ce qui se passe réellement, dans quel ordre | Ne dit pas pourquoi |
| Interface opérateur | Écrans, alarmes, consignes : la logique attendue | Montre ce qui a été prévu d'afficher |
| Personnes d'exploitation et de maintenance | L'histoire de l'équipement, les astuces, les pannes passées | Mémoire individuelle, à recouper |

## Reconstituer le fonctionnement

À partir des relevés, on déduit les états de la machine, les conditions de passage de l'un à l'autre et la logique de commande. Pour le convoyeur, une première hypothèse se dessine : le tapis attend la pièce, le vérin pousse dès que la pièce est détectée, puis il rentre.

:::figure modele "Premier modèle d'états du convoyeur (fictif) : trois états, des transitions déclenchées par les entrées I1, I2 et I3."

Ce modèle est une hypothèse, pas une vérité. Il est utile surtout parce qu'on peut le confronter à la mesure.

## Valider : l'écart est une information

On compare le modèle aux relevés, et chaque écart révèle un élément oublié. Ici, l'hypothèse « le vérin pousse dès que la pièce est détectée » ne colle pas à la mesure : il manque deux temporisations. Une première, de 0,8 s, fait attendre le vérin avant de pousser. Une seconde, de 0,6 s, le maintient sorti avant qu'il rentre. Le modèle est alors corrigé, puis comparé de nouveau, jusqu'à zéro écart.

:::figure ecart "Le modèle initial s'écarte de la mesure à deux endroits ; en le corrigeant (T1 et T2), les écarts disparaissent."

Quelques précautions :

- Un modèle conforme sur quelques cycles n'est pas forcément complet : on vérifie aussi les cas rares (défaut, reprise après arrêt, démarrage à froid).
- Les cas qui ne se produisent presque jamais ne se provoquent pas sur une installation en production : on les traite à part, hors production, sur banc ou en simulation.

## Documenter pour que cela serve

Une compréhension qui reste dans la tête d'une personne n'est qu'une dette de plus. Le résultat de la démarche est un dossier que l'on peut utiliser pour dépanner, faire évoluer ou remplacer sans deviner :

| Livrable | Contenu |
| --- | --- |
| Liste des entrées/sorties | Chaque signal, avec son adresse, son rôle et son état de repos |
| Analyse fonctionnelle | Les états, les séquences, les conditions de passage et les temporisations |
| Schémas à jour | Le câblage réel, repéré et corrigé |
| Programme commenté et sauvegardé | Une version lisible, datée et archivée, avec son historique |
| Dossier de maintenance | Références des pièces, équivalents possibles, procédures de remplacement |
| Plan de modernisation (optionnel) | Les options pour remplacer ou moderniser, avec leurs risques et leurs priorités |

## Décider en connaissance de cause

Avec un équipement compris et documenté, la décision devient un vrai choix plutôt qu'un pari. Quatre issues sont possibles :

- **Réparer** : remettre en état à l'identique, quand l'équipement est sain et que la pièce défaillante est identifiée.
- **Fiabiliser** : traiter les causes d'arrêt répétées (point faible, composant fragile, absence de sauvegarde).
- **Adapter** : modifier le comportement pour répondre à un nouveau besoin, avec un modèle de référence pour mesurer l'effet.
- **Remplacer ou moderniser** : changer le matériel ou la commande en conservant le comportement validé, ou en le modifiant en conscience.

## Garde-fous

Comprendre un équipement existant suppose de ne rien casser. Quatre règles encadrent la démarche :

1. **Sécurité d'abord** : lecture seule par défaut, consignation avant toute intervention, procédures du site respectées.
2. **Sauvegarder avant d'intervenir** : une copie datée et vérifiée du programme et des paramètres avant la moindre modification.
3. **Valider hors production** : tester sur banc ou en simulation avant de toucher à l'équipement en service.
4. **Cadre juridique et contractuel** : licences, propriété intellectuelle, confidentialité et contrats. On vérifie ce qui est permis avant de relever ou de modifier.

## Pour aller plus loin

La compétence est présentée, avec une démo interactive de cette démarche, sur la page [Rétro-ingénierie industrielle](/competences/retro-ingenierie-industrielle.html). Les autres compétences associées sont réunies dans la page [Compétences](/competences.html).

On ne fiabilise bien que ce que l'on comprend.
