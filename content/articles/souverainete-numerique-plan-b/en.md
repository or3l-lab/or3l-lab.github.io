---
title: "Digital sovereignty: preparing a plan B"
date: 2026-11-23
summary: Control over tools and data also means knowing how to continue when a service is unavailable. A look at dependencies, backups and recovery.
tags: Sovereignty, Resilience
type: Reflection
related: en/projects/local-ai-assistant.html | Orélia, a sovereign personal assistant
draft: false
---

A digital tool can become indispensable before we have understood all its dependencies. What happens if the service, the connection or the sign-in system becomes unavailable? Digital sovereignty is not just a matter of choosing a supplier or installing software: it also asks whether we can understand, protect and resume our activities.

> **The key idea**: having a plan B does not mean everything can continue without interruption. It means knowing the priorities, the limits and the recovery measures that have actually been tested.

## Depending on others is not the problem; ignoring it is

Relying on external solutions is normal. They can provide skills, maintenance and services that an organisation cannot or does not want to operate alone. The risk arises when a critical dependency remains invisible until it is unavailable.

One tool can depend on several links at once: network, supplier, login, licence, proprietary format, hardware, service provider or the person who knows the procedure. A file backup, for example, may not be enough if the software or permissions needed to open it are no longer available.

The useful question is not “should we do everything ourselves?”, but **which dependencies are acceptable, for which uses, and with what alternatives?**

## Imagine an interruption before it happens

In this **fictional simulation**, a team normally consults a document service. The service becomes unavailable. A backup copy and a reduced-operation procedure, if prepared and tested, may help part of the work continue. Once the service returns, changes are reconciled before normal operation resumes.

:::figure plan-b "Fictional scenario: a service becomes unavailable, prepared continuity measures help, then checks precede recovery."

The figure does not depict a real outage or guarantee automatic failover. It illustrates possible decisions that depend on the tools and procedures available.

## Map what really matters

Not everything needs to be restored at the same time. Starting with activities leads to more useful questions than a list of software alone:

- Which decisions or operations become difficult if this tool stops?
- Who uses the data, and what information is essential?
- Where is the data, and in what format can it be retrieved?
- Which permissions, applications and people are needed to use it?
- What fallback exists, and what are its limits?

This map can reveal shared dependencies: for example, a backup in a service accessed with the same account as the main application may be unavailable if that account cannot be used. The point is to identify these common links, then select suitable protections.

## A useful backup is one that can be restored

Backing up is more than copying. Decide **what** to save, **how often**, **where**, **with which access rights** and **how to restore it**. Depending on the risk, a disconnected or otherwise isolated copy may reduce exposure to certain incidents. Its protection and availability need checking.

Two reference points help discuss priorities:

| Reference point | Question to ask |
| --- | --- |
| Acceptable data loss | What interval of data can we afford to lose between backups? |
| Target recovery time | How quickly must an activity resume, at least partially? |

These objectives do not replace a restoration exercise. A test can check access, integrity, required software and whether the procedure is understood. It also reveals the time actually needed and any gap from the target.

## Local and cloud: think control, not labels

A local solution can reduce some dependencies on a connection or remote service. It also introduces responsibilities: hardware, updates, backups, security and skills. Conversely, a cloud service can simplify some aspects while creating other contractual, technical or geographic dependencies.

“Local” does not automatically mean “sovereign”. Control depends, among other things, on access rights, export formats, contracts, where and under what conditions data is processed, and the ability to change solutions. The right balance depends on the sensitivity of the information and continuity requirements.

## A plan B that can be practised

A continuity plan does not have to be complicated to be useful, but it does have to be concrete:

1. Name priority activities, responsible people and ways to contact them.
2. Describe reduced operation: what continues, what stops and what requires approval.
3. Provide protected copies, the tools to read them and the necessary access.
4. Record operations carried out during the interruption.
5. Test restoration and reconcile changes when the service returns.

An exercise can start with a simple scenario and improve with the people involved. The goal is not to promise zero risk: it is to reduce improvisation when it is most costly.

## Further reading

This article develops my [original post on digital sovereignty](https://www.linkedin.com/feed/update/urn:li:activity:7527280198258458624/). The [Cybermalveillance.gouv.fr backup guidance](https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/sauvegardes) discusses protection and testing in particular (in French).

Sovereignty can also be measured by a very practical question: if the tool stops, do we know what we can still do?
