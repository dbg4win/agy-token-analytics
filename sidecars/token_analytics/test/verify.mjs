import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCollector, parseTranscriptText } from '../lib/collector.mjs';
import {
  buildAgentMetrics,
  buildConversationMetrics,
  buildTelemetrySnapshot,
  computeFocusDurationFromTimestamps,
  evaluateContextStatus,
  resolveContextThresholds,
} from '../lib/metrics.mjs';
import { computeTokenCost, getDefaultModelRate, resolveModelRate } from '../lib/pricing.mjs';
import { normalizeSettings } from '../lib/settings.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mainPath = path.resolve(__dirname, '..', 'main.mjs');

function buildFixtureTranscript() {
  return [
    JSON.stringify({
      step_index: 0,
      type: 'USER_INPUT',
      created_at: '2026-11-25T05:00:00Z',
      content: '<USER_REQUEST>\nAnalyze repository architecture\n</USER_REQUEST>',
    }),
    JSON.stringify({
      step_index: 1,
      type: 'PLANNER_RESPONSE',
      created_at: '2026-11-25T05:00:05Z',
      model: 'gemini-2.5-pro',
      input_tokens: 15000,
      cache_read_tokens: 0,
      output_tokens: 500,
      thinking: 'thinking...',
      tool_calls: [{ name: 'read_file', args: { Path: '/tmp/a.js' } }],
    }),
    JSON.stringify({
      step_index: 2,
      type: 'GENERIC',
      created_at: '2026-11-25T05:00:06Z',
      content: 'A'.repeat(4000),
    }),
    JSON.stringify({
      step_index: 3,
      type: 'PLANNER_RESPONSE',
      created_at: '2026-11-25T05:00:10Z',
      model: 'gemini-2.5-pro',
      input_tokens: 5000,
      cache_read_tokens: 15500,
      output_tokens: 800,
      content: 'Done reading.',
    }),
    // Simulate compaction on turn 3
    JSON.stringify({
      step_index: 4,
      type: 'PLANNER_RESPONSE',
      created_at: '2026-11-25T05:01:00Z',
      model: 'gemini-2.5-pro',
      input_tokens: 4000,
      cache_read_tokens: 6000,
      output_tokens: 300,
      content: 'Compacted summary.',
    }),
    '{"partial_trailing_line": ',
  ].join('\n');
}

function createTempFixtureAppDir() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'token-analytics-fixture-'));
  const convDir = path.join(tempRoot, 'brain', 'fixture-conv-001', '.system_generated', 'logs');
  fs.mkdirSync(convDir, { recursive: true });
  fs.writeFileSync(path.join(convDir, 'transcript.jsonl'), buildFixtureTranscript(), 'utf8');
  return tempRoot;
}

