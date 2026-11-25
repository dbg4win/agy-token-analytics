#!/usr/bin/env node
/**
 * Antigravity Sidecar entrypoint for Token Analytics.
 * Zero external npm dependencies — runs directly on Node.js v22+.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCollector } from './lib/collector.mjs';
import { buildTelemetrySnapshot } from './lib/metrics.mjs';
import { createSettingsStore, DEFAULT_SETTINGS } from './lib/settings.mjs';
import { renderDashboardHtml } from './lib/ui.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readPluginVersion() {
  const candidates = [
    path.resolve(__dirname, '..', '..', 'plugin.json'),
    path.resolve(__dirname, 'package.json'),
  ];
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (typeof parsed.version === 'string' && parsed.version.trim()) {
        return parsed.version.trim();
      }
    } catch {
      // Ignore malformed candidate
    }
  }
  return '1.0.0';
}

function parseCliArgs(argv) {
  let standalonePort = null;
  let printUrl = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--standalone-port' && i + 1 < argv.length) {
      const n = Number(argv[++i]);
      if (Number.isInteger(n) && n >= 0 && n <= 65535) {
        standalonePort = n;
      }
    } else if (arg.startsWith('--standalone-port=')) {
      const n = Number(arg.slice('--standalone-port='.length));
      if (Number.isInteger(n) && n >= 0 && n <= 65535) {
        standalonePort = n;
      }
    } else if (arg === '--print-url') {
      printUrl = true;
    }
  }
  return { standalonePort, printUrl };
}

function computeSnapshotHash(snapshot) {
  const stablePayload = {
    lsConnected: snapshot.lsConnected,
    range: snapshot.range,
    selectedProjectId: snapshot.agent?.selectedProjectId || 'all',
    settings: snapshot.settings,
    activeConversationId: snapshot.activeConversationId,
    todayTokens: snapshot.todayTokens ?? null,
    todayCost: snapshot.todayCost ?? null,
    todayCacheSavings: snapshot.todayCacheSavings ?? null,
    conversationOptions: snapshot.conversationOptions,
    current: snapshot.current,
    agent: snapshot.agent,
  };
  return crypto.createHash('sha256').update(JSON.stringify(stablePayload)).digest('hex').slice(0, 24);
}

function createTelemetryHandler(collector, settingsStore, version) {
  return async function handleTelemetry(queryObj = {}) {
    const collected = await collector.collectAll();
    const settings = settingsStore.load();
    const snapshot = buildTelemetrySnapshot(collected, queryObj, { version, settings });
    const hash = computeSnapshotHash(snapshot);
    const clientEtag = typeof queryObj.etag === 'string' ? queryObj.etag.trim() : '';
    if (clientEtag && clientEtag === hash) {
      return { unchanged: true, hash };
    }
    return { unchanged: false, hash, snapshot };
  };
}

function readJsonBody(req, limitBytes = 32 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > limitBytes) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

async function startSidecarMode(collector, settingsStore, version) {
  const { SidecarApp, Response } = await import('sidecar_sdk');
  const app = new SidecarApp();
  const handleTelemetry = createTelemetryHandler(collector, settingsStore, version);

  app.page('/', async () => {
    const html = renderDashboardHtml({ viewMode: 'aux', isSidecarEnv: true, version });
    return new Response(html, {
      contentType: 'text/html; charset=utf-8',
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  });

  app.page('/full', async () => {
    const html = renderDashboardHtml({ viewMode: 'sidebar', isSidecarEnv: true, version });
    return new Response(html, {
      contentType: 'text/html; charset=utf-8',
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  });

  app.api('/api/health', () => ({ ok: true, version, mode: 'sidecar' }), 'GET');

  app.api(
    '/api/telemetry',
    async (data) => {
      const payload = await handleTelemetry(data || {});
      return new Response(JSON.stringify(payload), {
        contentType: 'application/json; charset=utf-8',
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    },
    'GET'
  );

  app.api(
    '/api/settings',
    () =>
      new Response(JSON.stringify({ ok: true, settings: settingsStore.load() }), {
        contentType: 'application/json; charset=utf-8',
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      }),
    'GET'
  );

  app.api(
    '/api/settings',
    async (data) => {
      const input = typeof data === 'string' ? JSON.parse(data || '{}') : data || {};
      const saved = await settingsStore.save(input);
      return new Response(JSON.stringify({ ok: true, settings: saved }), {
        contentType: 'application/json; charset=utf-8',
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    },
    'POST'
  );

  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    try {
      await app.close();
    } catch {
      // ignore
    }
    process.exit(0);
  };
  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());

  await app.run();
}

async function startStandaloneMode(collector, settingsStore, version, port, printUrl) {
  const handleTelemetry = createTelemetryHandler(collector, settingsStore, version);

  const server = http.createServer(async (req, res) => {
    try {
      const reqUrl = new URL(req.url || '/', 'http://127.0.0.1');
      const pathname = reqUrl.pathname;

      if (req.method === 'GET' && (pathname === '/' || pathname === '/full')) {
        const viewMode = pathname === '/full' ? 'sidebar' : 'aux';
        const html = renderDashboardHtml({ viewMode, isSidecarEnv: false, version });
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(html);
        return;
      }

      if (req.method === 'GET' && pathname === '/api/health') {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(JSON.stringify({ ok: true, version, mode: 'standalone' }));
        return;
      }

      if (req.method === 'GET' && pathname === '/api/telemetry') {
        const queryObj = Object.fromEntries(reqUrl.searchParams.entries());
        const payload = await handleTelemetry(queryObj);
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(JSON.stringify(payload));
        return;
      }

      if (req.method === 'GET' && pathname === '/api/settings') {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(JSON.stringify({ ok: true, settings: settingsStore.load() }));
        return;
      }

      if (req.method === 'POST' && pathname === '/api/settings') {
        const body = await readJsonBody(req);
        const saved = await settingsStore.save(body);
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(JSON.stringify({ ok: true, settings: saved }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: 'Not Found' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }));
    }
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(port, '127.0.0.1', () => resolveListen());
  });

  const addr = server.address();
  const actualPort = typeof addr === 'object' && addr ? addr.port : port;
  const url = `http://127.0.0.1:${actualPort}`;
  if (printUrl) {
    process.stdout.write(`${url}\n`);
  } else {
    console.log(`[token_analytics] standalone listening on ${url}`);
  }

  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    server.close(() => process.exit(0));
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

async function main() {
  const version = readPluginVersion();
  const { standalonePort, printUrl } = parseCliArgs(process.argv.slice(2));
  const collector = createCollector();
  const settingsStore = createSettingsStore();

  const hasSidecarEnv = Boolean(
    process.env.ANTIGRAVITY_SIDECAR_WEB_PORT &&
      process.env.ANTIGRAVITY_LS_ADDRESS &&
      process.env.ANTIGRAVITY_CSRF_TOKEN
  );

  if (standalonePort === null && hasSidecarEnv) {
    await startSidecarMode(collector, settingsStore, version);
  } else {
    const port = standalonePort !== null ? standalonePort : 17910;
    await startStandaloneMode(collector, settingsStore, version, port, printUrl);
  }
}

main().catch((err) => {
  console.error(`[token_analytics] fatal startup error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
