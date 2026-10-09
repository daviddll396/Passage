<script setup>
import Lenis from 'lenis';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const isBooting = ref(true);

let lenis;
let lenisFrameId = 0;
let motionPreference;

function lenisRaf(time) {
  if (!lenis) return;
  lenis.raf(time);
  lenisFrameId = window.requestAnimationFrame(lenisRaf);
}

function stopLenis() {
  if (lenisFrameId) window.cancelAnimationFrame(lenisFrameId);
  lenisFrameId = 0;
  lenis?.destroy();
  lenis = null;
}

function syncLenisToMotionPreference() {
  stopLenis();
  if (motionPreference.matches) return;
  lenis = new Lenis({ autoRaf: false, anchors: true, respectReducedMotion: true, smoothWheel: true, syncTouch: false });
  lenisFrameId = window.requestAnimationFrame(lenisRaf);
}

onMounted(() => {
  nextTick(() => { isBooting.value = false; });
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionPreference.addEventListener('change', syncLenisToMotionPreference);
  syncLenisToMotionPreference();
});

onBeforeUnmount(() => {
  motionPreference?.removeEventListener('change', syncLenisToMotionPreference);
  stopLenis();
});

useHead({
  titleTemplate: (title) => title ? `${title} · Passage` : 'Passage',
  meta: [{ name: 'description', content: 'Ask questions about a PDF and follow every answer back to the source.' }],
  link: [
    { rel: 'icon', type: 'image/png', href: '/brand/passage-mark.png' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Newsreader:opsz,wght@6..72,400..700&display=swap' },
  ],
});
</script>

<template>
  <NuxtLoadingIndicator color="var(--bl-accent)" :height="2" :throttle="200" />
  <Transition name="passage-preloader">
    <div v-if="isBooting" class="passage-preloader" role="status">
      <img src="/brand/passage-mark.png" alt="" aria-hidden="true">
      <span class="passage-preloader-spinner" aria-hidden="true"></span>
      <span>Loading Passage</span>
    </div>
  </Transition>
  <NuxtPage />
</template>

<style>
:root {
  color-scheme: light;
  font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
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
