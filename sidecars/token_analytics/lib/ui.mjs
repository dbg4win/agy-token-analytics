/**
 * Self-contained single-document HTML UI for Token Analytics.
 * Zero external CDN dependencies; supports zh/en bilingual UI across Sidecar and Standalone modes.
 */

export function renderDashboardHtml({ viewMode = 'aux', isSidecarEnv = false, version = '1.0.0' } = {}) {
  const preloadScript = isSidecarEnv ? '<script src="/preload.js"></script>\n' : '';
  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Token Analytics</title>
${preloadScript}<style>
:root {
  color-scheme: dark;
  --tcl-bg: var(--background, #12141a);
  --tcl-surface: #1b1e27;
  --tcl-surface: color-mix(in srgb, var(--tcl-bg) 92%, #ffffff 8%);
  --tcl-surface-2: #242936;
  --tcl-surface-2: color-mix(in srgb, var(--tcl-bg) 85%, #ffffff 15%);
  --tcl-surface-hover: #2c3242;
  --tcl-surface-hover: color-mix(in srgb, var(--tcl-bg) 79%, #ffffff 21%);
  --tcl-border: rgba(255, 255, 255, 0.12);
  --tcl-border-strong: rgba(255, 255, 255, 0.22);
  --tcl-text: var(--foreground, #f1f5f9);
  --tcl-muted: #a1a8b8;
  --tcl-muted: color-mix(in srgb, var(--tcl-text) 72%, var(--tcl-bg) 28%);
  --tcl-accent: #38bdf8;
  --tcl-accent-soft: rgba(56, 189, 248, 0.15);
  --tcl-ok: #34d399;
  --tcl-warn: #fbbf24;
  --tcl-danger: #f87171;
  --tcl-c-sys: #a78bfa;
  --tcl-c-tool: #fbbf24;
  --tcl-c-asst: #38bdf8;
  --tcl-c-user: #34d399;
  --tcl-c-cache: #818cf8;
  --tcl-c-new: #38bdf8;
  --tcl-c-out: #34d399;
  --tcl-hm-0: #242936;
  --tcl-hm-0: color-mix(in srgb, var(--tcl-bg) 82%, #ffffff 18%);
  --tcl-hm-1: #0c4a6e;
  --tcl-hm-2: #0284c7;
  --tcl-hm-3: #38bdf8;
  --tcl-hm-4: #10b981;
  --tcl-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.28);
  --tcl-shadow-card: 0 4px 16px -4px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  --tcl-sav-bg: linear-gradient(135deg, rgba(52, 211, 153, 0.14) 0%, rgba(16, 185, 129, 0.02) 100%);
  --tcl-cost-bg: linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.02) 100%);
  --tcl-glow-ok: 0 0 16px rgba(52, 211, 153, 0.16);
  --tcl-glow-accent: 0 0 16px rgba(56, 189, 248, 0.18);
  --tcl-radius: 12px;
  --tcl-ui-font-sans: "Google Sans", "Google Sans Text", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  --tcl-font-mono: "JetBrains Mono", var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
  --tcl-active-font: var(--font-sans, var(--tcl-ui-font-sans));
}

:root[data-theme="light"],
body[data-theme="light"] {
  color-scheme: light;
  --tcl-bg: var(--background, #f8fafc);
  --tcl-surface: #ffffff;
  --tcl-surface: color-mix(in srgb, var(--tcl-bg) 35%, #ffffff 65%);
  --tcl-surface-2: #f1f5f9;
  --tcl-surface-2: color-mix(in srgb, var(--tcl-bg) 92%, #0f172a 8%);
  --tcl-surface-hover: #e2e8f0;
  --tcl-surface-hover: color-mix(in srgb, var(--tcl-bg) 86%, #0f172a 14%);
  --tcl-border: rgba(15, 23, 42, 0.10);
  --tcl-border-strong: rgba(15, 23, 42, 0.20);
  --tcl-text: var(--foreground, #0f172a);
  --tcl-muted: #475569;
  --tcl-muted: color-mix(in srgb, var(--tcl-text) 64%, var(--tcl-bg) 36%);
  --tcl-accent: #0284c7;
  --tcl-accent-soft: rgba(2, 132, 199, 0.10);
  --tcl-ok: #059669;
  --tcl-warn: #d97706;
  --tcl-danger: #dc2626;
  --tcl-c-sys: #8b5cf6;
  --tcl-c-tool: #d97706;
  --tcl-c-asst: #0284c7;
  --tcl-c-user: #059669;
  --tcl-c-cache: #6366f1;
  --tcl-c-new: #0284c7;
  --tcl-c-out: #059669;
  --tcl-hm-0: #e2e8f0;
  --tcl-hm-1: #bae6fd;
  --tcl-hm-2: #38bdf8;
  --tcl-hm-3: #0284c7;
  --tcl-hm-4: #059669;
  --tcl-shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.06);
  --tcl-shadow-card: 0 4px 14px -4px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04);
  --tcl-sav-bg: linear-gradient(135deg, rgba(5, 150, 105, 0.10) 0%, rgba(5, 150, 105, 0.02) 100%);
  --tcl-cost-bg: linear-gradient(135deg, rgba(2, 132, 199, 0.09) 0%, rgba(99, 102, 241, 0.02) 100%);
  --tcl-glow-ok: 0 0 14px rgba(5, 150, 105, 0.12);
  --tcl-glow-accent: 0 0 14px rgba(2, 132, 199, 0.12);
}

@keyframes tclFadeIn {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes tclPulseRing {
  0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.42); }
  70% { box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
  100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
}

* {
  box-sizing: border-box;
  scrollbar-color: var(--tcl-border) transparent;
  scrollbar-width: thin;
}
html {
  margin: 0;
  padding: 0;
  height: 100%;
  background: var(--tcl-bg);
}
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: var(--tcl-bg) !important;
  color: var(--tcl-text) !important;
  font-family: var(--tcl-active-font) !important;
  font-size: 13px;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}
button, select, input, textarea, svg text {
  font-family: inherit;
}
select option {
  background: var(--tcl-surface);
  color: var(--tcl-text);
}

.app {
  max-width: 1240px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

body[data-view="sidebar"] .app {
  padding: 18px 22px;
  gap: 14px;
}

.num {
  font-family: inherit;
  font-variant-numeric: tabular-nums;
}

/* Header */
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--tcl-surface);
  border: 1px solid var(--tcl-border);
  border-radius: var(--tcl-radius);
  padding: 10px 14px;
  box-shadow: var(--tcl-shadow-card);
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--tcl-ok);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  animation: tclPulseRing 2.6s ease-out infinite;
  flex-shrink: 0;
}
.pulse.paused {
  background: var(--tcl-warn);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
  animation: none;
}
.pulse.error {
  background: var(--tcl-danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
  animation: none;
}

.brand-title {
  font-weight: 650;
  font-size: 14px;
  letter-spacing: -0.015em;
  white-space: nowrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  background: var(--tcl-surface-2);
  color: var(--tcl-muted);
  border: 1px solid var(--tcl-border);
  white-space: nowrap;
}
.badge.ok { color: var(--tcl-ok); border-color: rgba(16, 185, 129, 0.35); background: rgba(16, 185, 129, 0.12); }
.badge.warn { color: var(--tcl-warn); border-color: rgba(245, 158, 11, 0.35); background: rgba(245, 158, 11, 0.12); }
.badge.danger { color: var(--tcl-danger); border-color: rgba(239, 68, 68, 0.35); background: rgba(239, 68, 68, 0.12); }
.badge.accent { color: var(--tcl-accent); border-color: rgba(56, 189, 248, 0.35); background: var(--tcl-accent-soft); }

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  flex: 1 1 280px;
  justify-content: flex-end;
}

select.conv-select {
  max-width: 420px;
  min-width: 220px;
  flex: 1 1 320px;
  background: var(--tcl-surface-2);
  color: var(--tcl-text);
  border: 1px solid var(--tcl-border);
  border-radius: 8px;
  padding: 5px 9px;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
body[data-view="aux"] select.conv-select {
  min-width: 140px;
  max-width: 100%;
  flex: 1 1 180px;
}
select.conv-select:hover { border-color: var(--tcl-border-strong); }
select.conv-select:focus {
  border-color: var(--tcl-accent);
  box-shadow: 0 0 0 3px var(--tcl-accent-soft);
}

select.font-select {
  max-width: 138px;
  background: var(--tcl-surface-2);
  color: var(--tcl-text);
  border: 1px solid var(--tcl-border);
  border-radius: 8px;
  padding: 5px 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  box-shadow: var(--tcl-shadow-sm);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
select.font-select:hover {
  border-color: var(--tcl-border-strong);
  background: var(--tcl-surface-hover);
}
select.font-select:focus {
  border-color: var(--tcl-accent);
  box-shadow: 0 0 0 3px var(--tcl-accent-soft);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: var(--tcl-surface-2);
  color: var(--tcl-text);
  border: 1px solid var(--tcl-border);
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: var(--tcl-shadow-sm);
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease;
}
.btn svg, .tab-btn svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  opacity: 0.85;
}
.btn:hover {
  border-color: var(--tcl-border-strong);
  background: var(--tcl-surface-hover);
  transform: translateY(-0.5px);
}
.btn:active { transform: translateY(0); }
.btn:focus-visible, .tab-btn:focus-visible, .pill:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--tcl-accent);
}
.btn.active {
  background: var(--tcl-accent-soft);
  border-color: var(--tcl-accent);
  color: var(--tcl-accent);
  box-shadow: var(--tcl-glow-accent);
}

/* Tabs */
.tabs {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 6px;
  background: var(--tcl-surface-2);
  border: 1px solid var(--tcl-border);
  border-radius: var(--tcl-radius);
  padding: 4px;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.06);
}

.tab-btn {
  flex: 1 1 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--tcl-text);
  opacity: 0.72;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease, opacity 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;
}
.tab-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0.88;
}
.tab-btn:hover {
  opacity: 1;
  color: var(--tcl-text);
  background: color-mix(in srgb, var(--tcl-surface) 78%, transparent);
  border-color: var(--tcl-border);
  box-shadow: var(--tcl-shadow-sm);
}
.tab-btn.active,
.tab-btn.active:hover {
  opacity: 1;
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: rgba(2, 132, 199, 0.45);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 2px 8px -1px rgba(2, 132, 199, 0.40), 0 1px 2px rgba(15, 23, 42, 0.12);
}
.tab-btn.active svg {
  opacity: 1;
  color: #ffffff;
}
body[data-view="aux"] .tab-btn {
  padding: 7px 8px;
  font-size: 12px;
  gap: 5px;
}

/* Grid & Cards */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
body[data-view="sidebar"] .grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (min-width: 780px) {
  .grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
@media (min-width: 720px) {
  .kpi-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
.kpi-grid-6 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
@media (min-width: 680px) {
  .kpi-grid-6 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
body[data-view="aux"] .kpi-grid-6 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.card {
  background: var(--tcl-surface);
  border: 1px solid var(--tcl-border);
  border-radius: var(--tcl-radius);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 11px;
  min-width: 0;
  box-shadow: var(--tcl-shadow-card);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  animation: tclFadeIn 0.2s ease-out;
}
.card:hover {
  border-color: var(--tcl-border-strong);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.card-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--tcl-text);
}
.card-sub {
  font-size: 11.5px;
  color: var(--tcl-muted);
}

.kpi-card {
  background: var(--tcl-surface);
  border: 1px solid var(--tcl-border);
  border-radius: var(--tcl-radius);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: var(--tcl-shadow-card);
  transition: border-color 0.18s ease, transform 0.15s ease;
}
.kpi-card:hover {
  border-color: var(--tcl-border-strong);
}
.kpi-card.cost-card {
  background-color: var(--tcl-surface);
  background-image: var(--tcl-cost-bg);
  border-color: color-mix(in srgb, var(--tcl-accent) 28%, var(--tcl-border));
}
.kpi-card.savings-card {
  background-color: var(--tcl-surface);
  background-image: var(--tcl-sav-bg);
  border-color: color-mix(in srgb, var(--tcl-ok) 35%, var(--tcl-border));
  box-shadow: var(--tcl-shadow-card), var(--tcl-glow-ok);
}
.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.kpi-label {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--tcl-muted);
}
.kpi-val {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--tcl-text);
}
.kpi-meta {
  font-size: 11px;
  color: var(--tcl-muted);
}

/* Context Hero */
.hero-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.gauge-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}
.gauge-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.gauge-pct {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.025em;
}
.gauge-lbl {
  font-size: 10.5px;
  color: var(--tcl-muted);
  margin-top: 2px;
}
.hero-stats {
  flex: 1 1 190px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.stat-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  padding-bottom: 5px;
  border-bottom: 1px dashed var(--tcl-border);
}
.stat-line:last-child { border-bottom: none; padding-bottom: 0; }

/* Stacked Bars & Legends */
.stacked-bar {
  height: 12px;
  border-radius: 999px;
  background: var(--tcl-surface-2);
  overflow: hidden;
  display: flex;
}
.seg { height: 100%; transition: width 0.25s ease; }

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
}
.legend-left {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  flex-shrink: 0;
}

/* Lists & Tables */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.item-row {
  background: var(--tcl-surface-2);
  border: 1px solid var(--tcl-border);
  border-radius: 9px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.item-row:hover {
  border-color: var(--tcl-border-strong);
  background: var(--tcl-surface-hover);
}
.item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
}
.item-label {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-preview {
  font-size: 11px;
  color: var(--tcl-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-bar-track {
  height: 3px;
  border-radius: 999px;
  background: var(--tcl-border);
  overflow: hidden;
  margin-top: 2px;
}
.item-bar-fill {
  height: 100%;
  border-radius: 999px;
}

.mini-share-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.mini-share-wrap > span:last-child {
  min-width: 42px;
  text-align: right;
}
.mini-share-track {
  display: block;
  width: 48px;
  height: 5px;
  border-radius: 999px;
  background: var(--tcl-border);
  overflow: hidden;
  flex-shrink: 0;
}
.mini-share-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--tcl-accent);
}

.chart-legend-inline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.chart-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--tcl-muted);
}
.chart-chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 2px;
  display: inline-block;
}

.mini-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
  gap: 8px;
}
.mini-stat-box {
  background: var(--tcl-surface-2);
  border: 1px solid var(--tcl-border);
  border-radius: 9px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.mini-stat-lbl {
  font-size: 11px;
  color: var(--tcl-muted);
}
.mini-stat-val {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--tcl-text);
}
.mini-stat-sub {
  font-size: 10.5px;
  color: var(--tcl-muted);
  line-height: 1.35;
  word-break: break-word;
}

.kpi-icon {
  width: 14px;
  height: 14px;
  color: var(--tcl-muted);
  opacity: 0.72;
  flex-shrink: 0;
}

.badge.clickable-status {
  cursor: pointer;
  transition: filter 0.14s ease, transform 0.12s ease;
}
.badge.clickable-status:hover {
  filter: brightness(1.12);
}

.hero-bar-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 4px;
}
.hero-bar-wrap {
  position: relative;
  height: 7px;
  border-radius: 999px;
  background: var(--tcl-surface-2);
  overflow: hidden;
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--tcl-border);
}
.drawer-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  background: var(--tcl-surface-2);
  border: 1px solid var(--tcl-border);
  border-radius: 8px;
  padding: 3px;
}
.drawer-tab {
  border: none;
  background: transparent;
  color: var(--tcl-muted);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.14s ease, background 0.14s ease;
}
.drawer-tab:hover { color: var(--tcl-text); }
.drawer-tab.active {
  background: var(--tcl-accent-soft);
  color: var(--tcl-accent);
  font-weight: 600;
}

.mini-pills {
  display: inline-flex;
  gap: 3px;
  background: var(--tcl-surface-2);
  border: 1px solid var(--tcl-border);
  border-radius: 7px;
  padding: 2px;
}
.mini-pill {
  border: none;
  background: transparent;
  color: var(--tcl-muted);
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.14s ease, background 0.14s ease;
}
.mini-pill:hover { color: var(--tcl-text); }
.mini-pill.active {
  background: var(--tcl-accent-soft);
  color: var(--tcl-accent);
  font-weight: 600;
}

.tcl-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  max-width: 280px;
  padding: 7px 10px;
  border-radius: 9px;
  font-size: 11.5px;
  line-height: 1.45;
  background: var(--tcl-surface);
  color: var(--tcl-text);
  border: 1px solid var(--tcl-border-strong);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(8px);
  white-space: pre-line;
}
[data-tip] { cursor: pointer; }
g[data-tip]:hover rect { filter: brightness(1.16); }

@media (max-width: 960px) {
  .col-hide-md { display: none; }
}
@media (max-width: 680px) {
  .col-hide-sm { display: none; }
}
body[data-view="aux"] .col-hide-md {
  display: none;
}

.subtabs {
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid var(--tcl-border);
  padding: 0 2px;
  margin-top: 2px;
  overflow-x: auto;
  scrollbar-width: none;
}
.subtabs::-webkit-scrollbar {
  display: none;
}
.subtab-btn {
  position: relative;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: transparent;
  color: var(--tcl-muted);
  padding: 8px 13px 9px;
  border-radius: 8px 8px 0 0;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}
.subtab-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0.72;
  transition: opacity 0.15s ease;
}
.subtab-btn:hover {
  color: var(--tcl-text);
  background: var(--tcl-surface-2);
  border-bottom-color: var(--tcl-border-strong);
}
.subtab-btn:hover svg {
  opacity: 0.95;
}
.subtab-btn.active {
  color: var(--tcl-accent);
  font-weight: 600;
  border-bottom-color: var(--tcl-accent);
  background: linear-gradient(180deg, transparent 0%, var(--tcl-accent-soft) 100%);
}
.subtab-btn.active svg {
  opacity: 1;
}
.subtab-count {
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1.2;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--tcl-surface-2);
  border: 1px solid var(--tcl-border);
  color: var(--tcl-muted);
}
.subtab-btn.active .subtab-count {
  background: var(--tcl-accent-soft);
  border-color: color-mix(in srgb, var(--tcl-accent) 30%, transparent);
  color: var(--tcl-accent);
}
body[data-view="aux"] .subtab-btn {
  padding: 7px 10px 8px;
  font-size: 12px;
}
.conv-search-input {
  min-width: 160px;
  max-width: 240px;
  flex: 1 1 160px;
  background: var(--tcl-surface-2);
  color: var(--tcl-text);
  border: 1px solid var(--tcl-border);
  border-radius: 8px;
  padding: 5px 9px;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.conv-search-input:focus {
  border-color: var(--tcl-accent);
  box-shadow: 0 0 0 3px var(--tcl-accent-soft);
}
th.sortable {
  cursor: pointer;
  user-select: none;
}
th.sortable:hover {
  color: var(--tcl-text);
}
th.sortable.sorted {
  color: var(--tcl-accent);
}
.table-wrap.tall {
  max-height: 520px;
}
.kpi-top svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.kpi-card.hero-kpi {
  padding: 13px 14px 12px;
  gap: 8px;
  justify-content: space-between;
  background: var(--tcl-surface);
  border: 1px solid var(--tcl-border);
  border-radius: var(--tcl-radius);
  transition: border-color 0.16s ease;
}
.kpi-card.hero-kpi:hover {
  border-color: var(--tcl-accent);
}
.kpi-card.hero-kpi .kpi-top {
  align-items: center;
  gap: 8px;
}
.kpi-head-left {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
.kpi-head-left .kpi-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kpi-icon-badge {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid transparent;
}
.kpi-icon-badge svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}
.kpi-icon-badge.tone-sky {
  background: rgba(14, 165, 233, 0.14);
  color: var(--tcl-c-new);
  border-color: rgba(14, 165, 233, 0.28);
}
.kpi-icon-badge.tone-indigo {
  background: rgba(99, 102, 241, 0.14);
  color: var(--tcl-accent);
  border-color: rgba(99, 102, 241, 0.28);
}
.kpi-icon-badge.tone-emerald {
  background: rgba(16, 185, 129, 0.14);
  color: var(--tcl-ok);
  border-color: rgba(16, 185, 129, 0.28);
}
.kpi-icon-badge.tone-violet {
  background: rgba(139, 92, 246, 0.14);
  color: var(--tcl-c-sys);
  border-color: rgba(139, 92, 246, 0.28);
}
.kpi-icon-badge.tone-cyan {
  background: rgba(20, 184, 166, 0.14);
  color: #0d9488;
  border-color: rgba(20, 184, 166, 0.28);
}
.kpi-icon-badge.tone-amber {
  background: rgba(245, 158, 11, 0.14);
  color: var(--tcl-warn);
  border-color: rgba(245, 158, 11, 0.28);
}
.kpi-icon-badge.tone-rose {
  background: rgba(244, 63, 94, 0.13);
  color: #e11d48;
  border-color: rgba(244, 63, 94, 0.26);
}
:root[data-theme="dark"] .kpi-icon-badge.tone-cyan,
body[data-theme="dark"] .kpi-icon-badge.tone-cyan {
  color: #2dd4bf;
}
:root[data-theme="dark"] .kpi-icon-badge.tone-rose,
body[data-theme="dark"] .kpi-icon-badge.tone-rose {
  color: #fb7185;
}
.kpi-card.hero-kpi.card-tone-sky {
  background: linear-gradient(145deg, rgba(14, 165, 233, 0.11) 0%, rgba(14, 165, 233, 0.03) 55%, var(--tcl-surface) 100%);
  border-color: rgba(14, 165, 233, 0.24);
}
.kpi-card.hero-kpi.card-tone-sky:hover {
  border-color: rgba(14, 165, 233, 0.48);
}
.kpi-card.hero-kpi.card-tone-cyan {
  background: linear-gradient(145deg, rgba(20, 184, 166, 0.11) 0%, rgba(20, 184, 166, 0.03) 55%, var(--tcl-surface) 100%);
  border-color: rgba(20, 184, 166, 0.25);
}
.kpi-card.hero-kpi.card-tone-cyan:hover {
  border-color: rgba(20, 184, 166, 0.48);
}
.kpi-card.hero-kpi.card-tone-violet {
  background: linear-gradient(145deg, rgba(139, 92, 246, 0.11) 0%, rgba(139, 92, 246, 0.03) 55%, var(--tcl-surface) 100%);
  border-color: rgba(139, 92, 246, 0.25);
}
.kpi-card.hero-kpi.card-tone-violet:hover {
  border-color: rgba(139, 92, 246, 0.48);
}
.kpi-card.hero-kpi.card-tone-amber {
  background: linear-gradient(145deg, rgba(245, 158, 11, 0.11) 0%, rgba(245, 158, 11, 0.03) 55%, var(--tcl-surface) 100%);
  border-color: rgba(245, 158, 11, 0.26);
}
.kpi-card.hero-kpi.card-tone-amber:hover {
  border-color: rgba(245, 158, 11, 0.48);
}
.kpi-card.hero-kpi.card-tone-rose {
  background: linear-gradient(145deg, rgba(244, 63, 94, 0.10) 0%, rgba(244, 63, 94, 0.025) 55%, var(--tcl-surface) 100%);
  border-color: rgba(244, 63, 94, 0.25);
}
.kpi-card.hero-kpi.card-tone-rose:hover {
  border-color: rgba(244, 63, 94, 0.48);
}
.kpi-card.hero-kpi.card-tone-emerald {
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.03) 55%, var(--tcl-surface) 100%);
  border-color: rgba(16, 185, 129, 0.28);
}
.kpi-card.hero-kpi.card-tone-emerald:hover {
  border-color: rgba(16, 185, 129, 0.50);
}
.kpi-card.hero-kpi .badge:not(.ok) {
  background: color-mix(in srgb, var(--tcl-surface) 72%, transparent);
}
.kpi-card.hero-kpi .kpi-val {
  font-size: 24px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-top: 2px;
}
.kpi-micro-bar {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: var(--tcl-surface-2);
  overflow: hidden;
  display: flex;
  gap: 1px;
}
.kpi-micro-seg {
  height: 100%;
  min-width: 2px;
  border-radius: 1px;
}
.kpi-micro-seg.seg-new {
  background: var(--tcl-c-new);
}
.kpi-micro-seg.seg-cache {
  background: var(--tcl-c-cache);
}
.kpi-micro-seg.seg-out {
  background: var(--tcl-c-out);
}
.kpi-micro-seg.seg-sav {
  background: var(--tcl-ok);
}
.kpi-micro-seg.seg-focus {
  background: var(--tcl-accent);
}
.kpi-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 11px;
  line-height: 1.35;
  color: var(--tcl-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kpi-foot span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  max-height: 320px;
  overflow-y: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
th, td {
  text-align: left;
  padding: 7px 9px;
  border-bottom: 1px solid var(--tcl-border);
  white-space: nowrap;
}
th {
  font-size: 11px;
  font-weight: 600;
  color: var(--tcl-muted);
  position: sticky;
  top: 0;
  background: var(--tcl-surface);
  z-index: 2;
  border-bottom: 1px solid var(--tcl-border-strong);
}
tbody tr { transition: background 0.12s ease; }
tbody tr:hover td { background: var(--tcl-surface-2); }
td.right, th.right { text-align: right; }
tr.clickable { cursor: pointer; }
tr.clickable:hover td { background: var(--tcl-surface-hover); }

.conv-title-cell {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Range Pills */
.range-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.pills {
  display: inline-flex;
  gap: 4px;
  background: var(--tcl-surface);
  border: 1px solid var(--tcl-border);
  border-radius: 9px;
  padding: 3px;
  box-shadow: var(--tcl-shadow-sm);
}
.pill {
  border: none;
  background: transparent;
  color: var(--tcl-muted);
  padding: 4px 11px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.14s ease, background 0.14s ease;
}
.pill:hover { color: var(--tcl-text); }
.pill.active {
  background: var(--tcl-accent-soft);
  color: var(--tcl-accent);
  font-weight: 600;
}

.svg-chart {
  width: 100%;
  height: auto;
  display: block;
}
rect.hm-cell {
  stroke: rgba(255, 255, 255, 0.04);
  stroke-width: 0.7;
  transition: stroke 0.12s ease;
}
body[data-theme="light"] rect.hm-cell {
  stroke: rgba(15, 23, 42, 0.06);
}
rect.hm-cell:hover {
  stroke: var(--tcl-accent);
  stroke-width: 1.4;
}

.empty-state {
  text-align: center;
  padding: 28px 12px;
  color: var(--tcl-muted);
  font-size: 12.5px;
}

.footer-note {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
  color: var(--tcl-muted);
  padding: 2px 4px;
}

.alert-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 9px 12px;
  border-radius: var(--tcl-radius);
  font-size: 12px;
  border: 1px solid var(--tcl-border);
}
.alert-banner.warn {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.4);
  color: var(--tcl-warn);
}
.alert-banner.critical {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.4);
  color: var(--tcl-danger);
}

