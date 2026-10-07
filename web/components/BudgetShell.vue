<template>
  <div class="bl-page">
    <div class="bl-wrap bl-nav-frame">
      <header class="bl-nav">
        <NuxtLink class="bl-brand" to="/" aria-label="Passage home">
          <img class="bl-brand-mark" src="/brand/passage-mark.png" alt="">
          <span class="bl-wordmark">Passage</span>
        </NuxtLink>
        <nav class="bl-nav-links" aria-label="Main navigation">
          <NuxtLink class="bl-nav-link" to="/#reports">Examples</NuxtLink>
          <NuxtLink class="bl-nav-link" to="/#how-it-works">How it works</NuxtLink>
          <NuxtLink class="bl-nav-cta" to="/upload">Upload a document</NuxtLink>
        </nav>
      </header>
    </div>

    <slot />

    <footer class="bl-wrap bl-footer">
      <div class="bl-footer-brand">
        <NuxtLink class="bl-brand" to="/" aria-label="Passage home">
          <img class="bl-brand-mark" src="/brand/passage-mark.png" alt="">
          <span class="bl-wordmark">Passage</span>
        </NuxtLink>
        <p>Every answer, back to its source.</p>
      </div>
      <div class="bl-footer-links">
        <NuxtLink to="/#reports">Examples</NuxtLink>
        <NuxtLink to="/upload">Upload a document</NuxtLink>
      </div>
    </footer>
  </div>
</template>