function testUnitMetrics() {
  const parsed = parseTranscriptText(buildFixtureTranscript());
  assert.equal(parsed.turns.length, 3, 'Should parse 3 valid turns and ignore partial line');
  assert.equal(parsed.turns[1].promptTokens, 20500, 'promptTokens must equal input_tokens + cache_read_tokens');
  assert.equal(parsed.turns[1].totalTokens, 21300, 'totalTokens must equal promptTokens + output_tokens');
  assert.ok(parsed.steps.some((s) => s.label === '工具输出: read_file'), 'Should associate GENERIC step with preceding tool name');

  const convMain = {
    id: 'main-1',
    title: 'Main Conv',
    runState: 'RUN_STATE_IDLE',
    projectId: 'proj-alpha',
    projectName: 'AlphaRepo',
    projectPath: '/work/alpha',
    isSubagent: false,
    parentConversationId: '',
    rootConversationId: 'main-1',
    createdAt: '2026-11-25T05:00:00Z',
    updatedAt: '2026-11-25T05:01:00Z',
    primaryModel: 'gemini-2.5-pro',
    turns: parsed.turns,
    steps: parsed.steps,
  };
  const convChild = {
    id: 'sub-1',
    title: 'Subagent Conv',
    runState: 'RUN_STATE_IDLE',
    projectId: 'proj-alpha',
    projectName: 'AlphaRepo',
    projectPath: '/work/alpha',
    isSubagent: true,
    parentConversationId: 'main-1',
    rootConversationId: 'main-1',
    createdAt: '2026-11-25T05:00:30Z',
    updatedAt: '2026-11-25T05:00:40Z',
    primaryModel: 'gemini-2.5-flash',
    turns: [
      {
        turn: 1,
        stepIndex: 1,
        createdAt: '2026-11-25T05:00:35Z',
        model: 'gemini-2.5-flash',
        inputTokens: 2000,
        cacheReadTokens: 1000,
        promptTokens: 3000,
        outputTokens: 400,
        totalTokens: 3400,
        toolNames: [],
      },
    ],
    steps: [],
  };
  const convBeta = {
    id: 'beta-1',
    title: 'Beta Conv',
    runState: 'RUN_STATE_IDLE',
    projectId: 'proj-beta',
    projectName: 'BetaRepo',
    projectPath: '/work/beta',
    isSubagent: false,
    parentConversationId: '',
    rootConversationId: 'beta-1',
    createdAt: '2026-11-25T05:02:00Z',
    updatedAt: '2026-11-25T05:02:10Z',
    primaryModel: 'gemini-2.5-pro',
    turns: [
      {
        turn: 1,
        stepIndex: 1,
        createdAt: '2026-11-25T05:02:05Z',
        model: 'gemini-2.5-pro',
        inputTokens: 8000,
        cacheReadTokens: 0,
        promptTokens: 8000,
        outputTokens: 500,
        totalTokens: 8500,
        toolNames: [],
      },
    ],
    steps: [],
  };

  // Threshold settings normalization & evaluation
  const clamped = normalizeSettings({ thresholds: { mode: 'percent', warnPercent: 75, criticalPercent: 50 } });
  assert.ok(clamped.thresholds.criticalPercent > clamped.thresholds.warnPercent, 'criticalPercent must stay above warnPercent');

  const tokenSettings = normalizeSettings({ thresholds: { mode: 'tokens', warnTokens: 9000, criticalTokens: 15000 } });
  const resolvedTok = resolveContextThresholds(1_000_000, tokenSettings);
  assert.equal(resolvedTok.warnTokens, 9000);
  assert.equal(evaluateContextStatus(8999, resolvedTok), 'ok');
  assert.equal(evaluateContextStatus(10000, resolvedTok), 'warn');
  assert.equal(evaluateContextStatus(15000, resolvedTok), 'critical');

  const map = new Map([
    [convMain.id, convMain],
    [convChild.id, convChild],
    [convBeta.id, convBeta],
  ]);
  const metrics = buildConversationMetrics(convMain, map, tokenSettings);

  assert.equal(metrics.context.used, 10000, 'Latest context used should be turn 3 promptTokens');
  assert.equal(metrics.context.status, 'warn', '10000 >= 9000 custom warnTokens should trigger warn');
  assert.equal(metrics.projectName, 'AlphaRepo');
  assert.equal(metrics.context.compactionCount, 1, 'Should detect 1 compaction event');
  const sumBreakdown = metrics.context.breakdown.reduce((s, b) => s + b.tokens, 0);
  assert.equal(sumBreakdown, metrics.context.used, 'Context breakdown buckets must sum strictly to context.used');

  assert.equal(metrics.tokens.inputTokens, 24000);
  assert.equal(metrics.tokens.cacheReadTokens, 21500);
  assert.equal(metrics.tokens.outputTokens, 1600);
  assert.equal(metrics.tokens.totalTokens, 47100);
  assert.ok(Math.abs(metrics.tokens.cacheHitRate - 21500 / 45500) < 1e-6);

  assert.equal(metrics.withSubagents.subagentCount, 1);
  assert.equal(metrics.withSubagents.totalTokens, 47100 + 3400);

  // Per-project aggregation & filtering
  const nowMs = Date.parse('2026-11-25T06:00:00Z');
  const agFiltered = buildAgentMetrics([convMain, convChild, convBeta], 'all', nowMs, {
    projectId: 'proj-beta',
    settings: tokenSettings,
  });
  assert.equal(agFiltered.byProject.length, 2, 'byProject must still list all projects when filtered');
  assert.equal(agFiltered.totalTokens, 8500, 'Scoped totalTokens should match BetaRepo only');
  assert.equal(agFiltered.allProjectsTotalTokens, 47100 + 3400 + 8500);
  assert.equal(agFiltered.topConversations.length, 1);
  assert.equal(agFiltered.topConversations[0].projectName, 'BetaRepo');

  // Range filtering test
  const oldConv = {
    ...convChild,
    id: 'old-1',
    isSubagent: false,
    parentConversationId: '',
    rootConversationId: 'old-1',
    updatedAt: '2026-10-01T00:00:00Z',
    turns: [
      {
        turn: 1,
        stepIndex: 1,
        createdAt: '2026-10-01T00:00:00Z',
        model: 'claude-opus-4-1',
        inputTokens: 1000,
        cacheReadTokens: 0,
        promptTokens: 1000,
        outputTokens: 200,
        totalTokens: 1200,
        toolNames: [],
      },
    ],
  };
  const agToday = buildAgentMetrics([convMain, convChild, oldConv], 'today', nowMs);
  const agAll = buildAgentMetrics([convMain, convChild, oldConv], 'all', nowMs);
  assert.equal(agToday.totalTokens, 50500, 'Today range should exclude October conversation');
  assert.equal(agAll.totalTokens, 51700, 'All range should include October conversation');

  // Calendar heatmap & 24-hour distribution assertions
  assert.ok(
    agToday.calendarHeatmap &&
      agToday.calendarHeatmap.days.length >= 106 &&
      agToday.calendarHeatmap.days.length <= 112,
    'Heatmap should cover 16 weeks (106..112 days)'
  );
  assert.equal(
    agToday.calendarHeatmap.activeDays,
    2,
    '16-week heatmap keeps active days across the window even when range=today'
  );
  assert.equal(agToday.calendarHeatmap.currentStreak, 1);
  assert.equal(agToday.calendarHeatmap.maxDayTokens, 50500);
  assert.ok(
    agToday.calendarHeatmap.days.every((d) => d.level >= 0 && d.level <= 4),
    'Heatmap levels must be 0..4'
  );
  assert.equal(agFiltered.calendarHeatmap.maxDayTokens, 8500, 'Heatmap should respect projectId filter');

  assert.equal(agAll.hourlyDistribution.buckets.length, 24, 'Hourly distribution must have 24 buckets');
  const hourlySum = agAll.hourlyDistribution.buckets.reduce((s, b) => s + b.totalTokens, 0);
  assert.equal(hourlySum, agAll.totalTokens, 'Sum of hourly buckets must equal agent totalTokens');
  assert.equal(agAll.hourlyDistribution.peakHour, new Date('2026-11-25T05:00:10Z').getHours());

  assert.equal(normalizeSettings({}).font, 'auto');
  assert.equal(normalizeSettings({ font: 'google-sans' }).font, 'google-sans');
  assert.equal(normalizeSettings({ font: 'unknown-font' }).font, 'auto');
  assert.equal(normalizeSettings({ lang: 'en' }).lang, 'en');
  assert.equal(normalizeSettings({ lang: 'fr' }).lang, 'zh');

  // Pricing & cache savings math
  const proRate = getDefaultModelRate('gemini-2.5-pro');
  assert.equal(proRate.input, 2.0);
  assert.equal(proRate.cacheRead, 0.2);
  assert.equal(proRate.output, 12.0);
  assert.equal(getDefaultModelRate('gemini-2.5-flash').input, 0.3);
  assert.equal(getDefaultModelRate('claude-opus-4-1').input, 15.0);
  assert.equal(getDefaultModelRate('unknown-future-model').isDefaultRate, true);

  const costSample = computeTokenCost(
    { inputTokens: 500_000, cacheReadTokens: 1_000_000, outputTokens: 100_000 },
    proRate
  );
  assert.ok(Math.abs(costSample.totalCost - 2.4) < 1e-9);
  assert.ok(Math.abs(costSample.cacheSavings - 1.8) < 1e-9);
  assert.ok(Math.abs(costSample.savingsPercent - (1.8 / 4.2) * 100) < 1e-6);

  const customPricing = normalizeSettings({
    pricing: {
      currency: 'CNY',
      usdToCny: 7.3,
      overrides: { 'gemini-2.5-pro': { input: 4, cacheRead: 0.4, output: 20 } },
    },
  });
  assert.equal(customPricing.pricing.currency, 'CNY');
  assert.equal(customPricing.pricing.usdToCny, 7.3);
  const resolvedCustom = resolveModelRate('gemini-2.5-pro', customPricing.pricing);
  assert.equal(resolvedCustom.isCustom, true);
  assert.equal(resolvedCustom.input, 4);

  assert.ok(metrics.cost.totalCost > 0, 'Session metrics must include positive totalCost');
  assert.ok(metrics.cost.cacheSavings > 0, 'Session metrics must include positive cacheSavings');
  assert.ok(agAll.cost.totalCost > 0 && agAll.cost.cacheSavings > 0);
  assert.ok(agAll.byProject.every((p) => typeof p.totalCost === 'number' && typeof p.cacheSavings === 'number'));

  // Efficiency & timing assertions (Thinking/Answer, Autonomy Leverage, Latency & Focus Time)
  const focusSample = computeFocusDurationFromTimestamps([
    Date.parse('2026-11-25T05:00:00Z'),
    Date.parse('2026-11-25T05:01:00Z'),
    Date.parse('2026-11-25T05:10:00Z'),
    Date.parse('2026-11-25T05:10:30Z'),
  ]);
  assert.equal(focusSample.focusSessions, 2, 'Should split bursts across >5m idle gaps');
  assert.equal(focusSample.activeDurationMs, 60_000 + 15_000 + 30_000 + 15_000);

  assert.ok(metrics.efficiency.thinkingEstTokens > 0);
  assert.ok(metrics.efficiency.contentEstTokens > 0);
  assert.equal(metrics.efficiency.userPromptCount, 1);
  assert.equal(metrics.efficiency.toolCallCount, 1);
  assert.equal(metrics.efficiency.turnsPerPrompt, 3);
  assert.equal(metrics.efficiency.maxTurnsInSingleTask, 3);
  assert.ok(metrics.timing.activeDurationMs > 0);
  assert.equal(metrics.timing.focusSessions, 1);
  assert.ok(metrics.timing.avgTurnDurationMs > 0);
  assert.ok(Array.isArray(metrics.timing.turnPaceSeries) && metrics.timing.turnPaceSeries.length === 2);
  assert.equal(metrics.timing.taskCount, 1);

  assert.ok(agAll.efficiency && agAll.efficiency.modelTurnCount > 0);
  assert.ok(agAll.timing && agAll.timing.totalActiveDurationMs > 0);
  assert.ok(agAll.dailyTrend.every((d) => typeof d.activeDurationMs === 'number'));

  console.log('[PASS] Unit tests for settings, thresholds, pricing, project breakdown, heatmap, hourly, efficiency, timing, and parser');
}

