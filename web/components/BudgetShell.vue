<template>
  <div class="bl-page">
    <div class="bl-wrap bl-nav-frame">
      <header class="bl-nav">
        <NuxtLink class="bl-brand" to="/" aria-label="BudgetLens home">
          <span class="bl-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="28" height="28" rx="9" fill="#9FE870" />
              <path d="M8 21.5h16M10 19v-5m6 5V9m6 10v-8" stroke="#163300" stroke-width="2.4" stroke-linecap="round" />
              <path d="m9 11 6-4 6 3 3-3" stroke="#163300" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>BudgetLens</span>
        </NuxtLink>
        <nav class="bl-nav-links" aria-label="Main navigation">
          <NuxtLink class="bl-nav-link" to="/#reports">Report library</NuxtLink>
          <NuxtLink class="bl-nav-link" to="/#how-it-works">How it works</NuxtLink>
          <NuxtLink class="bl-nav-cta" to="/upload">Analyze a PDF <span aria-hidden="true">↗</span></NuxtLink>
        </nav>
      </header>
    </div>

    <slot />

    <footer class="bl-wrap bl-footer">
      <div class="bl-footer-inner">
        <span>BudgetLens <span aria-hidden="true">·</span> Read the source behind the number.</span>
        <span>AI answers should always lead back to evidence.</span>
      </div>
    </footer>
  </div>
</template>
