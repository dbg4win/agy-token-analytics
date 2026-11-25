import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DEFAULT_PRICING_SETTINGS } from './pricing.mjs';

export const VALID_FONTS = ['auto', 'google-sans', 'noto-sans', 'yahei', 'mono', 'system'];

export const DEFAULT_SETTINGS = {
  lang: 'zh', // 'zh' | 'en'
  font: 'auto', // 'auto' | 'google-sans' | 'noto-sans' | 'yahei' | 'mono' | 'system'
  thresholds: {
    mode: 'percent', // 'percent' | 'tokens'
    warnPercent: 60,
    criticalPercent: 80,
    warnTokens: 150_000,
    criticalTokens: 300_000,
  },
  pricing: {
    currency: DEFAULT_PRICING_SETTINGS.currency,
    usdToCny: DEFAULT_PRICING_SETTINGS.usdToCny,
    overrides: {},
  },
};

function clampInt(val, min, max, fallback) {
  const num = Number(val);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(num)));
}

function clampFloat(val, min, max, fallback, decimals = 4) {
  const num = Number(val);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  const clamped = Math.min(max, Math.max(min, num));
  const factor = Math.pow(10, decimals);
  return Math.round(clamped * factor) / factor;
}

function normalizePricing(rawPricing) {
  const p = rawPricing && typeof rawPricing === 'object' ? rawPricing : {};
  const currency = p.currency === 'CNY' ? 'CNY' : 'USD';
  const usdToCny = clampFloat(p.usdToCny, 1, 100, DEFAULT_PRICING_SETTINGS.usdToCny, 2);
  const overrides = {};
  if (p.overrides && typeof p.overrides === 'object') {
    const entries = Object.entries(p.overrides).slice(0, 64);
    for (const [rawKey, rawRate] of entries) {
      const key = String(rawKey || '').trim();
      if (!key || !rawRate || typeof rawRate !== 'object') continue;
      const input = clampFloat(rawRate.input, 0, 1000, -1, 4);
      const cacheRead = clampFloat(rawRate.cacheRead, 0, 1000, -1, 4);
      const output = clampFloat(rawRate.output, 0, 1000, -1, 4);
      if (input >= 0 && cacheRead >= 0 && output >= 0) {
        overrides[key] = { input, cacheRead, output };
      }
    }
  }
  return { currency, usdToCny, overrides };
}

/**
 * Validate and clamp plugin settings so warn < critical always holds.
 */
export function normalizeSettings(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const t = src.thresholds && typeof src.thresholds === 'object' ? src.thresholds : {};

  const mode = t.mode === 'tokens' ? 'tokens' : 'percent';
  const warnPercent = clampInt(t.warnPercent, 1, 98, DEFAULT_SETTINGS.thresholds.warnPercent);
  const criticalPercent = clampInt(
    t.criticalPercent,
    warnPercent + 1,
    100,
    Math.max(warnPercent + 1, DEFAULT_SETTINGS.thresholds.criticalPercent)
  );

  const warnTokens = clampInt(t.warnTokens, 1000, 10_000_000, DEFAULT_SETTINGS.thresholds.warnTokens);
  const criticalTokens = clampInt(
    t.criticalTokens,
    warnTokens + 1000,
    10_000_000,
    Math.max(warnTokens + 1000, DEFAULT_SETTINGS.thresholds.criticalTokens)
  );

  const font = VALID_FONTS.includes(src.font) ? src.font : 'auto';

  return {
    lang: src.lang === 'en' ? 'en' : 'zh',
    font,
    thresholds: {
      mode,
      warnPercent,
      criticalPercent,
      warnTokens,
      criticalTokens,
    },
    pricing: normalizePricing(src.pricing),
  };
}

/**
 * Create a persistent settings store under plugin_data/token-analytics/settings.json.
 */
export function createSettingsStore(options = {}) {
  const appDataDir = path.resolve(
    options.appDataDir ||
      process.env.ANTIGRAVITY_APP_DATA_DIR ||
      path.join(os.homedir(), '.gemini', 'antigravity')
  );
  const settingsPath = path.resolve(
    options.settingsPath ||
      process.env.TOKEN_ANALYTICS_SETTINGS_PATH ||
      path.join(appDataDir, 'plugin_data', 'token-analytics', 'settings.json')
  );

  let cached = null;

  function load() {
    if (cached) {
      return cached;
    }
    try {
      if (fs.existsSync(settingsPath)) {
        const raw = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        cached = normalizeSettings(raw);
        return cached;
      }
    } catch {
      // Fall back to defaults if file is missing or malformed
    }
    cached = normalizeSettings(DEFAULT_SETTINGS);
    return cached;
  }

  async function save(partial) {
    const current = load();
    const input = partial && typeof partial === 'object' ? partial : {};
    if (input.reset === true) {
      const normalized = normalizeSettings(DEFAULT_SETTINGS);
      await writeSettingsFile(normalized);
      return normalized;
    }

    const nextThresholds = input.resetThresholds
      ? DEFAULT_SETTINGS.thresholds
      : {
          ...current.thresholds,
          ...(input.thresholds && typeof input.thresholds === 'object' ? input.thresholds : {}),
        };

    let nextPricing;
    if (input.resetPricing) {
      nextPricing = DEFAULT_SETTINGS.pricing;
    } else if (input.pricing && typeof input.pricing === 'object') {
      const hasOverridesProp = Object.prototype.hasOwnProperty.call(input.pricing, 'overrides');
      nextPricing = {
        ...current.pricing,
        ...input.pricing,
        overrides: hasOverridesProp
          ? input.pricing.overrides
          : current.pricing.overrides,
      };
    } else {
      nextPricing = current.pricing;
    }

    const merged = {
      ...current,
      ...input,
      thresholds: nextThresholds,
      pricing: nextPricing,
    };
    const normalized = normalizeSettings(merged);
    await writeSettingsFile(normalized);
    return normalized;
  }

  async function writeSettingsFile(normalized) {
    const dir = path.dirname(settingsPath);
    await fs.promises.mkdir(dir, { recursive: true });
    const serialized = JSON.stringify(normalized, null, 2) + '\n';
    const tmpPath = `${settingsPath}.${process.pid}.${Date.now()}.tmp`;
    try {
      await fs.promises.writeFile(tmpPath, serialized, 'utf8');
      await fs.promises.rename(tmpPath, settingsPath);
    } catch {
      try {
        await fs.promises.unlink(tmpPath);
      } catch {
        // ignore cleanup error
      }
      await fs.promises.writeFile(settingsPath, serialized, 'utf8');
    }

    cached = normalized;
  }

  return {
    settingsPath,
    load,
    save,
  };
}