async function testOfflineFixtureCollector() {
  const tempAppDir = createTempFixtureAppDir();
  const emptyProjectsDir = path.join(tempAppDir, 'projects');
  fs.mkdirSync(emptyProjectsDir, { recursive: true });
  try {
    const collector = createCollector({
      appDataDir: tempAppDir,
      projectsDir: emptyProjectsDir,
      lsAddress: '',
      csrfToken: '',
    });
    const collected = await collector.collectAll();
    assert.equal(collected.lsConnected, false);
    assert.equal(collected.conversations.length, 1);
    const snap = buildTelemetrySnapshot(collected, { range: 'all' });
    assert.equal(snap.agent.totalTokens, 47100);
    assert.equal(snap.current.context.used, 10000);
    assert.equal(snap.pricingCatalog.length, 1);
    console.log('[PASS] Offline fixture collector verified (1 fixture conversation, total=47,100)');
  } finally {
    fs.rmSync(tempAppDir, { recursive: true, force: true });
  }
}

async function testLiveCollector() {
  const collector = createCollector();
  const collected = await collector.collectAll();
  assert.ok(Array.isArray(collected.conversations), 'Collector must return conversations array');
  assert.ok(collected.conversations.length > 0, 'Expected at least 1 local conversation in brain/');

  const currentId = process.env.ANTIGRAVITY_CONVERSATION_ID || '';
  const snap = buildTelemetrySnapshot(collected, { conversationId: currentId, range: 'all' });
  assert.ok(snap.agent.totalTokens > 0, 'Agent totalTokens should be > 0');
  assert.ok(Array.isArray(snap.agent.byProject) && snap.agent.byProject.length > 0, 'Expected non-empty byProject list');
  assert.ok(Array.isArray(snap.pricingCatalog) && snap.pricingCatalog.length > 0);
  console.log(
    `[PASS] Live collector: ${collected.conversations.length} conversations, ${snap.agent.byProject.length} projects, agent total=${snap.agent.totalTokens.toLocaleString()}, lsConnected=${snap.lsConnected}`
  );
}

