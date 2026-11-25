/**
 * Pure token & context telemetry calculation engine for Token Analytics.
 */

import { computeTokenCost, resolveModelRate } from './pricing.mjs';
import { DEFAULT_SETTINGS, normalizeSettings } from './settings.mjs';

const COMPACTION_RATIO_THRESHOLD = 0.75;
const COMPACTION_MIN_DROP_TOKENS = 5000;
const ACTIVE_IDLE_GAP_MS = 5 * 60 * 1000;
const BURST_TAIL_MS = 15 * 1000;
const MAX_TURN_LATENCY_MS = 10 * 60 * 1000;

/**
 * Resolve effective warning & critical thresholds in both tokens and percent for a model window.
 */
export function resolveContextThresholds(contextLimit, settings = DEFAULT_SETTINGS) {
  const safeLimit = Math.max(1, Number(contextLimit) || 1_000_000);
  const cfg = normalizeSettings(settings).thresholds;

  if (cfg.mode === 'tokens') {
    const warnTokens = cfg.warnTokens;
    const criticalTokens = cfg.criticalTokens;
    return {
      mode: 'tokens',
      warnTokens,
      criticalTokens,
      warnPercent: (warnTokens / safeLimit) * 100,
      criticalPercent: (criticalTokens / safeLimit) * 100,
    };
  }

  const warnPercent = cfg.warnPercent;
  const criticalPercent = cfg.criticalPercent;
  return {
    mode: 'percent',
    warnTokens: Math.round((safeLimit * warnPercent) / 100),
    criticalTokens: Math.round((safeLimit * criticalPercent) / 100),
    warnPercent,
    criticalPercent,
  };
}

/**
 * Evaluate context health status against resolved thresholds.
 */
export function evaluateContextStatus(contextUsed, thresholds) {
  const used = Math.max(0, Number(contextUsed) || 0);
  if (thresholds && thresholds.criticalTokens > 0 && used >= thresholds.criticalTokens) {
    return 'critical';
  }
  if (thresholds && thresholds.warnTokens > 0 && used >= thresholds.warnTokens) {
    return 'warn';
  }
  return 'ok';
}

/**
 * Resolve model context window ceiling in tokens.
 */
export function getModelContextLimit(modelId) {
  const id = (modelId || '').toLowerCase().trim();
  if (!id) {
    return { limit: 1_000_000, isDefaultLimit: true };
  }
  if (id.startsWith('gemini')) {
    return { limit: 1_000_000, isDefaultLimit: false };
  }
  if (id.startsWith('claude-')) {
    return { limit: 200_000, isDefaultLimit: false };
  }
  if (id.startsWith('gpt-') || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('o4')) {
    return { limit: 200_000, isDefaultLimit: false };
  }
  return { limit: 1_000_000, isDefaultLimit: true };
}

/**
 * Format raw model identifier into a readable display label.
 */
export function formatModelName(modelId) {
  const raw = (modelId || '').trim();
  if (!raw || raw === 'unknown') {
    return 'Unknown Model';
  }
  const parts = raw.split('-').filter(Boolean);
  const tiers = new Set(['low', 'medium', 'high', 'xhigh', 'lite']);
  let tier = '';
  if (parts.length > 1 && tiers.has(parts[parts.length - 1].toLowerCase())) {
    const t = parts.pop().toLowerCase();
    tier = t === 'xhigh' ? 'XHigh' : t.charAt(0).toUpperCase() + t.slice(1);
  }

  // Collapse consecutive single-digit version parts in Claude names like 5-5 -> 5.5
  const formatted = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (
      /^\d+$/.test(p) &&
      i + 1 < parts.length &&
      /^\d+$/.test(parts[i + 1]) &&
      parts[0].toLowerCase() === 'claude'
    ) {
      formatted.push(`${p}.${parts[i + 1]}`);
      i++;
      continue;
    }
    formatted.push(p.charAt(0).toUpperCase() + p.slice(1));
  }
  return tier ? `${formatted.join(' ')} (${tier})` : formatted.join(' ');
}

/**
 * CJK-aware token heuristic (~1.5 chars/token for CJK, ~4 chars/token for ASCII).
 */
export function estimateTokens(totalChars, cjkChars = 0) {
  const safeTotal = Math.max(0, Number(totalChars) || 0);
  const safeCjk = Math.min(safeTotal, Math.max(0, Number(cjkChars) || 0));
  const ascii = safeTotal - safeCjk;
  return Math.round(safeCjk / 1.5 + ascii / 4);
}

function createCostAcc() {
  return {
    inputCost: 0,
    cacheReadCost: 0,
    outputCost: 0,
    totalCost: 0,
    uncachedEquivalentCost: 0,
    cacheSavings: 0,
  };
}

function addCostAcc(acc, c) {
  acc.inputCost += c.inputCost;
  acc.cacheReadCost += c.cacheReadCost;
  acc.outputCost += c.outputCost;
  acc.totalCost += c.totalCost;
  acc.uncachedEquivalentCost += c.uncachedEquivalentCost;
  acc.cacheSavings += c.cacheSavings;
}

function finalizeCostAcc(acc) {
  return {
    ...acc,
    savingsPercent:
      acc.uncachedEquivalentCost > 0 ? (acc.cacheSavings / acc.uncachedEquivalentCost) * 100 : 0,
  };
}

/**
 * Estimate continuous active focus duration by merging events separated by <= 5 minutes
 * and crediting a short tail window for each active burst.
 */
export function computeFocusDurationFromTimestamps(timestampsMs) {
  const sorted = (Array.isArray(timestampsMs) ? timestampsMs : [])
    .filter((ts) => Number.isFinite(ts) && ts > 0)
    .sort((a, b) => a - b);

  if (sorted.length === 0) {
    return { activeDurationMs: 0, focusSessions: 0 };
  }

  let activeDurationMs = 0;
  let focusSessions = 0;
  for (let i = 1; i < sorted.length; i++) {
    const dt = sorted[i] - sorted[i - 1];
    if (dt <= ACTIVE_IDLE_GAP_MS) {
      activeDurationMs += dt;
    } else {
      focusSessions++;
      activeDurationMs += BURST_TAIL_MS;
    }
  }
  focusSessions++;
  activeDurationMs += BURST_TAIL_MS;

  return { activeDurationMs, focusSessions };
}

