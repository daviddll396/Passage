<template>
  <div class="bl-page">
    <div class="bl-wrap bl-nav-frame">
      <header class="bl-nav">
        <NuxtLink class="bl-brand" to="/" aria-label="BudgetLens home">
          <img class="bl-brand-mark" src="/brand/budgetlens-mark.svg" alt="">
          <span class="bl-wordmark">Budget<span>Lens</span></span>
        </NuxtLink>
        <nav class="bl-nav-links" aria-label="Main navigation">
          <NuxtLink class="bl-nav-link" to="/#reports">Reports</NuxtLink>
          <NuxtLink class="bl-nav-link" to="/#how-it-works">How it works</NuxtLink>
          <NuxtLink class="bl-nav-cta" to="/upload">Analyze a PDF</NuxtLink>
        </nav>
      </header>
    </div>

    <slot />

    <footer class="bl-wrap bl-footer">
      <div class="bl-footer-brand">
        <NuxtLink class="bl-brand" to="/" aria-label="BudgetLens home">
          <img class="bl-brand-mark" src="/brand/budgetlens-mark.svg" alt="">
          <span class="bl-wordmark">Budget<span>Lens</span></span>
        </NuxtLink>
        <p>Read the source behind the number.</p>
      </div>
      <div class="bl-footer-links">
        <NuxtLink to="/#reports">Report library</NuxtLink>
        <NuxtLink to="/upload">Analyze a PDF</NuxtLink>
      </div>
    </footer>
  </div>
</template>
