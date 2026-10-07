<script setup>
import { computed, onMounted, ref } from 'vue';
import { budgetRequest } from '../utils/budgetApi.js';

useHead({ title: 'Public budgets, in clear focus' });
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
    <main class="bl-main bl-home">
      <section class="home-hero" aria-labelledby="home-title">
        <div class="hero-copy">
          <p class="bl-kicker">Public finance, made readable</p>
          <h1 id="home-title">Public budgets,<br><span>in clear focus.</span></h1>
          <p class="hero-lede">Find a figure. Ask the report. Follow every answer back to its source.</p>
          <div class="hero-actions">
            <NuxtLink to="#reports" class="bl-button bl-button-primary">Explore reports</NuxtLink>
            <NuxtLink to="/upload" class="bl-button bl-button-secondary">Analyze a PDF</NuxtLink>
          </div>
          <p class="hero-note">Answers use report evidence. If a source is silent, BudgetLens says so.</p>
        </div>

        <div class="hero-visual" :aria-busy="loading">
          <img class="hero-artwork" src="/images/budgetlens-evidence-layers.png" alt="" fetchpriority="high">
          <article v-if="featured" class="hero-proof-card" aria-label="Featured public report">
            <div class="proof-card-top">
              <span class="proof-card-label">Featured report</span>
              <span class="proof-period">{{ featured.period || 'Public report' }}</span>
            </div>
            <p class="proof-source">{{ featured.sourceName || featured.organization || 'Source document' }}</p>
            <h2>{{ featured.title }}</h2>
            <div v-if="featured.metrics?.[0]" class="proof-figure">
              <span>{{ featured.metrics[0].label }}</span>
              <strong>{{ featured.metrics[0].value }} <small>{{ featured.metrics[0].unit }}</small></strong>
              <small class="proof-page">{{ featured.metrics[0].sourcePage == null ? 'Page not identified' : `Page ${featured.metrics[0].sourcePage}` }}</small>
            </div>
            <NuxtLink class="proof-link" :to="`/reports/${encodeURIComponent(featured.id)}`">Open this report <span aria-hidden="true">→</span></NuxtLink>
          </article>
          <div v-else-if="loading" class="hero-proof-card proof-loading" role="status">Loading the public report library</div>
          <div v-else class="hero-proof-card proof-empty">
            <p class="proof-card-label">Public report library</p>
            <h2>{{ error ? 'The library is unavailable' : 'Start with a report of your own' }}</h2>
            <p>{{ error || 'Upload a public budget PDF and ask about its figures or reporting period.' }}</p>
            <button v-if="error" class="proof-link proof-retry" type="button" @click="loadReports">Try again</button>
            <NuxtLink v-else class="proof-link" to="/upload">Analyze a PDF <span aria-hidden="true">→</span></NuxtLink>
          </div>
        </div>
      </section>

      <section class="trust-strip" aria-label="How BudgetLens supports trust">
        <div><strong>Source-linked figures</strong><span>See where published numbers come from.</span></div>
        <div><strong>Answers with evidence</strong><span>Check the passage behind each answer.</span></div>
        <div><strong>Private PDF sessions</strong><span>Uploaded files are not added to the library.</span></div>
      </section>

      <section id="how-it-works" class="process-section" aria-labelledby="how-title">
        <div class="section-intro">
          <p class="bl-kicker">From source to understanding</p>
          <h2 id="how-title">Every answer has a trail.</h2>
          <p>BudgetLens keeps the published report, extracted figures, and AI explanation easy to tell apart.</p>
        </div>
        <div class="process-grid">
          <article class="process-item">
            <span class="process-rule" aria-hidden="true"></span>
            <h3>Choose a source</h3>
            <p>Open a public report or bring a budget PDF you want to understand.</p>
          </article>
          <article class="process-item">
            <span class="process-rule" aria-hidden="true"></span>
            <h3>Ask in plain language</h3>
            <p>Ask about a figure, time period, or detail in the report.</p>
          </article>
          <article class="process-item">
            <span class="process-rule" aria-hidden="true"></span>
            <h3>Check the evidence</h3>
            <p>Review the cited passage or see when the report does not support an answer.</p>
          </article>
        </div>
      </section>

      <section id="reports" class="library-section" aria-labelledby="reports-title" aria-live="polite">
        <div class="section-heading">
          <div>
            <p class="bl-kicker">Public report library</p>
            <h2 id="reports-title">Start with the source.</h2>
            <p>Browse published figures, open the underlying report, then ask a grounded question.</p>
          </div>
          <NuxtLink to="/upload" class="section-link">Have a PDF? Analyze it <span aria-hidden="true">→</span></NuxtLink>
        </div>

        <div v-if="loading" class="library-grid" aria-label="Loading reports">
          <div v-for="item in 2" :key="item" class="report-placeholder" aria-hidden="true"><span></span><span></span><span></span></div>
        </div>
        <div v-else-if="error" class="bl-state bl-state-error" role="alert">
          <strong>Could not load the report library</strong>
          <p>{{ error }}</p>
          <button type="button" class="retry-button" @click="loadReports">Try again</button>
        </div>
        <div v-else-if="reports.length" class="library-grid" :class="{ 'single-report': reports.length === 1 }">
          <BudgetReportCard v-for="report in reports" :key="report.id" :report="report" />
        </div>
        <div v-else class="bl-state library-empty">
          <strong>No curated reports are available yet</strong>
          <p>You can still explore the product with a public budget PDF of your own.</p>
          <NuxtLink to="/upload" class="bl-button bl-button-primary">Analyze a report</NuxtLink>
        </div>
        <p class="library-source-note">Published figures stay attributed to their source. AI answers are shown separately with their supporting evidence.</p>
      </section>

      <section class="closing-cta" aria-labelledby="closing-title">
        <div class="closing-copy">
          <p class="bl-kicker bl-kicker-inverse">Bring a source document</p>
          <h2 id="closing-title">Make a long report<br>easier to use.</h2>
          <NuxtLink to="/upload" class="bl-button bl-button-accent">Analyze a PDF</NuxtLink>
        </div>
      </section>
    </main>
  </BudgetShell>
</template>
