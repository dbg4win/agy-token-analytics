import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const META_CACHE_TTL_MS = 5000;
const PROJECTS_CACHE_TTL_MS = 10000;
const LS_TIMEOUT_MS = 2000;
const MAX_LS_PAGES = 5;

function decodeFolderUri(uri) {
  if (typeof uri !== 'string' || !uri.trim()) {
    return '';
  }
  const trimmed = uri.trim();
  if (!trimmed.startsWith('file://')) {
    return trimmed;
  }
  try {
    let p = decodeURIComponent(trimmed.replace(/^file:\/\//i, ''));
    if (/^\/[a-zA-Z]:/.test(p)) {
      p = p.slice(1);
    }
    return p;
  } catch {
    return trimmed;
  }
}

/**
 * Count total characters and CJK characters in a string for token estimation.
 */
function measureText(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return { chars: 0, cjkChars: 0 };
  }
  let cjkChars = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3400 && code <= 0x4dbf) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0x3040 && code <= 0x30ff) ||
      (code >= 0xac00 && code <= 0xd7af)
    ) {
      cjkChars++;
    }
  }
  return { chars: str.length, cjkChars };
}

/**
 * Extract a concise single-line preview from transcript step content.
 */
function buildPreview(rawContent, stepType) {
  if (typeof rawContent !== 'string' || !rawContent) {
    return '';
  }
  let text = rawContent;
  if (stepType === 'USER_INPUT') {
    const match = text.match(/<USER_REQUEST>\s*([\s\S]*?)\s*<\/USER_REQUEST>/i);
    if (match && match[1]) {
      text = match[1];
    }
  }
  const singleLine = text.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= 140) {
    return singleLine;
  }
  return `${singleLine.slice(0, 137)}...`;
}

/**
 * Parse a single transcript.jsonl file into normalized turns and context steps.
 */
export function parseTranscriptText(rawText) {
  const lines = rawText.split(/\r?\n/);
  const turns = [];
  const steps = [];
  let pendingToolNames = [];
  let firstTimestamp = '';
  let lastTimestamp = '';
  let primaryModel = '';
  let fallbackTitle = '';
  let invokedSubagentCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      continue;
    }
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      // Ignore partial/truncated trailing line while a turn is actively streaming
      continue;
    }
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const stepIndex = Number.isFinite(Number(entry.step_index)) ? Number(entry.step_index) : i;
    const stepType = typeof entry.type === 'string' ? entry.type : 'UNKNOWN';
    const createdAt = typeof entry.created_at === 'string' ? entry.created_at : '';
    const truncated = Array.isArray(entry.truncated_fields) && entry.truncated_fields.length > 0;

    if (createdAt) {
      if (!firstTimestamp) {
        firstTimestamp = createdAt;
      }
      lastTimestamp = createdAt;
    }

    const hasTokenUsage =
      typeof entry.input_tokens === 'number' ||
      typeof entry.cache_read_tokens === 'number' ||
      typeof entry.output_tokens === 'number';

    const contentStr = typeof entry.content === 'string' ? entry.content : '';
    const thinkingStr = typeof entry.thinking === 'string' ? entry.thinking : '';
    const contentMeasure = measureText(contentStr);
    const thinkingMeasure = measureText(thinkingStr);

    if (stepType === 'PLANNER_RESPONSE' || hasTokenUsage) {
      const inputTokens = Math.max(0, Number(entry.input_tokens) || 0);
      const cacheReadTokens = Math.max(0, Number(entry.cache_read_tokens) || 0);
      const promptTokens = inputTokens + cacheReadTokens;
      const outputTokens = Math.max(0, Number(entry.output_tokens) || 0);
      const totalTokens = promptTokens + outputTokens;
      const model = typeof entry.model === 'string' && entry.model.trim() ? entry.model.trim() : 'unknown';

      if (model !== 'unknown') {
        primaryModel = model;
      }

      const rawToolCalls = Array.isArray(entry.tool_calls) ? entry.tool_calls : [];
      const toolCalls = rawToolCalls.map((tc) => {
        const name = tc && typeof tc.name === 'string' && tc.name.trim() ? tc.name.trim() : 'tool';
        if (name === 'invoke_subagent') {
          invokedSubagentCount++;
        }
        let argsChars = 0;
        let argsCjk = 0;
        if (tc && tc.args !== undefined) {
          const serialized = typeof tc.args === 'string' ? tc.args : JSON.stringify(tc.args);
          const m = measureText(serialized);
          argsChars = m.chars;
          argsCjk = m.cjkChars;
        }
        return { name, argsChars, argsCjk };
      });

      const toolArgsChars = toolCalls.reduce((sum, tc) => sum + tc.argsChars, 0);
      const toolArgsCjk = toolCalls.reduce((sum, tc) => sum + tc.argsCjk, 0);
      pendingToolNames = toolCalls.map((tc) => tc.name);

      turns.push({
        turn: turns.length + 1,
        stepIndex,
        createdAt,
        model,
        inputTokens,
        cacheReadTokens,
        promptTokens,
        outputTokens,
        totalTokens,
        toolNames: [...pendingToolNames],
        contentChars: contentMeasure.chars,
        contentCjkChars: contentMeasure.cjkChars,
        thinkingChars: thinkingMeasure.chars,
        thinkingCjkChars: thinkingMeasure.cjkChars,
        toolArgsChars,
        toolArgsCjkChars: toolArgsCjk,
      });

      steps.push({
        stepIndex,
        type: stepType,
        category: 'assistant',
        toolNames: [...pendingToolNames],
        label: toolCalls.length > 0
          ? `模型回复 (${toolCalls.map((t) => t.name).slice(0, 2).join(', ')}${toolCalls.length > 2 ? '…' : ''})`
          : '模型回复',
        createdAt,
        chars: contentMeasure.chars + thinkingMeasure.chars + toolArgsChars,
        cjkChars: contentMeasure.cjkChars + thinkingMeasure.cjkChars + toolArgsCjk,
        truncated,
        preview: buildPreview(contentStr || thinkingStr, stepType),
      });
      continue;
    }

    if (stepType === 'USER_INPUT') {
      const preview = buildPreview(contentStr, stepType);
      if (!fallbackTitle && preview) {
        fallbackTitle = preview.length > 48 ? `${preview.slice(0, 45)}...` : preview;
      }
      steps.push({
        stepIndex,
        type: stepType,
        category: 'user',
        label: '用户输入',
        createdAt,
        chars: contentMeasure.chars,
        cjkChars: contentMeasure.cjkChars,
        truncated,
        preview,
      });
      continue;
    }

    if (stepType === 'GENERIC') {
      const toolName = pendingToolNames.length > 0 ? pendingToolNames.shift() : 'tool_output';
      steps.push({
        stepIndex,
        type: stepType,
        category: 'toolOutputs',
        toolName,
        label: `工具输出: ${toolName}`,
        createdAt,
        chars: contentMeasure.chars,
        cjkChars: contentMeasure.cjkChars,
        truncated,
        preview: buildPreview(contentStr, stepType),
      });
      continue;
    }

    if (stepType === 'SYSTEM_MESSAGE' || stepType === 'ERROR_MESSAGE') {
      steps.push({
        stepIndex,
        type: stepType,
        category: 'system',
        label: stepType === 'ERROR_MESSAGE' ? '错误消息' : '系统消息',
        createdAt,
        chars: contentMeasure.chars,
        cjkChars: contentMeasure.cjkChars,
        truncated,
        preview: buildPreview(contentStr, stepType),
      });
    }
  }

  return {
    turns,
    steps,
    firstTimestamp,
    lastTimestamp,
    primaryModel,
    fallbackTitle,
    invokedSubagentCount,
  };
}

