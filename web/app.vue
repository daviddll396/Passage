<script setup>
useHead({
  titleTemplate: (title) => title ? `${title} · Passage` : 'Passage',
  meta: [{ name: 'description', content: 'Ask questions about a PDF and follow every answer back to the source.' }],
  link: [
    { rel: 'icon', type: 'image/png', href: '/brand/passage-mark.png' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap' },
  ],
});
</script>

<template>
  <NuxtPage />
</template>

<style>
:root {
  color-scheme: light;
  font-family: Manrope, ui-sans-serif, system-ui, sans-serif;
  color: #485264;
  background: #faf7f2;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; min-width: 320px; }
button, input, textarea, select { font: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
a { color: inherit; }
:focus-visible { outline: 3px solid #cf806a; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
</style>
