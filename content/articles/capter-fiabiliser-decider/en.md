---
title: Capture, refine, decide: the loop that connects the shop floor to AI
date: 2026-11-23
summary: Why a plant doesn't get more efficient by adding AI on top of its problems, but by cleanly connecting three disciplines: capturing signals, making data reliable, and deciding with people and AI.
tags: Applied AI, Data, Continuous improvement
related: en/projects/local-ai-assistant.html | Orélia, a sovereign personal assistant
related: en/projects/downtime-risk-monitoring.html | See it before it breaks
related: en/projects/custom-cmms.html | Custom CMMS: from machine fleet to preventive maintenance
---

A plant produces signals all the time: a drifting sensor, a stopped PLC, a maintenance request, a batch waiting for inspection. Most of the time, those signals stay scattered. Each department has its own tools, its own files, its own habits. The information exists, but it doesn't reach the right place, at the right time, in a form people can use.

That observation led to a simple way of describing my work: a **loop** in three steps, from the workshop to the decision, and back. This article walks through it.

> **In short**: capture signals from production and support services, make the data reliable, then decide with human expertise and AI. And every decision goes back to the business teams.

## A loop rather than a chain

Industrial transformation is often presented as a chain: install sensors, centralise the data, then add artificial intelligence. On paper it makes sense. In practice, every link depends on the previous one, and the quality of the final result is that of the weakest link.

I prefer to talk about a **loop**, for a simple reason: **every decision goes back to the business teams**. What we learn at the end of the chain changes what we capture, how we clean it and what we decide next. Nothing is frozen; everything improves through iterations.

The three steps of the loop:

1. **Capture**: make every machine and every department speak.
2. **Refine**: make the data clean, comparable and usable.
3. **Decide**: turn data into decisions, with people and with AI.

## Capture: make every machine and every department speak

Everything starts with signals. On the production side, these are sensors, PLCs and industrial networks. But the company doesn't stop at the workshop: **support services** (maintenance, quality, logistics, methods, purchasing) also produce information, often the most valuable kind.

The first job is to make it accessible:

- connect existing equipment and systems, without replacing everything;
- decide what is worth capturing, rather than recording everything;
- keep the link with the business: a signal is only valuable if you know what it means at the workstation.

In my projects, this step belongs to automation and industrial IT. It is the starting point of the loop, but never the end point.

## Refine: cleanse, standardise, rationalise

This is the least visible step, and yet the most decisive one. Raw signals from different sources are useless until they can be compared with each other.

Making data reliable takes three complementary actions:

- **Cleanse**: fix errors, remove duplicates, handle missing or outlying values.
- **Standardise**: use the same names, units and codes from one department to the next.
- **Rationalise**: simplify, remove what isn't useful, and build a **single source of truth** that everyone uses.

This is where software development really matters: clear applications, designed with their users, that make data usable day to day. My custom CMMS project is an example: a reference of the machine fleet that then makes preventive maintenance possible.

## Decide: people and AI, together

Once the data is reliable, we can do something with it. Artificial intelligence is very useful here: it spots deviations the eye can't see, anticipates drifts and suggests options. Human expertise brings context, judgement and accountability.

The core idea fits in one sentence: **AI detects and predicts, human expertise arbitrates.** It isn't an AI replacing the teams; it is a single "brain" with two components working together: a human side and an AI side.

That is the logic behind the projects closest to my heart:

- **See it before it breaks**: detect early warning signs of a stoppage, to act before the breakdown.
- **Orélia**: a sovereign personal assistant, designed to stay under its user's control.

## What this loop changes in practice

Thinking in loops changes how a project is run:

- You start from a **business need**, not from a technology.
- You treat **data quality** as a workstream in its own right, with its own time budget.
- You **measure** what changes, then decide what to keep. That is the meaning of the continuous improvement approach described on the home page.
- You keep people in the decision: AI informs, it doesn't decide alone.

## Going further

This is the first of a series that will take up my LinkedIn posts with more context, method and perspective. The related projects are presented in detail in the [Projects](/en/projects.html) section and my areas of work on the [Skills](/en/skills.html) page.
