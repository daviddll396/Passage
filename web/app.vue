<script setup>
useHead({
  titleTemplate: (title) => title ? `${title} · BudgetLens` : 'BudgetLens',
  meta: [{ name: 'description', content: 'Explore public budgets, inspect published figures, and ask questions with source evidence.' }],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/brand/budgetlens-mark.svg' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' },
  ],
});
</script>

<template>
  <NuxtPage />
</template>

<style>
:root {
  color-scheme: light;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #18300e;
  background: #f7f8f5;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  --forest: #163300;
  --lime: #9fe870;
  --ink: #18300e;
  --muted: #687264;
  --paper: #fff;
  --fog: #f2f4ef;
  --line: #e1e5dd;
}

* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; }
button, input, textarea, select { font: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
a { color: inherit; }
:focus-visible { outline: 3px solid #7fb74f; outline-offset: 3px; }
.site-nav {
  align-items: center; background: var(--paper); border-bottom: 1px solid var(--line); display: flex;
  height: 72px; justify-content: space-between; padding: 0 max(24px, calc((100vw - 1160px) / 2));
}
.brand { align-items: center; color: var(--forest); display: inline-flex; font-size: 18px; font-weight: 780; gap: 9px; letter-spacing: -.8px; text-decoration: none; }
.brand-mark { align-items: center; background: var(--forest); border-radius: 9px; display: inline-flex; height: 30px; justify-content: center; position: relative; width: 30px; }
.brand-mark::before { border: 3px solid var(--lime); border-right-color: transparent; border-radius: 50%; content: ""; height: 12px; transform: rotate(-35deg); width: 12px; }
.nav-links { align-items: center; display: flex; gap: 26px; }
.nav-link { color: #5c6657; font-size: 13px; font-weight: 600; text-decoration: none; transition: color .15s ease; }
.nav-link:hover, .nav-link.router-link-active { color: var(--forest); }
.nav-cta { background: var(--lime); border-radius: 999px; color: var(--forest); padding: 10px 16px; }
.nav-cta:hover { background: #8ed85e; color: var(--forest); }
.page-wrap { margin: 0 auto; max-width: 1160px; padding: 40px 24px 72px; }
.eyebrow { align-items: center; color: #58684f; display: flex; font-size: 11px; font-weight: 750; gap: 8px; letter-spacing: .09em; margin: 0; text-transform: uppercase; }
.signal-dot { background: var(--lime); border: 1px solid #6b9b44; border-radius: 50%; height: 8px; width: 8px; }
.pill { align-items: center; background: #edf4e8; border: 1px solid #dce8d3; border-radius: 999px; color: #425b33; display: inline-flex; font-size: 11px; font-weight: 650; gap: 6px; padding: 6px 10px; }
.primary-button, .secondary-button { align-items: center; border: 1px solid transparent; border-radius: 999px; cursor: pointer; display: inline-flex; font-size: 13px; font-weight: 700; justify-content: center; min-height: 44px; padding: 0 18px; text-decoration: none; transition: background .15s ease, border-color .15s ease, color .15s ease; }
.primary-button { background: var(--lime); color: var(--forest); }
.primary-button:hover:not(:disabled) { background: #8ed85e; }
.primary-button:disabled { cursor: wait; opacity: .62; }
.secondary-button { background: white; border-color: var(--line); color: var(--forest); }
.secondary-button:hover:not(:disabled) { background: var(--fog); }
.section-heading { align-items: end; display: flex; gap: 18px; justify-content: space-between; }
.section-heading h2 { color: var(--forest); font-size: 20px; letter-spacing: -.6px; margin: 0; }
.section-heading p { color: var(--muted); font-size: 13px; margin: 6px 0 0; }
.state-panel { background: white; border: 1px solid var(--line); border-radius: 10px; color: var(--muted); padding: 24px; }
.state-panel.error { border-color: #efc9c3; color: #8e3329; }
.state-panel strong { color: var(--ink); display: block; font-size: 14px; margin-bottom: 5px; }
.state-panel p { font-size: 13px; line-height: 1.6; margin: 0; }
.state-panel .secondary-button { margin-top: 16px; }
.source-chip { align-items: center; background: #f0f2ee; border-radius: 999px; color: #4d5b45; display: inline-flex; font-size: 10px; font-weight: 700; gap: 6px; padding: 6px 9px; }
.source-chip::before { background: #779262; border-radius: 50%; content: ""; height: 5px; width: 5px; }
.field-label { color: #35452e; display: block; font-size: 12px; font-weight: 700; margin-bottom: 7px; }
.field-hint { color: #7b8576; display: block; font-size: 11px; line-height: 1.5; margin-top: 6px; }
.input, .textarea, .select {
  background: white; border: 1px solid #d5dbd0; border-radius: 8px; color: var(--ink); font-size: 14px; outline: 0; padding: 12px 13px; width: 100%;
}
.textarea { line-height: 1.6; min-height: 140px; resize: vertical; }
.input:focus, .textarea:focus, .select:focus { border-color: #789d61; box-shadow: 0 0 0 3px #9fe87033; }
.site-footer { border-top: 1px solid var(--line); color: #7b8576; font-size: 11px; margin: 0 auto; max-width: 1160px; padding: 20px 24px 30px; }
.sr-only { clip: rect(0, 0, 0, 0); clip-path: inset(50%); height: 1px; overflow: hidden; position: absolute; white-space: nowrap; width: 1px; }
@media (max-width: 700px) {
  .site-nav { height: 62px; padding: 0 17px; }
  .brand { font-size: 16px; }
  .brand-mark { height: 28px; width: 28px; }
  .nav-links { gap: 8px; }
  .nav-link { font-size: 10px; }
  .nav-links > .nav-link:first-child { display: none; }
  .nav-cta { padding: 9px 12px; }
  .page-wrap { padding: 28px 17px 52px; }
  .site-footer { padding-left: 17px; padding-right: 17px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
</style>