function computeMedian(nums) {
  if (!nums || nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function summarizeIntervals(intervals) {
  if (!intervals || intervals.length === 0) {
    return { count: 0, avgMs: 0, p50Ms: 0, maxMs: 0 };
  }
  let sum = 0;
  let maxMs = 0;
  for (const v of intervals) {
    sum += v;
    if (v > maxMs) maxMs = v;
  }
  return {
    count: intervals.length,
    avgMs: Math.round(sum / intervals.length),
    p50Ms: Math.round(computeMedian(intervals)),
    maxMs: Math.round(maxMs),
  };
}

function createEfficiencyAcc() {
  return {
    thinkingChars: 0,
    contentChars: 0,
    toolArgsChars: 0,
    thinkingEstTokens: 0,
    contentEstTokens: 0,
    toolArgsEstTokens: 0,
    thinkingTurnCount: 0,
    userPromptCount: 0,
    modelTurnCount: 0,
    toolCallCount: 0,
    maxTurnsInSingleTask: 0,
    maxToolsInSingleTask: 0,
  };
}

function addEfficiencyAcc(target, part) {
  target.thinkingChars += part.thinkingChars;
  target.contentChars += part.contentChars;
  target.toolArgsChars += part.toolArgsChars;
  target.thinkingEstTokens += part.thinkingEstTokens;
  target.contentEstTokens += part.contentEstTokens;
  target.toolArgsEstTokens += part.toolArgsEstTokens;
  target.thinkingTurnCount += part.thinkingTurnCount;
  target.userPromptCount += part.userPromptCount;
  target.modelTurnCount += part.modelTurnCount;
  target.toolCallCount += part.toolCallCount;
  if (part.maxTurnsInSingleTask > target.maxTurnsInSingleTask) {
    target.maxTurnsInSingleTask = part.maxTurnsInSingleTask;
  }
  if (part.maxToolsInSingleTask > target.maxToolsInSingleTask) {
    target.maxToolsInSingleTask = part.maxToolsInSingleTask;
  }
}

function finalizeEfficiency(acc, effectivePrompts) {
  const proseTotal = acc.thinkingEstTokens + acc.contentEstTokens;
  const outputTotal = proseTotal + acc.toolArgsEstTokens;
  return {
    thinkingChars: acc.thinkingChars,
    contentChars: acc.contentChars,
    toolArgsChars: acc.toolArgsChars,
    thinkingEstTokens: acc.thinkingEstTokens,
    contentEstTokens: acc.contentEstTokens,
    toolArgsEstTokens: acc.toolArgsEstTokens,
    thinkingTurnCount: acc.thinkingTurnCount,
    thinkingSharePercent: proseTotal > 0 ? (acc.thinkingEstTokens / proseTotal) * 100 : 0,
    answerSharePercent: proseTotal > 0 ? (acc.contentEstTokens / proseTotal) * 100 : 0,
    thinkingToAnswerRatio: acc.contentEstTokens > 0 ? acc.thinkingEstTokens / acc.contentEstTokens : null,
    outputBreakdown: [
      {
        key: 'thinking',
        estTokens: acc.thinkingEstTokens,
        percent: outputTotal > 0 ? (acc.thinkingEstTokens / outputTotal) * 100 : 0,
      },
      {
        key: 'answer',
        estTokens: acc.contentEstTokens,
        percent: outputTotal > 0 ? (acc.contentEstTokens / outputTotal) * 100 : 0,
      },
      {
        key: 'toolArgs',
        estTokens: acc.toolArgsEstTokens,
        percent: outputTotal > 0 ? (acc.toolArgsEstTokens / outputTotal) * 100 : 0,
      },
    ],
    userPromptCount: acc.userPromptCount,
    effectivePromptCount: effectivePrompts,
    modelTurnCount: acc.modelTurnCount,
    toolCallCount: acc.toolCallCount,
    turnsPerPrompt: effectivePrompts > 0 ? acc.modelTurnCount / effectivePrompts : 0,
    toolsPerPrompt: effectivePrompts > 0 ? acc.toolCallCount / effectivePrompts : 0,
    actionsPerPrompt: effectivePrompts > 0 ? (acc.modelTurnCount + acc.toolCallCount) / effectivePrompts : 0,
    maxTurnsInSingleTask: acc.maxTurnsInSingleTask,
    maxToolsInSingleTask: acc.maxToolsInSingleTask,
  };
}

function analyzeConversationEfficiencyAndTiming(conv, cutoffMs = 0, fallbackNowMs = Date.now()) {
  const rawTurns = conv?.turns || [];
  const rawSteps = conv?.steps || [];
  const acc = createEfficiencyAcc();

  const filteredTurns = [];
  for (const t of rawTurns) {
    const ts = Date.parse(t.createdAt || conv?.updatedAt || '');
    if (cutoffMs > 0 && (!Number.isFinite(ts) || ts < cutoffMs)) {
      continue;
    }
    filteredTurns.push({ turn: t, ts: Number.isFinite(ts) ? ts : fallbackNowMs });
  }

  const filteredSteps = [];
  for (const s of rawSteps) {
    const ts = Date.parse(s.createdAt || conv?.updatedAt || '');
    if (cutoffMs > 0 && (!Number.isFinite(ts) || ts < cutoffMs)) {
      continue;
    }
    filteredSteps.push({ step: s, ts: Number.isFinite(ts) ? ts : fallbackNowMs });
  }

  const timestampsMs = [];
  for (const { turn: t, ts } of filteredTurns) {
    if (ts > 0) timestampsMs.push(ts);
    const thChars = Math.max(0, Number(t.thinkingChars) || 0);
    const ctChars = Math.max(0, Number(t.contentChars) || 0);
    const taChars = Math.max(0, Number(t.toolArgsChars) || 0);
    acc.thinkingChars += thChars;
    acc.contentChars += ctChars;
    acc.toolArgsChars += taChars;
    acc.thinkingEstTokens += estimateTokens(thChars, Number(t.thinkingCjkChars) || 0);
    acc.contentEstTokens += estimateTokens(ctChars, Number(t.contentCjkChars) || 0);
    acc.toolArgsEstTokens += estimateTokens(taChars, Number(t.toolArgsCjkChars) || 0);
    if (thChars > 0) acc.thinkingTurnCount++;
    acc.modelTurnCount++;
    acc.toolCallCount += Array.isArray(t.toolNames) ? t.toolNames.length : 0;
  }

  const sortedSteps = [...filteredSteps].sort((a, b) => a.step.stepIndex - b.step.stepIndex);
  const userInputStepIndices = [];
  const taskDurationsMs = [];
  let inTask = false;
  let taskTurns = 0;
  let taskTools = 0;
  let taskActiveMs = 0;
  let lastTaskTs = null;

  const flushTask = () => {
    if (!inTask || taskTurns === 0) return;
    if (taskTurns > acc.maxTurnsInSingleTask) acc.maxTurnsInSingleTask = taskTurns;
    if (taskTools > acc.maxToolsInSingleTask) acc.maxToolsInSingleTask = taskTools;
    taskDurationsMs.push(Math.max(1000, taskActiveMs));
  };

  for (const { step: s, ts } of sortedSteps) {
    if (s.createdAt && Number.isFinite(Date.parse(s.createdAt))) {
      timestampsMs.push(ts);
    }
    if (s.type === 'USER_INPUT') {
      flushTask();
      acc.userPromptCount++;
      userInputStepIndices.push(s.stepIndex);
      inTask = true;
      taskTurns = 0;
      taskTools = 0;
      taskActiveMs = 0;
      lastTaskTs = s.createdAt && Number.isFinite(Date.parse(s.createdAt)) ? ts : null;
      continue;
    }
    if (inTask) {
      if (s.createdAt && Number.isFinite(Date.parse(s.createdAt))) {
        if (lastTaskTs !== null) {
          const dt = ts - lastTaskTs;
          if (dt >= 0 && dt <= ACTIVE_IDLE_GAP_MS) {
            taskActiveMs += dt;
          }
        }
        lastTaskTs = ts;
      }
      if (s.type === 'PLANNER_RESPONSE') {
        taskTurns++;
        taskTools += Array.isArray(s.toolNames) ? s.toolNames.length : 0;
      }
    }
  }
  flushTask();

  if (acc.userPromptCount === 0 && acc.modelTurnCount > 0) {
    acc.maxTurnsInSingleTask = Math.max(acc.maxTurnsInSingleTask, acc.modelTurnCount);
    acc.maxToolsInSingleTask = Math.max(acc.maxToolsInSingleTask, acc.toolCallCount);
  }

  const turnIntervalsMs = [];
  const turnPaceSeries = [];
  let maxTurnDurationMs = 0;
  let slowestTurnNumber = null;
  for (let i = 1; i < filteredTurns.length; i++) {
    const prev = filteredTurns[i - 1].turn;
    const curr = filteredTurns[i].turn;
    const hasInterveningUser = userInputStepIndices.some(
      (idx) => idx > prev.stepIndex && idx <= curr.stepIndex
    );
    if (hasInterveningUser) continue;
    const tPrev = Date.parse(prev.createdAt || '');
    const tCurr = Date.parse(curr.createdAt || '');
    if (!Number.isFinite(tPrev) || !Number.isFinite(tCurr)) continue;
    const dt = tCurr - tPrev;
    if (dt >= 0 && dt <= MAX_TURN_LATENCY_MS) {
      turnIntervalsMs.push(dt);
      turnPaceSeries.push({ turn: curr.turn, durationMs: dt });
      if (dt > maxTurnDurationMs) {
        maxTurnDurationMs = dt;
        slowestTurnNumber = curr.turn;
      }
    }
  }

  const focus = computeFocusDurationFromTimestamps(timestampsMs);
  return {
    acc,
    timestampsMs,
    turnIntervalsMs,
    turnPaceSeries,
    taskDurationsMs,
    slowestTurnNumber,
    activeDurationMs: focus.activeDurationMs,
    focusSessions: focus.focusSessions,
  };
}

function normalizeModelRows(modelMap, grandTotalTokens, pricingSettings) {
  return [...modelMap.values()]
    .map((m) => ({
      ...m,
      displayName: formatModelName(m.model),
      cacheHitRate: m.promptTokens > 0 ? m.cacheReadTokens / m.promptTokens : 0,
      sharePercent: grandTotalTokens > 0 ? (m.totalTokens / grandTotalTokens) * 100 : 0,
      rate: resolveModelRate(m.model, pricingSettings),
    }))
    .sort((a, b) => b.totalTokens - a.totalTokens);
}

/**
 * Build full context & token telemetry for a single conversation.
 */
export function buildConversationMetrics(conv, allConversationsMap, settings = DEFAULT_SETTINGS) {
  const turns = conv?.turns || [];
  const steps = conv?.steps || [];
  const pricingSettings = normalizeSettings(settings).pricing;

  let sumInput = 0;
  let sumCacheRead = 0;
  let sumOutput = 0;
  const costAcc = createCostAcc();
  let compactionCount = 0;
  let lastCompactionTurnIdx = -1;
  let lastCompactionStepIndex = -1;
  const byModelMap = new Map();

  const growthSeries = turns.map((t, idx) => {
    sumInput += t.inputTokens;
    sumCacheRead += t.cacheReadTokens;
    sumOutput += t.outputTokens;
    const tCost = computeTokenCost(t, resolveModelRate(t.model, pricingSettings));
    addCostAcc(costAcc, tCost);

    const prev = idx > 0 ? turns[idx - 1] : null;
    const deltaPrompt = prev ? t.promptTokens - prev.promptTokens : t.promptTokens;
    const compacted = Boolean(
      prev &&
      t.promptTokens < prev.promptTokens * COMPACTION_RATIO_THRESHOLD &&
      prev.promptTokens - t.promptTokens > COMPACTION_MIN_DROP_TOKENS
    );
    if (compacted) {
      compactionCount++;
      lastCompactionTurnIdx = idx;
      lastCompactionStepIndex = t.stepIndex;
    }

    const mKey = t.model || 'unknown';
    const mEntry = byModelMap.get(mKey) || {
      model: mKey,
      turns: 0,
      inputTokens: 0,
      cacheReadTokens: 0,
      promptTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      cacheSavings: 0,
    };
    mEntry.turns++;
    mEntry.inputTokens += t.inputTokens;
    mEntry.cacheReadTokens += t.cacheReadTokens;
    mEntry.promptTokens += t.promptTokens;
    mEntry.outputTokens += t.outputTokens;
    mEntry.totalTokens += t.totalTokens;
    mEntry.totalCost += tCost.totalCost;
    mEntry.cacheSavings += tCost.cacheSavings;
    byModelMap.set(mKey, mEntry);

    return {
      turn: t.turn,
      stepIndex: t.stepIndex,
      createdAt: t.createdAt,
      model: t.model,
      modelDisplay: formatModelName(t.model),
      inputTokens: t.inputTokens,
      cacheReadTokens: t.cacheReadTokens,
      promptTokens: t.promptTokens,
      outputTokens: t.outputTokens,
      totalTokens: t.totalTokens,
      totalCost: tCost.totalCost,
      cacheSavings: tCost.cacheSavings,
      cacheHitRate: t.promptTokens > 0 ? t.cacheReadTokens / t.promptTokens : 0,
      deltaPrompt,
      compacted,
      toolNames: t.toolNames || [],
    };
  });

  const sumPrompt = sumInput + sumCacheRead;
  const sumTotal = sumPrompt + sumOutput;
  const latestTurn = turns.length > 0 ? turns[turns.length - 1] : null;
  const activeModel = latestTurn?.model || conv?.primaryModel || 'unknown';
  const { limit: contextLimit, isDefaultLimit } = getModelContextLimit(activeModel);
  const contextUsed = latestTurn ? latestTurn.promptTokens : 0;
  const projectedNextContext = latestTurn ? latestTurn.promptTokens + latestTurn.outputTokens : 0;
  const usagePercent = contextLimit > 0 ? (contextUsed / contextLimit) * 100 : 0;
  const remainingTokens = Math.max(0, contextLimit - contextUsed);
  const thresholds = resolveContextThresholds(contextLimit, settings);
  const contextStatus = evaluateContextStatus(contextUsed, thresholds);

  // Active window steps (post-compaction if any occurred)
  const activeStartStepIndex = lastCompactionStepIndex >= 0 ? lastCompactionStepIndex : 0;
  const activeSteps = steps.filter((s) => s.stepIndex >= activeStartStepIndex);

  const rawByCategory = { user: 0, toolOutputs: 0, assistant: 0, system: 0 };
  const stepEstimates = activeSteps.map((s) => {
    const est = estimateTokens(s.chars, s.cjkChars);
    if (s.category === 'user') rawByCategory.user += est;
    else if (s.category === 'toolOutputs') rawByCategory.toolOutputs += est;
    else if (s.category === 'assistant') rawByCategory.assistant += est;
    else rawByCategory.system += est;
    return { ...s, rawEstTokens: est };
  });

  // Anchor system prompt overhead from turn 1 (or compaction floor) and reconcile categories to exact contextUsed
  let systemBase = 0;
  if (turns.length > 0 && contextUsed > 0) {
    if (lastCompactionTurnIdx >= 0) {
      systemBase = Math.round(turns[lastCompactionTurnIdx].promptTokens * 0.35);
    } else {
      const firstTurn = turns[0];
      const initialUserEst = steps
        .filter((s) => s.stepIndex < firstTurn.stepIndex && s.category === 'user')
        .reduce((acc, s) => acc + estimateTokens(s.chars, s.cjkChars), 0);
      systemBase = Math.max(0, firstTurn.promptTokens - initialUserEst);
    }
  }

  const systemAnchor = Math.min(contextUsed, systemBase);
  const variableBudget = Math.max(0, contextUsed - systemAnchor);
  const variableRawSum =
    rawByCategory.system + rawByCategory.toolOutputs + rawByCategory.user + rawByCategory.assistant;

  const breakdownTokens = { system: 0, toolOutputs: 0, user: 0, assistant: 0 };
  if (contextUsed > 0) {
    if (variableRawSum > 0) {
      const scale = variableBudget / variableRawSum;
      const sysVar = Math.round(rawByCategory.system * scale);
      breakdownTokens.toolOutputs = Math.round(rawByCategory.toolOutputs * scale);
      breakdownTokens.user = Math.round(rawByCategory.user * scale);
      breakdownTokens.assistant = Math.round(rawByCategory.assistant * scale);
      breakdownTokens.system = systemAnchor + sysVar;

      // Correct integer rounding drift so sum equals contextUsed strictly
      const actualSum =
        breakdownTokens.system +
        breakdownTokens.toolOutputs +
        breakdownTokens.user +
        breakdownTokens.assistant;
      const diff = contextUsed - actualSum;
      if (diff !== 0) {
        const largestVarKey = ['toolOutputs', 'user', 'assistant', 'system'].sort(
          (a, b) => breakdownTokens[b] - breakdownTokens[a]
        )[0];
        breakdownTokens[largestVarKey] = Math.max(0, breakdownTokens[largestVarKey] + diff);
      }
    } else {
      breakdownTokens.system = contextUsed;
    }
  }

  const breakdown = [
    { key: 'system', label: '系统提示与规则基线', tokens: breakdownTokens.system },
    { key: 'toolOutputs', label: '工具调用结果', tokens: breakdownTokens.toolOutputs },
    { key: 'assistant', label: '助手回复与思考', tokens: breakdownTokens.assistant },
    { key: 'user', label: '用户输入消息', tokens: breakdownTokens.user },
  ].map((item) => ({
    ...item,
    percent: contextUsed > 0 ? (item.tokens / contextUsed) * 100 : 0,
  }));

  // Scale factor for individual step display
  const stepScale = variableRawSum > 0 && variableBudget > 0 ? variableBudget / variableRawSum : 1;
  const heaviestItems = stepEstimates
    .filter((s) => s.rawEstTokens > 0)
    .map((s) => {
      const estTokens = Math.max(1, Math.round(s.rawEstTokens * stepScale));
      return {
        stepIndex: s.stepIndex,
        type: s.type,
        category: s.category,
        toolName: s.toolName || '',
        toolNames: s.toolNames || [],
        label: s.label,
        estTokens,
        sharePercent: contextUsed > 0 ? Math.min(100, (estTokens / contextUsed) * 100) : 0,
        truncated: s.truncated,
        preview: s.preview,
      };
    })
    .sort((a, b) => b.estTokens - a.estTokens)
    .slice(0, 8);

  // Subagent rollup
  const subagents = [];
  let subInput = 0;
  let subCache = 0;
  let subOutput = 0;
  let subTurns = 0;
  let subTotalCost = 0;
  let subCacheSavings = 0;
  if (allConversationsMap) {
    for (const candidate of allConversationsMap.values()) {
      if (candidate.id === conv.id) {
        continue;
      }
      const isChild =
        candidate.parentConversationId === conv.id ||
        (candidate.rootConversationId === conv.id && candidate.isSubagent);
      if (!isChild) {
        continue;
      }
      let cIn = 0;
      let cCache = 0;
      let cOut = 0;
      let cCost = 0;
      let cSav = 0;
      for (const t of candidate.turns || []) {
        cIn += t.inputTokens;
        cCache += t.cacheReadTokens;
        cOut += t.outputTokens;
        const tc = computeTokenCost(t, resolveModelRate(t.model, pricingSettings));
        cCost += tc.totalCost;
        cSav += tc.cacheSavings;
      }
      const cTotal = cIn + cCache + cOut;
      subInput += cIn;
      subCache += cCache;
      subOutput += cOut;
      subTotalCost += cCost;
      subCacheSavings += cSav;
      subTurns += (candidate.turns || []).length;
      subagents.push({
        id: candidate.id,
        title: candidate.title,
        runState: candidate.runState,
        turns: (candidate.turns || []).length,
        inputTokens: cIn,
        cacheReadTokens: cCache,
        outputTokens: cOut,
        totalTokens: cTotal,
        totalCost: cCost,
        cacheSavings: cSav,
      });
    }
    subagents.sort((a, b) => b.totalTokens - a.totalTokens);
  }

  const finalizedCost = finalizeCostAcc(costAcc);
  const effTiming = analyzeConversationEfficiencyAndTiming(conv, 0);
  const effectivePrompts =
    effTiming.acc.userPromptCount > 0
      ? effTiming.acc.userPromptCount
      : effTiming.acc.modelTurnCount > 0
        ? 1
        : 0;
  const turnSummary = summarizeIntervals(effTiming.turnIntervalsMs);
  const taskSummary = summarizeIntervals(effTiming.taskDurationsMs);

  return {
    id: conv.id,
    title: conv.title,
    runState: conv.runState,
    isSubagent: conv.isSubagent,
    parentConversationId: conv.parentConversationId || '',
    projectId: conv.projectId || 'outside-of-project',
    projectName: conv.projectName || '独立会话 / 未关联项目',
    projectPath: conv.projectPath || '',
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
    activeModel,
    activeModelDisplay: formatModelName(activeModel),
    context: {
      used: contextUsed,
      projectedNext: projectedNextContext,
      limit: contextLimit,
      isDefaultLimit,
      usagePercent,
      remainingTokens,
      status: contextStatus,
      thresholds: {
        ...thresholds,
        toWarnTokens: thresholds.warnTokens - contextUsed,
        toCriticalTokens: thresholds.criticalTokens - contextUsed,
      },
      compactionCount,
      lastCompactionStepIndex,
      breakdown,
      heaviestItems,
      growthSeries,
    },
    tokens: {
      inputTokens: sumInput,
      cacheReadTokens: sumCacheRead,
      promptTokens: sumPrompt,
      outputTokens: sumOutput,
      totalTokens: sumTotal,
      turnCount: turns.length,
      cacheHitRate: sumPrompt > 0 ? sumCacheRead / sumPrompt : 0,
      latestCacheHitRate:
        latestTurn && latestTurn.promptTokens > 0
          ? latestTurn.cacheReadTokens / latestTurn.promptTokens
          : 0,
      byModel: normalizeModelRows(byModelMap, sumTotal, pricingSettings),
    },
    cost: finalizedCost,
    efficiency: finalizeEfficiency(effTiming.acc, effectivePrompts),
    timing: {
      activeDurationMs: effTiming.activeDurationMs,
      focusSessions: effTiming.focusSessions,
      avgTurnDurationMs: turnSummary.avgMs,
      p50TurnDurationMs: turnSummary.p50Ms,
      maxTurnDurationMs: turnSummary.maxMs,
      slowestTurnNumber: effTiming.slowestTurnNumber,
      measuredTurnIntervals: turnSummary.count,
      taskCount: taskSummary.count,
      avgTaskDurationMs: taskSummary.avgMs,
      maxTaskDurationMs: taskSummary.maxMs,
      turnPaceSeries: effTiming.turnPaceSeries.slice(-24),
    },
    subagents,
    withSubagents: {
      subagentCount: subagents.length,
      turnCount: turns.length + subTurns,
      inputTokens: sumInput + subInput,
      cacheReadTokens: sumCacheRead + subCache,
      outputTokens: sumOutput + subOutput,
      totalTokens: sumTotal + subInput + subCache + subOutput,
      totalCost: finalizedCost.totalCost + subTotalCost,
      cacheSavings: finalizedCost.cacheSavings + subCacheSavings,
    },
  };
}

function getRangeCutoffMs(range, nowMs) {
  if (range === 'today') {
    const d = new Date(nowMs);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
  }
  if (range === '7d') {
    return nowMs - 7 * 86_400_000;
  }
  if (range === '30d') {
    return nowMs - 30 * 86_400_000;
  }
  return 0;
}

function toLocalDateKey(ms) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildCalendarHeatmap(dailyMap, nowMs) {
  const nowDate = new Date(nowMs);
  const todayLocal = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  const todayWeekday = (todayLocal.getDay() + 6) % 7; // Mon=0 .. Sun=6
  const weeksCount = 16;
  const totalDays = (weeksCount - 1) * 7 + todayWeekday + 1;
  const startLocal = new Date(
    todayLocal.getFullYear(),
    todayLocal.getMonth(),
    todayLocal.getDate() - (totalDays - 1)
  );

  let maxDayTokens = 0;
  let maxDayDate = '';
  let activeDays = 0;
  let totalTokens = 0;
  const days = [];

  for (let offset = 0; offset < totalDays; offset++) {
    const d = new Date(startLocal.getFullYear(), startLocal.getMonth(), startLocal.getDate() + offset);
    const date = toLocalDateKey(d.getTime());
    const stats = dailyMap.get(date);
    const inputTokens = stats ? stats.inputTokens : 0;
    const cacheReadTokens = stats ? stats.cacheReadTokens : 0;
    const outputTokens = stats ? stats.outputTokens : 0;
    const dayTotal = stats ? stats.totalTokens : 0;
    const turns = stats ? stats.turns : 0;

    if (dayTotal > 0) {
      activeDays++;
      totalTokens += dayTotal;
      if (dayTotal > maxDayTokens) {
        maxDayTokens = dayTotal;
        maxDayDate = date;
      }
    }

    days.push({
      date,
      weekIndex: Math.floor(offset / 7),
      weekday: (d.getDay() + 6) % 7,
      month: d.getMonth() + 1,
      dayOfMonth: d.getDate(),
      inputTokens,
      cacheReadTokens,
      outputTokens,
      totalTokens: dayTotal,
      turns,
      level: 0,
    });
  }

  if (maxDayTokens > 0) {
    for (const day of days) {
      if (day.totalTokens <= 0) {
        day.level = 0;
      } else {
        const ratio = Math.sqrt(day.totalTokens / maxDayTokens);
        day.level = ratio <= 0.25 ? 1 : ratio <= 0.5 ? 2 : ratio <= 0.75 ? 3 : 4;
      }
    }
  }

  let currentStreak = 0;
  if (days.length > 0) {
    let idx = days.length - 1;
    if (days[idx].totalTokens === 0 && idx > 0) {
      idx--;
    }
    while (idx >= 0 && days[idx].totalTokens > 0) {
      currentStreak++;
      idx--;
    }
  }

  return {
    days,
    weeksCount,
    activeDays,
    currentStreak,
    maxDayTokens,
    maxDayDate,
    totalTokens,
  };
}

/**
 * Aggregate agent-wide token usage across all conversations within a time range and optional project filter.
 */
export function buildAgentMetrics(conversations, range = 'all', nowMs = Date.now(), options = {}) {
  const validRange = ['today', '7d', '30d', 'all'].includes(range) ? range : 'all';
  const cutoffMs = getRangeCutoffMs(validRange, nowMs);
  const selectedProjectId =
    typeof options.projectId === 'string' && options.projectId.trim() ? options.projectId.trim() : 'all';
  const settings = normalizeSettings(options.settings || DEFAULT_SETTINGS);
  const pricingSettings = settings.pricing;

  let inputTokens = 0;
  let cacheReadTokens = 0;
  let outputTokens = 0;
  let turnCount = 0;
  let conversationCount = 0;
  let mainConversationCount = 0;
  let subagentCount = 0;
  let activeRunningCount = 0;
  let allProjectsTotalTokens = 0;
  const agentCostAcc = createCostAcc();
  const agentEffAcc = createEfficiencyAcc();
  const allTurnIntervalsMs = [];
  const allTaskDurationsMs = [];
  const scopedTimestampsMs = [];
  const dailyFocusTimestampsMap = new Map();

  const byProjectMap = new Map();
  const byModelMap = new Map();
  const dailyMap = new Map();
  const heatmapDailyMap = new Map();
  const hourlyBuckets = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: String(hour).padStart(2, '0'),
    inputTokens: 0,
    cacheReadTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    turns: 0,
  }));
  const topConversations = [];

  for (const conv of conversations) {
    const projId = (conv.projectId || '').trim() || 'outside-of-project';
    const projName =
      conv.projectName || (projId === 'outside-of-project' ? '独立会话 / 未关联项目' : projId.slice(0, 8));
    const projPath = conv.projectPath || '';

    if (selectedProjectId === 'all' || projId === selectedProjectId) {
      if (conv.runState === 'RUN_STATE_RUNNING') {
        activeRunningCount++;
      }
      for (const t of conv.turns || []) {
        const ts = Date.parse(t.createdAt || conv.updatedAt || '');
        const resolvedTs = Number.isFinite(ts) ? ts : nowMs;
        const hmKey = toLocalDateKey(resolvedTs);
        const hmEntry = heatmapDailyMap.get(hmKey) || {
          inputTokens: 0,
          cacheReadTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          turns: 0,
        };
        hmEntry.inputTokens += t.inputTokens;
        hmEntry.cacheReadTokens += t.cacheReadTokens;
        hmEntry.outputTokens += t.outputTokens;
        hmEntry.totalTokens += t.totalTokens;
        hmEntry.turns++;
        heatmapDailyMap.set(hmKey, hmEntry);
      }
    }

    const filteredTurns = [];
    for (const t of conv.turns || []) {
      const ts = Date.parse(t.createdAt || conv.updatedAt || '');
      if (cutoffMs > 0 && (!Number.isFinite(ts) || ts < cutoffMs)) {
        continue;
      }
      filteredTurns.push({ turn: t, ts: Number.isFinite(ts) ? ts : nowMs });
    }

    if (filteredTurns.length === 0) {
      continue;
    }

    let cIn = 0;
    let cCache = 0;
    let cOut = 0;
    const cCostAcc = createCostAcc();
    const turnCosts = new Array(filteredTurns.length);
    for (let idx = 0; idx < filteredTurns.length; idx++) {
      const t = filteredTurns[idx].turn;
      cIn += t.inputTokens;
      cCache += t.cacheReadTokens;
      cOut += t.outputTokens;
      const tc = computeTokenCost(t, resolveModelRate(t.model, pricingSettings));
      turnCosts[idx] = tc;
      addCostAcc(cCostAcc, tc);
    }
    const cPrompt = cIn + cCache;
    const cTotal = cPrompt + cOut;
    allProjectsTotalTokens += cTotal;

    const projEntry = byProjectMap.get(projId) || {
      id: projId,
      name: projName,
      folderPath: projPath,
      conversations: 0,
      mainConversations: 0,
      subagents: 0,
      runningCount: 0,
      turns: 0,
      inputTokens: 0,
      cacheReadTokens: 0,
      promptTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      cacheSavings: 0,
      lastUpdatedAt: '',
    };
    projEntry.conversations++;
    if (conv.isSubagent) projEntry.subagents++;
    else projEntry.mainConversations++;
    if (conv.runState === 'RUN_STATE_RUNNING') projEntry.runningCount++;
    projEntry.turns += filteredTurns.length;
    projEntry.inputTokens += cIn;
    projEntry.cacheReadTokens += cCache;
    projEntry.promptTokens += cPrompt;
    projEntry.outputTokens += cOut;
    projEntry.totalTokens += cTotal;
    projEntry.totalCost += cCostAcc.totalCost;
    projEntry.cacheSavings += cCostAcc.cacheSavings;
    if (conv.updatedAt && (!projEntry.lastUpdatedAt || conv.updatedAt > projEntry.lastUpdatedAt)) {
      projEntry.lastUpdatedAt = conv.updatedAt;
    }
    byProjectMap.set(projId, projEntry);

    if (selectedProjectId !== 'all' && projId !== selectedProjectId) {
      continue;
    }

    conversationCount++;
    if (conv.isSubagent) subagentCount++;
    else mainConversationCount++;
    addCostAcc(agentCostAcc, cCostAcc);

    const convEffTiming = analyzeConversationEfficiencyAndTiming(conv, cutoffMs, nowMs);
    addEfficiencyAcc(agentEffAcc, convEffTiming.acc);
    for (const dt of convEffTiming.turnIntervalsMs) allTurnIntervalsMs.push(dt);
    for (const td of convEffTiming.taskDurationsMs) allTaskDurationsMs.push(td);
    for (const ts of convEffTiming.timestampsMs) {
      scopedTimestampsMs.push(ts);
      const dayKey = toLocalDateKey(ts);
      let arr = dailyFocusTimestampsMap.get(dayKey);
      if (!arr) {
        arr = [];
        dailyFocusTimestampsMap.set(dayKey, arr);
      }
      arr.push(ts);
    }

    for (let idx = 0; idx < filteredTurns.length; idx++) {
      const { turn: t, ts } = filteredTurns[idx];
      const tc = turnCosts[idx];
      turnCount++;

      const mKey = t.model || 'unknown';
      const mEntry = byModelMap.get(mKey) || {
        model: mKey,
        turns: 0,
        inputTokens: 0,
        cacheReadTokens: 0,
        promptTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        cacheSavings: 0,
      };
      mEntry.turns++;
      mEntry.inputTokens += t.inputTokens;
      mEntry.cacheReadTokens += t.cacheReadTokens;
      mEntry.promptTokens += t.promptTokens;
      mEntry.outputTokens += t.outputTokens;
      mEntry.totalTokens += t.totalTokens;
      mEntry.totalCost += tc.totalCost;
      mEntry.cacheSavings += tc.cacheSavings;
      byModelMap.set(mKey, mEntry);

      const dayKey = toLocalDateKey(ts);
      const dayEntry = dailyMap.get(dayKey) || {
        date: dayKey,
        inputTokens: 0,
        cacheReadTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        cacheSavings: 0,
        turns: 0,
      };
      dayEntry.inputTokens += t.inputTokens;
      dayEntry.cacheReadTokens += t.cacheReadTokens;
      dayEntry.outputTokens += t.outputTokens;
      dayEntry.totalTokens += t.totalTokens;
      dayEntry.totalCost += tc.totalCost;
      dayEntry.cacheSavings += tc.cacheSavings;
      dayEntry.turns++;
      dailyMap.set(dayKey, dayEntry);

      const hr = new Date(ts).getHours();
      const hb = hourlyBuckets[hr];
      if (hb) {
        hb.inputTokens += t.inputTokens;
        hb.cacheReadTokens += t.cacheReadTokens;
        hb.outputTokens += t.outputTokens;
        hb.totalTokens += t.totalTokens;
        hb.turns++;
      }
    }

    inputTokens += cIn;
    cacheReadTokens += cCache;
    outputTokens += cOut;

    const latestAllTurn = conv.turns[conv.turns.length - 1];
    const contextUsed = latestAllTurn ? latestAllTurn.promptTokens : 0;
    const activeModel = latestAllTurn?.model || conv.primaryModel || 'unknown';
    const { limit: contextLimit } = getModelContextLimit(activeModel);
    const convThresholds = resolveContextThresholds(contextLimit, settings);
    const contextStatus = evaluateContextStatus(contextUsed, convThresholds);

    topConversations.push({
      id: conv.id,
      title: conv.title,
      runState: conv.runState,
      isSubagent: conv.isSubagent,
      projectId: projId,
      projectName: projName,
      model: activeModel,
      modelDisplay: formatModelName(activeModel),
      contextUsed,
      contextLimit,
      usagePercent: contextLimit > 0 ? (contextUsed / contextLimit) * 100 : 0,
      contextStatus,
      inputTokens: cIn,
      cacheReadTokens: cCache,
      outputTokens: cOut,
      totalTokens: cTotal,
      totalCost: cCostAcc.totalCost,
      cacheSavings: cCostAcc.cacheSavings,
      turns: filteredTurns.length,
      updatedAt: conv.updatedAt,
    });
  }

  const promptTokens = inputTokens + cacheReadTokens;
  const totalTokens = promptTokens + outputTokens;

  topConversations.sort((a, b) => b.totalTokens - a.totalTokens);
  const dailyTrend = [...dailyMap.values()]
    .map((d) => {
      const focus = computeFocusDurationFromTimestamps(dailyFocusTimestampsMap.get(d.date) || []);
      return {
        ...d,
        activeDurationMs: focus.activeDurationMs,
        focusSessions: focus.focusSessions,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  let totalDailyActiveMs = 0;
  let activeFocusDays = 0;
  let peakFocusDay = null;
  for (const d of dailyTrend) {
    if (d.activeDurationMs > 0) {
      totalDailyActiveMs += d.activeDurationMs;
      activeFocusDays++;
      if (!peakFocusDay || d.activeDurationMs > peakFocusDay.activeDurationMs) {
        peakFocusDay = { date: d.date, activeDurationMs: d.activeDurationMs };
      }
    }
  }
  const totalFocus = computeFocusDurationFromTimestamps(scopedTimestampsMs);
  const todayFocus = computeFocusDurationFromTimestamps(
    dailyFocusTimestampsMap.get(toLocalDateKey(nowMs)) || []
  );
  const agentTurnSummary = summarizeIntervals(allTurnIntervalsMs);
  const agentTaskSummary = summarizeIntervals(allTaskDurationsMs);
  const effectiveAgentPrompts =
    agentEffAcc.userPromptCount > 0
      ? agentEffAcc.userPromptCount
      : agentEffAcc.modelTurnCount > 0
        ? Math.max(1, mainConversationCount || conversationCount)
        : 0;
  const byProject = [...byProjectMap.values()]
    .map((p) => ({
      ...p,
      cacheHitRate: p.promptTokens > 0 ? p.cacheReadTokens / p.promptTokens : 0,
      sharePercent: allProjectsTotalTokens > 0 ? (p.totalTokens / allProjectsTotalTokens) * 100 : 0,
    }))
    .sort((a, b) => b.totalTokens - a.totalTokens);

  const selectedProjMeta = byProject.find((p) => p.id === selectedProjectId);
  const selectedProjectName =
    selectedProjectId === 'all'
      ? '全部项目'
      : selectedProjMeta?.name ||
        (selectedProjectId === 'outside-of-project' ? '独立会话 / 未关联项目' : selectedProjectId.slice(0, 8));

  const calendarHeatmap = buildCalendarHeatmap(heatmapDailyMap, nowMs);
  let peakBucket = null;
  let activeHours = 0;
  for (const b of hourlyBuckets) {
    if (b.totalTokens > 0 || b.turns > 0) {
      activeHours++;
    }
    if (!peakBucket || b.totalTokens > peakBucket.totalTokens || (b.totalTokens === peakBucket.totalTokens && b.turns > peakBucket.turns)) {
      peakBucket = b;
    }
  }
  const hourlyDistribution = {
    buckets: hourlyBuckets,
    peakHour: peakBucket && peakBucket.totalTokens > 0 ? peakBucket.hour : null,
    peakTokens: peakBucket ? peakBucket.totalTokens : 0,
    peakTurns: peakBucket ? peakBucket.turns : 0,
    activeHours,
  };

  return {
    range: validRange,
    selectedProjectId,
    selectedProjectName,
    allProjectsTotalTokens,
    inputTokens,
    cacheReadTokens,
    promptTokens,
    outputTokens,
    totalTokens,
    cacheHitRate: promptTokens > 0 ? cacheReadTokens / promptTokens : 0,
    turnCount,
    conversationCount,
    mainConversationCount,
    subagentCount,
    activeRunningCount,
    byProject,
    byModel: normalizeModelRows(byModelMap, totalTokens, pricingSettings),
    cost: finalizeCostAcc(agentCostAcc),
    efficiency: finalizeEfficiency(agentEffAcc, effectiveAgentPrompts),
    timing: {
      totalActiveDurationMs: totalFocus.activeDurationMs,
      focusSessions: totalFocus.focusSessions,
      todayActiveDurationMs: todayFocus.activeDurationMs,
      avgDailyActiveDurationMs: activeFocusDays > 0 ? Math.round(totalDailyActiveMs / activeFocusDays) : 0,
      activeFocusDays,
      peakFocusDay,
      avgTurnDurationMs: agentTurnSummary.avgMs,
      p50TurnDurationMs: agentTurnSummary.p50Ms,
      maxTurnDurationMs: agentTurnSummary.maxMs,
      measuredTurnIntervals: agentTurnSummary.count,
      taskCount: agentTaskSummary.count,
      avgTaskDurationMs: agentTaskSummary.avgMs,
      maxTaskDurationMs: agentTaskSummary.maxMs,
    },
    dailyTrend,
    calendarHeatmap,
    hourlyDistribution,
    topConversations,
  };
}

/**
 * Build the complete telemetry snapshot returned by /api/telemetry.
 */
export function buildTelemetrySnapshot(collected, query = {}, options = {}) {
  const conversations = collected?.conversations || [];
  const byId = new Map(conversations.map((c) => [c.id, c]));
  const requestedId = typeof query.conversationId === 'string' ? query.conversationId.trim() : '';
  const range = typeof query.range === 'string' ? query.range.trim() : 'all';
  const projectFilter =
    typeof query.project === 'string'
      ? query.project.trim()
      : typeof query.projectId === 'string'
        ? query.projectId.trim()
        : 'all';
  const settings = normalizeSettings(options.settings || DEFAULT_SETTINGS);
  const nowMs = options.nowMs || Date.now();

  let target = requestedId ? byId.get(requestedId) : null;
  if (!target) {
    target =
      conversations.find((c) => c.runState === 'RUN_STATE_RUNNING' && c.turns.length > 0) ||
      conversations.find((c) => c.runState === 'RUN_STATE_RUNNING') ||
      conversations.find((c) => c.turns.length > 0) ||
      conversations[0] ||
      null;
  }

  const current = target ? buildConversationMetrics(target, byId, settings) : null;
  const agent = buildAgentMetrics(conversations, range, nowMs, {
    projectId: projectFilter,
    settings,
  });

  const observedModels = new Set();
  for (const c of conversations) {
    for (const t of c.turns || []) {
      if (t.model && t.model !== 'unknown') {
        observedModels.add(t.model);
      }
    }
  }
  const pricingCatalog = [...observedModels]
    .sort((a, b) => a.localeCompare(b))
    .map((model) => ({
      model,
      displayName: formatModelName(model),
      rate: resolveModelRate(model, settings.pricing),
    }));

  const conversationOptions = conversations
    .filter((c) => c.turns.length > 0 || c.runState === 'RUN_STATE_RUNNING' || c.id === target?.id)
    .slice(0, 60)
    .map((c) => {
      const lastTurn = c.turns[c.turns.length - 1];
      const contextUsed = lastTurn ? lastTurn.promptTokens : 0;
      const activeModel = lastTurn?.model || c.primaryModel || 'unknown';
      const { limit: contextLimit } = getModelContextLimit(activeModel);
      const contextStatus = evaluateContextStatus(
        contextUsed,
        resolveContextThresholds(contextLimit, settings)
      );
      return {
        id: c.id,
        title: c.title,
        runState: c.runState,
        isSubagent: c.isSubagent,
        projectId: c.projectId || 'outside-of-project',
        projectName: c.projectName || '独立会话 / 未关联项目',
        turns: c.turns.length,
        contextUsed,
        contextStatus,
        updatedAt: c.updatedAt,
      };
    });

  return {
    version: options.version || '1.0.0',
    generatedAt: collected?.fetchedAt || new Date().toISOString(),
    lsConnected: Boolean(collected?.lsConnected),
    range: agent.range,
    settings,
    pricingCatalog,
    activeConversationId: target ? target.id : null,
    requestedConversationId: requestedId || null,
    conversationOptions,
    current,
    agent,
  };
}
