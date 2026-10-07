<script setup>
import { computed, onMounted, ref } from 'vue';
import { budgetRequest } from '../utils/budgetApi.js';

useHead({ title: 'Public budgets, made legible' });
const { public: { apiBase } } = useRuntimeConfig();
const reports = ref([]);
const loading = ref(true);
const error = ref('');
const featured = computed(() => reports.value[0] || null);

async function loadReports() {
  loading.value = true;
  error.value = '';
  try {
    const result = await budgetRequest(apiBase, '/budget/reports');
    reports.value = Array.isArray(result.reports) ? result.reports : [];
  } catch (cause) {
    error.value = cause.message;
  } finally {
    loading.value = false;
  }
}

onMounted(loadReports);
</script>

<template>
  <BudgetShell>
    <main class="bl-main home-main">
      <section class="home-hero" aria-labelledby="home-title">
        <div class="hero-copy">
          <p class="bl-overline">Public finance, in plain language</p>
          <h1 id="home-title">Public spending,<br><span>made legible.</span></h1>
          <p class="hero-lede">Bring a budget report. Ask a direct question. Get an answer tied to the page and passage it came from.</p>
          <div class="hero-actions">
            <NuxtLink to="/upload" class="bl-button bl-button-primary">Analyze a PDF <span aria-hidden="true">↗</span></NuxtLink>
            <a href="#reports" class="browse-link">Explore public reports <span aria-hidden="true">↓</span></a>
          </div>
          <p class="hero-note"><span aria-hidden="true">✓</span> Your uploads stay private and expire after analysis.</p>
        </div>

        <aside class="hero-feature" aria-label="Featured public report">
          <div class="feature-topline">
            <span class="feature-label">A closer look</span>
            <span class="feature-live"><i aria-hidden="true"></i> Source linked</span>
          </div>
          <template v-if="featured">
            <p class="feature-source">{{ featured.sourceName || featured.organization }}</p>
            <h2>{{ featured.title }}</h2>
            <p class="feature-period">{{ featured.period }}</p>
            <div class="feature-metrics">
              <div v-for="metric in featured.metrics?.slice(0, 2)" :key="metric.label" class="feature-metric">
                <span>{{ metric.label }}</span>
                <strong>{{ metric.value }} <small>{{ metric.unit }}</small></strong>
              </div>
            </div>
            <NuxtLink class="feature-open" :to="`/reports/${encodeURIComponent(featured.id)}`">Explore this report <span aria-hidden="true">↗</span></NuxtLink>
          </template>
          <div v-else-if="loading" class="feature-skeleton" aria-label="Loading the public report library">
            <span></span><span></span><span></span>
          </div>
          <div v-else class="feature-empty">
            <span class="empty-document" aria-hidden="true">PDF</span>
            <strong>{{ error ? 'The library is unavailable' : 'Start with a report of your own' }}</strong>
            <p>{{ error || 'Upload a public budget document and ask about its figures, wording, or reporting period.' }}</p>
            <NuxtLink to="/upload">Analyze your first report <span aria-hidden="true">→</span></NuxtLink>
          </div>
          <div class="feature-footnote"><span class="feature-line" aria-hidden="true"></span><span>Answers point back to the source.</span></div>
        </aside>
      </section>

      <section id="how-it-works" class="how-section" aria-labelledby="how-title">
        <div class="section-intro">
          <p class="bl-overline">From PDF to evidence</p>
          <h2 id="how-title">Follow the numbers<br class="small-break"> back to the page.</h2>
        </div>
        <div class="how-grid">
          <article class="how-item">
            <span class="how-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z"/><path d="M14 3.75v4h4M8.5 13h7M8.5 16h7"/></svg></span>
            <h3>Choose a source</h3>
            <p>Explore an official report from the public library or bring your own PDF.</p>
          </article>
          <article class="how-item">
            <span class="how-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42m-9.88 9.88-1.42 1.42"/><circle cx="12" cy="12" r="4"/></svg></span>
            <h3>Ask in plain language</h3>
            <p>Gemini reads the report and extracts the information needed to answer.</p>
          </article>
          <article class="how-item">
            <span class="how-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5.5h16v13H4zM8 9h8m-8 3h5m-5 3h7"/><path d="m16 15 1.5 1.5L20 13"/></svg></span>
            <h3>Check the evidence</h3>
            <p>Each answer shows the passage and page that support it. Unsupported facts stay unknown.</p>
          </article>
        </div>
      </section>

      <section id="reports" class="library-section" aria-labelledby="reports-title" aria-live="polite">
        <div class="library-heading">
          <div>
            <p class="bl-overline">Public report library</p>
            <h2 id="reports-title">Start with the source.</h2>
            <p>Browse the underlying numbers, then ask a question about what the report says.</p>
          </div>
          <NuxtLink to="/upload" class="upload-text-link">Have a PDF? Analyze it <span aria-hidden="true">↗</span></NuxtLink>
        </div>

        <div v-if="loading" class="library-grid" aria-label="Loading reports">
          <div v-for="item in 2" :key="item" class="report-placeholder" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
        </div>
        <div v-else-if="error" class="bl-state bl-state-error" role="alert">
          <strong>Could not load the report library</strong><p>{{ error }}</p>
          <button type="button" class="retry-button" @click="loadReports">Try again</button>
        </div>
        <div v-else-if="reports.length" class="library-grid">
          <BudgetReportCard v-for="report in reports" :key="report.id" :report="report" />
        </div>
        <div v-else class="bl-state library-empty">
          <strong>No curated reports are available yet</strong>
          <p>You can still explore the product with a public budget PDF of your own.</p>
          <NuxtLink to="/upload" class="bl-button bl-button-primary">Analyze a report <span aria-hidden="true">↗</span></NuxtLink>
        </div>
        <p class="library-source-note">Official report figures remain attributed to their source. AI explanations are separate from the published data.</p>
      </section>

      <section class="closing-cta">
        <div><p class="bl-overline">Make the document easier to use</p><h2>Bring a report.<br>Find the answer.</h2></div>
        <NuxtLink to="/upload" class="bl-button bl-button-accent">Upload a budget PDF <span aria-hidden="true">↗</span></NuxtLink>
      </section>
    </main>
  </BudgetShell>
