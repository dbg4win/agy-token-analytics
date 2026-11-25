/**
 * Model pricing table, custom override resolution, and token cost / cache-savings math.
 * All stored rates are in USD per 1,000,000 tokens.
 */

export const DEFAULT_PRICING_SETTINGS = {
  currency: 'USD', // 'USD' | 'CNY'
  usdToCny: 7.2,
  overrides: {},
};

/**
 * Resolve built-in default API rates (USD per 1M tokens) for a model ID.
 */
export function getDefaultModelRate(modelId) {
  const id = (modelId || '').toLowerCase().trim();
  if (!id || id === 'unknown') {
    return { input: 1.5, cacheRead: 0.15, output: 8.0, isDefaultRate: true };
  }
  if (id.startsWith('gemini') && (id.includes('flash') || id.includes('lite'))) {
    return { input: 0.3, cacheRead: 0.03, output: 2.5, isDefaultRate: false };
  }
  if (id.startsWith('gemini')) {
    return { input: 2.0, cacheRead: 0.2, output: 12.0, isDefaultRate: false };
  }
  if (id.startsWith('claude-opus')) {
    return { input: 15.0, cacheRead: 1.5, output: 75.0, isDefaultRate: false };
  }
  if (id.startsWith('claude-sonnet')) {
    return { input: 3.0, cacheRead: 0.3, output: 15.0, isDefaultRate: false };
  }
  if (id.startsWith('claude-haiku')) {
    return { input: 0.8, cacheRead: 0.08, output: 4.0, isDefaultRate: false };
  }
  if (id.startsWith('gpt-') || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('o4')) {
    return { input: 2.5, cacheRead: 1.25, output: 10.0, isDefaultRate: false };
  }
  return { input: 1.5, cacheRead: 0.15, output: 8.0, isDefaultRate: true };
}

/**
 * Resolve effective model rate, preferring user-configured overrides when valid.
 */
export function resolveModelRate(modelId, pricingSettings) {
  const key = (modelId || '').trim();
  const overrides =
    pricingSettings && pricingSettings.overrides && typeof pricingSettings.overrides === 'object'
      ? pricingSettings.overrides
      : null;
  const custom = key && overrides ? overrides[key] : null;
  if (
    custom &&
    typeof custom === 'object' &&
    Number.isFinite(Number(custom.input)) &&
    Number.isFinite(Number(custom.cacheRead)) &&
    Number.isFinite(Number(custom.output))
  ) {
    return {
      input: Math.max(0, Number(custom.input)),
      cacheRead: Math.max(0, Number(custom.cacheRead)),
      output: Math.max(0, Number(custom.output)),
      isCustom: true,
      isDefaultRate: false,
    };
  }
  return {
    ...getDefaultModelRate(modelId),
    isCustom: false,
  };
}

/**
 * Compute USD cost breakdown and prompt-cache savings for token counts under a given rate.
 */
export function computeTokenCost(tokens, rate) {
  const inputTokens = Math.max(0, Number(tokens?.inputTokens) || 0);
  const cacheReadTokens = Math.max(0, Number(tokens?.cacheReadTokens) || 0);
  const outputTokens = Math.max(0, Number(tokens?.outputTokens) || 0);

  const inRate = Math.max(0, Number(rate?.input) || 0);
  const cacheRate = Math.max(0, Number(rate?.cacheRead) || 0);
  const outRate = Math.max(0, Number(rate?.output) || 0);

  const inputCost = (inputTokens / 1_000_000) * inRate;
  const cacheReadCost = (cacheReadTokens / 1_000_000) * cacheRate;
  const outputCost = (outputTokens / 1_000_000) * outRate;
  const totalCost = inputCost + cacheReadCost + outputCost;

  const uncachedEquivalentCost = ((inputTokens + cacheReadTokens) / 1_000_000) * inRate + outputCost;
  const cacheSavings = Math.max(0, (cacheReadTokens / 1_000_000) * (inRate - cacheRate));
  const savingsPercent = uncachedEquivalentCost > 0 ? (cacheSavings / uncachedEquivalentCost) * 100 : 0;

  return {
    inputCost,
    cacheReadCost,
    outputCost,
    totalCost,
    uncachedEquivalentCost,
    cacheSavings,
    savingsPercent,
  };
}
