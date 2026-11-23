---
title: "AI agents: improving through feedback"
date: 2026-11-23
summary: An agent does not become reliable simply by chaining actions. It needs a clear goal, verifiable feedback, boundaries and space for human decisions.
tags: AI, Agents
type: Reflection
related: en/projects/ai-agent-team.html | An AI agent team
related: en/projects/local-ai-assistant.html | Orélia, a sovereign personal assistant
draft: false
---

Giving an AI agent a task does not guarantee that it will recognise an error, let alone correct it without consequences. What interests me is not just its ability to produce an answer or use a tool: it is how we organise **the feedback between an action, its result and the next decision**.

> **The key idea**: a feedback loop makes work more verifiable when it rests on explicit criteria, boundaries for actions and validation suited to the risk.

## An agent is not a magic box

An agent can be designed to receive a goal, consult information, propose steps and use certain tools. Its capabilities and degree of autonomy depend on the system. An impressive chain of actions is not proof that the result is correct, complete or authorised.

Context matters: which documents are accessible? Which tool can be called? Is the output merely a proposal or a real change? Without answers to these questions, advertised “autonomy” may simply move the risk elsewhere.

## A simple loop: propose, observe, evaluate, adjust

Take a **fictional example**: an agent prepares a draft maintenance report from notes it has been given. It proposes a summary, checks it against criteria, flags missing information and revises the draft. A person then checks what should be retained.

:::figure boucle-agents "Fictional demonstration: a proposal is observed, evaluated and adjusted, with human oversight."

In this figure, “act” can simply mean **preparing a proposal**. Sending a document, changing a file or taking any other action with a real effect must be subject to the permissions and approvals defined for the context.

## What makes feedback useful?

Useful feedback gives a basis for deciding what happens next. “Try again” is less actionable than “the date is missing, and the stated cause does not appear in the supplied notes”. But a check is only reliable if it is itself relevant.

| Possible feedback | What it contributes | Limitation |
| --- | --- | --- |
| Tool result | An output, an error or an observable state. | The tool may fail or cover only part of the problem. |
| Explicit rule | An expected format, required field or testable constraint. | Satisfying a rule does not prove that the substance is correct. |
| Cited source | A passage to compare with the proposal. | A source may be missing, outdated or unsuitable. |
| Human review | An understanding of context, consequences and priorities. | The reviewer also needs information and time. |

It is important to distinguish **what was observed**, **what was inferred** and **what remains unknown**. If the notes do not identify a cause, a useful answer must be able to say so instead of inventing one.

## Adjusting does not mean retraining the model

The word “learning” can be misleading. During an execution loop, a system can use feedback to change its next proposal or step without changing the model's parameters. That is an adjustment to the current work, not necessarily machine learning.

Retraining or changing model parameters is a separate process requiring its own data, evaluations and decisions. Nothing in this article assumes that a project on this site automatically changes a model.

## Put boundaries in the right place

For a real task, concrete safeguards are more useful than a vague promise of autonomy:

- Define authorised tools and restrict permissions to what is needed.
- Separate consulted content from instructions that have authority over the system.
- Set a limit on attempts and a stopping condition for uncertainty or repeated errors.
- Require human approval before sensitive or hard-to-reverse actions.
- Retain relevant records of sources, decisions, tool calls and failures.

An external document can contain misleading instructions intended to influence a model. Textual instructions alone are not a guarantee; tool permissions and controls around the system matter too.

## Evaluate the whole job

The question is not only “did the agent finish?”. We also need to ask whether the answer meets the need, whether its sources can be checked, whether actions were authorised and whether human involvement remains proportionate.

To begin, a bounded, reversible task makes a good test: prepare a draft, compare it with a few criteria, then observe the corrections made by a person. Difficult cases and failures are as useful as successful demonstrations for understanding the limits.

Feedback is not meant to remove people from the loop. It can instead make their intervention better informed and better placed.

## Further reading

This article develops my [original post on feedback for AI agents](https://www.linkedin.com/feed/update/urn:li:activity:7524918307263635456/). For risks from instructions embedded in consulted content: [OWASP, Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/).

The [AI agent team](/en/projects/ai-agent-team.html) and [Orélia](/en/projects/local-ai-assistant.html) pages present my projects; this general reflection does not automatically attribute the mechanisms described here to them.