/**
 * Create a cached local collector combining brain transcripts and ConversationService metadata.
 */
export function createCollector(options = {}) {
  const appDataDir = path.resolve(
    options.appDataDir ||
      process.env.ANTIGRAVITY_APP_DATA_DIR ||
      path.join(os.homedir(), '.gemini', 'antigravity')
  );
  const brainDir = path.join(appDataDir, 'brain');
  const projectsDir = path.resolve(
    options.projectsDir || path.join(os.homedir(), '.gemini', 'config', 'projects')
  );
  const transcriptCache = new Map();
  let metaCache = { fetchedAtMs: 0, lsConnected: false, map: new Map() };
  let projectsCache = { fetchedAtMs: 0, map: new Map() };

  async function loadProjectsMetadata() {
    const nowMs = Date.now();
    if (nowMs - projectsCache.fetchedAtMs < PROJECTS_CACHE_TTL_MS) {
      return projectsCache.map;
    }

    const map = new Map();
    try {
      const files = await fs.promises.readdir(projectsDir);
      await Promise.all(
        files
          .filter((f) => f.endsWith('.json'))
          .map(async (f) => {
            try {
              const raw = JSON.parse(await fs.promises.readFile(path.join(projectsDir, f), 'utf8'));
              if (!raw || typeof raw !== 'object') return;
              const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : f.slice(0, -5);
              const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : id.slice(0, 8);
              const resources = Array.isArray(raw.projectResources?.resources) ? raw.projectResources.resources : [];
              let folderUri = '';
              for (const r of resources) {
                const uri = r?.gitFolder?.folderUri || r?.localFolder?.folderUri;
                if (typeof uri === 'string' && uri.trim()) {
                  folderUri = uri.trim();
                  break;
                }
              }
              map.set(id, { id, name, folderPath: decodeFolderUri(folderUri) });
            } catch {
              // Ignore malformed project file
            }
          })
      );
    } catch {
      // Projects directory may not exist
    }

    projectsCache = { fetchedAtMs: nowMs, map };
    return map;
  }

  async function fetchConversationMetadata() {
    const nowMs = Date.now();
    if (nowMs - metaCache.fetchedAtMs < META_CACHE_TTL_MS) {
      return metaCache;
    }

    const lsAddress = options.lsAddress ?? process.env.ANTIGRAVITY_LS_ADDRESS;
    const csrfToken = options.csrfToken ?? process.env.ANTIGRAVITY_CSRF_TOKEN;
    if (!lsAddress || !csrfToken) {
      metaCache = { fetchedAtMs: nowMs, lsConnected: false, map: new Map() };
      return metaCache;
    }

    const map = new Map();
    let pageToken = '';
    let connected = false;

    try {
      for (let page = 0; page < MAX_LS_PAGES; page++) {
        const body = { pageSize: 100, includeArchived: true };
        if (pageToken) {
          body.pageToken = pageToken;
        }
        const res = await fetch(`http://${lsAddress}/product.v1.ConversationService/ListConversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Connect-Protocol-Version': '1',
            'x-antigravity-csrf-token': csrfToken,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(LS_TIMEOUT_MS),
        });
        if (!res.ok) {
          break;
        }
        connected = true;
        const json = await res.json();
        const list = Array.isArray(json?.conversations) ? json.conversations : [];
        for (const c of list) {
          if (c && typeof c.id === 'string' && c.id) {
            map.set(c.id, c);
          }
        }
        if (!json?.nextPageToken || list.length === 0) {
          break;
        }
        pageToken = String(json.nextPageToken);
      }
    } catch {
      // Language server may be unavailable in standalone debug mode; fall back gracefully
    }

    metaCache = {
      fetchedAtMs: nowMs,
      lsConnected: connected,
      map: connected ? map : metaCache.map,
    };
    return metaCache;
  }

  async function readTranscriptCached(conversationId) {
    const filePath = path.join(brainDir, conversationId, '.system_generated', 'logs', 'transcript.jsonl');
    let stat;
    try {
      stat = await fs.promises.stat(filePath);
    } catch {
      return null;
    }
    if (!stat.isFile()) {
      return null;
    }

    const cached = transcriptCache.get(conversationId);
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
      return cached.parsed;
    }

    try {
      const rawText = await fs.promises.readFile(filePath, 'utf8');
      const parsed = parseTranscriptText(rawText);
      transcriptCache.set(conversationId, {
        mtimeMs: stat.mtimeMs,
        size: stat.size,
        parsed,
      });
      return parsed;
    } catch {
      return null;
    }
  }

  async function collectAll() {
    const [metaResult, projectsMap] = await Promise.all([
      fetchConversationMetadata(),
      loadProjectsMetadata(),
    ]);
    let dirNames = [];
    try {
      const entries = await fs.promises.readdir(brainDir, { withFileTypes: true });
      dirNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      dirNames = [];
    }

    const allIds = new Set(dirNames);
    for (const id of metaResult.map.keys()) {
      allIds.add(id);
    }

    const parsedResults = await Promise.all(
      [...allIds].map(async (id) => {
        const parsed = await readTranscriptCached(id);
        return { id, parsed };
      })
    );

    const conversations = [];
    for (const { id, parsed } of parsedResults) {
      const ls = metaResult.map.get(id);
      if (!parsed && !ls) {
        continue;
      }

      const turns = parsed?.turns || [];
      const steps = parsed?.steps || [];
      const annotationsTitle = ls?.annotations?.title?.trim() || '';
      const stateSummary = ls?.state?.summary?.trim() || '';
      const title = annotationsTitle || stateSummary || parsed?.fallbackTitle || id.slice(0, 8);
      const parentConversationId = ls?.metadata?.parentConversationId || '';
      const rootConversationId = ls?.metadata?.rootConversationId || id;
      const isSubagent = Boolean(parentConversationId) || (Boolean(rootConversationId) && rootConversationId !== id);
      const createdAt = ls?.metadata?.createTime || parsed?.firstTimestamp || '';
      const updatedAt = ls?.state?.updateTime || parsed?.lastTimestamp || createdAt;
      const runState = ls?.state?.runState || 'RUN_STATE_IDLE';
      const archived = Boolean(ls?.annotations?.archived);
      const rawProjectId = typeof ls?.metadata?.projectId === 'string' ? ls.metadata.projectId.trim() : '';
      const projectId = rawProjectId || 'outside-of-project';
      const projectMeta = projectsMap.get(projectId);
      const projectName =
        projectMeta?.name ||
        (projectId === 'outside-of-project' ? '独立会话 / 未关联项目' : projectId.slice(0, 8));
      const projectPath = projectMeta?.folderPath || '';

      conversations.push({
        id,
        title,
        runState,
        archived,
        projectId,
        projectName,
        projectPath,
        parentConversationId,
        rootConversationId,
        isSubagent,
        invokedSubagentCount: parsed?.invokedSubagentCount || 0,
        createdAt,
        updatedAt,
        primaryModel: parsed?.primaryModel || (turns[turns.length - 1]?.model ?? ''),
        turns,
        steps,
      });
    }

    // Sort newest first by updatedAt
    conversations.sort((a, b) => {
      const ta = Date.parse(a.updatedAt || '') || 0;
      const tb = Date.parse(b.updatedAt || '') || 0;
      return tb - ta;
    });

    return {
      conversations,
      projects: [...projectsMap.values()],
      fetchedAt: new Date().toISOString(),
      lsConnected: metaResult.lsConnected,
    };
  }

  return { collectAll };
}