.settings-drawer {
  background: var(--tcl-surface);
  border: 1px solid color-mix(in srgb, var(--tcl-accent) 45%, var(--tcl-border));
  border-radius: var(--tcl-radius);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--tcl-shadow-card), var(--tcl-glow-accent);
  animation: tclFadeIn 0.16s ease-out;
}
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  align-items: end;
}
.field-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-label {
  font-size: 11px;
  color: var(--tcl-muted);
}
.input-num {
  width: 100%;
  background: var(--tcl-surface-2);
  color: var(--tcl-text);
  border: 1px solid var(--tcl-border);
  border-radius: 7px;
  padding: 6px 8px;
  font-size: 12px;
  font-family: var(--tcl-font-mono);
  outline: none;
}
.input-num:focus { border-color: var(--tcl-accent); }
.preset-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.proj-select {
  background: var(--tcl-surface);
  color: var(--tcl-text);
  border: 1px solid var(--tcl-border);
  border-radius: 8px;
  padding: 5px 9px;
  font-size: 12px;
  max-width: 220px;
  outline: none;
  box-shadow: var(--tcl-shadow-sm);
}
.proj-select:focus {
  border-color: var(--tcl-accent);
  box-shadow: 0 0 0 3px var(--tcl-accent-soft);
}
tr.row-selected td {
  background: var(--tcl-accent-soft);
}
.hm-legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: var(--tcl-muted);
}
.hm-scale {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.hm-swatch {
  width: 10px;
  height: 10px;
  border-radius: 2.5px;
  display: inline-block;
}
.hud-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.25s ease;
}
.hud-tick {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  opacity: 0.85;
}
.cost-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 10px;
}
@media (min-width: 600px) {
  .cost-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.cost-val-ok {
  color: var(--tcl-ok);
}
.rate-input {
  width: 82px;
  background: var(--tcl-surface-2);
  color: var(--tcl-text);
  border: 1px solid var(--tcl-border);
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 11.5px;
  font-family: var(--tcl-font-mono);
  text-align: right;
  outline: none;
}
.rate-input:focus { border-color: var(--tcl-accent); }
</style>
</head>
<body data-view="${viewMode}" data-theme="dark">
<div class="app">
  <header class="header">
    <div class="brand">
      <span class="brand-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <defs>
            <linearGradient id="tclBrandGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#6366f1"/>
            </linearGradient>
          </defs>
          <rect x="1.5" y="1.5" width="21" height="21" rx="6.5" fill="url(#tclBrandGrad)" fill-opacity="0.16" stroke="url(#tclBrandGrad)" stroke-width="1.5"/>
          <circle cx="11.5" cy="11.5" r="4.5" stroke="#38bdf8" stroke-width="1.8"/>
          <path d="M15 15L18 18" stroke="#34d399" stroke-width="2" stroke-linecap="round"/>
          <circle cx="11.5" cy="11.5" r="1.5" fill="#34d399"/>
        </svg>
      </span>
      <span id="livePulse" class="pulse"></span>
      <span class="brand-title">Token Analytics</span>
      <span id="statusBadge" class="badge clickable-status" title="点击暂停或恢复自动同步">连接中</span>
    </div>
    <div class="controls">
      <select id="convSelect" class="conv-select" title="选择要查看的会话">
        <option value="__follow__">跟随当前会话</option>
      </select>
      <button id="settingsBtn" class="btn" type="button" title="外观、警戒线与单价设置"><span class="lbl">设置</span></button>
      <button id="refreshBtn" class="btn" type="button" title="立即刷新"><span class="lbl">刷新</span></button>
      <button id="copyBtn" class="btn" type="button" title="复制 Markdown 统计报告"><span class="lbl">复制报告</span></button>
    </div>
  </header>

  <nav class="tabs" role="tablist">
    <button class="tab-btn active" data-tab="context" type="button" role="tab" aria-selected="true"><span class="lbl">当前上下文</span></button>
    <button class="tab-btn" data-tab="session" type="button" role="tab" aria-selected="false"><span class="lbl">会话 Token</span></button>
    <button class="tab-btn" data-tab="agent" type="button" role="tab" aria-selected="false"><span class="lbl">Agent 全局用量</span></button>
  </nav>

  <div id="settingsPanel" hidden></div>

  <main id="contentRoot">
    <div class="card"><div id="initialLoading" class="empty-state">正在加载会话与 Token 数据...</div></div>
  </main>

  <footer class="footer-note">
    <span id="metaLine">v${version}</span>
    <span id="updatedAtLine">-</span>
  </footer>
</div>
<div id="tclTooltip" class="tcl-tooltip" hidden></div>

<script>
(function() {
  var I18N = {
    zh: {
      connecting: '连接中',
      liveSync: '实时同步',
      localMode: '本地模式',
      paused: '已暂停',
      connError: '连接异常',
      loading: '正在加载会话与 Token 数据...',
      followActive: '跟随当前会话',
      followNamed: '跟随: {title}',
      autoTrackNamed: '自动跟踪: {title}',
      selectConvTitle: '选择要查看的会话',
      langBtnLabel: 'EN',
      langBtnTitle: 'Switch to English',
      thresholdBtn: '警戒线',
      thresholdBtnTitle: '设置上下文自定义警戒线',
      pauseBtn: '暂停',
      resumeBtn: '恢复',
      pauseBtnTitle: '暂停/恢复自动刷新',
      refreshBtn: '刷新',
      refreshBtnTitle: '立即刷新',
      copyBtn: '复制报告',
      copiedBtn: '已复制',
      copyBtnTitle: '复制 Markdown 统计报告',
      tabContext: '当前上下文',
      tabSession: '会话 Token',
      tabAgent: 'Agent 全局用量',
      noCurrentConv: '暂未找到当前会话记录',
      standaloneProj: '独立会话 / 未关联项目',
      allProjectsOpt: '全部项目 ({count})',
      allProjectsLabel: '全部项目',
      clearFilter: '清除筛选',
      runningCount: '运行中',
      runningBadge: '运行中',
      runningShort: '运行',
      subBadge: '子',
      healthOk: '健康',
      healthWarn: '超警戒',
      healthCrit: '超危险',
      statusWarnLong: '超过警戒线',
      statusCritLong: '超过危险线',
      statusWarnBadge: '警戒',
      statusCritBadge: '危险',
      defaultWindow: '默认窗口',
      projectPrefix: '项目',
      ctxGaugeLbl: '上下文占用',
      ctxUsedLine: '当前已用上下文',
      ctxThreshLine: '警戒 / 危险线',
      ctxMarginLine: '阈值余量',
      ctxNextLine: '预计下轮起点',
      ctxCacheCompLine: '末轮缓存 / 压缩',
      distRemaining: '距警戒线剩 {n}',
      distExceeded: '已超出警戒线 {n}',
      compactedTimes: '压缩 {n} 次',
      notCompacted: '未压缩',
      compactedTag: '压缩',
      truncatedTag: '已截断',
      warnBanner: '<strong>上下文已达警戒线</strong>：当前 {used} tokens ≥ 警戒阈值 {limit}，建议关注后续工具输出体积。',
      critBanner: '<strong>上下文已超危险线</strong>：当前 {used} tokens ≥ 危险阈值 {limit}，建议执行压缩（/compact）或开启新会话。',
      breakdownTitle: '上下文构成估算',
      breakdownSub: '对齐实测 {used} tokens',
      bkSystem: '系统提示与规则基线',
      bkToolOutputs: '工具调用结果',
      bkAssistant: '助手回复与思考',
      bkUser: '用户输入消息',
      growthTitle: '上下文增长曲线',
      growthSub: '蓝线: 总输入 · 虚线: 缓存/阈值',
      noTurnData: '暂无模型轮次数据',
      heaviestTitle: '当前窗口最高占用步骤',
      heaviestSub: '按估算 Token 排序',
      noStepData: '当前窗口暂无上下文明细',
      stepAssistant: '模型回复',
      stepUser: '用户输入',
      stepToolOut: '工具输出: {name}',
      stepSystem: '系统消息',
      stepError: '错误消息',
      turnTip: '轮次 #{turn}: 上下文 {prompt} (新增 {input} / 缓存 {cache})',
      turnTipCompact: ' [触发压缩]',
      chartWarn: '警戒',
      chartCrit: '危险',
      sessTotalKpi: '会话总消耗 Token',
      sessTurnMeta: '{n} 轮模型调用',
      sessInputKpi: '累计输入 (新增 / 缓存)',
      sessInputMeta: '新 {in} · 缓存 {cache}',
      sessOutputKpi: '累计输出 Token',
      sessOutputMeta: '含思考与工具参数',
      sessCacheKpi: '会话缓存命中率',
      sessCacheMeta: '末轮 {rate}',
      subTitle: '子 Agent 汇总 ({n} 个子会话)',
      subCombined: '合并总计 {total}',
      subColName: '子会话',
      subColTurns: '轮次',
      subColIn: '输入',
      subColOut: '输出',
      subColTotal: '总 Token',
      sessModelsTitle: '会话模型分布',
      turnsTableTitle: '逐轮 Token 明细',
      turnsTableSub: '按最新轮次倒序',
      colModel: '模型',
      colTurns: '轮次',
      colNewIn: '新增输入',
      colCacheRead: '缓存读取',
      colOutput: '输出',
      colTotal: '总计',
      colCacheRate: '缓存率',
      colTurnIdx: '轮次',
      colCtxTotal: '上下文总计',
      colHitRate: '命中率',
      noData: '无数据',
      noCallRecords: '无调用记录',
      rangeToday: '今日',
      range7d: '近 7 天',
      range30d: '近 30 天',
      rangeAll: '全部时间',
      agentTotalKpi: 'Agent 总消耗 Token',
      projScopedTotal: '{name} · 总消耗',
      agentInputKpi: '输入 (新增 / 缓存)',
      agentInputMeta: '新 {in} · 缓存 {cache}',
      agentOutputKpi: '输出 Token',
      agentCacheKpi: '缓存命中率',
      agentCacheMeta: '{conv} 会话 ({main}主/{sub}子) · {turns} 轮',
      projTableTitle: '按项目用量统计 (点击行筛选)',
      projTableSub: '总计 {total} · {n} 个项目',
      colProject: '项目',
      colShare: '占比',
      colConvs: '会话',
      colNewShort: '新增',
      colCacheShort: '缓存',
      noProjData: '无项目数据',
      dailyTitle: '每日 Token 用量趋势',
      dailySub: '紫: 缓存 · 蓝: 新增 · 绿: 输出',
      noDailyData: '该时间范围内暂无用量记录',
      dailyTip: '{date}: 总计 {total} (缓存 {cache}, 新增 {input}, 输出 {output}, {turns} 轮)',
      modelsTitle: '各模型消耗分布',
      modelsSub: '{n} 个模型',
      hmTitle: '日历热力图 (近 16 周)',
      hmSub: '活跃 {active} 天 · 连续 {streak} 天',
      hmNoData: '暂无日历统计数据',
      hmPeak: '峰值 {date} ({val})',
      hmEmptyPeak: '近 16 周暂无用量',
      hmLess: '少',
      hmMore: '多',
      hmWeekdays: ['一', '三', '五', '日'],
      hmMonths: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
      hourlyTitle: '24 小时时段分布',
      hourlyPeakSub: '高峰 {hour}:00 ({val}) · 活跃 {active} 时段',
      hourlyEmptySub: '暂无活跃时段',
      hourlyNoData: '暂无时段分布数据',
      hourlyRangeEmpty: '该筛选范围内暂无活跃时段数据',
      hourlyTip: '{h}:00-{h}:59: 总计 {total} (缓存 {cache}, 新增 {input}, 输出 {output}, {turns} 轮)',
      topConvTitle: '会话用量排行 (点击跳转查看上下文)',
      colConv: '会话',
      colCtxCurr: '当前上下文',
      noConvRecords: '无会话记录',
      thTitle: '自定义上下文警戒线',
      thSub: '按模型窗口百分比或绝对 Token 数设置提醒阈值（全局持久保存）',
      thModePct: '百分比 (%)',
      thModeTok: '绝对 Token',
      thPresets: '快捷预设:',
      thPresetDefault: '默认 60% / 80%',
      thPresetLite: '精简 100K / 200K',
      thPresetBal: '平衡 150K / 300K',
      thPresetLong: '长窗 400K / 700K',
      thWarnLbl: '警戒线 ({unit})',
      thCritLbl: '危险线 ({unit})',
      thSave: '保存生效',
      thReset: '重置默认',
      thClose: '收起',
      pricingBtn: '单价',
      pricingBtnTitle: '自定义模型单价与显示货币',
      prTitle: '模型单价与货币设置',
      prSub: '按每 1M Tokens 的 USD 基准单价估算费用与缓存节省',
      prCurrency: '显示货币',
      prRate: '汇率 (USD→CNY)',
      prCustomTag: '自定义',
      prDefaultTag: '默认',
      prColModel: '模型',
      prColIn: '输入 ($/1M)',
      prColCache: '缓存读 ($/1M)',
      prColOut: '输出 ($/1M)',
      prSave: '保存单价',
      prReset: '重置单价',
      prClose: '收起',
      prNote: '说明：费用按公开 API 单价估算，用于观察用量与缓存省钱效果，不代表实际账单。',
      sessCostCard: '会话预估费用',
      sessCostMeta: '新 {in} · 缓存 {cache} · 输出 {out}',
      sessSavCard: '缓存已节省',
      sessSavMeta: '省下 {pct}% · 无缓存原价 {raw}',
      agentCostCard: '预估总费用',
      agentSavCard: 'Prompt Cache 累计省钱',
      colCost: '费用',
      colSaved: '缓存省',
      dailyCostSuffix: ' · 费用 {cost} (省 {saved})',
      effTitle: '思考/回答比 & Agent 自治杠杆',
      effSub: '输出构成估算与单指令杠杆',
      effThinkLbl: '思考过程',
      effAnsLbl: '正式回答',
      effToolArgsLbl: '工具参数',
      effRatioLbl: '思考 / 回答比',
      effThinkShare: '思考占 {pct}%',
      effLeverageLbl: '自治杠杆率',
      effLeverageSub: '1 指令 → {turns} 轮 · {tools} 工具',
      effPeakTaskLbl: '单次任务峰值',
      effPeakTaskVal: '{turns} 轮 · {tools} 工具',
      effPromptsMeta: '{prompts} 指令 · {turns} 轮 · {tools} 工具',
      timingTitle: '响应耗时 & 专注时长',
      timingSub: '按 5 分钟无操作间隔分段估算',
      agTimingTitle: '响应耗时 & 每日专注使用时长',
      focusTotalLbl: '累计专注时长',
      focusSessLbl: '本会话专注',
      focusSessionsMeta: '{n} 个专注段',
      focusTodayLbl: '今日专注',
      focusAvgDayLbl: '日均专注',
      focusPeakLbl: '峰值',
      turnPaceLbl: '平均轮次节奏',
      turnPaceMeta: '中位 {p50} · 最慢 {max}',
      taskDurLbl: '平均任务耗时',
      taskDurMeta: '最长 {max} · {n} 次指令',
      noFocusData: '该范围内暂无专注时长记录',
      focusBarTip: '{date}: 专注 {dur} ({sessions} 个专注段, {turns} 轮)',
      dailyFocusSuffix: ' · 专注 {dur}',
      metaFooter: 'v{ver} · 会话: {convs} · 项目: {projs}',
      updatedFooter: '更新于 {time}',
      rptHeader: '## Token Analytics 统计报告',
      rptSess: '### 当前会话: {title} (项目: {proj})',
      rptModel: '- 模型: {model}',
      rptCtx: '- 当前上下文: {used} / {limit} ({pct}%) · 状态: {status}',
      rptSessTok: '- 会话总 Token: {total} (新增输入 {in} + 缓存读取 {cache} + 输出 {out})',
      rptSessCost: '- 会话预估费用: {cost} (缓存节省 {saved}, {pct}%)',
      rptCache: '- 缓存命中率: {hit} (末轮 {last})',
      rptEff: '- 思考/回答比: {ratio} (思考占 {pct}%) · 自治杠杆: 1 指令 → {turns} 轮 / {tools} 工具',
      rptTiming: '- 专注时长: {focus} · 平均轮次节奏: {pace} · 平均任务耗时: {task}',
      rptAgent: '### Agent 全局用量 ({range} / {proj})',
      rptCov: '- 覆盖会话: {convs} ({turns} 轮)',
      rptAgTok: '- 全局总 Token: {total} (新增 {in} / 缓存 {cache} / 输出 {out})',
      rptAgCost: '- 全局预估费用: {cost} (缓存累计省钱 {saved}, 省下 {pct}%)',
      rptAgCache: '- 全局缓存命中率: {hit}',
      rptProjTop: '### 项目用量 Top 5',
      fontTitle: '切换界面字体（默认跟随 Agent）',
      fontAuto: '跟随 Agent',
      fontGoogleSans: 'Google Sans',
      fontNotoSans: 'Noto Sans SC',
      fontYahei: '微软雅黑 / PingFang',
      fontMono: 'JetBrains Mono',
      fontSystem: '系统默认',
      settingsBtn: '设置',
      settingsBtnTitle: '外观、警戒线与单价设置',
      setTabGeneral: '常规与外观',
      setTabLimits: '上下文警戒线',
      setTabPricing: '模型单价',
      genLangLbl: '界面语言',
      genFontLbl: '界面字体',
      genSyncLbl: '自动刷新 (每 10 秒)',
      statusClickTip: '点击暂停或恢复自动同步',
      dailyModeTokens: 'Token',
      dailyModeFocus: '专注时长',
      dailyModeCost: '费用',
      dailyCostTitle: '每日费用与缓存省钱',
      dailyCostTip: '{date}\\n预估费用: {cost}\\n缓存省钱: {saved}\\n轮次: {turns}',
      turnPaceChartTitle: '近期单轮耗时节奏 (最近 {n} 轮)',
      turnPaceTip: '第 {turn} 轮: {dur}',
      noTurnPaceData: '暂无多轮间隔耗时数据',
      focusDaysMeta: '活跃专注 {days} 天 · {sessions} 个专注段',
      agSubTrends: '趋势与节律',
      agSubBreakdown: '项目与模型',
      agSubConvs: '会话排行',
      agSummaryTokMeta: '命中 {hit} · 新 {in} / 缓 {cache} / 出 {out}',
      agSummaryFocusLbl: '专注时长 & 杠杆',
      agSummaryFocusMeta: '今日 {today} · 杠杆 1→{turns} 轮 · {convs} 会话',
      agHitPill: '命中 {hit}',
      agTurnsPill: '{convs} 会话',
      agLevPill: '1→{turns} 轮',
      agTokFoot: '新 {in} · 缓 {cache} · 出 {out}',
      agSavFoot: '实付 {paid} · 原价 {raw}',
      agFocusFoot: '今日 {today} · 日均 {avg}',
      convSearchPlaceholder: '搜索会话标题 / 项目 / 模型...',
      convShownCount: '显示 {shown} / {total} 个会话'
    },
    en: {
      connecting: 'Connecting',
      liveSync: 'Live Sync',
      localMode: 'Local Mode',
      paused: 'Paused',
      connError: 'Offline',
      loading: 'Loading conversation & token telemetry...',
      followActive: 'Follow Active Session',
      followNamed: 'Follow: {title}',
      autoTrackNamed: 'Auto: {title}',
      selectConvTitle: 'Select conversation to inspect',
      langBtnLabel: '中文',
      langBtnTitle: '切换为中文',
      thresholdBtn: 'Limits',
      thresholdBtnTitle: 'Configure custom context thresholds',
      pauseBtn: 'Pause',
      resumeBtn: 'Resume',
      pauseBtnTitle: 'Pause/Resume auto-refresh',
      refreshBtn: 'Refresh',
      refreshBtnTitle: 'Refresh now',
      copyBtn: 'Copy Report',
      copiedBtn: 'Copied',
      copyBtnTitle: 'Copy Markdown telemetry report',
      tabContext: 'Current Context',
      tabSession: 'Session Tokens',
      tabAgent: 'Agent Overview',
      noCurrentConv: 'No active conversation found',
      standaloneProj: 'Standalone / No Project',
      allProjectsOpt: 'All Projects ({count})',
      allProjectsLabel: 'All Projects',
      clearFilter: 'Clear Filter',
      runningCount: 'Running',
      runningBadge: 'Running',
      runningShort: 'Live',
      subBadge: 'Sub',
      healthOk: 'Healthy',
      healthWarn: 'Warn',
      healthCrit: 'Critical',
      statusWarnLong: 'Warning',
      statusCritLong: 'Critical',
      statusWarnBadge: 'Warn',
      statusCritBadge: 'Crit',
      defaultWindow: 'Default Window',
      projectPrefix: 'Project',
      ctxGaugeLbl: 'Context Used',
      ctxUsedLine: 'Current Context',
      ctxThreshLine: 'Warn / Critical',
      ctxMarginLine: 'Threshold Margin',
      ctxNextLine: 'Projected Next',
      ctxCacheCompLine: 'Last Cache / Compact',
      distRemaining: '{n} before warn',
      distExceeded: '{n} over warn',
      compactedTimes: 'Compacted {n}x',
      notCompacted: 'None',
      compactedTag: 'Compacted',
      truncatedTag: 'Truncated',
      warnBanner: '<strong>Warning Threshold Reached</strong>: {used} tokens ≥ warn limit {limit}. Watch large tool outputs.',
      critBanner: '<strong>Critical Threshold Exceeded</strong>: {used} tokens ≥ critical limit {limit}. Consider /compact or starting a new session.',
      breakdownTitle: 'Context Breakdown (Est.)',
      breakdownSub: 'Aligned to {used} tokens',
      bkSystem: 'System Prompt & Rules',
      bkToolOutputs: 'Tool Outputs',
      bkAssistant: 'Assistant & Thinking',
      bkUser: 'User Messages',
      growthTitle: 'Context Growth Curve',
      growthSub: 'Blue: Total Input · Dashed: Cache / Limits',
      noTurnData: 'No model turn data yet',
      heaviestTitle: 'Heaviest Steps in Window',
      heaviestSub: 'Sorted by estimated tokens',
      noStepData: 'No steps in current window',
      stepAssistant: 'Assistant Reply',
      stepUser: 'User Input',
      stepToolOut: 'Tool Output: {name}',
      stepSystem: 'System Message',
      stepError: 'Error Message',
      turnTip: 'Turn #{turn}: Context {prompt} (New {input} / Cache {cache})',
      turnTipCompact: ' [Compacted]',
      chartWarn: 'Warn',
      chartCrit: 'Crit',
      sessTotalKpi: 'Session Total Tokens',
      sessTurnMeta: '{n} model turns',
      sessInputKpi: 'Input (New / Cached)',
      sessInputMeta: 'New {in} · Cache {cache}',
      sessOutputKpi: 'Output Tokens',
      sessOutputMeta: 'Includes thinking & tool args',
      sessCacheKpi: 'Cache Hit Rate',
      sessCacheMeta: 'Last turn {rate}',
      subTitle: 'Subagent Rollup ({n} children)',
      subCombined: 'Combined {total}',
      subColName: 'Subagent',
      subColTurns: 'Turns',
      subColIn: 'Input',
      subColOut: 'Output',
      subColTotal: 'Total',
      sessModelsTitle: 'Session Model Split',
      turnsTableTitle: 'Turn-by-Turn Breakdown',
      turnsTableSub: 'Latest turn first',
      colModel: 'Model',
      colTurns: 'Turns',
      colNewIn: 'New In',
      colCacheRead: 'Cache Read',
      colOutput: 'Output',
      colTotal: 'Total',
      colCacheRate: 'Hit Rate',
      colTurnIdx: 'Turn',
      colCtxTotal: 'Context',
      colHitRate: 'Hit %',
      noData: 'No data',
      noCallRecords: 'No model turns recorded',
      rangeToday: 'Today',
      range7d: '7D',
      range30d: '30D',
      rangeAll: 'All Time',
      agentTotalKpi: 'Agent Total Tokens',
      projScopedTotal: '{name} · Total',
      agentInputKpi: 'Input (New / Cached)',
      agentInputMeta: 'New {in} · Cache {cache}',
      agentOutputKpi: 'Output Tokens',
      agentCacheKpi: 'Cache Hit Rate',
      agentCacheMeta: '{conv} convs ({main} main / {sub} sub) · {turns} turns',
      projTableTitle: 'Usage by Project (Click to Filter)',
      projTableSub: 'Total {total} · {n} projects',
      colProject: 'Project',
      colShare: 'Share',
      colConvs: 'Convs',
      colNewShort: 'New',
      colCacheShort: 'Cache',
      noProjData: 'No project data',
      dailyTitle: 'Daily Token Trend',
      dailySub: 'Purple: Cache · Blue: New · Green: Output',
      noDailyData: 'No usage in selected range',
      dailyTip: '{date}: Total {total} (Cache {cache}, New {input}, Out {output}, {turns} turns)',
      modelsTitle: 'Model Distribution',
      modelsSub: '{n} models',
      hmTitle: 'Calendar Heatmap (16 Weeks)',
      hmSub: '{active} active days · {streak}d streak',
      hmNoData: 'No calendar data',
      hmPeak: 'Peak {date} ({val})',
      hmEmptyPeak: 'No usage in 16 weeks',
      hmLess: 'Less',
      hmMore: 'More',
      hmWeekdays: ['Mon', 'Wed', 'Fri', 'Sun'],
      hmMonths: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      hourlyTitle: '24h Hourly Distribution',
      hourlyPeakSub: 'Peak {hour}:00 ({val}) · {active} active hrs',
      hourlyEmptySub: 'No active hours',
      hourlyNoData: 'No hourly data',
      hourlyRangeEmpty: 'No hourly activity in selected filter',
      hourlyTip: '{h}:00-{h}:59: Total {total} (Cache {cache}, New {input}, Out {output}, {turns} turns)',
      topConvTitle: 'Top Conversations (Click to Inspect)',
      colConv: 'Conversation',
      colCtxCurr: 'Context',
      noConvRecords: 'No conversations found',
      thTitle: 'Custom Context Thresholds',
      thSub: 'Configure warning & critical alerts by window % or token count (persisted globally)',
      thModePct: 'Percent (%)',
      thModeTok: 'Token Count',
      thPresets: 'Presets:',
      thPresetDefault: 'Default 60% / 80%',
      thPresetLite: 'Tight 100K / 200K',
      thPresetBal: 'Balanced 150K / 300K',
      thPresetLong: 'Long 400K / 700K',
      thWarnLbl: 'Warning ({unit})',
      thCritLbl: 'Critical ({unit})',
      thSave: 'Save',
      thReset: 'Reset',
      thClose: 'Close',
      pricingBtn: 'Pricing',
      pricingBtnTitle: 'Customize model rates & currency',
      prTitle: 'Model Pricing & Currency',
      prSub: 'Estimate API cost & cache savings from USD per 1M token rates',
      prCurrency: 'Currency',
      prRate: 'FX (USD→CNY)',
      prCustomTag: 'Custom',
      prDefaultTag: 'Default',
      prColModel: 'Model',
      prColIn: 'Input ($/1M)',
      prColCache: 'Cache ($/1M)',
      prColOut: 'Output ($/1M)',
      prSave: 'Save Pricing',
      prReset: 'Reset Pricing',
      prClose: 'Close',
      prNote: 'Note: Costs are estimates based on API token rates to track efficiency and cache savings.',
      sessCostCard: 'Session Est. Cost',
      sessCostMeta: 'New {in} · Cache {cache} · Out {out}',
      sessSavCard: 'Cache Savings',
      sessSavMeta: 'Saved {pct}% · Uncached {raw}',
      agentCostCard: 'Estimated Cost',
      agentSavCard: 'Total Cache Savings',
      colCost: 'Cost',
      colSaved: 'Saved',
      dailyCostSuffix: ' · Cost {cost} (Saved {saved})',
      effTitle: 'Thinking / Answer & Autonomy',
      effSub: 'Output mix & prompt leverage',
      effThinkLbl: 'Thinking',
      effAnsLbl: 'Answer',
      effToolArgsLbl: 'Tool Args',
      effRatioLbl: 'Think / Answer',
      effThinkShare: 'Thinking {pct}%',
      effLeverageLbl: 'Autonomy Leverage',
      effLeverageSub: '1 prompt → {turns} turns · {tools} tools',
      effPeakTaskLbl: 'Peak Autonomous Run',
      effPeakTaskVal: '{turns} turns · {tools} tools',
      effPromptsMeta: '{prompts} prompts · {turns} turns · {tools} tools',
      timingTitle: 'Latency & Focus Time',
      timingSub: 'Active focus split by 5m idle gaps',
      agTimingTitle: 'Latency & Daily Focus Time',
      focusTotalLbl: 'Total Focus',
      focusSessLbl: 'Session Focus',
      focusSessionsMeta: '{n} focus sessions',
      focusTodayLbl: 'Today Focus',
      focusAvgDayLbl: 'Daily Avg',
      focusPeakLbl: 'Peak',
      turnPaceLbl: 'Avg Turn Pace',
      turnPaceMeta: 'P50 {p50} · Max {max}',
      taskDurLbl: 'Avg Task Time',
      taskDurMeta: 'Max {max} · {n} tasks',
      noFocusData: 'No focus duration in selected range',
      focusBarTip: '{date}: Focus {dur} ({sessions} sessions, {turns} turns)',
      dailyFocusSuffix: ' · Focus {dur}',
      metaFooter: 'v{ver} · Convs: {convs} · Projects: {projs}',
      updatedFooter: 'Updated {time}',
      rptHeader: '## Token Analytics Report',
      rptSess: '### Current Session: {title} (Project: {proj})',
      rptModel: '- Model: {model}',
      rptCtx: '- Context Used: {used} / {limit} ({pct}%) · Status: {status}',
      rptSessTok: '- Session Tokens: {total} (New {in} + Cache {cache} + Out {out})',
      rptSessCost: '- Session Est. Cost: {cost} (Cache Savings {saved}, {pct}%)',
      rptCache: '- Cache Hit Rate: {hit} (Last turn {last})',
      rptEff: '- Think/Answer: {ratio} (Thinking {pct}%) · Leverage: 1 prompt → {turns} turns / {tools} tools',
      rptTiming: '- Focus Time: {focus} · Avg Turn Pace: {pace} · Avg Task Time: {task}',
      rptAgent: '### Agent Overview ({range} / {proj})',
      rptCov: '- Scope: {convs} conversations ({turns} turns)',
      rptAgTok: '- Total Tokens: {total} (New {in} / Cache {cache} / Out {out})',
      rptAgCost: '- Est. Cost: {cost} (Cache Savings {saved}, {pct}%)',
      rptAgCache: '- Cache Hit Rate: {hit}',
      rptProjTop: '### Top 5 Projects',
      fontTitle: 'Switch UI font (default: Follow Agent)',
      fontAuto: 'Follow Agent',
      fontGoogleSans: 'Google Sans',
      fontNotoSans: 'Noto Sans SC',
      fontYahei: 'PingFang / YaHei',
      fontMono: 'JetBrains Mono',
      fontSystem: 'System UI',
      settingsBtn: 'Settings',
      settingsBtnTitle: 'Appearance, limits & pricing',
      setTabGeneral: 'General & UI',
      setTabLimits: 'Context Limits',
      setTabPricing: 'Model Pricing',
      genLangLbl: 'Language',
      genFontLbl: 'Interface Font',
      genSyncLbl: 'Auto-Sync (every 10s)',
      statusClickTip: 'Click to pause or resume auto-sync',
      dailyModeTokens: 'Tokens',
      dailyModeFocus: 'Focus Time',
      dailyModeCost: 'Cost',
      dailyCostTitle: 'Daily Cost & Cache Savings',
      dailyCostTip: '{date}\\nEst. Cost: {cost}\\nCache Saved: {saved}\\nTurns: {turns}',
      turnPaceChartTitle: 'Recent Turn Pace (Last {n} turns)',
      turnPaceTip: 'Turn #{turn}: {dur}',
      noTurnPaceData: 'No multi-turn interval data yet',
      focusDaysMeta: '{days} active focus days · {sessions} sessions',
      agSubTrends: 'Trends & Rhythm',
      agSubBreakdown: 'Projects & Models',
      agSubConvs: 'Conversations',
      agSummaryTokMeta: 'Hit {hit} · New {in} / Cache {cache} / Out {out}',
      agSummaryFocusLbl: 'Focus & Leverage',
      agSummaryFocusMeta: 'Today {today} · 1→{turns} turns · {convs} convs',
      agHitPill: '{hit} hit',
      agTurnsPill: '{convs} convs',
      agLevPill: '1→{turns} turns',
      agTokFoot: 'New {in} · Cache {cache} · Out {out}',
      agSavFoot: 'Paid {paid} · Raw {raw}',
      agFocusFoot: 'Today {today} · Avg {avg}/d',
      convSearchPlaceholder: 'Filter by title, project, model...',
      convShownCount: 'Showing {shown} / {total} convs'
    }
  };

  var urlQuery = new URLSearchParams(window.location.search);
  var urlLang = urlQuery.get('lang');
  var hasUrlLang = urlLang === 'en' || urlLang === 'zh';
  var urlTheme = urlQuery.get('theme');
  var hasUrlTheme = urlTheme === 'light' || urlTheme === 'dark';
  var urlTab = urlQuery.get('tab');
  var hasUrlTab = urlTab === 'context' || urlTab === 'session' || urlTab === 'agent';
  var urlSubTab = urlQuery.get('subtab');
  var hasUrlSubTab = urlSubTab === 'trends' || urlSubTab === 'breakdown' || urlSubTab === 'conversations';

  var state = {
    lang: hasUrlLang ? urlLang : 'zh',
    langInitialized: hasUrlLang,
    font: 'auto',
    fontInitialized: false,
    activeTab: hasUrlTab ? urlTab : 'context',
    agentSubTab: hasUrlSubTab ? urlSubTab : 'trends',
    convSearch: '',
    convSortBy: 'totalTokens',
    convSortDir: 'desc',
    range: 'all',
    projectId: 'all',
    selectedConvId: '__follow__',
    settingsOpen: false,
    settingsTab: 'general',
    dailyMetric: 'tokens',
    draftMode: '',
    draftCurrency: '',
    paused: false,
    lastEtag: '',
    snapshot: null,
    pollTimer: null,
    inFlight: false
  };

  var sidecarApi = (typeof window.sidecar === 'object' && window.sidecar !== null) ? window.sidecar : null;

  function t(key, vars) {
    var dict = I18N[state.lang] || I18N.zh;
    var str = dict[key] !== undefined ? dict[key] : (I18N.zh[key] !== undefined ? I18N.zh[key] : key);
    if (vars && typeof vars === 'object') {
      for (var k in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, k)) {
          str = str.split('{' + k + '}').join(String(vars[k]));
        }
      }
    }
    return str;
  }

  function formatProjectName(projId, projName) {
    if (projId === 'outside-of-project') {
      return t('standaloneProj');
    }
    return projName || '-';
  }

  function formatStepLabel(item) {
    if (!item) return '';
    if (item.type === 'USER_INPUT' || item.category === 'user') return t('stepUser');
    if (item.type === 'GENERIC' || item.category === 'toolOutputs') {
      return t('stepToolOut', { name: item.toolName || 'tool_output' });
    }
    if (item.type === 'ERROR_MESSAGE') return t('stepError');
    if (item.type === 'SYSTEM_MESSAGE' || item.category === 'system') return t('stepSystem');
    if (item.type === 'PLANNER_RESPONSE' || item.category === 'assistant') {
      var names = Array.isArray(item.toolNames) ? item.toolNames : [];
      if (names.length > 0) {
        return t('stepAssistant') + ' (' + names.slice(0, 2).join(', ') + (names.length > 2 ? '…' : '') + ')';
      }
      return t('stepAssistant');
    }
    return item.label || '';
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtNum(n) {
    var v = Number(n) || 0;
    return v.toLocaleString('en-US');
  }

  function fmtCompact(n) {
    var v = Number(n) || 0;
    if (v >= 1000000) return (v / 1000000).toFixed(2) + 'M';
    if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
    return String(Math.round(v));
  }

  function fmtPct(ratioOrPct, isRatio) {
    var pct = isRatio ? (Number(ratioOrPct) || 0) * 100 : (Number(ratioOrPct) || 0);
    return pct.toFixed(1) + '%';
  }

  function fmtTime(iso) {
    if (!iso) return '-';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleTimeString(state.lang === 'en' ? 'en-US' : 'zh-CN', { hour12: false });
  }

  function fmtDuration(ms, zeroAsZero) {
    var v = Number(ms) || 0;
    if (v <= 0) return zeroAsZero ? '0s' : '-';
    if (v < 1000) return '<1s';
    var totalSec = Math.round(v / 1000);
    if (totalSec < 60) {
      return (v < 10000 ? (v / 1000).toFixed(1) : String(totalSec)) + 's';
    }
    var totalMin = Math.floor(totalSec / 60);
    var sec = totalSec % 60;
    if (totalMin < 60) {
      return sec > 0 ? (totalMin + 'm ' + sec + 's') : (totalMin + 'm');
    }
    var hrs = Math.floor(totalMin / 60);
    var mins = totalMin % 60;
    return mins > 0 ? (hrs + 'h ' + mins + 'm') : (hrs + 'h');
  }

  function fmtRatio(val) {
    if (val === null || val === undefined || !isFinite(val)) return '-';
    return Number(val).toFixed(2) + 'x';
  }

  function getPricingCfg() {
    return (state.snapshot && state.snapshot.settings && state.snapshot.settings.pricing) || {
      currency: 'USD',
      usdToCny: 7.2,
      overrides: {}
    };
  }

  function fmtMoney(usdAmount, pricingOverride) {
    var cfg = pricingOverride || getPricingCfg();
    var isCny = cfg && cfg.currency === 'CNY';
    var fx = isCny ? (Number(cfg.usdToCny) || 7.2) : 1;
    var val = Math.max(0, (Number(usdAmount) || 0) * fx);
    var sym = isCny ? '¥' : '$';
    if (val === 0) return sym + '0.00';
    if (val < 0.01) return sym + val.toFixed(4);
    if (val < 100) return sym + val.toFixed(2);
    return sym + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  var ICONS = {
    lang: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M2.5 8h11M8 2a9.5 9.5 0 0 1 0 12M8 2a9.5 9.5 0 0 0 0 12"/></svg>',
    pricing: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 4.5v7M10 6.2c0-.7-.9-1.2-2-1.2s-2 .5-2 1.3.8 1.2 2 1.4 2 .7 2 1.5-.9 1.3-2 1.3-2-.5-2-1.2"/></svg>',
    threshold: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4.5h10M3 8h10M3 11.5h10"/><circle cx="6" cy="4.5" r="1.4" fill="var(--tcl-surface)"/><circle cx="10.5" cy="8" r="1.4" fill="var(--tcl-surface)"/><circle cx="5.5" cy="11.5" r="1.4" fill="var(--tcl-surface)"/></svg>',
    pause: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9"/></svg>',
    play: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M5 3.5l7.5 4.5L5 12.5V3.5z"/></svg>',
    refresh: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 8a5.5 5.5 0 1 1-1.4-3.7"/><path d="M13.5 2.5v2.8h-2.8"/></svg>',
    copy: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 5.5V3.8A1.3 1.3 0 0 0 9.2 2.5H3.8A1.3 1.3 0 0 0 2.5 3.8v5.4a1.3 1.3 0 0 0 1.3 1.3h1.7"/></svg>',
    check: '<svg viewBox="0 0 16 16" fill="none" stroke="var(--tcl-ok)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.2 8.5l3.2 3.2 6.4-7"/></svg>',
    context: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 10.5a5.5 5.5 0 1 1 11 0"/><path d="M8 8.5l2.5-2.5"/><circle cx="8" cy="10" r="1.2"/></svg>',
    session: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 11.5l3-3.5 2.5 2 3.5-4.5 2 1.5"/><rect x="2" y="2.5" width="12" height="11" rx="2"/></svg>',
    agent: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13V8.5M6.3 13V5.5M9.7 13V7M13 13V3.5"/></svg>',
    settings: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="2.2"/><path d="M8 2.2v1.3M8 12.5v1.3M3.9 3.9l.9.9M11.2 11.2l.9.9M2.2 8h1.3M12.5 8h1.3M3.9 12.1l.9-.9M11.2 4.8l.9-.9"/></svg>',
    kpiTotal: '<svg class="kpi-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2l5.5 3-5.5 3-5.5-3L8 2z"/><path d="M2.5 8L8 11l5.5-3M2.5 11L8 14l5.5-3"/></svg>',
    kpiIn: '<svg class="kpi-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 6.5v6h-6"/></svg>',
    kpiOut: '<svg class="kpi-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 12.5l9-9M6.5 3.5h6v6"/></svg>',
    kpiCache: '<svg class="kpi-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 1.8L3.5 9H8l-1 5.2L12.5 7H8l1-5.2z"/></svg>',
    kpiCost: '<svg class="kpi-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 4.4v7.2M10 6c0-.8-.9-1.3-2-1.3s-2 .5-2 1.3c0 .9.9 1.2 2 1.5s2 .6 2 1.5c0 .8-.9 1.3-2 1.3s-2-.5-2-1.3"/></svg>',
    kpiSavings: '<svg class="kpi-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 1.8l5 2.1v4c0 3.2-2.1 5.6-5 6.3-2.9-.7-5-3.1-5-6.3v-4l5-2.1z"/><path d="M5.7 8.1l1.6 1.6 3.1-3.2"/></svg>',
    kpiFocus: '<svg class="kpi-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 4.6V8l2.4 1.6"/></svg>',
    subTrends: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 11.5l3.5-4 3 2.5L13.5 4"/><path d="M10.5 4h3v3"/></svg>',
    subBreakdown: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.2" y="2.2" width="4.8" height="4.8" rx="1"/><rect x="9" y="2.2" width="4.8" height="4.8" rx="1"/><rect x="2.2" y="9" width="4.8" height="4.8" rx="1"/><rect x="9" y="9" width="4.8" height="4.8" rx="1"/></svg>',
    subConvs: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 4h8M5.5 8h8M5.5 12h8"/><circle cx="2.8" cy="4" r="0.9" fill="currentColor" stroke="none"/><circle cx="2.8" cy="8" r="0.9" fill="currentColor" stroke="none"/><circle cx="2.8" cy="12" r="0.9" fill="currentColor" stroke="none"/></svg>'
  };

  function setElIconLabel(el, iconKey, label) {
    if (!el) return;
    el.innerHTML = (ICONS[iconKey] || '') + '<span class="lbl">' + escapeHtml(label) + '</span>';
  }

  function buildFontSelectHtml() {
    var fontOpts = [
      ['auto', t('fontAuto')],
      ['google-sans', t('fontGoogleSans')],
      ['noto-sans', t('fontNotoSans')],
      ['yahei', t('fontYahei')],
      ['mono', t('fontMono')],
      ['system', t('fontSystem')]
    ];
    var fHtml = '';
    for (var fi = 0; fi < fontOpts.length; fi++) {
      fHtml += '<option value="' + fontOpts[fi][0] + '"' + ((state.font || 'auto') === fontOpts[fi][0] ? ' selected' : '') + '>' + escapeHtml(fontOpts[fi][1]) + '</option>';
    }
    return fHtml;
  }

  function syncStaticLabels() {
    document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-CN';
    var convSel = document.getElementById('convSelect');
    if (convSel) convSel.title = t('selectConvTitle');
    var statusBadge = document.getElementById('statusBadge');
    if (statusBadge) statusBadge.title = t('statusClickTip');
    var fontSel = document.getElementById('fontSelect');
    if (fontSel) {
      fontSel.innerHTML = buildFontSelectHtml();
      fontSel.value = state.font || 'auto';
      fontSel.title = t('fontTitle');
    }
    var langBtn = document.getElementById('langBtn');
    if (langBtn) {
      setElIconLabel(langBtn, 'lang', t('langBtnLabel'));
      langBtn.title = t('langBtnTitle');
    }
    var setBtn = document.getElementById('settingsBtn');
    if (setBtn) {
      setElIconLabel(setBtn, 'settings', t('settingsBtn'));
      setBtn.title = t('settingsBtnTitle');
    }
    var pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
      setElIconLabel(pauseBtn, state.paused ? 'play' : 'pause', state.paused ? t('resumeBtn') : t('pauseBtn'));
      pauseBtn.title = t('pauseBtnTitle');
    }
    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      setElIconLabel(refreshBtn, 'refresh', t('refreshBtn'));
      refreshBtn.title = t('refreshBtnTitle');
    }
    var copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
      setElIconLabel(copyBtn, 'copy', t('copyBtn'));
      copyBtn.title = t('copyBtnTitle');
    }
    var initLoad = document.getElementById('initialLoading');
    if (initLoad) initLoad.textContent = t('loading');

    var tabMap = { context: 'tabContext', session: 'tabSession', agent: 'tabAgent' };
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      var tabId = btn.getAttribute('data-tab');
      if (tabId && tabMap[tabId]) {
        setElIconLabel(btn, tabId, t(tabMap[tabId]));
      }
      var isAct = tabId === state.activeTab;
      btn.classList.toggle('active', isAct);
      btn.setAttribute('aria-selected', isAct ? 'true' : 'false');
    });
  }

  // Theme Sync
  var colorProbeCtx = null;
  function resolveCssColorRgb(raw) {
    if (!raw || typeof raw !== 'string') return null;
    var s = raw.trim().toLowerCase();
    if (!s || s === 'transparent') return null;

    var hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
    if (hex) {
      var h = hex[1];
      if (h.length === 3 || h.length === 4) {
        return [parseInt(h[0]+h[0],16), parseInt(h[1]+h[1],16), parseInt(h[2]+h[2],16)];
      }
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    }

    var rgb = s.match(/^rgba?\\(\\s*(\\d+(?:\\.\\d+)?)\\s*[,\\s]\\s*(\\d+(?:\\.\\d+)?)\\s*[,\\s]\\s*(\\d+(?:\\.\\d+)?)/);
    if (rgb) {
      return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
    }

    var srgb = s.match(/^color\\(\\s*srgb\\s+(\\d*\\.?\\d+)\\s+(\\d*\\.?\\d+)\\s+(\\d*\\.?\\d+)/);
    if (srgb) {
      return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255];
    }

    try {
      if (!colorProbeCtx) {
        var c = document.createElement('canvas');
        c.width = 1;
        c.height = 1;
        colorProbeCtx = c.getContext('2d', { willReadFrequently: true });
      }
      if (colorProbeCtx) {
        colorProbeCtx.clearRect(0, 0, 1, 1);
        colorProbeCtx.fillStyle = 'rgba(0,0,0,0)';
        colorProbeCtx.fillStyle = raw;
        colorProbeCtx.fillRect(0, 0, 1, 1);
        var px = colorProbeCtx.getImageData(0, 0, 1, 1).data;
        if (px && px[3] > 0) {
          return [px[0], px[1], px[2]];
        }
      }
    } catch (_) {
      // Ignore canvas unavailability
    }
    return null;
  }

  function luminanceOfRgb(rgb) {
    if (!rgb) return null;
    return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  }

  var FONT_STACKS = {
    'google-sans': '"Google Sans", "Google Sans Text", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'noto-sans': '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    'yahei': '"PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif',
    'mono': '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    'system': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };

  function resolveActiveFontStack() {
    if (state.font && state.font !== 'auto' && FONT_STACKS[state.font]) {
      return FONT_STACKS[state.font];
    }
    var docStyle = document.documentElement.style;
    var compStyle = getComputedStyle(document.documentElement);
    var hostFont = (
      docStyle.getPropertyValue('--font-sans') ||
      docStyle.getPropertyValue('--font-family') ||
      docStyle.getPropertyValue('--font-body') ||
      compStyle.getPropertyValue('--font-sans') ||
      ''
    ).trim();
    if (hostFont && !hostFont.includes('--tcl-')) {
      return hostFont + ', "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
    }
    return FONT_STACKS['google-sans'];
  }

  function applyFont() {
    var stack = resolveActiveFontStack();
    var curProp = document.documentElement.style.getPropertyValue('--tcl-active-font').trim();
    if (curProp !== stack) {
      document.documentElement.style.setProperty('--tcl-active-font', stack);
    }
    if (document.body) {
      var curBodyFont = document.body.style.getPropertyValue('font-family').trim();
      if (curBodyFont !== stack) {
        document.body.style.setProperty('font-family', stack, 'important');
      }
    }
  }

  function syncTheme() {
    var rootStyle = getComputedStyle(document.documentElement);
    var bgRaw = (document.documentElement.style.getPropertyValue('--background') || rootStyle.getPropertyValue('--background') || '').trim();
    var fgRaw = (document.documentElement.style.getPropertyValue('--foreground') || rootStyle.getPropertyValue('--foreground') || '').trim();
    var lum = luminanceOfRgb(resolveCssColorRgb(bgRaw));

    if (lum === null && document.body) {
      var fgLum = luminanceOfRgb(resolveCssColorRgb(fgRaw));
      if (fgLum !== null) {
        lum = fgLum > 0.5 ? 0.1 : 0.9;
      }
    }

    var theme = 'dark';
    if (hasUrlTheme) {
      theme = urlTheme;
    } else if (lum !== null) {
      theme = lum > 0.5 ? 'light' : 'dark';
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      theme = 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
      document.body.style.background = 'var(--tcl-bg)';
      document.body.style.color = 'var(--tcl-text)';
    }
    applyFont();
  }

  window.addEventListener('message', function(ev) {
    if (ev && ev.data && ev.data.type === 'theme-change') {
      var vars = ev.data.payload && ev.data.payload.cssVariables;
      if (vars && typeof vars === 'object') {
        for (var k in vars) {
          if (Object.prototype.hasOwnProperty.call(vars, k)) {
            document.documentElement.style.setProperty(k, vars[k]);
          }
        }
      }
      syncTheme();
    }
  });
  if (typeof MutationObserver === 'function') {
    var themeObserver = new MutationObserver(function() {
      syncTheme();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncTheme);
  }
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    if (mq && mq.addEventListener) mq.addEventListener('change', syncTheme);
  }
  syncTheme();
  syncStaticLabels();

  function bridgeFetch(url, opts) {
    var fetchOpts = opts || { method: 'GET' };
    if (fetchOpts.body && !fetchOpts.headers) {
      fetchOpts.headers = { 'Content-Type': 'application/json' };
    }
    if (sidecarApi && typeof sidecarApi.fetch === 'function') {
      return sidecarApi.fetch(url, fetchOpts);
    }
    return window.fetch(url, fetchOpts);
  }

  function getTargetConversationId() {
    if (state.selectedConvId && state.selectedConvId !== '__follow__') {
      return state.selectedConvId;
    }
    if (sidecarApi && typeof sidecarApi.conversationId === 'string' && sidecarApi.conversationId) {
      return sidecarApi.conversationId;
    }
    var urlConv = urlQuery.get('conversationId');
    return urlConv || '';
  }

  function buildTelemetryUrl(forceFull) {
    var qs = new URLSearchParams();
    var cid = getTargetConversationId();
    if (cid) qs.set('conversationId', cid);
    qs.set('range', state.range);
    if (state.projectId && state.projectId !== 'all') qs.set('project', state.projectId);
    if (!forceFull && state.lastEtag) qs.set('etag', state.lastEtag);
    return '/api/telemetry?' + qs.toString();
  }

  function syncConvDropdown(snap) {
    var select = document.getElementById('convSelect');
    if (!select || !snap) return;
    var opts = Array.isArray(snap.conversationOptions) ? snap.conversationOptions : [];
    var prev = state.selectedConvId;
    var followLabel = t('followActive');
    if (sidecarApi && sidecarApi.conversationId) {
      var matched = opts.find(function(o) { return o.id === sidecarApi.conversationId; });
      if (matched) followLabel = t('followNamed', { title: matched.title });
    } else if (snap.current && prev === '__follow__') {
      followLabel = t('autoTrackNamed', { title: snap.current.title });
    }
    var html = '<option value="__follow__">' + escapeHtml(followLabel) + '</option>';
    for (var i = 0; i < opts.length; i++) {
      var o = opts[i];
      var prefix = o.runState === 'RUN_STATE_RUNNING' ? '● ' : (o.isSubagent ? '↳ ' : '');
      var label = prefix + o.title + ' (' + fmtCompact(o.contextUsed) + ')';
      html += '<option value="' + escapeHtml(o.id) + '">' + escapeHtml(label) + '</option>';
    }
    select.innerHTML = html;
    select.value = prev;
    if (select.value !== prev) {
      state.selectedConvId = '__follow__';
      select.value = '__follow__';
    }
  }

  function renderGrowthSvg(series, thresholds) {
    if (!series || series.length === 0) {
      return '<div class="empty-state">' + escapeHtml(t('noTurnData')) + '</div>';
    }
    var W = 560, H = 165, padL = 44, padR = 12, padT = 14, padB = 26;
    var innerW = W - padL - padR;
    var innerH = H - padT - padB;
    var maxPrompt = 1;
    for (var i = 0; i < series.length; i++) {
      if (series[i].promptTokens > maxPrompt) maxPrompt = series[i].promptTokens;
    }
    var scaleCeiling = maxPrompt;
    if (thresholds && thresholds.warnTokens > 0 && maxPrompt >= thresholds.warnTokens * 0.45) {
      scaleCeiling = Math.max(scaleCeiling, thresholds.warnTokens);
    }
    if (thresholds && thresholds.criticalTokens > 0 && maxPrompt >= thresholds.criticalTokens * 0.75) {
      scaleCeiling = Math.max(scaleCeiling, thresholds.criticalTokens);
    }
    var yMax = Math.ceil(scaleCeiling * 1.12);
    var n = series.length;
    var xOf = function(idx) {
      if (n === 1) return padL + innerW / 2;
      return padL + (idx / (n - 1)) * innerW;
    };
    var yOf = function(val) {
      return padT + innerH - (val / yMax) * innerH;
    };

    var totalPts = [];
    var cachePts = [];
    for (var j = 0; j < n; j++) {
      var x = xOf(j).toFixed(1);
      totalPts.push(x + ',' + yOf(series[j].promptTokens).toFixed(1));
      cachePts.push(x + ',' + yOf(series[j].cacheReadTokens).toFixed(1));
    }

    var baseRight = xOf(n - 1).toFixed(1) + ',' + (padT + innerH);
    var baseLeft = xOf(0).toFixed(1) + ',' + (padT + innerH);
    var totalArea = 'M' + baseLeft + ' L' + totalPts.join(' L') + ' L' + baseRight + ' Z';
    var cacheArea = 'M' + baseLeft + ' L' + cachePts.join(' L') + ' L' + baseRight + ' Z';

    var gridHtml = '';
    for (var g = 0; g <= 2; g++) {
      var val = (yMax * g) / 2;
      var y = yOf(val).toFixed(1);
      gridHtml += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="var(--tcl-border)" stroke-dasharray="3 3"/>';
      gridHtml += '<text x="' + (padL - 6) + '" y="' + (Number(y) + 4) + '" text-anchor="end" font-size="10" fill="var(--tcl-muted)">' + fmtCompact(val) + '</text>';
    }

    var threshHtml = '';
    if (thresholds && thresholds.warnTokens > 0 && thresholds.warnTokens <= yMax) {
      var wy = yOf(thresholds.warnTokens).toFixed(1);
      var warnTxt = escapeHtml(t('chartWarn')) + ' ' + fmtCompact(thresholds.warnTokens);
      var wBoxW = Math.max(58, warnTxt.length * 6.2 + 12);
      threshHtml += '<line x1="' + padL + '" y1="' + wy + '" x2="' + (W - padR) + '" y2="' + wy + '" stroke="var(--tcl-warn)" stroke-width="1.2" stroke-dasharray="5 3"/>';
      threshHtml += '<rect x="' + (W - padR - wBoxW) + '" y="' + (Number(wy) - 16) + '" width="' + wBoxW + '" height="14" rx="4" fill="var(--tcl-surface)" fill-opacity="0.92" stroke="var(--tcl-warn)" stroke-opacity="0.45" stroke-width="0.8"/>';
      threshHtml += '<text x="' + (W - padR - 6) + '" y="' + (Number(wy) - 5.5) + '" text-anchor="end" font-size="9.5" font-weight="600" fill="var(--tcl-warn)">' + warnTxt + '</text>';
    }
    if (thresholds && thresholds.criticalTokens > 0 && thresholds.criticalTokens <= yMax) {
      var cyLine = yOf(thresholds.criticalTokens).toFixed(1);
      var critTxt = escapeHtml(t('chartCrit')) + ' ' + fmtCompact(thresholds.criticalTokens);
      var cBoxW = Math.max(58, critTxt.length * 6.2 + 12);
      threshHtml += '<line x1="' + padL + '" y1="' + cyLine + '" x2="' + (W - padR) + '" y2="' + cyLine + '" stroke="var(--tcl-danger)" stroke-width="1.2" stroke-dasharray="5 3"/>';
      threshHtml += '<rect x="' + (W - padR - cBoxW) + '" y="' + (Number(cyLine) - 16) + '" width="' + cBoxW + '" height="14" rx="4" fill="var(--tcl-surface)" fill-opacity="0.92" stroke="var(--tcl-danger)" stroke-opacity="0.45" stroke-width="0.8"/>';
      threshHtml += '<text x="' + (W - padR - 6) + '" y="' + (Number(cyLine) - 5.5) + '" text-anchor="end" font-size="9.5" font-weight="600" fill="var(--tcl-danger)">' + critTxt + '</text>';
    }

    var dotsHtml = '';
    for (var k = 0; k < n; k++) {
      var tr = series[k];
      var cx = xOf(k).toFixed(1);
      var cy = yOf(tr.promptTokens).toFixed(1);
      var color = tr.compacted ? 'var(--tcl-warn)' : 'var(--tcl-c-new)';
      var r = tr.compacted ? 4.5 : (n > 25 ? 2 : 3);
      var tip = t('turnTip', {
        turn: tr.turn,
        prompt: fmtNum(tr.promptTokens),
        input: fmtNum(tr.inputTokens),
        cache: fmtNum(tr.cacheReadTokens)
      }) + (tr.compacted ? t('turnTipCompact') : '');
      dotsHtml += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + color + '" data-tip="' + escapeHtml(tip) + '"/>';
    }

    var defsHtml = '<defs>' +
      '<linearGradient id="tclGradNew" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--tcl-c-new)" stop-opacity="0.34"/><stop offset="100%" stop-color="var(--tcl-c-new)" stop-opacity="0.02"/></linearGradient>' +
      '<linearGradient id="tclGradCache" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--tcl-c-cache)" stop-opacity="0.32"/><stop offset="100%" stop-color="var(--tcl-c-cache)" stop-opacity="0.03"/></linearGradient>' +
      '</defs>';

    return '<svg class="svg-chart" viewBox="0 0 ' + W + ' ' + H + '">' +
      defsHtml +
      gridHtml +
      '<path d="' + totalArea + '" fill="url(#tclGradNew)"/>' +
      '<path d="' + cacheArea + '" fill="url(#tclGradCache)"/>' +
      '<polyline fill="none" stroke="var(--tcl-c-new)" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" points="' + totalPts.join(' ') + '"/>' +
      '<polyline fill="none" stroke="var(--tcl-c-cache)" stroke-width="1.5" stroke-dasharray="4 2" points="' + cachePts.join(' ') + '"/>' +
      threshHtml +
      dotsHtml +
      '<text x="' + padL + '" y="' + (H - 6) + '" font-size="10" fill="var(--tcl-muted)">Turn 1</text>' +
      '<text x="' + (W - padR) + '" y="' + (H - 6) + '" text-anchor="end" font-size="10" fill="var(--tcl-muted)">Turn ' + n + '</text>' +
      '</svg>';
  }

  function renderDailyTrendSvg(daily) {
    if (!daily || daily.length === 0) {
      return '<div class="empty-state">' + escapeHtml(t('noDailyData')) + '</div>';
    }
    var W = 560, H = 170, padL = 46, padR = 10, padT = 14, padB = 26;
    var innerW = W - padL - padR;
    var innerH = H - padT - padB;
    var maxTot = 1;
    for (var i = 0; i < daily.length; i++) {
      if (daily[i].totalTokens > maxTot) maxTot = daily[i].totalTokens;
    }
    var yMax = Math.ceil(maxTot * 1.12);
    var count = daily.length;
    var slotW = innerW / count;
    var barW = Math.max(4, Math.min(28, slotW * 0.65));

    var gridHtml = '';
    for (var g = 0; g <= 2; g++) {
      var val = (yMax * g) / 2;
      var y = (padT + innerH - (val / yMax) * innerH).toFixed(1);
      gridHtml += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="var(--tcl-border)" stroke-dasharray="3 3"/>';
      gridHtml += '<text x="' + (padL - 6) + '" y="' + (Number(y) + 4) + '" text-anchor="end" font-size="10" fill="var(--tcl-muted)">' + fmtCompact(val) + '</text>';
    }

    var barsHtml = '';
    var labelStep = Math.max(1, Math.ceil(count / 6));
    for (var j = 0; j < count; j++) {
      var d = daily[j];
      var x = padL + j * slotW + (slotW - barW) / 2;
      var hCache = (d.cacheReadTokens / yMax) * innerH;
      var hNew = (d.inputTokens / yMax) * innerH;
      var hOut = (d.outputTokens / yMax) * innerH;
      var yOut = padT + innerH - hOut;
      var yNew = yOut - hNew;
      var yCache = yNew - hCache;
      var tip = t('dailyTip', {
        date: d.date,
        total: fmtNum(d.totalTokens),
        cache: fmtNum(d.cacheReadTokens),
        input: fmtNum(d.inputTokens),
        output: fmtNum(d.outputTokens),
        turns: d.turns
      }) + (d.totalCost !== undefined ? t('dailyCostSuffix', { cost: fmtMoney(d.totalCost), saved: fmtMoney(d.cacheSavings || 0) }) : '') +
      (d.activeDurationMs > 0 ? t('dailyFocusSuffix', { dur: fmtDuration(d.activeDurationMs, true) }) : '');

      barsHtml += '<g data-tip="' + escapeHtml(tip) + '">';
      if (hCache > 0.3) barsHtml += '<rect x="' + x.toFixed(1) + '" y="' + yCache.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + hCache.toFixed(1) + '" fill="var(--tcl-c-cache)" rx="1.5"/>';
      if (hNew > 0.3) barsHtml += '<rect x="' + x.toFixed(1) + '" y="' + yNew.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + hNew.toFixed(1) + '" fill="var(--tcl-c-new)"/>';
      if (hOut > 0.3) barsHtml += '<rect x="' + x.toFixed(1) + '" y="' + yOut.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + hOut.toFixed(1) + '" fill="var(--tcl-c-out)"/>';
      barsHtml += '</g>';

      if (j % labelStep === 0 || j === count - 1) {
        barsHtml += '<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="var(--tcl-muted)">' + escapeHtml(d.date.slice(5)) + '</text>';
      }
    }

    return '<svg class="svg-chart" viewBox="0 0 ' + W + ' ' + H + '">' + gridHtml + barsHtml + '</svg>';
  }

  function renderDailyFocusSvg(daily) {
    if (!daily || daily.length === 0) {
      return '<div class="empty-state">' + escapeHtml(t('noFocusData')) + '</div>';
    }
    var maxMs = 0;
    for (var i = 0; i < daily.length; i++) {
      if ((daily[i].activeDurationMs || 0) > maxMs) maxMs = daily[i].activeDurationMs;
    }
    if (maxMs <= 0) {
      return '<div class="empty-state">' + escapeHtml(t('noFocusData')) + '</div>';
    }
    var W = 560, H = 170, padL = 48, padR = 10, padT = 14, padB = 26;
    var innerW = W - padL - padR;
    var innerH = H - padT - padB;
    var yMax = Math.ceil(maxMs * 1.15);
    var count = daily.length;
    var slotW = innerW / count;
    var barW = Math.max(4, Math.min(28, slotW * 0.64));

    var gridHtml = '';
    for (var g = 0; g <= 2; g++) {
      var val = (yMax * g) / 2;
      var y = (padT + innerH - (val / yMax) * innerH).toFixed(1);
      gridHtml += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="var(--tcl-border)" stroke-dasharray="3 3"/>';
      gridHtml += '<text x="' + (padL - 6) + '" y="' + (Number(y) + 4) + '" text-anchor="end" font-size="10" fill="var(--tcl-muted)">' + escapeHtml(fmtDuration(val, true)) + '</text>';
    }

    var barsHtml = '';
    var labelStep = Math.max(1, Math.ceil(count / 6));
    for (var j = 0; j < count; j++) {
      var d = daily[j];
      var dur = d.activeDurationMs || 0;
      var x = padL + j * slotW + (slotW - barW) / 2;
      var h = dur > 0 ? Math.max(2, (dur / yMax) * innerH) : 0;
      var yBar = padT + innerH - h;
      var tip = t('focusBarTip', {
        date: d.date,
        dur: fmtDuration(dur, true),
        sessions: d.focusSessions || 0,
        turns: d.turns || 0
      });
      if (h > 0) {
        barsHtml += '<g data-tip="' + escapeHtml(tip) + '"><rect x="' + x.toFixed(1) + '" y="' + yBar.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2.5" fill="url(#tclGradFocus)"/></g>';
      }
      if (j % labelStep === 0 || j === count - 1) {
        barsHtml += '<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="var(--tcl-muted)">' + escapeHtml(d.date.slice(5)) + '</text>';
      }
    }

    var defsHtml = '<defs><linearGradient id="tclGradFocus" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--tcl-ok)"/><stop offset="100%" stop-color="var(--tcl-accent)" stop-opacity="0.78"/></linearGradient></defs>';
    return '<svg class="svg-chart" viewBox="0 0 ' + W + ' ' + H + '">' + defsHtml + gridHtml + barsHtml + '</svg>';
  }

  function renderDailyCostSvg(daily) {
    if (!daily || daily.length === 0) {
      return '<div class="empty-state">' + escapeHtml(t('noDailyData')) + '</div>';
    }
    var maxCost = 0;
    for (var i = 0; i < daily.length; i++) {
      var tot = Number(daily[i].totalCost || 0);
      if (tot > maxCost) maxCost = tot;
    }
    if (maxCost <= 0) {
      return '<div class="empty-state">' + escapeHtml(t('noDailyData')) + '</div>';
    }
    var W = 560, H = 170, padL = 50, padR = 10, padT = 14, padB = 26;
    var innerW = W - padL - padR;
    var innerH = H - padT - padB;
    var yMax = maxCost * 1.15;
    var count = daily.length;
    var slotW = innerW / count;
    var barW = Math.max(4, Math.min(28, slotW * 0.64));

    var gridHtml = '';
    for (var g = 0; g <= 2; g++) {
      var val = (yMax * g) / 2;
      var y = (padT + innerH - (val / yMax) * innerH).toFixed(1);
      gridHtml += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="var(--tcl-border)" stroke-dasharray="3 3"/>';
      gridHtml += '<text x="' + (padL - 6) + '" y="' + (Number(y) + 4) + '" text-anchor="end" font-size="9.5" fill="var(--tcl-muted)">' + escapeHtml(fmtMoney(val)) + '</text>';
    }

    var barsHtml = '';
    var labelStep = Math.max(1, Math.ceil(count / 6));
    for (var j = 0; j < count; j++) {
      var d = daily[j];
      var cost = Number(d.totalCost || 0);
      var sav = Number(d.cacheSavings || 0);
      var x = padL + j * slotW + (slotW - barW) / 2;
      var h = cost > 0 ? Math.max(2, (cost / yMax) * innerH) : 0;
      var yBar = padT + innerH - h;
      var tip = t('dailyCostTip', {
        date: d.date,
        cost: fmtMoney(cost),
        saved: fmtMoney(sav),
        turns: d.turns || 0
      });
      if (h > 0) {
        barsHtml += '<g data-tip="' + escapeHtml(tip) + '"><rect x="' + x.toFixed(1) + '" y="' + yBar.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2.5" fill="url(#tclGradCost)"/></g>';
      }
      if (j % labelStep === 0 || j === count - 1) {
        barsHtml += '<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="var(--tcl-muted)">' + escapeHtml(d.date.slice(5)) + '</text>';
      }
    }

    var defsHtml = '<defs><linearGradient id="tclGradCost" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--tcl-c-new)"/><stop offset="100%" stop-color="var(--tcl-c-cache)" stop-opacity="0.82"/></linearGradient></defs>';
    return '<svg class="svg-chart" viewBox="0 0 ' + W + ' ' + H + '">' + defsHtml + gridHtml + barsHtml + '</svg>';
  }

  function renderTurnPaceSparkSvg(series, avgMs) {
    var list = Array.isArray(series) ? series : [];
    if (list.length === 0) {
      return '<div class="card-sub" style="padding:10px 0">' + escapeHtml(t('noTurnPaceData')) + '</div>';
    }
    var W = 460, H = 86, padL = 36, padR = 8, padT = 8, padB = 18;
    var innerW = W - padL - padR;
    var innerH = H - padT - padB;
    var maxMs = 1000;
    for (var i = 0; i < list.length; i++) {
      if ((list[i].durationMs || 0) > maxMs) maxMs = list[i].durationMs;
    }
    var yMax = Math.ceil(maxMs * 1.15);
    var n = list.length;
    var slotW = innerW / n;
    var barW = Math.max(4, Math.min(18, slotW * 0.65));

    var avgYHtml = '';
    if (avgMs > 0 && avgMs <= yMax) {
      var ay = (padT + innerH - (avgMs / yMax) * innerH).toFixed(1);
      avgYHtml = '<line x1="' + padL + '" y1="' + ay + '" x2="' + (W - padR) + '" y2="' + ay + '" stroke="var(--tcl-accent)" stroke-opacity="0.55" stroke-dasharray="3 3"/>';
    }

    var barsHtml = '';
    for (var j = 0; j < n; j++) {
      var pt = list[j];
      var dur = Math.max(0, Number(pt.durationMs) || 0);
      var x = padL + j * slotW + (slotW - barW) / 2;
      var h = dur > 0 ? Math.max(2, (dur / yMax) * innerH) : 1;
      var y = padT + innerH - h;
      var isSlow = avgMs > 0 && dur > avgMs * 1.6;
      var fill = isSlow ? 'var(--tcl-warn)' : 'var(--tcl-accent)';
      var tip = t('turnPaceTip', { turn: pt.turn, dur: fmtDuration(dur, true) });
      barsHtml += '<g data-tip="' + escapeHtml(tip) + '"><rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2" fill="' + fill + '" fill-opacity="0.88"/></g>';
    }

    return '<div style="display:flex;flex-direction:column;gap:4px;">' +
      '<div class="card-sub">' + escapeHtml(t('turnPaceChartTitle', { n: n })) + '</div>' +
      '<svg class="svg-chart" viewBox="0 0 ' + W + ' ' + H + '">' +
        '<text x="' + (padL - 5) + '" y="' + (padT + 9) + '" text-anchor="end" font-size="9" fill="var(--tcl-muted)">' + escapeHtml(fmtDuration(yMax, true)) + '</text>' +
        '<line x1="' + padL + '" y1="' + (padT + innerH) + '" x2="' + (W - padR) + '" y2="' + (padT + innerH) + '" stroke="var(--tcl-border)"/>' +
        avgYHtml + barsHtml +
        '<text x="' + padL + '" y="' + (H - 4) + '" font-size="9" fill="var(--tcl-muted)">#' + list[0].turn + '</text>' +
        '<text x="' + (W - padR) + '" y="' + (H - 4) + '" text-anchor="end" font-size="9" fill="var(--tcl-muted)">#' + list[n - 1].turn + '</text>' +
      '</svg>' +
    '</div>';
  }

  function renderEfficiencyCard(eff, subOverride) {
    var e = eff || {
      thinkingSharePercent: 0,
      thinkingToAnswerRatio: null,
      outputBreakdown: [],
      effectivePromptCount: 0,
      modelTurnCount: 0,
      toolCallCount: 0,
      turnsPerPrompt: 0,
      toolsPerPrompt: 0,
      actionsPerPrompt: 0,
      maxTurnsInSingleTask: 0,
      maxToolsInSingleTask: 0
    };
    var colMap = { thinking: 'var(--tcl-c-sys)', answer: 'var(--tcl-c-asst)', toolArgs: 'var(--tcl-c-tool)' };
    var lblMap = { thinking: 'effThinkLbl', answer: 'effAnsLbl', toolArgs: 'effToolArgsLbl' };
    var segHtml = '';
    var legHtml = '';
    var list = Array.isArray(e.outputBreakdown) ? e.outputBreakdown : [];
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var col = colMap[item.key] || 'var(--tcl-accent)';
      var lbl = lblMap[item.key] ? t(lblMap[item.key]) : item.key;
      segHtml += '<div class="seg" style="width:' + item.percent.toFixed(2) + '%;background:' + col + '" title="' + escapeHtml(lbl) + ': ~' + fmtNum(item.estTokens) + '"></div>';
      legHtml += '<div class="legend-row">' +
        '<span class="legend-left"><span class="dot" style="background:' + col + '"></span><span>' + escapeHtml(lbl) + '</span></span>' +
        '<span class="num">~' + fmtCompact(item.estTokens) + ' <span class="card-sub">(' + item.percent.toFixed(1) + '%)</span></span>' +
      '</div>';
    }
    var subText = subOverride || t('effPromptsMeta', {
      prompts: fmtNum(e.effectivePromptCount),
      turns: fmtNum(e.modelTurnCount),
      tools: fmtNum(e.toolCallCount)
    });
    return '<section class="card">' +
      '<div class="card-head"><span class="card-title">' + escapeHtml(t('effTitle')) + '</span><span class="card-sub">' + escapeHtml(subText) + '</span></div>' +
      '<div class="stacked-bar">' + segHtml + '</div>' +
      '<div class="legend-list">' + legHtml + '</div>' +
      '<div class="mini-stat-grid">' +
        '<div class="mini-stat-box"><span class="mini-stat-lbl">' + escapeHtml(t('effRatioLbl')) + '</span><span class="mini-stat-val num">' + escapeHtml(fmtRatio(e.thinkingToAnswerRatio)) + '</span><span class="mini-stat-sub">' + escapeHtml(t('effThinkShare', { pct: (e.thinkingSharePercent || 0).toFixed(1) })) + '</span></div>' +
        '<div class="mini-stat-box"><span class="mini-stat-lbl">' + escapeHtml(t('effLeverageLbl')) + '</span><span class="mini-stat-val num">1 → ' + (e.actionsPerPrompt || 0).toFixed(1) + 'x</span><span class="mini-stat-sub">' + escapeHtml(t('effLeverageSub', { turns: (e.turnsPerPrompt || 0).toFixed(1), tools: (e.toolsPerPrompt || 0).toFixed(1) })) + '</span></div>' +
        '<div class="mini-stat-box"><span class="mini-stat-lbl">' + escapeHtml(t('effPeakTaskLbl')) + '</span><span class="mini-stat-val num">' + e.maxTurnsInSingleTask + ' / ' + e.maxToolsInSingleTask + '</span><span class="mini-stat-sub">' + escapeHtml(t('effPeakTaskVal', { turns: e.maxTurnsInSingleTask, tools: e.maxToolsInSingleTask })) + '</span></div>' +
      '</div>' +
    '</section>';
  }

  function renderSessionTimingCard(tm) {
    var d = tm || { activeDurationMs: 0, focusSessions: 0, avgTurnDurationMs: 0, p50TurnDurationMs: 0, maxTurnDurationMs: 0, taskCount: 0, avgTaskDurationMs: 0, maxTaskDurationMs: 0, turnPaceSeries: [] };
    return '<section class="card">' +
      '<div class="card-head"><span class="card-title">' + escapeHtml(t('timingTitle')) + '</span><span class="card-sub">' + escapeHtml(t('timingSub')) + '</span></div>' +
      '<div class="mini-stat-grid">' +
        '<div class="mini-stat-box"><span class="mini-stat-lbl">' + escapeHtml(t('focusSessLbl')) + '</span><span class="mini-stat-val num">' + escapeHtml(fmtDuration(d.activeDurationMs, true)) + '</span><span class="mini-stat-sub">' + escapeHtml(t('focusSessionsMeta', { n: d.focusSessions || 0 })) + '</span></div>' +
        '<div class="mini-stat-box"><span class="mini-stat-lbl">' + escapeHtml(t('turnPaceLbl')) + '</span><span class="mini-stat-val num">' + escapeHtml(fmtDuration(d.avgTurnDurationMs, false)) + '</span><span class="mini-stat-sub">' + escapeHtml(t('turnPaceMeta', { p50: fmtDuration(d.p50TurnDurationMs, false), max: fmtDuration(d.maxTurnDurationMs, false) })) + '</span></div>' +
        '<div class="mini-stat-box"><span class="mini-stat-lbl">' + escapeHtml(t('taskDurLbl')) + '</span><span class="mini-stat-val num">' + escapeHtml(fmtDuration(d.avgTaskDurationMs, false)) + '</span><span class="mini-stat-sub">' + escapeHtml(t('taskDurMeta', { max: fmtDuration(d.maxTaskDurationMs, false), n: d.taskCount || 0 })) + '</span></div>' +
      '</div>' +
      renderTurnPaceSparkSvg(d.turnPaceSeries, d.avgTurnDurationMs) +
    '</section>';
  }

  function renderAgentTimingCard(tm) {
    var d = tm || { totalActiveDurationMs: 0, focusSessions: 0, todayActiveDurationMs: 0, avgDailyActiveDurationMs: 0, activeFocusDays: 0, peakFocusDay: null, avgTurnDurationMs: 0, p50TurnDurationMs: 0, maxTurnDurationMs: 0, taskCount: 0, avgTaskDurationMs: 0, maxTaskDurationMs: 0 };
    var avgSub = d.peakFocusDay
      ? (t('focusPeakLbl') + ' ' + d.peakFocusDay.date.slice(5) + ' (' + fmtDuration(d.peakFocusDay.activeDurationMs, true) + ')')
      : t('focusSessionsMeta', { n: d.focusSessions || 0 });
    return '<section class="card">' +
      '<div class="card-head"><span class="card-title">' + escapeHtml(t('agTimingTitle')) + '</span><span class="card-sub">' + escapeHtml(t('focusDaysMeta', { days: d.activeFocusDays || 0, sessions: d.focusSessions || 0 })) + '</span></div>' +
      '<div class="mini-stat-grid">' +
        '<div class="mini-stat-box"><span class="mini-stat-lbl">' + escapeHtml(t('focusTotalLbl')) + '</span><span class="mini-stat-val num">' + escapeHtml(fmtDuration(d.totalActiveDurationMs, true)) + '</span><span class="mini-stat-sub">' + escapeHtml(t('focusTodayLbl')) + ': ' + escapeHtml(fmtDuration(d.todayActiveDurationMs, true)) + '</span></div>' +
        '<div class="mini-stat-box"><span class="mini-stat-lbl">' + escapeHtml(t('focusAvgDayLbl')) + '</span><span class="mini-stat-val num">' + escapeHtml(fmtDuration(d.avgDailyActiveDurationMs, true)) + '</span><span class="mini-stat-sub">' + escapeHtml(avgSub) + '</span></div>' +
        '<div class="mini-stat-box"><span class="mini-stat-lbl">' + escapeHtml(t('turnPaceLbl')) + '</span><span class="mini-stat-val num">' + escapeHtml(fmtDuration(d.avgTurnDurationMs, false)) + '</span><span class="mini-stat-sub">' + escapeHtml(t('turnPaceMeta', { p50: fmtDuration(d.p50TurnDurationMs, false), max: fmtDuration(d.maxTurnDurationMs, false) })) + '</span></div>' +
        '<div class="mini-stat-box"><span class="mini-stat-lbl">' + escapeHtml(t('taskDurLbl')) + '</span><span class="mini-stat-val num">' + escapeHtml(fmtDuration(d.avgTaskDurationMs, false)) + '</span><span class="mini-stat-sub">' + escapeHtml(t('taskDurMeta', { max: fmtDuration(d.maxTaskDurationMs, false), n: d.taskCount || 0 })) + '</span></div>' +
      '</div>' +
      '<div class="card-sub">' + escapeHtml(t('timingSub')) + '</div>' +
    '</section>';
  }

  function renderCalendarHeatmapSvg(hm) {
    if (!hm || !Array.isArray(hm.days) || hm.days.length === 0) {
      return '<div class="empty-state">' + escapeHtml(t('hmNoData')) + '</div>';
    }
    var weeks = hm.weeksCount || 16;
    var cell = 16;
    var gap = 4;
    var padL = 28;
    var padT = 18;
    var padR = 8;
    var padB = 6;
    var W = padL + weeks * (cell + gap) + padR;
    var H = padT + 7 * (cell + gap) + padB;

    var wDays = (I18N[state.lang] || I18N.zh).hmWeekdays;
    var mNames = (I18N[state.lang] || I18N.zh).hmMonths;
    var dayRows = [0, 2, 4, 6];
    var labelsHtml = '';
    for (var dn = 0; dn < dayRows.length; dn++) {
      var ly = padT + dayRows[dn] * (cell + gap) + cell * 0.78;
      labelsHtml += '<text x="' + (padL - 5) + '" y="' + ly.toFixed(1) + '" text-anchor="end" font-size="9" fill="var(--tcl-muted)">' + escapeHtml(wDays[dn]) + '</text>';
    }

    var monthSeen = {};
    var monthHtml = '';
    var cellsHtml = '';
    for (var i = 0; i < hm.days.length; i++) {
      var d = hm.days[i];
      var x = padL + d.weekIndex * (cell + gap);
      var y = padT + d.weekday * (cell + gap);
      var mKey = d.date.slice(0, 7);
      if (d.dayOfMonth <= 7 && !monthSeen[mKey]) {
        monthSeen[mKey] = true;
        var mLbl = mNames[(d.month - 1) % 12] || (d.month + '');
        monthHtml += '<text x="' + x + '" y="11" font-size="9.5" fill="var(--tcl-muted)">' + escapeHtml(mLbl) + '</text>';
      }
      var fill = 'var(--tcl-hm-' + (d.level || 0) + ')';
      var tip = t('dailyTip', {
        date: d.date,
        total: fmtNum(d.totalTokens),
        cache: fmtNum(d.cacheReadTokens),
        input: fmtNum(d.inputTokens),
        output: fmtNum(d.outputTokens),
        turns: d.turns
      }) + (d.totalCost !== undefined ? t('dailyCostSuffix', { cost: fmtMoney(d.totalCost), saved: fmtMoney(d.cacheSavings || 0) }) : '');
      cellsHtml += '<rect class="hm-cell" x="' + x + '" y="' + y + '" width="' + cell + '" height="' + cell + '" rx="3.5" fill="' + fill + '" data-tip="' + escapeHtml(tip) + '"/>';
    }

    var peakText = hm.maxDayTokens > 0
      ? t('hmPeak', { date: hm.maxDayDate, val: fmtCompact(hm.maxDayTokens) })
      : t('hmEmptyPeak');

    return '<svg class="svg-chart" viewBox="0 0 ' + W + ' ' + H + '">' +
        labelsHtml + monthHtml + cellsHtml +
      '</svg>' +
      '<div class="hm-legend">' +
        '<span>' + escapeHtml(peakText) + '</span>' +
        '<span class="hm-scale">' + escapeHtml(t('hmLess')) + ' ' +
          '<span class="hm-swatch" style="background:var(--tcl-hm-0)"></span>' +
          '<span class="hm-swatch" style="background:var(--tcl-hm-1)"></span>' +
          '<span class="hm-swatch" style="background:var(--tcl-hm-2)"></span>' +
          '<span class="hm-swatch" style="background:var(--tcl-hm-3)"></span>' +
          '<span class="hm-swatch" style="background:var(--tcl-hm-4)"></span>' +
        ' ' + escapeHtml(t('hmMore')) + '</span>' +
      '</div>';
  }

  function renderHourlyDistributionSvg(hourly) {
    var buckets = (hourly && Array.isArray(hourly.buckets)) ? hourly.buckets : [];
    if (buckets.length === 0) {
      return '<div class="empty-state">' + escapeHtml(t('hourlyNoData')) + '</div>';
    }
    var W = 560, H = 165, padL = 44, padR = 10, padT = 16, padB = 26;
    var innerW = W - padL - padR;
    var innerH = H - padT - padB;
    var maxTot = 1;
    var hasAny = false;
    for (var i = 0; i < buckets.length; i++) {
      if (buckets[i].totalTokens > 0) hasAny = true;
      if (buckets[i].totalTokens > maxTot) maxTot = buckets[i].totalTokens;
    }
    if (!hasAny) {
      return '<div class="empty-state">' + escapeHtml(t('hourlyRangeEmpty')) + '</div>';
    }

    var yMax = Math.ceil(maxTot * 1.15);
    var slotW = innerW / 24;
    var barW = Math.max(6, slotW * 0.68);
    var gridHtml = '';
    for (var g = 0; g <= 2; g++) {
      var val = (yMax * g) / 2;
      var gy = (padT + innerH - (val / yMax) * innerH).toFixed(1);
      gridHtml += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '" stroke="var(--tcl-border)" stroke-dasharray="3 3"/>';
      gridHtml += '<text x="' + (padL - 6) + '" y="' + (Number(gy) + 4) + '" text-anchor="end" font-size="10" fill="var(--tcl-muted)">' + fmtCompact(val) + '</text>';
    }

    var barsHtml = '';
    var tickHours = { 0: 1, 4: 1, 8: 1, 12: 1, 16: 1, 20: 1, 23: 1 };
    for (var h = 0; h < buckets.length; h++) {
      var b = buckets[h];
      var x = padL + h * slotW + (slotW - barW) / 2;
      var hCache = (b.cacheReadTokens / yMax) * innerH;
      var hNew = (b.inputTokens / yMax) * innerH;
      var hOut = (b.outputTokens / yMax) * innerH;
      var yOut = padT + innerH - hOut;
      var yNew = yOut - hNew;
      var yCache = yNew - hCache;
      var isPeak = hourly.peakHour === b.hour && b.totalTokens > 0;
      var tip = t('hourlyTip', {
        h: b.label,
        total: fmtNum(b.totalTokens),
        cache: fmtNum(b.cacheReadTokens),
        input: fmtNum(b.inputTokens),
        output: fmtNum(b.outputTokens),
        turns: b.turns
      });

      barsHtml += '<g data-tip="' + escapeHtml(tip) + '">';
      if (isPeak) {
        barsHtml += '<rect x="' + (x - 1.5).toFixed(1) + '" y="' + padT + '" width="' + (barW + 3).toFixed(1) + '" height="' + innerH + '" fill="var(--tcl-accent-soft)" rx="3"/>';
      }
      if (hCache > 0.3) barsHtml += '<rect x="' + x.toFixed(1) + '" y="' + yCache.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + hCache.toFixed(1) + '" fill="var(--tcl-c-cache)" rx="1.5"/>';
      if (hNew > 0.3) barsHtml += '<rect x="' + x.toFixed(1) + '" y="' + yNew.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + hNew.toFixed(1) + '" fill="var(--tcl-c-new)"/>';
      if (hOut > 0.3) barsHtml += '<rect x="' + x.toFixed(1) + '" y="' + yOut.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + hOut.toFixed(1) + '" fill="var(--tcl-c-out)"/>';
      barsHtml += '</g>';

      if (tickHours[b.hour]) {
        barsHtml += '<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="' + (isPeak ? 'var(--tcl-accent)' : 'var(--tcl-muted)') + '">' + b.label + '</text>';
      }
    }

    return '<svg class="svg-chart" viewBox="0 0 ' + W + ' ' + H + '">' + gridHtml + barsHtml + '</svg>';
  }

  function renderSettingsPanel(snap) {
    var panel = document.getElementById('settingsPanel');
    if (!panel) return;
    if (!state.settingsOpen) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }

    var activeDrawerTab = state.settingsTab || 'general';
    var drawerHeader = '<div class="drawer-head">' +
      '<div class="drawer-tabs">' +
        '<button class="drawer-tab' + (activeDrawerTab === 'general' ? ' active' : '') + '" data-settings-tab="general" type="button">' + escapeHtml(t('setTabGeneral')) + '</button>' +
        '<button id="thresholdBtn" class="drawer-tab' + (activeDrawerTab === 'thresholds' ? ' active' : '') + '" data-settings-tab="thresholds" type="button">' + escapeHtml(t('setTabLimits')) + '</button>' +
        '<button id="pricingBtn" class="drawer-tab' + (activeDrawerTab === 'pricing' ? ' active' : '') + '" data-settings-tab="pricing" type="button">' + escapeHtml(t('setTabPricing')) + '</button>' +
      '</div>' +
      '<button id="closeThresholdBtn" class="btn" type="button">' + escapeHtml(t('thClose')) + '</button>' +
    '</div>';

    var bodyHtml = '';
    if (activeDrawerTab === 'general') {
      bodyHtml = '<div class="settings-grid">' +
        '<div class="field-col">' +
          '<label class="field-label" for="langBtn">' + escapeHtml(t('genLangLbl')) + '</label>' +
          '<button id="langBtn" class="btn" type="button" title="' + escapeHtml(t('langBtnTitle')) + '">' + ICONS.lang + '<span class="lbl">' + escapeHtml(t('langBtnLabel')) + '</span></button>' +
        '</div>' +
        '<div class="field-col">' +
          '<label class="field-label" for="fontSelect">' + escapeHtml(t('genFontLbl')) + '</label>' +
          '<select id="fontSelect" class="font-select" style="max-width:100%" title="' + escapeHtml(t('fontTitle')) + '">' + buildFontSelectHtml() + '</select>' +
        '</div>' +
        '<div class="field-col">' +
          '<label class="field-label" for="pauseBtn">' + escapeHtml(t('genSyncLbl')) + '</label>' +
          '<button id="pauseBtn" class="btn' + (state.paused ? ' active' : '') + '" type="button" title="' + escapeHtml(t('pauseBtnTitle')) + '">' + (state.paused ? ICONS.play : ICONS.pause) + '<span class="lbl">' + escapeHtml(state.paused ? t('resumeBtn') : t('pauseBtn')) + '</span></button>' +
        '</div>' +
      '</div>';
    } else if (activeDrawerTab === 'pricing') {
      var pr = (snap && snap.settings && snap.settings.pricing) || { currency: 'USD', usdToCny: 7.2, overrides: {} };
      var curCurrency = state.draftCurrency || pr.currency || 'USD';
      var catalog = (snap && Array.isArray(snap.pricingCatalog)) ? snap.pricingCatalog : [];
      var rowsHtml = '';
      for (var i = 0; i < catalog.length; i++) {
        var item = catalog[i];
        var rt = item.rate || { input: 1.5, cacheRead: 0.15, output: 8.0, isCustom: false };
        rowsHtml += '<tr>' +
          '<td><span>' + escapeHtml(item.displayName) + '</span> ' +
            (rt.isCustom ? '<span class="badge accent">' + escapeHtml(t('prCustomTag')) + '</span>' : '<span class="badge">' + escapeHtml(t('prDefaultTag')) + '</span>') +
          '</td>' +
          '<td class="right"><input class="rate-input" type="number" min="0" max="1000" step="0.01" data-pr-model="' + escapeHtml(item.model) + '" data-pr-field="input" value="' + rt.input + '" /></td>' +
          '<td class="right"><input class="rate-input" type="number" min="0" max="1000" step="0.01" data-pr-model="' + escapeHtml(item.model) + '" data-pr-field="cacheRead" value="' + rt.cacheRead + '" /></td>' +
          '<td class="right"><input class="rate-input" type="number" min="0" max="1000" step="0.01" data-pr-model="' + escapeHtml(item.model) + '" data-pr-field="output" value="' + rt.output + '" /></td>' +
        '</tr>';
      }
      bodyHtml = '<div class="card-head">' +
          '<div><div class="card-title">' + escapeHtml(t('prTitle')) + '</div><div class="card-sub">' + escapeHtml(t('prSub')) + '</div></div>' +
          '<div class="pills">' +
            '<button class="pill' + (curCurrency === 'USD' ? ' active' : '') + '" data-pr-currency="USD" type="button">USD ($)</button>' +
            '<button class="pill' + (curCurrency === 'CNY' ? ' active' : '') + '" data-pr-currency="CNY" type="button">CNY (¥)</button>' +
          '</div>' +
        '</div>' +
        '<div class="preset-row">' +
          '<label class="field-label" for="usdToCnyInput">' + escapeHtml(t('prRate')) + '</label>' +
          '<input id="usdToCnyInput" class="rate-input" type="number" min="1" max="100" step="0.05" value="' + (pr.usdToCny || 7.2) + '" />' +
          '<button id="savePricingBtn" class="btn active" type="button">' + escapeHtml(t('prSave')) + '</button>' +
          '<button id="resetPricingBtn" class="btn" type="button">' + escapeHtml(t('prReset')) + '</button>' +
        '</div>' +
        '<div class="table-wrap"><table><thead><tr><th>' + escapeHtml(t('prColModel')) + '</th><th class="right">' + escapeHtml(t('prColIn')) + '</th><th class="right">' + escapeHtml(t('prColCache')) + '</th><th class="right">' + escapeHtml(t('prColOut')) + '</th></tr></thead><tbody>' + (rowsHtml || '<tr><td colspan="4" class="empty-state">' + escapeHtml(t('noData')) + '</td></tr>') + '</tbody></table></div>' +
        '<div class="card-sub">' + escapeHtml(t('prNote')) + '</div>';
    } else {
      var th = (snap && snap.settings && snap.settings.thresholds) || {
        mode: 'percent',
        warnPercent: 60,
        criticalPercent: 80,
        warnTokens: 150000,
        criticalTokens: 300000
      };
      var mode = state.draftMode || th.mode || 'percent';
      var isPct = mode === 'percent';
      var warnVal = isPct ? th.warnPercent : th.warnTokens;
      var critVal = isPct ? th.criticalPercent : th.criticalTokens;
      var unitStr = isPct ? '%' : 'Tokens';

      bodyHtml = '<div class="card-head">' +
          '<div><div class="card-title">' + escapeHtml(t('thTitle')) + '</div><div class="card-sub">' + escapeHtml(t('thSub')) + '</div></div>' +
          '<div class="pills">' +
            '<button class="pill' + (isPct ? ' active' : '') + '" data-th-mode="percent" type="button">' + escapeHtml(t('thModePct')) + '</button>' +
            '<button class="pill' + (!isPct ? ' active' : '') + '" data-th-mode="tokens" type="button">' + escapeHtml(t('thModeTok')) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="preset-row">' +
          '<span class="card-sub">' + escapeHtml(t('thPresets')) + '</span>' +
          '<button class="btn" type="button" data-th-preset="percent:60:80">' + escapeHtml(t('thPresetDefault')) + '</button>' +
          '<button class="btn" type="button" data-th-preset="tokens:100000:200000">' + escapeHtml(t('thPresetLite')) + '</button>' +
          '<button class="btn" type="button" data-th-preset="tokens:150000:300000">' + escapeHtml(t('thPresetBal')) + '</button>' +
          '<button class="btn" type="button" data-th-preset="tokens:400000:700000">' + escapeHtml(t('thPresetLong')) + '</button>' +
        '</div>' +
        '<div class="settings-grid">' +
          '<div class="field-col">' +
            '<label class="field-label" for="warnInput">' + escapeHtml(t('thWarnLbl', { unit: unitStr })) + '</label>' +
            '<input id="warnInput" class="input-num" type="number" min="' + (isPct ? 1 : 1000) + '" max="' + (isPct ? 98 : 10000000) + '" step="' + (isPct ? 1 : 5000) + '" value="' + warnVal + '" />' +
          '</div>' +
          '<div class="field-col">' +
            '<label class="field-label" for="critInput">' + escapeHtml(t('thCritLbl', { unit: unitStr })) + '</label>' +
            '<input id="critInput" class="input-num" type="number" min="' + (isPct ? 2 : 2000) + '" max="' + (isPct ? 100 : 10000000) + '" step="' + (isPct ? 1 : 5000) + '" value="' + critVal + '" />' +
          '</div>' +
          '<div class="preset-row">' +
            '<button id="saveThresholdBtn" class="btn active" type="button">' + escapeHtml(t('thSave')) + '</button>' +
            '<button id="resetThresholdBtn" class="btn" type="button">' + escapeHtml(t('thReset')) + '</button>' +
          '</div>' +
        '</div>';
    }

    panel.hidden = false;
    panel.innerHTML = '<section class="settings-drawer">' + drawerHeader + bodyHtml + '</section>';
  }

  function renderContextTab(snap) {
    var cur = snap.current;
    if (!cur) {
      return '<div class="card"><div class="empty-state">' + escapeHtml(t('noCurrentConv')) + '</div></div>';
    }
    var ctx = cur.context;
    var th = ctx.thresholds || { mode: 'percent', warnTokens: 0, criticalTokens: 0, warnPercent: 60, criticalPercent: 80, toWarnTokens: 0, toCriticalTokens: 0 };
    var pct = Math.min(100, Math.max(0, ctx.usagePercent));
    var r = 48;
    var circ = 2 * Math.PI * r;
    var dash = (pct / 100) * circ;
    var gaugeGradStart = ctx.status === 'critical' ? '#f87171' : (ctx.status === 'warn' ? '#fbbf24' : '#34d399');
    var gaugeGradEnd = ctx.status === 'critical' ? '#ef4444' : (ctx.status === 'warn' ? '#f59e0b' : '#38bdf8');
    var gaugeTextCol = ctx.status === 'critical' ? 'var(--tcl-danger)' : (ctx.status === 'warn' ? 'var(--tcl-warn)' : 'var(--tcl-text)');
    var statusLabel = ctx.status === 'critical' ? t('statusCritLong') : (ctx.status === 'warn' ? t('statusWarnLong') : t('healthOk'));
    var statusClass = ctx.status === 'critical' ? 'danger' : (ctx.status === 'warn' ? 'warn' : 'ok');

    var thText = th.mode === 'tokens'
      ? (fmtCompact(th.warnTokens) + ' / ' + fmtCompact(th.criticalTokens))
      : (th.warnPercent.toFixed(0) + '% (' + fmtCompact(th.warnTokens) + ') / ' + th.criticalPercent.toFixed(0) + '%');
    var distText = th.toWarnTokens >= 0
      ? t('distRemaining', { n: fmtNum(th.toWarnTokens) })
      : t('distExceeded', { n: fmtNum(Math.abs(th.toWarnTokens)) });

    var alertHtml = '';
    if (ctx.status === 'critical') {
      alertHtml = '<div class="alert-banner critical"><span>' + t('critBanner', { used: fmtNum(ctx.used), limit: fmtNum(th.criticalTokens) }) + '</span><span class="badge danger">' + escapeHtml(t('statusCritBadge')) + '</span></div>';
    } else if (ctx.status === 'warn') {
      alertHtml = '<div class="alert-banner warn"><span>' + t('warnBanner', { used: fmtNum(ctx.used), limit: fmtNum(th.warnTokens) }) + '</span><span class="badge warn">' + escapeHtml(t('statusWarnBadge')) + '</span></div>';
    }

    var colorMap = {
      system: 'var(--tcl-c-sys)',
      toolOutputs: 'var(--tcl-c-tool)',
      assistant: 'var(--tcl-c-asst)',
      user: 'var(--tcl-c-user)'
    };
    var labelKeyMap = {
      system: 'bkSystem',
      toolOutputs: 'bkToolOutputs',
      assistant: 'bkAssistant',
      user: 'bkUser'
    };

    var segHtml = '';
    var legHtml = '';
    for (var i = 0; i < ctx.breakdown.length; i++) {
      var b = ctx.breakdown[i];
      var col = colorMap[b.key] || 'var(--tcl-accent)';
      var bLbl = labelKeyMap[b.key] ? t(labelKeyMap[b.key]) : b.label;
      segHtml += '<div class="seg" style="width:' + b.percent.toFixed(2) + '%;background:' + col + '" title="' + escapeHtml(bLbl) + ': ' + fmtNum(b.tokens) + '"></div>';
      legHtml += '<div class="legend-row">' +
        '<span class="legend-left"><span class="dot" style="background:' + col + '"></span><span>' + escapeHtml(bLbl) + '</span></span>' +
        '<span class="num">' + fmtNum(b.tokens) + ' <span class="card-sub">(' + b.percent.toFixed(1) + '%)</span></span>' +
        '</div>';
    }

    var heavyHtml = '';
    if (ctx.heaviestItems.length === 0) {
      heavyHtml = '<div class="empty-state">' + escapeHtml(t('noStepData')) + '</div>';
    } else {
      var maxShare = 1;
      for (var hs = 0; hs < ctx.heaviestItems.length; hs++) {
        if (ctx.heaviestItems[hs].sharePercent > maxShare) maxShare = ctx.heaviestItems[hs].sharePercent;
      }
      for (var h = 0; h < ctx.heaviestItems.length; h++) {
        var item = ctx.heaviestItems[h];
        var itemCol = colorMap[item.category] || 'var(--tcl-accent)';
        var barPct = Math.min(100, Math.max(3, (item.sharePercent / maxShare) * 100));
        heavyHtml += '<div class="item-row">' +
          '<div class="item-top">' +
            '<span class="legend-left"><span class="dot" style="background:' + itemCol + '"></span>' +
            '<span class="item-label">#' + item.stepIndex + ' ' + escapeHtml(formatStepLabel(item)) + '</span>' +
            (item.truncated ? '<span class="badge warn">' + escapeHtml(t('truncatedTag')) + '</span>' : '') +
            '</span>' +
            '<span class="num">~' + fmtNum(item.estTokens) + ' <span class="card-sub">(' + item.sharePercent.toFixed(1) + '%)</span></span>' +
          '</div>' +
          (item.preview ? '<div class="item-preview">' + escapeHtml(item.preview) + '</div>' : '') +
          '<div class="item-bar-track"><div class="item-bar-fill" style="width:' + barPct.toFixed(1) + '%;background:' + itemCol + '"></div></div>' +
        '</div>';
      }
    }

    var projDisp = formatProjectName(cur.projectId, cur.projectName);
    var compStr = ctx.compactionCount > 0 ? t('compactedTimes', { n: ctx.compactionCount }) : t('notCompacted');
    var warnTick = (th.warnPercent > 0 && th.warnPercent < 100)
      ? '<span class="hud-tick" style="left:' + th.warnPercent.toFixed(1) + '%;background:var(--tcl-warn)" data-tip="' + escapeHtml(t('chartWarn')) + ' ' + th.warnPercent.toFixed(0) + '%"></span>'
      : '';
    var critTick = (th.criticalPercent > 0 && th.criticalPercent < 100)
      ? '<span class="hud-tick" style="left:' + th.criticalPercent.toFixed(1) + '%;background:var(--tcl-danger)" data-tip="' + escapeHtml(t('chartCrit')) + ' ' + th.criticalPercent.toFixed(0) + '%"></span>'
      : '';
    var heroFillCol = ctx.status === 'critical' ? 'var(--tcl-danger)' : (ctx.status === 'warn' ? 'var(--tcl-warn)' : 'var(--tcl-ok)');

    return alertHtml +
      '<div class="grid-2">' +
        '<section class="card">' +
          '<div class="card-head">' +
            '<div><div class="card-title">' + escapeHtml(cur.title) + '</div><div class="card-sub">' + escapeHtml(cur.activeModelDisplay) + (ctx.isDefaultLimit ? (' · ' + escapeHtml(t('defaultWindow'))) : '') + ' · ' + escapeHtml(t('projectPrefix')) + ': ' + escapeHtml(projDisp) + '</div></div>' +
            '<span class="badge ' + statusClass + '">' + escapeHtml(statusLabel) + '</span>' +
          '</div>' +
          '<div class="hero-row">' +
            '<div class="gauge-wrap">' +
              '<svg width="120" height="120" viewBox="0 0 120 120">' +
                '<defs><linearGradient id="tclGaugeGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="' + gaugeGradStart + '"/><stop offset="100%" stop-color="' + gaugeGradEnd + '"/></linearGradient></defs>' +
                '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="var(--tcl-surface-2)" stroke-width="10"/>' +
                '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="url(#tclGaugeGrad)" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + dash.toFixed(1) + ' ' + circ.toFixed(1) + '" transform="rotate(-90 60 60)"/>' +
              '</svg>' +
              '<div class="gauge-center"><span class="gauge-pct num" style="color:' + gaugeTextCol + '">' + pct.toFixed(1) + '%</span><span class="gauge-lbl">' + escapeHtml(t('ctxGaugeLbl')) + '</span></div>' +
            '</div>' +
            '<div class="hero-stats">' +
              '<div class="stat-line"><span class="card-sub">' + escapeHtml(t('ctxUsedLine')) + '</span><span class="num"><strong>' + fmtNum(ctx.used) + '</strong> / ' + fmtCompact(ctx.limit) + '</span></div>' +
              '<div class="stat-line"><span class="card-sub">' + escapeHtml(t('ctxThreshLine')) + '</span><span class="num">' + escapeHtml(thText) + '</span></div>' +
              '<div class="stat-line"><span class="card-sub">' + escapeHtml(t('ctxMarginLine')) + '</span><span class="num">' + escapeHtml(distText) + '</span></div>' +
              '<div class="stat-line"><span class="card-sub">' + escapeHtml(t('ctxNextLine')) + '</span><span class="num">' + fmtNum(ctx.projectedNext) + '</span></div>' +
              '<div class="stat-line"><span class="card-sub">' + escapeHtml(t('ctxCacheCompLine')) + '</span><span class="num">' + fmtPct(cur.tokens.latestCacheHitRate, true) + ' · ' + escapeHtml(compStr) + '</span></div>' +
            '</div>' +
          '</div>' +
          '<div class="hero-bar-section">' +
            '<div class="hero-bar-wrap">' +
              '<div class="hud-bar-fill" style="width:' + pct.toFixed(2) + '%;background:' + heroFillCol + '"></div>' +
              warnTick + critTick +
            '</div>' +
          '</div>' +
        '</section>' +
        '<section class="card">' +
          '<div class="card-head"><span class="card-title">' + escapeHtml(t('breakdownTitle')) + '</span><span class="card-sub">' + escapeHtml(t('breakdownSub', { used: fmtNum(ctx.used) })) + '</span></div>' +
          '<div class="stacked-bar">' + segHtml + '</div>' +
          '<div class="legend-list">' + legHtml + '</div>' +
        '</section>' +
      '</div>' +
      '<div class="grid-2">' +
        '<section class="card">' +
          '<div class="card-head"><span class="card-title">' + escapeHtml(t('growthTitle')) + '</span><span class="card-sub">' + escapeHtml(t('growthSub')) + '</span></div>' +
          renderGrowthSvg(ctx.growthSeries, th) +
        '</section>' +
        '<section class="card">' +
          '<div class="card-head"><span class="card-title">' + escapeHtml(t('heaviestTitle')) + '</span><span class="card-sub">' + escapeHtml(t('heaviestSub')) + '</span></div>' +
          '<div class="item-list">' + heavyHtml + '</div>' +
        '</section>' +
      '</div>';
  }

  function renderSessionTab(snap) {
    var cur = snap.current;
    if (!cur) {
      return '<div class="card"><div class="empty-state">' + escapeHtml(t('noCurrentConv')) + '</div></div>';
    }
    var tok = cur.tokens;
    var cost = cur.cost || { inputCost: 0, cacheReadCost: 0, outputCost: 0, totalCost: 0, uncachedEquivalentCost: 0, cacheSavings: 0, savingsPercent: 0 };
    var kpis = '<div class="kpi-grid">' +
      '<div class="kpi-card"><div class="kpi-top"><span class="kpi-label">' + escapeHtml(t('sessTotalKpi')) + '</span>' + ICONS.kpiTotal + '</div><span class="kpi-val num">' + fmtNum(tok.totalTokens) + '</span><span class="kpi-meta">' + escapeHtml(t('sessTurnMeta', { n: tok.turnCount })) + '</span></div>' +
      '<div class="kpi-card"><div class="kpi-top"><span class="kpi-label">' + escapeHtml(t('sessInputKpi')) + '</span>' + ICONS.kpiIn + '</div><span class="kpi-val num">' + fmtCompact(tok.promptTokens) + '</span><span class="kpi-meta num">' + escapeHtml(t('sessInputMeta', { in: fmtNum(tok.inputTokens), cache: fmtNum(tok.cacheReadTokens) })) + '</span></div>' +
      '<div class="kpi-card"><div class="kpi-top"><span class="kpi-label">' + escapeHtml(t('sessOutputKpi')) + '</span>' + ICONS.kpiOut + '</div><span class="kpi-val num">' + fmtNum(tok.outputTokens) + '</span><span class="kpi-meta">' + escapeHtml(t('sessOutputMeta')) + '</span></div>' +
      '<div class="kpi-card"><div class="kpi-top"><span class="kpi-label">' + escapeHtml(t('sessCacheKpi')) + '</span>' + ICONS.kpiCache + '</div><span class="kpi-val num">' + fmtPct(tok.cacheHitRate, true) + '</span><span class="kpi-meta">' + escapeHtml(t('sessCacheMeta', { rate: fmtPct(tok.latestCacheHitRate, true) })) + '</span></div>' +
    '</div>' +
    '<div class="cost-grid">' +
      '<div class="kpi-card cost-card"><span class="kpi-label">' + escapeHtml(t('sessCostCard')) + '</span><span class="kpi-val num">' + escapeHtml(fmtMoney(cost.totalCost)) + '</span><span class="kpi-meta num">' + escapeHtml(t('sessCostMeta', { in: fmtMoney(cost.inputCost), cache: fmtMoney(cost.cacheReadCost), out: fmtMoney(cost.outputCost) })) + '</span></div>' +
      '<div class="kpi-card savings-card"><div class="kpi-top"><span class="kpi-label">' + escapeHtml(t('sessSavCard')) + '</span><span class="badge ok num">-' + cost.savingsPercent.toFixed(1) + '%</span></div><span class="kpi-val num cost-val-ok">' + escapeHtml(fmtMoney(cost.cacheSavings)) + '</span><span class="kpi-meta num">' + escapeHtml(t('sessSavMeta', { pct: cost.savingsPercent.toFixed(1), raw: fmtMoney(cost.uncachedEquivalentCost) })) + '</span></div>' +
    '</div>' +
    '<div class="grid-2">' +
      renderEfficiencyCard(cur.efficiency) +
      renderSessionTimingCard(cur.timing) +
    '</div>';

    var subHtml = '';
    if (cur.subagents && cur.subagents.length > 0) {
      var ws = cur.withSubagents;
      var subRows = '';
      for (var s = 0; s < cur.subagents.length; s++) {
        var sa = cur.subagents[s];
        subRows += '<tr class="clickable" data-jump-conv="' + escapeHtml(sa.id) + '">' +
          '<td class="conv-title-cell">' + escapeHtml(sa.title) + '</td>' +
          '<td class="right num">' + sa.turns + '</td>' +
          '<td class="right num">' + fmtNum(sa.inputTokens + sa.cacheReadTokens) + '</td>' +
          '<td class="right num">' + fmtNum(sa.outputTokens) + '</td>' +
          '<td class="right num"><strong>' + fmtNum(sa.totalTokens) + '</strong></td>' +
          '<td class="right num">' + escapeHtml(fmtMoney(sa.totalCost || 0)) + '</td>' +
        '</tr>';
      }
      subHtml = '<section class="card">' +
        '<div class="card-head"><span class="card-title">' + escapeHtml(t('subTitle', { n: ws.subagentCount })) + '</span><span class="badge accent num">' + escapeHtml(t('subCombined', { total: fmtNum(ws.totalTokens) })) + ' · ' + escapeHtml(fmtMoney(ws.totalCost || 0)) + '</span></div>' +
        '<div class="table-wrap"><table><thead><tr><th>' + escapeHtml(t('subColName')) + '</th><th class="right">' + escapeHtml(t('subColTurns')) + '</th><th class="right">' + escapeHtml(t('subColIn')) + '</th><th class="right">' + escapeHtml(t('subColOut')) + '</th><th class="right">' + escapeHtml(t('subColTotal')) + '</th><th class="right">' + escapeHtml(t('colCost')) + '</th></tr></thead><tbody>' + subRows + '</tbody></table></div>' +
      '</section>';
    }

    var modelRows = '';
    for (var m = 0; m < tok.byModel.length; m++) {
      var mr = tok.byModel[m];
      modelRows += '<tr>' +
        '<td>' + escapeHtml(mr.displayName) + '</td>' +
        '<td class="right num">' + mr.turns + '</td>' +
        '<td class="right num col-hide-md">' + fmtNum(mr.inputTokens) + '</td>' +
        '<td class="right num col-hide-md">' + fmtNum(mr.cacheReadTokens) + '</td>' +
        '<td class="right num col-hide-md">' + fmtNum(mr.outputTokens) + '</td>' +
        '<td class="right num"><strong>' + fmtNum(mr.totalTokens) + '</strong></td>' +
        '<td class="right num">' + fmtPct(mr.cacheHitRate, true) + '</td>' +
        '<td class="right num">' + escapeHtml(fmtMoney(mr.totalCost || 0)) + '</td>' +
      '</tr>';
    }

    var turnRows = '';
    var series = cur.context.growthSeries || [];
    for (var i = series.length - 1; i >= 0; i--) {
      var tr = series[i];
      turnRows += '<tr>' +
        '<td class="num">#' + tr.turn + (tr.compacted ? ' <span class="badge warn">' + escapeHtml(t('compactedTag')) + '</span>' : '') + '</td>' +
        '<td>' + escapeHtml(tr.modelDisplay) + '</td>' +
        '<td class="right num col-hide-md">' + fmtNum(tr.inputTokens) + '</td>' +
        '<td class="right num col-hide-md">' + fmtNum(tr.cacheReadTokens) + '</td>' +
        '<td class="right num col-hide-md">' + fmtNum(tr.outputTokens) + '</td>' +
        '<td class="right num">' + fmtNum(tr.promptTokens) + '</td>' +
        '<td class="right num">' + fmtPct(tr.cacheHitRate, true) + '</td>' +
        '<td class="right num">' + escapeHtml(fmtMoney(tr.totalCost || 0)) + '</td>' +
      '</tr>';
    }

    return kpis + subHtml +
      '<section class="card">' +
        '<div class="card-head"><span class="card-title">' + escapeHtml(t('sessModelsTitle')) + '</span><span class="card-sub">' + escapeHtml(cur.title) + '</span></div>' +
        '<div class="table-wrap"><table><thead><tr><th>' + escapeHtml(t('colModel')) + '</th><th class="right">' + escapeHtml(t('colTurns')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colNewIn')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colCacheRead')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colOutput')) + '</th><th class="right">' + escapeHtml(t('colTotal')) + '</th><th class="right">' + escapeHtml(t('colCacheRate')) + '</th><th class="right">' + escapeHtml(t('colCost')) + '</th></tr></thead><tbody>' + (modelRows || '<tr><td colspan="8" class="empty-state">' + escapeHtml(t('noData')) + '</td></tr>') + '</tbody></table></div>' +
      '</section>' +
      '<section class="card">' +
        '<div class="card-head"><span class="card-title">' + escapeHtml(t('turnsTableTitle')) + '</span><span class="card-sub">' + escapeHtml(t('turnsTableSub')) + '</span></div>' +
        '<div class="table-wrap"><table><thead><tr><th>' + escapeHtml(t('colTurnIdx')) + '</th><th>' + escapeHtml(t('colModel')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colNewIn')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colCacheRead')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colOutput')) + '</th><th class="right">' + escapeHtml(t('colCtxTotal')) + '</th><th class="right">' + escapeHtml(t('colHitRate')) + '</th><th class="right">' + escapeHtml(t('colCost')) + '</th></tr></thead><tbody>' + (turnRows || '<tr><td colspan="8" class="empty-state">' + escapeHtml(t('noCallRecords')) + '</td></tr>') + '</tbody></table></div>' +
      '</section>';
  }

  function buildFilteredSortedConvRows(topList) {
    var list = Array.isArray(topList) ? topList : [];
    var q = (state.convSearch || '').trim().toLowerCase();
    var filtered = [];
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (q) {
        var projLbl = formatProjectName(item.projectId, item.projectName);
        var hay = (String(item.title || '') + ' ' + String(projLbl || '') + ' ' + String(item.modelDisplay || '')).toLowerCase();
        if (hay.indexOf(q) === -1) continue;
      }
      filtered.push(item);
    }

    var sortKey = state.convSortBy || 'totalTokens';
    var sortDir = state.convSortDir === 'asc' ? 1 : -1;
    filtered.sort(function(a, b) {
      var av = Number(a[sortKey]) || 0;
      var bv = Number(b[sortKey]) || 0;
      if (av === bv) return ((b.totalTokens || 0) - (a.totalTokens || 0));
      return (av - bv) * sortDir;
    });

    var limit = Math.min(50, filtered.length);
    var rowsHtml = '';
    for (var c = 0; c < limit; c++) {
      var cv = filtered[c];
      var runDot = cv.runState === 'RUN_STATE_RUNNING' ? '<span class="badge ok">' + escapeHtml(t('runningBadge')) + '</span> ' : '';
      var subBadge = cv.isSubagent ? '<span class="badge">' + escapeHtml(t('subBadge')) + '</span> ' : '';
      var ctxBadge = cv.contextStatus === 'critical'
        ? ' <span class="badge danger">' + escapeHtml(t('healthCrit')) + '</span>'
        : (cv.contextStatus === 'warn' ? ' <span class="badge warn">' + escapeHtml(t('healthWarn')) + '</span>' : '');
      rowsHtml += '<tr class="clickable" data-jump-conv="' + escapeHtml(cv.id) + '">' +
        '<td class="conv-title-cell" title="' + escapeHtml(cv.title) + '">' + runDot + subBadge + escapeHtml(cv.title) + '</td>' +
        '<td class="col-hide-sm">' + escapeHtml(formatProjectName(cv.projectId, cv.projectName)) + '</td>' +
        '<td class="col-hide-md">' + escapeHtml(cv.modelDisplay) + '</td>' +
        '<td class="right num">' + fmtCompact(cv.contextUsed) + ' (' + cv.usagePercent.toFixed(0) + '%)' + ctxBadge + '</td>' +
        '<td class="right num col-hide-sm">' + cv.turns + '</td>' +
        '<td class="right num"><strong>' + fmtCompact(cv.totalTokens) + '</strong></td>' +
        '<td class="right num">' + escapeHtml(fmtMoney(cv.totalCost || 0)) + '</td>' +
      '</tr>';
    }
    return {
      rowsHtml: rowsHtml,
      shownCount: limit,
      totalCount: filtered.length
    };
  }

  function renderAgentTab(snap) {
    var ag = snap.agent;
    var ranges = [
      { id: 'today', label: t('rangeToday') },
      { id: '7d', label: t('range7d') },
      { id: '30d', label: t('range30d') },
      { id: 'all', label: t('rangeAll') }
    ];
    var pillsHtml = '';
    for (var r = 0; r < ranges.length; r++) {
      var rg = ranges[r];
      pillsHtml += '<button class="pill' + (state.range === rg.id ? ' active' : '') + '" data-range="' + rg.id + '" type="button">' + escapeHtml(rg.label) + '</button>';
    }

    var projects = Array.isArray(ag.byProject) ? ag.byProject : [];
    var projOpts = '<option value="all">' + escapeHtml(t('allProjectsOpt', { count: projects.length })) + '</option>';
    for (var p = 0; p < projects.length; p++) {
      var pj = projects[p];
      var pjLabel = formatProjectName(pj.id, pj.name);
      projOpts += '<option value="' + escapeHtml(pj.id) + '"' + (state.projectId === pj.id ? ' selected' : '') + '>' + escapeHtml(pjLabel) + ' (' + fmtCompact(pj.totalTokens) + ')</option>';
    }

    var selProjName = ag.selectedProjectId === 'all'
      ? t('allProjectsLabel')
      : formatProjectName(ag.selectedProjectId, ag.selectedProjectName);

    var agCost = ag.cost || { inputCost: 0, cacheReadCost: 0, outputCost: 0, totalCost: 0, uncachedEquivalentCost: 0, cacheSavings: 0, savingsPercent: 0 };
    var agPromptTok = ag.promptTokens || ((ag.inputTokens || 0) + (ag.cacheReadTokens || 0));

    var agTokSum = Math.max(1, (ag.inputTokens || 0) + (ag.cacheReadTokens || 0) + (ag.outputTokens || 0));
    var agTokInPct = (((ag.inputTokens || 0) / agTokSum) * 100).toFixed(1);
    var agTokCachePct = (((ag.cacheReadTokens || 0) / agTokSum) * 100).toFixed(1);
    var agTokOutPct = (((ag.outputTokens || 0) / agTokSum) * 100).toFixed(1);

    var agInOfTotalPct = ((agPromptTok / agTokSum) * 100).toFixed(1);
    var agPromptDenom = Math.max(1, agPromptTok);
    var agNewOfPromptPct = (((ag.inputTokens || 0) / agPromptDenom) * 100).toFixed(1);
    var agCacheOfPromptPct = (((ag.cacheReadTokens || 0) / agPromptDenom) * 100).toFixed(1);
    var agOutBarPct = (ag.outputTokens || 0) > 0 ? Math.min(100, Math.max(4, Number(agTokOutPct))).toFixed(1) : '0.0';
    var agHitBarPct = Math.min(100, Math.max(0, (ag.cacheHitRate || 0) * 100)).toFixed(1);

    var agCostSum = Math.max(0.0001, (agCost.inputCost || 0) + (agCost.cacheReadCost || 0) + (agCost.outputCost || 0));
    var agCostInPct = (((agCost.inputCost || 0) / agCostSum) * 100).toFixed(1);
    var agCostCachePct = (((agCost.cacheReadCost || 0) / agCostSum) * 100).toFixed(1);
    var agCostOutPct = (((agCost.outputCost || 0) / agCostSum) * 100).toFixed(1);

    var agSavBarPct = Math.min(100, Math.max(0, agCost.savingsPercent || 0)).toFixed(1);

    var summaryStrip = '<div class="kpi-grid-6">' +
      '<div class="kpi-card hero-kpi card-tone-sky">' +
        '<div class="kpi-top">' +
          '<div class="kpi-head-left"><span class="kpi-icon-badge tone-sky">' + ICONS.kpiTotal + '</span><span class="kpi-label">' + escapeHtml(ag.selectedProjectId !== 'all' ? t('projScopedTotal', { name: selProjName }) : t('agentTotalKpi')) + '</span></div>' +
          '<span class="badge num">' + escapeHtml(t('agTurnsPill', { convs: ag.conversationCount })) + '</span>' +
        '</div>' +
        '<span class="kpi-val num">' + fmtCompact(ag.totalTokens) + '</span>' +
        '<div class="kpi-micro-bar">' +
          '<div class="kpi-micro-seg seg-new" style="width:' + agTokInPct + '%"></div>' +
          '<div class="kpi-micro-seg seg-cache" style="width:' + agTokCachePct + '%"></div>' +
          '<div class="kpi-micro-seg seg-out" style="width:' + agTokOutPct + '%"></div>' +
        '</div>' +
        '<div class="kpi-foot num"><span>' + fmtNum(ag.totalTokens) + ' tokens</span></div>' +
      '</div>' +
      '<div class="kpi-card hero-kpi card-tone-cyan">' +
        '<div class="kpi-top">' +
          '<div class="kpi-head-left"><span class="kpi-icon-badge tone-cyan">' + ICONS.kpiIn + '</span><span class="kpi-label">' + escapeHtml(t('agentInputKpi')) + '</span></div>' +
          '<span class="badge num">' + agInOfTotalPct + '%</span>' +
        '</div>' +
        '<span class="kpi-val num">' + fmtCompact(agPromptTok) + '</span>' +
        '<div class="kpi-micro-bar">' +
          '<div class="kpi-micro-seg seg-new" style="width:' + agNewOfPromptPct + '%"></div>' +
          '<div class="kpi-micro-seg seg-cache" style="width:' + agCacheOfPromptPct + '%"></div>' +
        '</div>' +
        '<div class="kpi-foot num"><span>' + escapeHtml(t('agentInputMeta', { in: fmtCompact(ag.inputTokens), cache: fmtCompact(ag.cacheReadTokens) })) + '</span></div>' +
      '</div>' +
      '<div class="kpi-card hero-kpi card-tone-violet">' +
        '<div class="kpi-top">' +
          '<div class="kpi-head-left"><span class="kpi-icon-badge tone-violet">' + ICONS.kpiOut + '</span><span class="kpi-label">' + escapeHtml(t('agentOutputKpi')) + '</span></div>' +
          '<span class="badge num">' + agTokOutPct + '%</span>' +
        '</div>' +
        '<span class="kpi-val num">' + fmtCompact(ag.outputTokens) + '</span>' +
        '<div class="kpi-micro-bar">' +
          '<div class="kpi-micro-seg seg-out" style="width:' + agOutBarPct + '%"></div>' +
        '</div>' +
        '<div class="kpi-foot num"><span>' + fmtNum(ag.outputTokens) + ' tokens</span></div>' +
      '</div>' +
      '<div class="kpi-card hero-kpi card-tone-amber">' +
        '<div class="kpi-top">' +
          '<div class="kpi-head-left"><span class="kpi-icon-badge tone-amber">' + ICONS.kpiCache + '</span><span class="kpi-label">' + escapeHtml(t('agentCacheKpi')) + '</span></div>' +
          '<span class="badge num">' + fmtCompact(ag.cacheReadTokens) + '</span>' +
        '</div>' +
        '<span class="kpi-val num">' + fmtPct(ag.cacheHitRate, true) + '</span>' +
        '<div class="kpi-micro-bar">' +
          '<div class="kpi-micro-seg seg-cache" style="width:' + agHitBarPct + '%"></div>' +
        '</div>' +
        '<div class="kpi-foot num"><span>' + escapeHtml(t('agentCacheMeta', { conv: ag.conversationCount, main: ag.mainConversationCount, sub: ag.subagentCount, turns: ag.turnCount })) + '</span></div>' +
      '</div>' +
      '<div class="kpi-card hero-kpi card-tone-rose">' +
        '<div class="kpi-top">' +
          '<div class="kpi-head-left"><span class="kpi-icon-badge tone-rose">' + ICONS.kpiCost + '</span><span class="kpi-label">' + escapeHtml(t('agentCostCard')) + '</span></div>' +
          '<span class="badge num">' + escapeHtml(t('modelsSub', { n: ag.byModel.length })) + '</span>' +
        '</div>' +
        '<span class="kpi-val num">' + escapeHtml(fmtMoney(agCost.totalCost)) + '</span>' +
        '<div class="kpi-micro-bar">' +
          '<div class="kpi-micro-seg seg-new" style="width:' + agCostInPct + '%"></div>' +
          '<div class="kpi-micro-seg seg-cache" style="width:' + agCostCachePct + '%"></div>' +
          '<div class="kpi-micro-seg seg-out" style="width:' + agCostOutPct + '%"></div>' +
        '</div>' +
        '<div class="kpi-foot num"><span>' + escapeHtml(t('sessCostMeta', { in: fmtMoney(agCost.inputCost), cache: fmtMoney(agCost.cacheReadCost), out: fmtMoney(agCost.outputCost) })) + '</span></div>' +
      '</div>' +
      '<div class="kpi-card hero-kpi card-tone-emerald">' +
        '<div class="kpi-top">' +
          '<div class="kpi-head-left"><span class="kpi-icon-badge tone-emerald">' + ICONS.kpiSavings + '</span><span class="kpi-label">' + escapeHtml(t('agentSavCard')) + '</span></div>' +
          '<span class="badge ok num">-' + (agCost.savingsPercent || 0).toFixed(1) + '%</span>' +
        '</div>' +
        '<span class="kpi-val num cost-val-ok">' + escapeHtml(fmtMoney(agCost.cacheSavings)) + '</span>' +
        '<div class="kpi-micro-bar">' +
          '<div class="kpi-micro-seg seg-sav" style="width:' + agSavBarPct + '%"></div>' +
        '</div>' +
        '<div class="kpi-foot num"><span>' + escapeHtml(t('sessSavMeta', { pct: (agCost.savingsPercent || 0).toFixed(1), raw: fmtMoney(agCost.uncachedEquivalentCost) })) + '</span></div>' +
      '</div>' +
    '</div>';

    var topList = ag.topConversations || [];
    var subTab = state.agentSubTab || 'trends';
    var subTabsHtml = '<nav class="subtabs" role="tablist">' +
      '<button class="subtab-btn' + (subTab === 'trends' ? ' active' : '') + '" data-agent-subtab="trends" type="button" role="tab" aria-selected="' + (subTab === 'trends' ? 'true' : 'false') + '">' + ICONS.subTrends + '<span>' + escapeHtml(t('agSubTrends')) + '</span></button>' +
      '<button class="subtab-btn' + (subTab === 'breakdown' ? ' active' : '') + '" data-agent-subtab="breakdown" type="button" role="tab" aria-selected="' + (subTab === 'breakdown' ? 'true' : 'false') + '">' + ICONS.subBreakdown + '<span>' + escapeHtml(t('agSubBreakdown')) + '</span><span class="subtab-count num">' + projects.length + ' · ' + ag.byModel.length + '</span></button>' +
      '<button class="subtab-btn' + (subTab === 'conversations' ? ' active' : '') + '" data-agent-subtab="conversations" type="button" role="tab" aria-selected="' + (subTab === 'conversations' ? 'true' : 'false') + '">' + ICONS.subConvs + '<span>' + escapeHtml(t('agSubConvs')) + '</span><span class="subtab-count num">' + topList.length + '</span></button>' +
    '</nav>';

    var subBodyHtml = '';
    if (subTab === 'breakdown') {
      var projPalette = ['#38bdf8', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      var projSegs = '';
      var projRows = '';
      for (var pi = 0; pi < projects.length; pi++) {
        var pr = projects[pi];
        var prName = formatProjectName(pr.id, pr.name);
        var col = projPalette[pi % projPalette.length];
        var isSel = state.projectId === pr.id;
        projSegs += '<div class="seg" style="width:' + pr.sharePercent.toFixed(2) + '%;background:' + col + '" data-tip="' + escapeHtml(prName) + ': ' + fmtNum(pr.totalTokens) + ' (' + pr.sharePercent.toFixed(1) + '%)"></div>';
        projRows += '<tr class="clickable' + (isSel ? ' row-selected' : '') + '" data-select-project="' + escapeHtml(pr.id) + '" title="' + escapeHtml((pr.folderPath || prName) + ' · ' + t('colNewShort') + ' ' + fmtCompact(pr.inputTokens) + ' / ' + t('colCacheShort') + ' ' + fmtCompact(pr.cacheReadTokens) + ' / ' + t('colOutput') + ' ' + fmtCompact(pr.outputTokens)) + '">' +
          '<td><span class="legend-left"><span class="dot" style="background:' + col + '"></span><span>' + escapeHtml(prName) + '</span>' + (pr.runningCount > 0 ? ' <span class="badge ok">' + escapeHtml(t('runningShort')) + '</span>' : '') + '</span></td>' +
          '<td class="right num"><span class="mini-share-wrap"><span class="mini-share-track"><span class="mini-share-fill" style="width:' + Math.min(100, Math.max(2, pr.sharePercent)).toFixed(1) + '%;background:' + col + '"></span></span><span>' + pr.sharePercent.toFixed(1) + '%</span></span></td>' +
          '<td class="right num col-hide-sm">' + pr.conversations + '</td>' +
          '<td class="right num col-hide-md">' + pr.turns + '</td>' +
          '<td class="right num col-hide-md">' + fmtCompact(pr.inputTokens) + '</td>' +
          '<td class="right num col-hide-md">' + fmtCompact(pr.cacheReadTokens) + '</td>' +
          '<td class="right num col-hide-md">' + fmtCompact(pr.outputTokens) + '</td>' +
          '<td class="right num"><strong>' + fmtCompact(pr.totalTokens) + '</strong></td>' +
          '<td class="right num">' + fmtPct(pr.cacheHitRate, true) + '</td>' +
          '<td class="right num">' + escapeHtml(fmtMoney(pr.totalCost || 0)) + '</td>' +
          '<td class="right num cost-val-ok">' + escapeHtml(fmtMoney(pr.cacheSavings || 0)) + '</td>' +
        '</tr>';
      }

      var modelRows = '';
      for (var m = 0; m < ag.byModel.length; m++) {
        var mr = ag.byModel[m];
        modelRows += '<tr title="' + escapeHtml(mr.displayName + ' · ' + t('colNewShort') + ' ' + fmtCompact(mr.inputTokens) + ' / ' + t('colCacheShort') + ' ' + fmtCompact(mr.cacheReadTokens) + ' / ' + t('colOutput') + ' ' + fmtCompact(mr.outputTokens)) + '">' +
          '<td>' + escapeHtml(mr.displayName) + '</td>' +
          '<td class="right num"><span class="mini-share-wrap"><span class="mini-share-track"><span class="mini-share-fill" style="width:' + Math.min(100, Math.max(2, mr.sharePercent)).toFixed(1) + '%"></span></span><span>' + mr.sharePercent.toFixed(1) + '%</span></span></td>' +
          '<td class="right num">' + mr.turns + '</td>' +
          '<td class="right num col-hide-md">' + fmtCompact(mr.inputTokens) + '</td>' +
          '<td class="right num col-hide-md">' + fmtCompact(mr.cacheReadTokens) + '</td>' +
          '<td class="right num col-hide-md">' + fmtCompact(mr.outputTokens) + '</td>' +
          '<td class="right num"><strong>' + fmtCompact(mr.totalTokens) + '</strong></td>' +
          '<td class="right num">' + fmtPct(mr.cacheHitRate, true) + '</td>' +
          '<td class="right num">' + escapeHtml(fmtMoney(mr.totalCost || 0)) + '</td>' +
        '</tr>';
      }

      subBodyHtml = '<section class="card">' +
          '<div class="card-head"><span class="card-title">' + escapeHtml(t('projTableTitle')) + '</span><span class="card-sub">' + escapeHtml(t('projTableSub', { total: fmtCompact(ag.allProjectsTotalTokens), n: projects.length })) + '</span></div>' +
          '<div class="stacked-bar">' + projSegs + '</div>' +
          '<div class="table-wrap"><table><thead><tr><th>' + escapeHtml(t('colProject')) + '</th><th class="right">' + escapeHtml(t('colShare')) + '</th><th class="right col-hide-sm">' + escapeHtml(t('colConvs')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colTurns')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colNewShort')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colCacheShort')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colOutput')) + '</th><th class="right">' + escapeHtml(t('colTotal')) + '</th><th class="right">' + escapeHtml(t('colHitRate')) + '</th><th class="right">' + escapeHtml(t('colCost')) + '</th><th class="right">' + escapeHtml(t('colSaved')) + '</th></tr></thead><tbody>' + (projRows || '<tr><td colspan="11" class="empty-state">' + escapeHtml(t('noProjData')) + '</td></tr>') + '</tbody></table></div>' +
        '</section>' +
        '<section class="card">' +
          '<div class="card-head"><span class="card-title">' + escapeHtml(t('modelsTitle')) + '</span><span class="card-sub">' + escapeHtml(t('modelsSub', { n: ag.byModel.length })) + '</span></div>' +
          '<div class="table-wrap"><table><thead><tr><th>' + escapeHtml(t('colModel')) + '</th><th class="right">' + escapeHtml(t('colShare')) + '</th><th class="right">' + escapeHtml(t('colTurns')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colNewShort')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colCacheShort')) + '</th><th class="right col-hide-md">' + escapeHtml(t('colOutput')) + '</th><th class="right">' + escapeHtml(t('colTotal')) + '</th><th class="right">' + escapeHtml(t('colHitRate')) + '</th><th class="right">' + escapeHtml(t('colCost')) + '</th></tr></thead><tbody>' + (modelRows || '<tr><td colspan="9" class="empty-state">' + escapeHtml(t('noData')) + '</td></tr>') + '</tbody></table></div>' +
        '</section>';
    } else if (subTab === 'conversations') {
      var convRes = buildFilteredSortedConvRows(topList);
      var sortArrow = function(colKey) {
        if ((state.convSortBy || 'totalTokens') !== colKey) return '';
        return state.convSortDir === 'asc' ? ' ▲' : ' ▼';
      };
      var sortCls = function(colKey, extra) {
        return 'right sortable' + ((state.convSortBy || 'totalTokens') === colKey ? ' sorted' : '') + (extra ? ' ' + extra : '');
      };
      subBodyHtml = '<section class="card">' +
        '<div class="card-head">' +
          '<div><div class="card-title">' + escapeHtml(t('topConvTitle')) + '</div><div id="convCountSub" class="card-sub">' + escapeHtml(t('convShownCount', { shown: convRes.shownCount, total: convRes.totalCount })) + '</div></div>' +
          '<input id="convSearchInput" class="conv-search-input" type="search" value="' + escapeHtml(state.convSearch || '') + '" placeholder="' + escapeHtml(t('convSearchPlaceholder')) + '" />' +
        '</div>' +
        '<div class="table-wrap tall"><table><thead><tr>' +
          '<th>' + escapeHtml(t('colConv')) + '</th>' +
          '<th class="col-hide-sm">' + escapeHtml(t('colProject')) + '</th>' +
          '<th class="col-hide-md">' + escapeHtml(t('colModel')) + '</th>' +
          '<th class="' + sortCls('usagePercent') + '" data-conv-sort="usagePercent">' + escapeHtml(t('colCtxCurr')) + sortArrow('usagePercent') + '</th>' +
          '<th class="' + sortCls('turns', 'col-hide-sm') + '" data-conv-sort="turns">' + escapeHtml(t('colTurns')) + sortArrow('turns') + '</th>' +
          '<th class="' + sortCls('totalTokens') + '" data-conv-sort="totalTokens">' + escapeHtml(t('colTotal')) + sortArrow('totalTokens') + '</th>' +
          '<th class="' + sortCls('totalCost') + '" data-conv-sort="totalCost">' + escapeHtml(t('colCost')) + sortArrow('totalCost') + '</th>' +
        '</tr></thead><tbody id="convTableBody">' + (convRes.rowsHtml || '<tr><td colspan="7" class="empty-state">' + escapeHtml(t('noConvRecords')) + '</td></tr>') + '</tbody></table></div>' +
      '</section>';
    } else {
      var hourlySub = ag.hourlyDistribution && ag.hourlyDistribution.peakHour !== null
        ? t('hourlyPeakSub', {
            hour: String(ag.hourlyDistribution.peakHour).padStart(2, '0'),
            val: fmtCompact(ag.hourlyDistribution.peakTokens),
            active: ag.hourlyDistribution.activeHours
          })
        : t('hourlyEmptySub');

      var stackChips = '<span class="chart-legend-inline">' +
        '<span class="chart-chip"><span class="chart-chip-dot" style="background:var(--tcl-c-cache)"></span>' + escapeHtml(t('colCacheShort')) + '</span>' +
        '<span class="chart-chip"><span class="chart-chip-dot" style="background:var(--tcl-c-new)"></span>' + escapeHtml(t('colNewShort')) + '</span>' +
        '<span class="chart-chip"><span class="chart-chip-dot" style="background:var(--tcl-c-out)"></span>' + escapeHtml(t('colOutput')) + '</span>' +
      '</span>';

      var dailyMode = state.dailyMetric || 'tokens';
      var dailyCardTitle = dailyMode === 'focus'
        ? t('dailyModeFocus')
        : (dailyMode === 'cost' ? t('dailyCostTitle') : t('dailyTitle'));
      var dailyCardSub = dailyMode === 'focus'
        ? t('timingSub')
        : (dailyMode === 'cost' ? t('prSub') : t('dailySub'));
      var dailyModePills = '<div class="mini-pills">' +
        '<button class="mini-pill' + (dailyMode === 'tokens' ? ' active' : '') + '" data-daily-metric="tokens" type="button">' + escapeHtml(t('dailyModeTokens')) + '</button>' +
        '<button class="mini-pill' + (dailyMode === 'focus' ? ' active' : '') + '" data-daily-metric="focus" type="button">' + escapeHtml(t('dailyModeFocus')) + '</button>' +
        '<button class="mini-pill' + (dailyMode === 'cost' ? ' active' : '') + '" data-daily-metric="cost" type="button">' + escapeHtml(t('dailyModeCost')) + '</button>' +
      '</div>';
      var dailyBodySvg = dailyMode === 'focus'
        ? renderDailyFocusSvg(ag.dailyTrend)
        : (dailyMode === 'cost' ? renderDailyCostSvg(ag.dailyTrend) : renderDailyTrendSvg(ag.dailyTrend));

      subBodyHtml = '<div class="grid-2">' +
          '<section class="card">' +
            '<div class="card-head"><div><div class="card-title">' + escapeHtml(dailyCardTitle) + '</div><div class="card-sub">' + escapeHtml(dailyCardSub) + '</div></div>' + dailyModePills + '</div>' +
            (dailyMode === 'tokens' ? ('<div>' + stackChips + '</div>') : '') +
            dailyBodySvg +
          '</section>' +
          '<section class="card">' +
            '<div class="card-head"><div><div class="card-title">' + escapeHtml(t('hourlyTitle')) + '</div><div class="card-sub">' + escapeHtml(hourlySub) + '</div></div>' + stackChips + '</div>' +
            renderHourlyDistributionSvg(ag.hourlyDistribution) +
          '</section>' +
        '</div>' +
        '<div class="grid-2">' +
          '<section class="card">' +
            '<div class="card-head"><span class="card-title">' + escapeHtml(t('hmTitle')) + '</span><span class="card-sub">' + escapeHtml(t('hmSub', { active: ag.calendarHeatmap ? ag.calendarHeatmap.activeDays : 0, streak: ag.calendarHeatmap ? ag.calendarHeatmap.currentStreak : 0 })) + '</span></div>' +
            renderCalendarHeatmapSvg(ag.calendarHeatmap) +
          '</section>' +
          renderEfficiencyCard(ag.efficiency) +
        '</div>' +
        renderAgentTimingCard(ag.timing);
    }

    return '' +
      '<div class="range-bar">' +
        '<div class="preset-row">' +
          '<select id="projectSelect" class="proj-select" title="' + escapeHtml(t('colProject')) + '">' + projOpts + '</select>' +
          (state.projectId !== 'all' ? '<button class="btn" type="button" data-select-project="all">' + escapeHtml(t('clearFilter')) + '</button>' : '') +
          '<span class="card-sub">' + escapeHtml(t('runningCount')) + ': <strong class="num">' + ag.activeRunningCount + '</strong></span>' +
        '</div>' +
        '<div class="pills">' + pillsHtml + '</div>' +
      '</div>' +
      summaryStrip +
      subTabsHtml +
      subBodyHtml;
  }

  function render() {
    var root = document.getElementById('contentRoot');
    var statusBadge = document.getElementById('statusBadge');
    var updatedLine = document.getElementById('updatedAtLine');
    var metaLine = document.getElementById('metaLine');
    var setBtn = document.getElementById('settingsBtn');
    var snap = state.snapshot;

    if (!snap) {
      syncStaticLabels();
      return;
    }

    if (!state.langInitialized && snap.settings && (snap.settings.lang === 'en' || snap.settings.lang === 'zh')) {
      state.langInitialized = true;
      state.lang = snap.settings.lang;
    }
    if (!state.fontInitialized && snap.settings && typeof snap.settings.font === 'string') {
      state.fontInitialized = true;
      state.font = snap.settings.font;
    }
    applyFont();
    syncStaticLabels();

    if (!snap.agent) {
      return;
    }

    syncConvDropdown(snap);
    renderSettingsPanel(snap);
    if (setBtn) setBtn.classList.toggle('active', state.settingsOpen);

    if (statusBadge) {
      statusBadge.title = t('statusClickTip');
      if (state.paused) {
        statusBadge.textContent = t('paused');
        statusBadge.className = 'badge warn clickable-status';
      } else {
        statusBadge.textContent = snap.lsConnected ? t('liveSync') : t('localMode');
        statusBadge.className = 'badge ok clickable-status';
      }
    }
    if (metaLine) {
      metaLine.textContent = t('metaFooter', {
        ver: snap.version,
        convs: snap.agent.conversationCount,
        projs: snap.agent.byProject ? snap.agent.byProject.length : 0
      });
    }
    if (updatedLine) {
      updatedLine.textContent = t('updatedFooter', { time: fmtTime(snap.generatedAt) });
    }

    if (state.activeTab === 'context') {
      root.innerHTML = renderContextTab(snap);
    } else if (state.activeTab === 'session') {
      root.innerHTML = renderSessionTab(snap);
    } else {
      root.innerHTML = renderAgentTab(snap);
    }
  }

  function buildMarkdownReport(snap) {
    if (!snap) return '';
    var lines = [t('rptHeader'), ''];
    if (snap.current) {
      var cur = snap.current;
      lines.push(t('rptSess', { title: cur.title, proj: formatProjectName(cur.projectId, cur.projectName) }));
      lines.push(t('rptModel', { model: cur.activeModelDisplay }));
      lines.push(t('rptCtx', {
        used: fmtNum(cur.context.used),
        limit: fmtNum(cur.context.limit),
        pct: cur.context.usagePercent.toFixed(1),
        status: cur.context.status
      }));
      lines.push(t('rptSessTok', {
        total: fmtNum(cur.tokens.totalTokens),
        in: fmtNum(cur.tokens.inputTokens),
        cache: fmtNum(cur.tokens.cacheReadTokens),
        out: fmtNum(cur.tokens.outputTokens)
      }));
      if (cur.cost) {
        lines.push(t('rptSessCost', {
          cost: fmtMoney(cur.cost.totalCost),
          saved: fmtMoney(cur.cost.cacheSavings),
          pct: cur.cost.savingsPercent.toFixed(1)
        }));
      }
      lines.push(t('rptCache', {
        hit: fmtPct(cur.tokens.cacheHitRate, true),
        last: fmtPct(cur.tokens.latestCacheHitRate, true)
      }));
      if (cur.efficiency) {
        lines.push(t('rptEff', {
          ratio: fmtRatio(cur.efficiency.thinkingToAnswerRatio),
          pct: cur.efficiency.thinkingSharePercent.toFixed(1),
          turns: cur.efficiency.turnsPerPrompt.toFixed(1),
          tools: cur.efficiency.toolsPerPrompt.toFixed(1)
        }));
      }
      if (cur.timing) {
        lines.push(t('rptTiming', {
          focus: fmtDuration(cur.timing.activeDurationMs, true),
          pace: fmtDuration(cur.timing.avgTurnDurationMs, false),
          task: fmtDuration(cur.timing.avgTaskDurationMs, false)
        }));
      }
      lines.push('');
    }
    if (snap.agent) {
      var ag = snap.agent;
      var agProjName = ag.selectedProjectId === 'all'
        ? t('allProjectsLabel')
        : formatProjectName(ag.selectedProjectId, ag.selectedProjectName);
      lines.push(t('rptAgent', { range: ag.range, proj: agProjName }));
      lines.push(t('rptCov', { convs: ag.conversationCount, turns: ag.turnCount }));
      lines.push(t('rptAgTok', {
        total: fmtNum(ag.totalTokens),
        in: fmtNum(ag.inputTokens),
        cache: fmtNum(ag.cacheReadTokens),
        out: fmtNum(ag.outputTokens)
      }));
      if (ag.cost) {
        lines.push(t('rptAgCost', {
          cost: fmtMoney(ag.cost.totalCost),
          saved: fmtMoney(ag.cost.cacheSavings),
          pct: ag.cost.savingsPercent.toFixed(1)
        }));
      }
      lines.push(t('rptAgCache', { hit: fmtPct(ag.cacheHitRate, true) }));
      if (ag.efficiency) {
        lines.push(t('rptEff', {
          ratio: fmtRatio(ag.efficiency.thinkingToAnswerRatio),
          pct: ag.efficiency.thinkingSharePercent.toFixed(1),
          turns: ag.efficiency.turnsPerPrompt.toFixed(1),
          tools: ag.efficiency.toolsPerPrompt.toFixed(1)
        }));
      }
      if (ag.timing) {
        lines.push(t('rptTiming', {
          focus: fmtDuration(ag.timing.totalActiveDurationMs, true),
          pace: fmtDuration(ag.timing.avgTurnDurationMs, false),
          task: fmtDuration(ag.timing.avgTaskDurationMs, false)
        }));
      }
      if (Array.isArray(ag.byProject) && ag.byProject.length > 0) {
        lines.push('');
        lines.push(t('rptProjTop'));
        for (var i = 0; i < Math.min(5, ag.byProject.length); i++) {
          var p = ag.byProject[i];
          lines.push('- ' + formatProjectName(p.id, p.name) + ': ' + fmtNum(p.totalTokens) + ' (' + p.sharePercent.toFixed(1) + '%, ' + p.conversations + ' convs)');
        }
      }
    }
    return lines.join('\\n');
  }

  function copyReport() {
    var text = buildMarkdownReport(state.snapshot);
    if (!text) return;
    var btn = document.getElementById('copyBtn');
    var done = function() {
      if (!btn) return;
      setElIconLabel(btn, 'check', t('copiedBtn'));
      setTimeout(function() {
        if (btn) setElIconLabel(btn, 'copy', t('copyBtn'));
      }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function() { done(); });
    } else {
      done();
    }
  }

  function scheduleNext() {
    if (state.pollTimer) {
      clearTimeout(state.pollTimer);
      state.pollTimer = null;
    }
    if (state.paused || document.hidden) return;
    state.pollTimer = setTimeout(function() { fetchSnapshot(false); }, 10000);
  }

  function fetchSnapshot(forceFull) {
    if (state.inFlight && !forceFull) return;
    state.inFlight = true;
    bridgeFetch(buildTelemetryUrl(!!forceFull))
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        if (data && data.hash) state.lastEtag = data.hash;
        if (data && data.unchanged === false && data.snapshot) {
          state.snapshot = data.snapshot;
          render();
        }
        var pulse = document.getElementById('livePulse');
        if (pulse && !state.paused) pulse.className = 'pulse';
      })
      .catch(function() {
        var pulse = document.getElementById('livePulse');
        var badge = document.getElementById('statusBadge');
        if (pulse) pulse.className = 'pulse error';
        if (badge) { badge.textContent = t('connError'); badge.className = 'badge danger'; }
      })
      .finally(function() {
        state.inFlight = false;
        scheduleNext();
      });
  }

  // Event wiring
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      state.activeTab = btn.getAttribute('data-tab') || 'context';
      document.querySelectorAll('.tab-btn').forEach(function(b) {
        var isCur = b === btn;
        b.classList.toggle('active', isCur);
        b.setAttribute('aria-selected', isCur ? 'true' : 'false');
      });
      render();
    });
  });

  function saveThresholdPayload(payload) {
    return bridgeFetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        if (data && data.settings && data.settings.thresholds) {
          state.draftMode = data.settings.thresholds.mode;
        }
        state.lastEtag = '';
        fetchSnapshot(true);
      });
  }

  function togglePaused() {
    state.paused = !state.paused;
    var pulse = document.getElementById('livePulse');
    if (pulse) pulse.className = state.paused ? 'pulse paused' : 'pulse';
    if (state.paused) {
      if (state.pollTimer) { clearTimeout(state.pollTimer); state.pollTimer = null; }
      render();
    } else {
      fetchSnapshot(true);
    }
  }

  document.getElementById('statusBadge').addEventListener('click', togglePaused);

  document.getElementById('settingsBtn').addEventListener('click', function() {
    state.settingsOpen = !state.settingsOpen;
    if (state.settingsOpen) {
      if (state.snapshot && state.snapshot.settings && state.snapshot.settings.thresholds) {
        state.draftMode = state.snapshot.settings.thresholds.mode;
      }
      var pr = getPricingCfg();
      state.draftCurrency = pr.currency || 'USD';
    }
    render();
  });

  document.getElementById('settingsPanel').addEventListener('click', function(ev) {
    var tabBtn = ev.target && ev.target.closest ? ev.target.closest('[data-settings-tab]') : null;
    if (tabBtn) {
      state.settingsTab = tabBtn.getAttribute('data-settings-tab') || 'general';
      if (state.settingsTab === 'thresholds' && state.snapshot && state.snapshot.settings && state.snapshot.settings.thresholds) {
        state.draftMode = state.snapshot.settings.thresholds.mode;
      } else if (state.settingsTab === 'pricing') {
        state.draftCurrency = getPricingCfg().currency || 'USD';
      }
      renderSettingsPanel(state.snapshot);
      return;
    }
    var langTarget = ev.target && ev.target.closest ? ev.target.closest('#langBtn') : null;
    if (langTarget) {
      state.langInitialized = true;
      state.lang = state.lang === 'en' ? 'zh' : 'en';
      render();
      bridgeFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: state.lang })
      }).catch(function() { /* ignore */ });
      return;
    }
    var pauseTarget = ev.target && ev.target.closest ? ev.target.closest('#pauseBtn') : null;
    if (pauseTarget) {
      togglePaused();
      return;
    }
    var curBtn = ev.target && ev.target.closest ? ev.target.closest('[data-pr-currency]') : null;
    if (curBtn) {
      state.draftCurrency = curBtn.getAttribute('data-pr-currency') === 'CNY' ? 'CNY' : 'USD';
      renderSettingsPanel(state.snapshot);
      return;
    }
    if (ev.target && ev.target.id === 'savePricingBtn') {
      var fxEl = document.getElementById('usdToCnyInput');
      var fxVal = Number(fxEl ? fxEl.value : 7.2);
      var currency = state.draftCurrency || getPricingCfg().currency || 'USD';
      var overrides = {};
      var inputs = document.querySelectorAll('#settingsPanel [data-pr-model]');
      var byModel = {};
      inputs.forEach(function(inp) {
        var mod = inp.getAttribute('data-pr-model');
        var fld = inp.getAttribute('data-pr-field');
        if (!mod || !fld) return;
        if (!byModel[mod]) byModel[mod] = {};
        byModel[mod][fld] = Number(inp.value);
      });
      for (var m in byModel) {
        if (Object.prototype.hasOwnProperty.call(byModel, m)) {
          overrides[m] = byModel[m];
        }
      }
      void saveThresholdPayload({ pricing: { currency: currency, usdToCny: fxVal, overrides: overrides } });
      return;
    }
    if (ev.target && ev.target.id === 'resetPricingBtn') {
      state.draftCurrency = 'USD';
      void saveThresholdPayload({ resetPricing: true });
      return;
    }
    var modeBtn = ev.target && ev.target.closest ? ev.target.closest('[data-th-mode]') : null;
    if (modeBtn) {
      state.draftMode = modeBtn.getAttribute('data-th-mode') || 'percent';
      renderSettingsPanel(state.snapshot);
      return;
    }
    var presetBtn = ev.target && ev.target.closest ? ev.target.closest('[data-th-preset]') : null;
    if (presetBtn) {
      var parts = (presetBtn.getAttribute('data-th-preset') || '').split(':');
      if (parts.length === 3) {
        var pMode = parts[0];
        var pWarn = Number(parts[1]);
        var pCrit = Number(parts[2]);
        state.draftMode = pMode;
        var thPatch = pMode === 'tokens'
          ? { thresholds: { mode: 'tokens', warnTokens: pWarn, criticalTokens: pCrit } }
          : { thresholds: { mode: 'percent', warnPercent: pWarn, criticalPercent: pCrit } };
        void saveThresholdPayload(thPatch);
      }
      return;
    }
    if (ev.target && ev.target.id === 'saveThresholdBtn') {
      var wEl = document.getElementById('warnInput');
      var cEl = document.getElementById('critInput');
      var curTh = (state.snapshot && state.snapshot.settings && state.snapshot.settings.thresholds) || {};
      var mode = state.draftMode || curTh.mode || 'percent';
      var warnNum = Number(wEl ? wEl.value : 0);
      var critNum = Number(cEl ? cEl.value : 0);
      var body = mode === 'tokens'
        ? { thresholds: { mode: 'tokens', warnTokens: warnNum, criticalTokens: critNum } }
        : { thresholds: { mode: 'percent', warnPercent: warnNum, criticalPercent: critNum } };
      void saveThresholdPayload(body);
      return;
    }
    if (ev.target && ev.target.id === 'resetThresholdBtn') {
      void saveThresholdPayload({ resetThresholds: true });
      return;
    }
    if (ev.target && ev.target.id === 'closeThresholdBtn') {
      state.settingsOpen = false;
      render();
    }
  });

  document.getElementById('settingsPanel').addEventListener('change', function(ev) {
    if (ev.target && ev.target.id === 'fontSelect') {
      state.fontInitialized = true;
      state.font = ev.target.value || 'auto';
      applyFont();
      bridgeFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ font: state.font })
      }).catch(function() { /* ignore */ });
    }
  });

  document.getElementById('contentRoot').addEventListener('click', function(ev) {
    var subBtn = ev.target && ev.target.closest ? ev.target.closest('[data-agent-subtab]') : null;
    if (subBtn) {
      state.agentSubTab = subBtn.getAttribute('data-agent-subtab') || 'trends';
      render();
      return;
    }
    var sortBtn = ev.target && ev.target.closest ? ev.target.closest('[data-conv-sort]') : null;
    if (sortBtn) {
      var nextKey = sortBtn.getAttribute('data-conv-sort') || 'totalTokens';
      if (state.convSortBy === nextKey) {
        state.convSortDir = state.convSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.convSortBy = nextKey;
        state.convSortDir = 'desc';
      }
      render();
      return;
    }
    var metricBtn = ev.target && ev.target.closest ? ev.target.closest('[data-daily-metric]') : null;
    if (metricBtn) {
      state.dailyMetric = metricBtn.getAttribute('data-daily-metric') || 'tokens';
      render();
      return;
    }
    var rangeBtn = ev.target && ev.target.closest ? ev.target.closest('[data-range]') : null;
    if (rangeBtn) {
      state.range = rangeBtn.getAttribute('data-range') || 'all';
      state.lastEtag = '';
      fetchSnapshot(true);
      return;
    }
    var projRow = ev.target && ev.target.closest ? ev.target.closest('[data-select-project]') : null;
    if (projRow) {
      var pid = projRow.getAttribute('data-select-project') || 'all';
      state.projectId = (pid !== 'all' && state.projectId === pid) ? 'all' : pid;
      state.lastEtag = '';
      fetchSnapshot(true);
      return;
    }
    var jumpRow = ev.target && ev.target.closest ? ev.target.closest('[data-jump-conv]') : null;
    if (jumpRow) {
      var cid = jumpRow.getAttribute('data-jump-conv');
      if (cid) {
        state.selectedConvId = cid;
        state.activeTab = 'context';
        document.querySelectorAll('.tab-btn').forEach(function(b) {
          b.classList.toggle('active', b.getAttribute('data-tab') === 'context');
        });
        state.lastEtag = '';
        fetchSnapshot(true);
      }
    }
  });

  document.getElementById('contentRoot').addEventListener('change', function(ev) {
    if (ev.target && ev.target.id === 'projectSelect') {
      state.projectId = ev.target.value || 'all';
      state.lastEtag = '';
      fetchSnapshot(true);
    }
  });

  document.getElementById('contentRoot').addEventListener('input', function(ev) {
    if (ev.target && ev.target.id === 'convSearchInput') {
      state.convSearch = ev.target.value || '';
      var topList = (state.snapshot && state.snapshot.agent && state.snapshot.agent.topConversations) || [];
      var res = buildFilteredSortedConvRows(topList);
      var tbody = document.getElementById('convTableBody');
      var cntEl = document.getElementById('convCountSub');
      if (tbody) {
        tbody.innerHTML = res.rowsHtml || '<tr><td colspan="7" class="empty-state">' + escapeHtml(t('noConvRecords')) + '</td></tr>';
      }
      if (cntEl) {
        cntEl.textContent = t('convShownCount', { shown: res.shownCount, total: res.totalCount });
      }
    }
  });

  document.getElementById('convSelect').addEventListener('change', function(ev) {
    state.selectedConvId = ev.target.value || '__follow__';
    state.lastEtag = '';
    fetchSnapshot(true);
  });

  (function initCustomTooltip() {
    var tipEl = document.getElementById('tclTooltip');
    if (!tipEl) return;
    var hideTip = function() {
      tipEl.hidden = true;
    };
    document.addEventListener('pointermove', function(ev) {
      var target = ev.target && ev.target.closest ? ev.target.closest('[data-tip]') : null;
      var text = target ? target.getAttribute('data-tip') : '';
      if (!text) {
        tipEl.hidden = true;
        return;
      }
      tipEl.textContent = text;
      tipEl.hidden = false;
      var pad = 12;
      var rect = tipEl.getBoundingClientRect();
      var left = ev.clientX + 14;
      var top = ev.clientY + 14;
      if (left + rect.width + pad > window.innerWidth) {
        left = Math.max(pad, ev.clientX - rect.width - 12);
      }
      if (top + rect.height + pad > window.innerHeight) {
        top = Math.max(pad, ev.clientY - rect.height - 12);
      }
      tipEl.style.left = left + 'px';
      tipEl.style.top = top + 'px';
    });
    document.addEventListener('pointerleave', hideTip);
    window.addEventListener('scroll', hideTip, true);
  })();

  document.getElementById('refreshBtn').addEventListener('click', function() {
    state.lastEtag = '';
    fetchSnapshot(true);
  });

  document.getElementById('copyBtn').addEventListener('click', copyReport);

  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !state.paused) {
      fetchSnapshot(false);
    } else if (document.hidden && state.pollTimer) {
      clearTimeout(state.pollTimer);
      state.pollTimer = null;
    }
  });

  fetchSnapshot(true);
})();
</script>
</body>
</html>`;
}