</template>

<style scoped>
.home-main { padding-top: 48px; }
.home-hero { align-items: center; display: grid; gap: 60px; grid-template-columns: minmax(0, 1.05fr) minmax(340px, .8fr); min-height: 504px; padding: 24px 10px 61px; }
.hero-copy { max-width: 650px; }
.hero-copy h1 { color: var(--bl-ink); font-size: clamp(52px, 7vw, 91px); font-weight: 850; letter-spacing: -.085em; line-height: .91; margin: 25px 0 22px; }
.hero-copy h1 span { color: var(--bl-forest); }
.hero-lede { color: #5b6258; font-size: 17px; line-height: 1.7; margin: 0; max-width: 510px; }
.hero-actions { align-items: center; display: flex; flex-wrap: wrap; gap: 22px; margin-top: 27px; }
.browse-link { color: var(--bl-forest); font-size: 13px; font-weight: 700; text-underline-offset: 4px; }
.hero-note { align-items: center; color: #788073; display: flex; font-size: 11px; gap: 8px; margin: 22px 0 0; }
.hero-note span { align-items: center; background: var(--bl-linen); border-radius: 50%; color: var(--bl-forest); display: inline-flex; font-size: 9px; font-weight: 800; height: 17px; justify-content: center; width: 17px; }
.hero-feature { background: linear-gradient(145deg, #163300 0%, #06442a 65%, #075f57 100%); border-radius: 26px; color: white; min-height: 355px; overflow: hidden; padding: 24px; position: relative; }
.feature-topline { align-items: center; display: flex; justify-content: space-between; position: relative; z-index: 1; }
.feature-label { color: #e7f4e0; font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.feature-live { align-items: center; color: #c4e8bd; display: flex; font-size: 10px; gap: 6px; }
.feature-live i { background: var(--bl-lime); border-radius: 50%; height: 6px; width: 6px; }
.feature-source { color: #b7d3ac; font-size: 10px; font-weight: 750; letter-spacing: .1em; margin: 32px 0 8px; text-transform: uppercase; }
.hero-feature h2 { color: white; font-size: 27px; letter-spacing: -.055em; line-height: 1.1; margin: 0; max-width: 380px; position: relative; z-index: 1; }
.feature-period { color: #c5d1c1; font-size: 11px; margin: 8px 0 0; }
.feature-metrics { display: grid; gap: 9px; grid-template-columns: 1fr 1fr; margin-top: 21px; position: relative; z-index: 1; }
.feature-metric { background: #ffffff12; border: 1px solid #ffffff21; border-radius: 10px; min-width: 0; padding: 13px; }
.feature-metric > span { color: #d2e3cc; display: block; font-size: 10px; }
.feature-metric strong { color: var(--bl-lime); display: block; font-size: 15px; letter-spacing: -.04em; margin-top: 9px; overflow-wrap: anywhere; }
.feature-metric small { color: #d2e3cc; font-size: 9px; font-weight: 500; }
.feature-open { color: white; display: inline-flex; font-size: 11px; font-weight: 750; gap: 8px; margin-top: 18px; position: relative; text-decoration: underline; text-underline-offset: 3px; z-index: 1; }
.feature-empty { margin-top: 54px; position: relative; z-index: 1; }
.empty-document { align-items: center; background: #9fe870; border-radius: 8px; color: #163300; display: inline-flex; font-size: 9px; font-weight: 850; height: 30px; justify-content: center; width: 30px; }
.feature-empty strong { color: white; display: block; font-size: 17px; letter-spacing: -.03em; margin-top: 13px; }
.feature-empty p { color: #d7e2d2; font-size: 11px; line-height: 1.55; margin: 7px 0 12px; max-width: 320px; }
.feature-empty a { color: var(--bl-lime); font-size: 11px; font-weight: 750; text-decoration: none; }
.feature-footnote { align-items: center; bottom: 22px; color: #d7e2d2; display: flex; font-size: 10px; gap: 8px; left: 24px; position: absolute; z-index: 1; }
.feature-line { background: var(--bl-lime); height: 1px; width: 27px; }
.feature-skeleton { display: grid; gap: 11px; margin-top: 65px; }
.feature-skeleton span { animation: shimmer 1.2s ease-in-out infinite alternate; background: #ffffff24; border-radius: 5px; height: 20px; width: 85%; }
.feature-skeleton span:nth-child(2) { width: 62%; }
.feature-skeleton span:nth-child(3) { height: 68px; width: 100%; }
.how-section { border-top: 1px solid var(--bl-line); display: grid; gap: 62px; grid-template-columns: .85fr 1.15fr; padding: 65px 10px 73px; }
.section-intro h2 { color: var(--bl-ink); font-size: clamp(33px, 4vw, 49px); letter-spacing: -.07em; line-height: .98; margin: 17px 0 0; }
.small-break { display: none; }
.how-grid { display: grid; gap: 22px; grid-template-columns: repeat(3, 1fr); }
.how-item { border-top: 2px solid var(--bl-forest); padding-top: 14px; }
.how-icon { align-items: center; background: #eff5eb; border-radius: 10px; color: var(--bl-forest); display: flex; height: 38px; justify-content: center; width: 38px; }
.how-icon svg { fill: none; height: 20px; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; width: 20px; }
.how-item h3 { color: var(--bl-ink); font-size: 15px; letter-spacing: -.03em; margin: 14px 0 7px; }
.how-item p { color: var(--bl-muted); font-size: 11px; line-height: 1.6; margin: 0; }
.library-section { border-top: 1px solid var(--bl-line); padding: 62px 10px 67px; }
.library-heading { align-items: end; display: flex; justify-content: space-between; margin-bottom: 24px; }
.library-heading h2 { color: var(--bl-ink); font-size: clamp(32px, 4vw, 46px); letter-spacing: -.07em; margin: 14px 0 7px; }
.library-heading p:not(.bl-overline) { color: var(--bl-muted); font-size: 13px; margin: 0; }
.upload-text-link { color: var(--bl-forest); font-size: 12px; font-weight: 750; padding-bottom: 5px; text-underline-offset: 4px; }
.library-grid { display: grid; gap: 14px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.library-empty .bl-button { margin-top: 16px; min-height: 40px; }
.retry-button { background: transparent; border: 0; color: var(--bl-forest); cursor: pointer; font-size: 12px; font-weight: 750; margin-top: 12px; padding: 4px 0; text-decoration: underline; text-underline-offset: 3px; }
.library-source-note { color: #81877e; font-size: 10px; line-height: 1.5; margin: 14px 0 0; }
.report-placeholder { animation: shimmer 1.2s ease-in-out infinite alternate; background: #f0f2ee; border-radius: 16px; height: 280px; padding: 22px; }
.report-placeholder span { background: #e3e7e1; border-radius: 4px; display: block; height: 13px; margin-bottom: 18px; width: 40%; }
.report-placeholder span:nth-child(2) { height: 30px; width: 75%; }
.report-placeholder span:nth-child(3) { height: 45px; width: 100%; }
.report-placeholder span:nth-child(4) { margin-top: 70px; width: 56%; }
.closing-cta { align-items: center; background: var(--bl-forest); border-radius: 23px; color: white; display: flex; justify-content: space-between; padding: 34px 40px; }
.closing-cta .bl-overline { color: #cde2c0; font-size: 9px; }
.closing-cta h2 { color: white; font-size: clamp(29px, 4vw, 43px); letter-spacing: -.07em; line-height: .98; margin: 14px 0 0; }
.closing-cta .bl-button { flex: 0 0 auto; }
@keyframes shimmer { to { opacity: .45; } }
@media (max-width: 900px) {
  .home-hero { gap: 32px; grid-template-columns: 1fr 1fr; }
  .hero-copy h1 { font-size: clamp(48px, 7vw, 68px); }
  .hero-feature { padding: 20px; }
  .how-section { gap: 36px; grid-template-columns: 1fr; }
}
@media (max-width: 680px) {
  .home-main { padding-top: 20px; }
  .home-hero { gap: 32px; grid-template-columns: 1fr; padding: 17px 0 45px; }
  .hero-copy h1 { font-size: clamp(52px, 14vw, 72px); margin: 19px 0; }
  .hero-lede { font-size: 14px; }
  .hero-actions { align-items: flex-start; flex-direction: column; gap: 15px; margin-top: 21px; }
  .hero-note { margin-top: 16px; }
  .hero-feature { border-radius: 19px; min-height: 340px; }
  .feature-metric strong { font-size: 13px; }
  .how-section { gap: 28px; padding: 47px 0; }
  .section-intro h2 { font-size: 38px; }
  .small-break { display: initial; }
  .how-grid { gap: 22px; grid-template-columns: 1fr; }
  .how-item { display: grid; gap: 0 12px; grid-template-columns: 38px 1fr; padding-top: 12px; }
  .how-icon { grid-row: 1 / 3; }
  .how-item h3 { margin: 1px 0 4px; }
  .library-section { padding: 46px 0; }
  .library-heading { align-items: flex-start; flex-direction: column; gap: 17px; }
  .library-heading h2 { font-size: 35px; }
  .library-heading p:not(.bl-overline) { font-size: 12px; line-height: 1.55; }
  .library-grid { grid-template-columns: 1fr; }
  .closing-cta { align-items: flex-start; flex-direction: column; gap: 24px; padding: 27px 23px; }
  .closing-cta .bl-button { width: 100%; }
}
</style>
