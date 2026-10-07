<script setup>
import { computed, onMounted, ref } from 'vue';
import { budgetRequest } from '../utils/budgetApi.js';

useHead({ title: 'Ask your PDFs. Check the source.' });
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
          <h1 id="home-title">Know what your<br><em>documents say.</em></h1>
          <p class="hero-lede">Ask a question. Get a clear answer, with a page citation you can check.</p>
          <div class="hero-actions">
            <NuxtLink to="/upload" class="bl-button bl-button-primary">Upload a document</NuxtLink>
            <NuxtLink to="#reports" class="hero-text-link">Try an example</NuxtLink>
          </div>
        </div>

        <figure class="hero-art" :aria-busy="loading">
          <img class="hero-artwork" src="/images/passage-document-lineart.png" alt="" fetchpriority="high">
          <article v-if="featured" class="hero-proof-card" aria-label="A figure from the sample document">
            <div class="proof-card-top">
              <span class="proof-period">{{ featured.period || 'Public report' }}</span>
            </div>
            <p class="proof-source">{{ featured.sourceName || featured.organization || 'Source document' }}</p>
            <h2>{{ featured.title }}</h2>
            <div v-if="featured.metrics?.[0]" class="proof-figure">
              <span>{{ featured.metrics[0].label }}</span>
              <strong>{{ featured.metrics[0].value }} <small>{{ featured.metrics[0].unit }}</small></strong>
              <small class="proof-page">{{ featured.metrics[0].sourcePage == null ? 'Page not identified' : `Page ${featured.metrics[0].sourcePage}` }}</small>
            </div>
            <NuxtLink class="proof-link" :to="`/reports/${encodeURIComponent(featured.id)}`">View report <span aria-hidden="true">→</span></NuxtLink>
          </article>
        </figure>

        <div class="hero-question-wrap">
          <BudgetQuestion
            v-if="featured"
            class="home-question"
            compact
            title="Ask this document"
            :source-label="[featured.title, featured.period].filter(Boolean).join(' · ')"
            :placeholder="`What would you like to know about ${featured.title}?`"
            :api-base="apiBase"
            :ask-path="`/budget/reports/${encodeURIComponent(featured.id)}/ask`"
            :suggestions="['Summarize the key points', 'What dates or figures should I note?']"
          />
          <div v-else class="hero-question-empty bl-panel" role="status">
            <h2>{{ loading ? 'Opening the examples…' : 'Bring a PDF to begin.' }}</h2>
            <p>{{ error || 'Ask questions about a document and check the source behind each answer.' }}</p>
            <NuxtLink to="/upload" class="bl-button bl-button-primary">Upload a PDF</NuxtLink>
          </div>
        </div>
      </section>

      <section class="trust-strip" aria-label="How Passage works">
        <div><strong>Page-level citations</strong><span>Trace answers back to the source.</span></div>
        <div><strong>Grounded answers</strong><span>Flags missing evidence.</span></div>
        <div><strong>Private PDF sessions</strong><span>Uploads stay out of the example library.</span></div>
      </section>

      <section id="how-it-works" class="process-section" aria-labelledby="how-title">
        <div class="section-intro">
          <h2 id="how-title">Every answer has a trail.</h2>
          <p>Passage keeps the original document, extracted details, and explanation easy to tell apart.</p>
        </div>
        <div class="process-grid">
          <article class="process-item">
            <span class="process-rule" aria-hidden="true"></span>
            <h3>Choose a document</h3>
            <p>Open the sample or bring a PDF you want to understand.</p>
          </article>
          <article class="process-item">
            <span class="process-rule" aria-hidden="true"></span>
            <h3>Ask in plain language</h3>
            <p>Ask about a figure, date, decision, or passage.</p>
          </article>
          <article class="process-item">
            <span class="process-rule" aria-hidden="true"></span>
            <h3>Check the evidence</h3>
            <p>See the cited passage, or when the document does not support an answer.</p>
          </article>
        </div>
      </section>

      <section id="reports" class="library-section" aria-labelledby="reports-title" aria-live="polite">
        <div class="section-heading">
          <div>
            <h2 id="reports-title">Try a sample document.</h2>
            <p>The example library starts with public reports. Upload any PDF to ask your own questions.</p>
          </div>
          <NuxtLink to="/upload" class="section-link">Use your own PDF <span aria-hidden="true">→</span></NuxtLink>
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
          <p>Bring a PDF to ask questions and check the cited passages.</p>
          <NuxtLink to="/upload" class="bl-button bl-button-primary">Upload a PDF</NuxtLink>
        </div>
      </section>

      <section class="closing-cta" aria-labelledby="closing-title">
        <div class="closing-copy">
          <h2 id="closing-title">A long document.<br>One clear answer.</h2>
          <NuxtLink to="/upload" class="bl-button bl-button-accent">Ask your PDF</NuxtLink>
        </div>
      </section>
    </main>
  </BudgetShell>
</template>
