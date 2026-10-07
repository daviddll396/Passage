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
      <NuxtLink class="back-link" to="/#reports">← Back to report library</NuxtLink>

      <div v-if="loading" class="report-loading" aria-live="polite">
        <span></span><span></span><span></span>
      </div>
      <div v-else-if="error" class="bl-state bl-state-error report-error" role="alert">
        <strong>Could not open this report</strong><p>{{ error }}</p>
        <button class="retry-button" type="button" @click="loadReport">Try again</button>
      </div>
      <template v-else-if="report">
        <header class="report-heading">
          <div>
            <p class="bl-overline">{{ report.sourceName || report.organization || 'Public source' }}</p>
            <h1>{{ report.title }}</h1>
            <p class="report-meta">{{ [report.organization, report.period].filter(Boolean).join(' · ') }}</p>
          </div>
          <a v-if="report.sourceUrl" class="source-button" :href="report.sourceUrl" target="_blank" rel="noopener noreferrer">View official source <span aria-hidden="true">↗</span></a>
        </header>

        <div class="report-layout">
          <div class="report-content">
            <section class="figures-panel bl-card" aria-labelledby="figures-title">
              <div class="panel-heading">
                <div><p class="bl-overline">From the published report</p><h2 id="figures-title">Reported figures</h2></div>
                <span class="bl-tag">{{ report.period || 'Source values' }}</span>
              </div>
              <p v-if="report.summary" class="report-summary">{{ report.summary }}</p>
              <div v-if="report.metrics?.length" class="figures-grid">
                <article v-for="metric in report.metrics" :key="metric.label" class="figure-item">
                  <span>{{ metric.label }}</span>
                  <strong>{{ metric.value }} <small>{{ metric.unit }}</small></strong>
                  <small class="figure-page">{{ metric.sourcePage == null ? 'Source page not identified' : `Page ${metric.sourcePage}` }}</small>
                </article>
              </div>
              <div v-else class="bl-state"><strong>No figures were extracted</strong><p>The source report is linked below. There are no verified figures available in the library record.</p></div>
              <p class="figures-note">These figures are transcribed from the report. AI explanations are separate and cited below.</p>
            </section>

            <section v-if="report.evidence?.length" class="source-evidence bl-card" aria-labelledby="evidence-title">
              <div class="panel-heading"><div><p class="bl-overline">Trace the source</p><h2 id="evidence-title">Evidence passages</h2></div></div>
              <blockquote v-for="(item, index) in report.evidence" :key="`${item.page}-${index}`">
                <span>{{ item.label || 'Report passage' }}</span><p>“{{ item.quote }}”</p>
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
              <span class="source-note-icon" aria-hidden="true">i</span>
              <p>Answers are limited to information found in this source. If the report does not support an answer, BudgetLens should say so.</p>
            </div>
          </aside>
        </div>
      </template>
    </main>
  </BudgetShell>
</template>

<style scoped>
.report-main { padding-top: 33px; }
.back-link { color: #657060; font-size: 12px; text-decoration: none; }
.back-link:hover { color: var(--bl-forest); text-decoration: underline; text-underline-offset: 3px; }
.report-heading { align-items: end; border-bottom: 1px solid var(--bl-line); display: flex; gap: 25px; justify-content: space-between; margin: 39px 0 23px; padding-bottom: 23px; }
.report-heading .bl-overline { font-size: 9px; }
.report-heading h1 { color: var(--bl-ink); font-size: clamp(36px, 5vw, 56px); letter-spacing: -.075em; line-height: .97; margin: 13px 0 9px; max-width: 770px; }
.report-meta { color: #6e766a; font-size: 12px; margin: 0; }
.source-button { align-items: center; border: 1px solid #bdc8b8; border-radius: 999px; color: var(--bl-forest); display: inline-flex; flex: 0 0 auto; font-size: 11px; font-weight: 700; gap: 8px; min-height: 40px; padding: 0 14px; text-decoration: none; }
.source-button:hover { background: #f2f5ef; }
.report-layout { align-items: start; display: grid; gap: 17px; grid-template-columns: minmax(0, 1.08fr) minmax(340px, .82fr); }
.report-content { display: grid; gap: 15px; min-width: 0; }
.figures-panel, .source-evidence { padding: 21px; }
.panel-heading { align-items: end; display: flex; justify-content: space-between; }
.panel-heading .bl-overline { font-size: 9px; }
.panel-heading h2 { color: var(--bl-ink); font-size: 22px; letter-spacing: -.055em; margin: 8px 0 0; }
.report-summary { color: #5c6657; font-size: 12px; line-height: 1.65; margin: 15px 0 0; }
.figures-grid { display: grid; gap: 9px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 18px; }
.figure-item { background: #f5f7f3; border-radius: 10px; min-width: 0; padding: 13px; }
.figure-item > span { color: #66705f; display: block; font-size: 10px; }
.figure-item > strong { color: var(--bl-forest); display: block; font-size: 17px; letter-spacing: -.045em; margin-top: 8px; overflow-wrap: anywhere; }
.figure-item > strong small { color: #596951; font-size: 9px; font-weight: 550; }
.figure-page { color: #868d83; display: block; font-size: 9px; margin-top: 6px; }
.figures-note { border-top: 1px solid #edf0ea; color: #7a8376; font-size: 10px; line-height: 1.5; margin: 16px 0 0; padding-top: 12px; }
.source-evidence blockquote { background: #f7f9f5; border-left: 3px solid #83b65f; margin: 14px 0 0; padding: 12px 14px; }
.source-evidence blockquote > span { color: #405c31; font-size: 10px; font-weight: 750; }
.source-evidence blockquote p { color: #454c43; font-size: 12px; line-height: 1.6; margin: 6px 0; }
.source-evidence blockquote small { color: #7a8376; font-size: 10px; }
.report-aside { display: grid; gap: 12px; }
.source-note { align-items: flex-start; background: var(--bl-fog); border-radius: 10px; display: flex; gap: 10px; padding: 13px; }
.source-note-icon { align-items: center; background: var(--bl-forest); border-radius: 50%; color: var(--bl-lime); display: inline-flex; flex: 0 0 20px; font-size: 11px; font-weight: 800; height: 20px; justify-content: center; }
.source-note p { color: #60695c; font-size: 10px; line-height: 1.55; margin: 0; }
.report-loading { display: grid; gap: 12px; margin: 50px auto; max-width: 700px; }
.report-loading span { animation: load 1.2s ease-in-out infinite alternate; background: #e9ede6; border-radius: 8px; height: 55px; }
.report-loading span:first-child { height: 110px; }
.report-error { margin-top: 42px; }
.retry-button { background: transparent; border: 0; color: var(--bl-forest); cursor: pointer; font-size: 12px; font-weight: 750; margin-top: 12px; padding: 4px 0; text-decoration: underline; text-underline-offset: 3px; }
@keyframes load { to { opacity: .5; } }
@media (max-width: 800px) { .report-layout { grid-template-columns: 1fr; } }
@media (max-width: 570px) {
  .report-main { padding-top: 23px; }
  .report-heading { align-items: flex-start; flex-direction: column; margin: 29px 0 17px; }
  .report-heading h1 { font-size: 40px; }
  .figures-panel, .source-evidence { padding: 16px; }
  .figures-grid { grid-template-columns: 1fr; }
  .panel-heading h2 { font-size: 20px; }
  .report-layout { grid-template-columns: minmax(0, 1fr); }
}
</style>
