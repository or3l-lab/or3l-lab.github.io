---
title: "Deep learning and industrial experience: combining signals and expertise"
date: 2026-11-23
summary: From historical data to hypotheses for business experts: where deep learning could help industry, and what is needed to evaluate its limitations.
tags: AI, Industry
type: Reflection
related: en/articles/capter-fiabiliser-decider.html | The loop: capture, refine, decide
draft: false
---

An installation produces signals, events and histories. The people who know it bring the circumstances, changes and nuances that numbers do not always show. Deep learning may be one way to analyse certain datasets; it is no substitute for that expertise or for understanding the process.

> **The key idea**: a model can help formulate a hypothesis. On its own, it does not turn a correlation into a diagnosis or a safe decision.

## What are we talking about?

Deep learning is a family of machine-learning methods based on neural networks with multiple layers. Depending on the problem and the data, such models can be used, for example, to classify images or analyse time series.

It is not synonymous with general intelligence, and it is not necessarily the best choice for every problem. A clear rule, statistical analysis or a simpler model may be easier to explain and maintain, and may be sufficient. The method comes after the business question, not before.

## From signals to a hypothesis worth examining

Imagine a **fictional situation**: on a production line, vibration and temperature readings, operating states and maintenance notes are available. An analysis might highlight an unusual sequence and suggest examining it. A qualified person would then compare it with the context: a change in speed, maintenance work, a replaced sensor or another possible explanation.

:::figure signaux-expertise "Fictional scenario: contextualised signals feed an analysis; a hypothesis is submitted to human expertise."

An unusual sequence is not necessarily a failure. Even if it precedes a stoppage in a historical record, that does not prove it caused it. The tool's value is to help guide an investigation, not to conclude on behalf of the business teams.

## Data tells part of the story

To investigate a use, first understand what is available:

- Measurements, units, sampling frequency, gaps and any sensor changes.
- Production events: running, stopped, product, speed or setting changes, where available.
- Known interventions and anomalies, with dates and the confidence placed in their descriptions.
- Process, equipment or organisational changes that make some periods different.

A long history is not automatically representative. Rare failures may be poorly documented; an event may be labelled imprecisely after the fact. Missing data and changes in context must be identified before drawing conclusions.

## Separate training from verification

A model learns from a set of examples. To evaluate whether it may help with unseen situations, separate data must be reserved for tuning and for a final test, without letting future information influence training.

For a time series, a split respecting time order is often more appropriate than a random shuffle: train on the past and check against a later period suitable for the problem. Transformations learned from the data must also be calculated without using the future reserved for testing.

This precaution limits one form of **data leakage**: a result that looks excellent because the model indirectly had access to what it was meant to predict. It does not guarantee that future conditions will resemble the past.

## Measure usefulness, not just a score

A useful evaluation relates the results to practical consequences:

| Question | Why it matters |
| --- | --- |
| What happens if an alert is false? | Too many unnecessary checks can make the system less useful. |
| What happens if an event is missed? | The cost of a missed alert can vary greatly with the context. |
| Which periods and equipment were tested? | A local result does not automatically generalise. |
| Can people examine the evidence offered? | A hypothesis must be weighed against observations and context. |
| How will changes over time be detected? | The process or data may change after the initial evaluation. |

Confidentiality, access rights, required resources and maintenance arrangements also matter. For a decision with significant consequences, the tool's role and human validation should be defined before any deployment.

## Start with a useful question

A gradual approach can begin with a precise question, a limited scope and a history whose limitations are understood. Compare several approaches, including simple methods, on separated data. Examine errors with business teams before considering wider use.

The examples in this article describe **possibilities**, not features claimed to be deployed in my projects. The goal is not to put deep learning everywhere, but to determine when it provides verifiable help.

## Further reading

This article develops my [original post on deep learning and industrial experience](https://www.linkedin.com/feed/update/urn:li:activity:7524579115744677889/). The [scikit-learn documentation on time-series validation](https://scikit-learn.org/stable/modules/cross_validation.html#time-series-split) explains why time order matters in evaluation.

Signals provide clues; expertise gives them context; the decision remains a responsibility.
