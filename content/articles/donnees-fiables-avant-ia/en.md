---
title: "Useful AI starts with reliable data"
date: 2026-11-23
summary: Before choosing a model, understand, reconcile and strengthen the data that will support decisions. A practical path from signals to shared uses.
tags: Data, AI
type: Reflection
related: en/articles/capter-fiabiliser-decider.html | The loop: capture, refine, decide
related: en/projects/factory-kpi-power-bi.html | Centralised factory KPI
draft: false
---

Models, agents and artificial intelligence get a lot of attention. But before asking a tool to help us decide, one question deserves equal attention: **what data will it rely on?** A quick answer has little value if it rests on incomplete, contradictory or decontextualised information.

> **The key idea**: useful data is more than available data. Its meaning must be understood, its quality checked and its limitations considered for the decision it is meant to inform.

## Data can look right and still mislead

In an industrial organisation, information often lives in several places: business systems, production histories, shared files, manual records and equipment data. Each source was created for a particular purpose. Putting them together does not automatically give their fields the same meaning.

Consider a **fictional example**: two files refer to the same part, but one uses an old description and the other the current one. A third contains a date without specifying its time zone. The values exist, yet combining them too quickly can lead to a misleading result.

An anomaly is not always an error to erase. An apparent duplicate may represent two different events. A missing value may mean that a measurement was never taken. Before correcting anything, we need to understand the history of the data with the people who know it.

## From a signal to shared use

The figure follows a deliberately simplified path: different sources, a diagnosis, preparation, then uses by business teams and, where appropriate, by AI. The data shown is fictional.

:::figure donnees-ia "Fictional demonstration: spot discrepancies, prepare data and put it to work for business teams and AI."

In [The loop: capture, refine, decide](/en/articles/capter-fiabiliser-decider.html), I describe the whole approach. Here I focus on the middle link: what makes a signal understandable and usable.

## Diagnose before cleaning

The first task is to examine what exists, without assuming that every source describes the same thing.

| Question | What it helps establish |
| --- | --- |
| Where does the data come from? | Its source, owner and how the value is produced. |
| What does it represent? | The business definition, unit, scope and period. |
| Can it be matched? | Identifiers, formats, mappings and possible duplicates. |
| Is it usable now? | Freshness, missing values, access rights and available checks. |

This diagnosis can reveal different formats, empty fields or gaps in a history. It can also show that two indicators with the same name do not measure exactly the same thing. Arbitrarily picking one is not the answer: their definitions and uses need clarification.

## Improve reliability without losing context

Preparing data means making transformations explicit and repeatable: harmonise formats, match references, document rules and check the result. Some corrections can be automated; others need business review.

A few principles matter in particular:

- **Preserve provenance**: be able to trace the source and understand the transformations applied.
- **Make uncertainty visible**: distinguish a missing, estimated or corrected value from one actually observed.
- **Define rules with business teams**: a technical check cannot replace knowledge of the process.
- **Manage access**: share what is needed, with rights suited to the sensitivity of the data.
- **Keep checking over time**: sources and rules can change; reliability is not achieved once and for all.

“Clean” data is therefore not necessarily perfect data. It is data whose meaning, limits and level of confidence are sufficiently understood for the intended use.

## One foundation, different decisions

The same prepared foundation can inform different questions: track activity, understand a discrepancy, prioritise an investigation or support an AI experiment. Each use has different needs: a management indicator and a predictive model do not necessarily require the same historical depth, frequency or controls.

A shared dashboard can help teams discuss common definitions. Depending on the use, AI can help search, summarise or examine information. **Neither tool guarantees that its input data is correct**, and not every problem calls for an AI model.

The [centralised factory KPI](/en/projects/factory-kpi-power-bi.html) project illustrates bringing data together for operational management. That should not be taken to mean that a predictive model has been deployed or that every dataset is suitable for every use.

## Where to start

1. Choose a specific decision to improve and identify the people involved.
2. Identify the necessary sources and clarify the meaning of each important field.
3. Examine a few discrepancies with business teams before automating corrections.
4. Document transformations, checks, ownership and known limitations.
5. Test the result in a real use, then monitor changes over time.

Starting small does not mean thinking small. A controlled first scope can establish trust that can later be extended.

## Further reading

This article develops my [original post on data and AI](https://www.linkedin.com/feed/update/urn:li:activity:7528898259067625472/). For more on AI trustworthiness and risk management: the [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework).

Performance does not begin when AI produces an answer. It begins when people can understand and question the data behind that answer.
