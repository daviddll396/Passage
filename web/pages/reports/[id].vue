<script setup>
import { onMounted, ref } from 'vue';
import { budgetRequest } from '../../utils/budgetApi.js';

const route = useRoute();
const { public: { apiBase } } = useRuntimeConfig();
const report = ref(null);
const loading = ref(true);
const error = ref('');

useHead(() => ({ title: report.value?.title || 'Public report' }));

async function loadReport() {
  loading.value = true;
  error.value = '';
  try {
    const result = await budgetRequest(apiBase, `/budget/reports/${encodeURIComponent(route.params.id)}`);
    report.value = result.report;
  } catch (cause) {
    error.value = cause.message;
  } finally {
    loading.value = false;
  }
}

onMounted(loadReport);
</script>

<template>
  <BudgetShell>
    <main class="bl-main report-main">
      <NuxtLink class="back-link" to="/#reports"><span aria-hidden="true">←</span> Report library</NuxtLink>

      <div v-if="loading" class="report-loading" role="status">Loading the source report</div>
      <div v-else-if="error" class="bl-state bl-state-error report-error" role="alert">
        <strong>Could not open this report</strong>
        <p>{{ error }}</p>
        <button class="retry-button" type="button" @click="loadReport">Try again</button>
      </div>

      <template v-else-if="report">
        <header class="report-heading">
          <div class="report-heading-copy">
            <p class="bl-kicker">{{ report.sourceName || report.organization || 'Public source' }}</p>
            <h1>{{ report.title }}</h1>
            <p class="report-meta">{{ [report.organization, report.period].filter(Boolean).join(' · ') }}</p>
          </div>
          <a v-if="report.sourceUrl" class="bl-button bl-button-secondary source-button" :href="report.sourceUrl" target="_blank" rel="noopener noreferrer">View source document</a>
        </header>

        <div class="report-layout">
          <div class="report-content">
            <section class="figures-panel bl-panel" aria-labelledby="figures-title">
              <div class="panel-heading">
                <div>
                  <p class="bl-kicker">Figures in this report</p>
                  <h2 id="figures-title">The published numbers</h2>
                </div>
                <span class="period-tag">{{ report.period || 'Source values' }}</span>
              </div>
              <p v-if="report.summary" class="report-summary">{{ report.summary }}</p>
              <div v-if="report.metrics?.length" class="figures-grid">
                <article v-for="metric in report.metrics" :key="metric.label" class="figure-item">
                  <span class="figure-label">{{ metric.label }}</span>
                  <strong>{{ metric.value }} <small>{{ metric.unit }}</small></strong>
                  <small class="figure-page">{{ metric.sourcePage == null ? 'Source page not identified' : `Page ${metric.sourcePage}` }}</small>
                </article>
              </div>
              <div v-else class="bl-state">
                <strong>No figures were extracted</strong>
                <p>The source report is linked above. No verified figures are available in this library record.</p>
              </div>
              <p class="figures-note">Figures are transcribed from the report. AI answers appear separately with their supporting evidence.</p>
            </section>

            <section v-if="report.evidence?.length" class="source-evidence bl-panel" aria-labelledby="evidence-title">
              <div class="panel-heading">
                <div>
                  <p class="bl-kicker">Check the wording</p>
                  <h2 id="evidence-title">Evidence passages</h2>
                </div>
              </div>
              <blockquote v-for="(item, index) in report.evidence" :key="`${item.page}-${index}`" class="source-passage">
                <span>{{ item.label || 'Report passage' }}</span>
                <p>“{{ item.quote }}”</p>
                <small>{{ item.page == null ? 'Source page not identified' : `Page ${item.page}` }}</small>
              </blockquote>
            </section>
          </div>

          <aside class="report-aside">
            <BudgetQuestion
              :api-base="apiBase"
              :ask-path="`/budget/reports/${encodeURIComponent(report.id)}/ask`"
              :suggestions="['What was the amount allocated to education?', 'How much was spent by October?']"
            />
            <div class="source-note">
              <span class="source-note-label">Answer scope</span>
              <p>Answers use this source only. If the report does not support an answer, BudgetLens should say so.</p>
            </div>
          </aside>
        </div>
      </template>
    </main>
  </BudgetShell>
</template>
