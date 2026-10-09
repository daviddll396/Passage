<template>
  <div class="bl-page">
    <div class="bl-wrap bl-nav-frame" :class="{ 'is-scrolled': isScrolled }">
      <header class="bl-nav">
        <NuxtLink class="bl-brand" to="/" aria-label="Passage home">
          <img class="bl-brand-mark" src="/brand/passage-mark.png" alt="">
          <span class="bl-wordmark">Passage</span>
        </NuxtLink>
        <nav class="bl-nav-links" aria-label="Main navigation">
          <NuxtLink v-if="route.path === '/'" class="bl-nav-link" to="/" :class="{ 'is-current': !route.hash }" :aria-current-value="!route.hash ? 'page' : 'false'">Home</NuxtLink>
          <NuxtLink class="bl-nav-link" to="/#reports" :class="{ 'is-current': route.path === '/' && route.hash === '#reports' }" :aria-current-value="route.path === '/' && route.hash === '#reports' ? 'location' : 'false'">Examples</NuxtLink>
          <NuxtLink class="bl-nav-link bl-nav-link-how-it-works" to="/#how-it-works" :class="{ 'is-current': route.path === '/' && route.hash === '#how-it-works' }" :aria-current-value="route.path === '/' && route.hash === '#how-it-works' ? 'location' : 'false'">How it works</NuxtLink>
        </nav>
        <button v-if="route.path === '/'" class="bl-nav-cta" type="button" @click="requestHeroUpload">Upload a document</button>
        <NuxtLink v-else class="bl-nav-cta" to="/?upload=1#hero">Upload a document</NuxtLink>
      </header>
    </div>

    <slot />

    <footer class="bl-wrap bl-footer">
      <div class="bl-footer-panel">
        <div class="bl-footer-top">
          <div class="bl-footer-brand">
            <NuxtLink class="bl-brand" to="/" aria-label="Passage home">
              <img class="bl-brand-mark" src="/brand/passage-mark.png" alt="">
              <span class="bl-wordmark">Passage</span>
            </NuxtLink>
            <p class="bl-footer-tagline">Ask your PDFs. Check the source.</p>
          </div>
          <nav class="bl-footer-links" aria-label="Footer navigation">
            <NuxtLink to="/#reports">Examples</NuxtLink>
            <NuxtLink to="/?upload=1#hero">Upload a PDF</NuxtLink>
            <a href="https://github.com/daviddll396/Passage" target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        </div>

        <div class="bl-footer-content">
          <div class="bl-footer-description">
            <p>Ask questions about a document and review the source passages behind each answer.</p>
          </div>
          <section class="bl-footer-tools" aria-label="Tools used to build Passage">
            <section class="bl-footer-tool-group" aria-labelledby="footer-frontend">
              <h2 id="footer-frontend">Frontend</h2>
              <ul>
                <li><img src="/brand/technology/nuxt.svg" width="20" height="20" alt="" aria-hidden="true"><span>Nuxt</span></li>
                <li><img src="/brand/technology/typescript.svg" width="20" height="20" alt="" aria-hidden="true"><span>TypeScript</span></li>
              </ul>
            </section>
            <section class="bl-footer-tool-group" aria-labelledby="footer-backend">
              <h2 id="footer-backend">Backend</h2>
              <ul>
                <li><img src="/brand/technology/express.svg" width="20" height="20" alt="" aria-hidden="true"><span>Express</span></li>
                <li><img src="/brand/technology/mysql.svg" width="20" height="20" alt="" aria-hidden="true"><span>MySQL</span></li>
              </ul>
            </section>
            <section class="bl-footer-tool-group" aria-labelledby="footer-ai-cloud">
              <h2 id="footer-ai-cloud">AI &amp; cloud</h2>
              <ul>
                <li><img src="/brand/technology/gemini.svg" width="20" height="20" alt="" aria-hidden="true"><span>Gemini</span></li>
                <li><img src="/brand/technology/gcp.svg" width="20" height="20" alt="" aria-hidden="true"><span>GCP</span></li>
              </ul>
            </section>
          </section>
        </div>

        <div class="bl-footer-wordmark" aria-hidden="true">PASSAGE</div>
      </div>
    </footer>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const route = useRoute();
const uploadRequest = useState('passage-upload-request', () => '');
const isScrolled = ref(false);

function updateScrollState() {
  isScrolled.value = window.scrollY > 8;
}

onMounted(() => {
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });
});

onBeforeUnmount(() => window.removeEventListener('scroll', updateScrollState));

function requestHeroUpload() {
  uploadRequest.value = 'hero';
  document.getElementById('hero')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
</script>
