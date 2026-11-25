---
name: token-analytics
description: >-
  Open or inspect Token Analytics to view current conversation context window
  utilization, session token consumption, cost & cache savings, and agent-wide
  token usage statistics across all conversations.
---

# Token Analytics

Use this skill when the user wants to inspect:
- Current conversation context window usage, category breakdown, compaction status, or heaviest context steps.
- Current conversation token consumption (uncached input, cache read, output, total, cache hit rate, estimated cost, and subagent rollup).
- Agent-wide token usage across all conversations (Today / 7D / 30D / All Time, model & project distribution, daily trend, heatmap, and top conversations).

## Opening the Panel

Check if the `token-analytics` plugin and its `token_analytics` sidecar are enabled and running before emitting a `sidecar://` pill:

- If enabled and running, present a single clickable pill to toggle the side pane (`AUX_PANE`):

  [Token Analytics](sidecar://token-analytics/token_analytics/)

- Users can also open the full dashboard (`SIDEBAR` view) from **Plugins > Token Analytics** in the left sidebar or from the side panel **`+`** menu.

## If Not Enabled Yet

Do not emit a dead `sidecar://` link when the plugin or sidecar is disabled. Instead, guide the user to Customizations:

1. Open [Token Analytics](customization://token-analytics).
2. Enable the plugin and ensure the **Token Analytics** sidecar is turned on.
3. Open **Token Analytics** from the side panel **`+`** menu or left sidebar **Plugins**.
