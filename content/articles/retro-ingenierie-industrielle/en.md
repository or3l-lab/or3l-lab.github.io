---
title: "Industrial reverse engineering: understand before you change"
date: 2026-11-23
summary: Equipment can run for years with incomplete or outdated documentation. How to find out what it really does, validate it against measurements, then decide: repair, make reliable, adapt or replace.
tags: Automation, Reliability
type: Approach
image: assets/img/og/en-industrial-reverse-engineering.png
related: en/skills/industrial-reverse-engineering.html | Skill: industrial reverse engineering (with demo)
related: en/skills.html | All skills
---

A piece of equipment can run for years with incomplete drawings, a program that was never backed up, or documentation nobody has updated. As long as everything works, it goes unnoticed. The day it needs repair, a change or a replacement, everything becomes a gamble. This article describes an approach to find out what the equipment really does before touching it.

> **Worth knowing**: the example followed in this article (a conveyor with a pusher cylinder), its timing diagrams and its values are **fictional**. They illustrate the approach; they do not describe a real installation.

## When the documentation no longer tells the truth

At the start, the documentation and the installation match. Then come the emergency repairs, the small changes, the part replacements: each one adds a gap that is rarely reported in the drawings. Over time, what we think we know about the equipment drifts away from what it actually does.

:::figure derive "The documentation describes the original installation; the actual installation drifts away with every unreported change."

Four situations make this gap critical:

- Drawings and diagrams no longer exist, or do not reflect the actual installation.
- A part, a PLC or a drive is no longer manufactured: an equivalent must be found without changing the behaviour.
- The program was never backed up, or its author is gone.
- Over successive repairs, the equipment was modified without the documentation following.

## The principle: understand before you change

Industrial reverse engineering means reconstructing how existing equipment works from what can be observed and measured, then recording it. The guiding idea fits in one sentence: **understand what the equipment actually does, not what we believe it does.**

The approach runs in five steps, going back to the model as long as a gap remains between what was reconstructed and what is measured.

:::figure boucle "Five steps; if validation reveals a gap, go back and reconstruct the model."

For the rest of the article we follow a fictional example: a conveyor brings a part, stops, then a cylinder pushes the part into a bin. No diagram is available. Five signals are identified: three inputs (I1 part present, I2 cylinder out, I3 cylinder in) and two outputs (Q1 belt motor, Q2 cylinder solenoid valve).

## Observe and capture, without touching anything

The first rule is read-only: we watch the equipment run without forcing or changing anything. This observation produces a first list of questions ("why does the cylinder wait before pushing?"). Then the signals are recorded over several cycles to obtain a timing diagram.

:::figure chrono "Fictional timing diagram of one cycle: the part is detected at 2.4 s, but the cylinder only starts at 3.2 s."

One detail stands out in this recording: the motor stops as soon as the part is detected, yet the cylinder only moves out 0.8 s later. What is visible on screen does not explain it: this is exactly the kind of thing missing documentation fails to say.

No single source is enough on its own. It is by comparing them that a reliable model emerges:

| Source | What it provides | Its limit |
| --- | --- | --- |
| Drawings and diagrams | The intended wiring, the references | May no longer reflect the installation |
| PLC program | The logic, the variables, the timers | May be missing, or differ from the one in service |
| Measurement on the installation | What really happens, and in which order | Does not say why |
| Operator interface | Screens, alarms, setpoints: the expected logic | Shows what was meant to be displayed |
| Operations and maintenance staff | The equipment's history, tricks, past failures | Individual memory, to be cross-checked |

## Reconstruct how it works

From the recordings, we deduce the machine's states, the conditions for moving from one to the next, and the control logic. For the conveyor, a first hypothesis emerges: the belt waits for the part, the cylinder pushes as soon as the part is detected, then it retracts.

:::figure modele "First state model of the conveyor (fictional): three states, with transitions triggered by inputs I1, I2 and I3."

This model is a hypothesis, not a truth. It is useful mainly because it can be compared against measurements.

## Validate: the gap is information

The model is compared with the recordings, and every gap reveals something that was overlooked. Here, the hypothesis "the cylinder pushes as soon as the part is detected" does not match the measurement: two timers are missing. A first one, 0.8 s, makes the cylinder wait before pushing. A second one, 0.6 s, keeps it extended before it retracts. The model is then corrected and compared again, until there is zero gap.

:::figure ecart "The initial model differs from the measurement in two places; once corrected (T1 and T2), the gaps disappear."

A few precautions:

- A model that matches over a few cycles is not necessarily complete: rare cases are checked too (fault, restart after a stop, cold start).
- Cases that almost never happen are not provoked on a production installation: they are handled separately, off production, on a test bench or in simulation.

## Document so that it is useful

Understanding that stays in one person's head is just one more debt. The result of the approach is a file that can be used to repair, upgrade or replace without guessing:

| Deliverable | Content |
| --- | --- |
| I/O list | Each signal, with its address, its role and its rest state |
| Functional analysis | The states, sequences, transition conditions and timers |
| Up-to-date diagrams | The actual wiring, identified and corrected |
| Commented and backed-up program | A readable, dated and archived version, with its history |
| Maintenance file | Part references, possible equivalents, replacement procedures |
| Modernisation plan (optional) | The options to replace or modernise, with their risks and priorities |

## Decide with full knowledge

With equipment that is understood and documented, the decision becomes a real choice instead of a gamble. Four outcomes are possible:

- **Repair**: restore to the identical state, when the equipment is sound and the faulty part is identified.
- **Make reliable**: address repeated causes of stops (weak point, fragile component, missing backup).
- **Adapt**: change the behaviour to meet a new need, with a reference model to measure the effect.
- **Replace or modernise**: change the hardware or the control while keeping the validated behaviour, or changing it deliberately.

## Safeguards

Understanding existing equipment means breaking nothing. Four rules frame the approach:

1. **Safety first**: read-only by default, lockout before any intervention, site procedures followed.
2. **Back up before intervening**: a dated and verified copy of the program and the parameters before any modification.
3. **Validate off production**: test on a bench or in simulation before touching equipment in service.
4. **Legal and contractual framework**: licences, intellectual property, confidentiality and contracts. We check what is permitted before capturing or modifying anything.

## Going further

The skill is presented, with an interactive demo of this approach, on the [Industrial reverse engineering](/en/skills/industrial-reverse-engineering.html) page. The related skills are gathered on the [Skills](/en/skills.html) page.

You can only make reliable what you understand.