async function testStandaloneServer() {
  const tempAppDir = createTempFixtureAppDir();
  const tempSettingsPath = path.join(tempAppDir, 'settings.json');
  const child = spawn(process.execPath, [mainPath, '--standalone-port', '0', '--print-url'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      ANTIGRAVITY_SIDECAR_WEB_PORT: '',
      ANTIGRAVITY_LS_ADDRESS: '',
      ANTIGRAVITY_CSRF_TOKEN: '',
      ANTIGRAVITY_APP_DATA_DIR: tempAppDir,
      TOKEN_ANALYTICS_SETTINGS_PATH: tempSettingsPath,
    },
  });

  let stderr = '';
  child.stderr.on('data', (d) => {
    stderr += d.toString('utf8');
  });

  const baseUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server startup timeout. stderr=${stderr}`)), 6000);
    let buf = '';
    child.stdout.on('data', (chunk) => {
      buf += chunk.toString('utf8');
      const line = buf.split(/\r?\n/)[0].trim();
      if (line.startsWith('http://127.0.0.1:')) {
        clearTimeout(timer);
        resolve(line);
      }
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited early with code ${code}. stderr=${stderr}`));
    });
  });

  try {
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = await healthRes.json();
    assert.equal(healthJson.ok, true);
    assert.equal(healthJson.mode, 'standalone');

    const getSettingsRes = await fetch(`${baseUrl}/api/settings`);
    assert.equal(getSettingsRes.status, 200);
    const getSettingsJson = await getSettingsRes.json();
    assert.equal(getSettingsJson.settings.thresholds.mode, 'percent');

    const postSettingsRes = await fetch(`${baseUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lang: 'en',
        font: 'noto-sans',
        thresholds: { mode: 'tokens', warnTokens: 100000, criticalTokens: 200000 },
        pricing: {
          currency: 'CNY',
          usdToCny: 7.3,
          overrides: { 'gemini-2.5-pro': { input: 3, cacheRead: 0.3, output: 15 } },
        },
      }),
    });
    assert.equal(postSettingsRes.status, 200);
    const postSettingsJson = await postSettingsRes.json();
    assert.equal(postSettingsJson.settings.lang, 'en');
    assert.equal(postSettingsJson.settings.font, 'noto-sans');
    assert.equal(postSettingsJson.settings.thresholds.mode, 'tokens');
    assert.equal(postSettingsJson.settings.thresholds.warnTokens, 100000);
    assert.equal(postSettingsJson.settings.pricing.currency, 'CNY');
    assert.equal(postSettingsJson.settings.pricing.usdToCny, 7.3);
    assert.equal(postSettingsJson.settings.pricing.overrides['gemini-2.5-pro'].input, 3);

    const telRes = await fetch(`${baseUrl}/api/telemetry?range=all&project=outside-of-project`);
    assert.equal(telRes.status, 200);
    const telJson = await telRes.json();
    assert.equal(telJson.unchanged, false);
    assert.equal(telJson.snapshot.settings.lang, 'en');
    assert.equal(telJson.snapshot.settings.pricing.currency, 'CNY');
    assert.equal(telJson.snapshot.settings.thresholds.mode, 'tokens');
    assert.equal(telJson.snapshot.agent.selectedProjectId, 'outside-of-project');
    assert.equal(telJson.snapshot.agent.totalTokens, 47100);
    assert.ok(telJson.snapshot.agent.cost && typeof telJson.snapshot.agent.cost.totalCost === 'number');
    assert.ok(telJson.snapshot.agent.efficiency && typeof telJson.snapshot.agent.efficiency.turnsPerPrompt === 'number');
    assert.ok(telJson.snapshot.agent.timing && typeof telJson.snapshot.agent.timing.totalActiveDurationMs === 'number');

    const etagRes = await fetch(
      `${baseUrl}/api/telemetry?range=all&project=outside-of-project&etag=${encodeURIComponent(telJson.hash)}`
    );
    assert.equal(etagRes.status, 200);
    const etagJson = await etagRes.json();
    assert.equal(etagJson.unchanged, true);

    for (const p of ['/', '/full']) {
      const htmlRes = await fetch(`${baseUrl}${p}`);
      assert.equal(htmlRes.status, 200);
      const html = await htmlRes.text();
      assert.ok(
        html.includes('Token Analytics') &&
          html.includes('当前上下文') &&
          html.includes('Current Context') &&
          html.includes('按项目用量统计') &&
          html.includes('自定义上下文警戒线') &&
          html.includes('Custom Context Thresholds') &&
          html.includes('日历热力图') &&
          html.includes('Calendar Heatmap') &&
          html.includes('24 小时时段分布') &&
          html.includes('24h Hourly Distribution') &&
          html.includes('settingsBtn') &&
          html.includes('pricingBtn') &&
          html.includes('tclTooltip') &&
          html.includes('data-agent-subtab') &&
          html.includes('convSearchInput') &&
          html.includes('缓存已节省') &&
          html.includes('Cache Savings') &&
          html.includes('预估总费用') &&
          html.includes('Estimated Cost') &&
          html.includes('思考/回答比') &&
          html.includes('Thinking / Answer') &&
          html.includes('每日专注使用时长') &&
          html.includes('Daily Focus Time') &&
          html.includes('langBtn') &&
          html.includes('fontSelect') &&
          html.includes('Google Sans') &&
          html.includes('color-mix(') &&
          html.includes('MutationObserver') &&
          html.includes('--tcl-muted') &&
          !html.includes('var(--muted)') &&
          !html.includes('var(--accent)') &&
          !html.includes('var(--border)') &&
          !html.includes('var(--radius)')
      );
      const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
      assert.ok(scriptMatch && scriptMatch[1], 'Expected inline dashboard script');
      new Function(scriptMatch[1]);
    }

    console.log(`[PASS] Standalone HTTP server & /api/settings verified at ${baseUrl}`);
  } finally {
    child.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 200));
    fs.rmSync(tempAppDir, { recursive: true, force: true });
  }
}

async function main() {
  const runLive = process.argv.includes('--live');
  testUnitMetrics();
  await testOfflineFixtureCollector();
  if (runLive) {
    await testLiveCollector();
  }
  await testStandaloneServer();
  console.log('ALL VERIFICATION CHECKS PASSED');
}

main().catch((err) => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
