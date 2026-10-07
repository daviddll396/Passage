<script setup>
defineProps({ report: { type: Object, required: true } });
</script>

<template>
  <!-- Card and badge hierarchy adapted from the existing Career1 / shadcnblocks-vue listing pattern in RoleCard.vue. -->
  <article class="report-card bl-card">
    <div class="report-card-top">
      <span class="report-glyph" aria-hidden="true">PDF</span>
      <span class="report-period">{{ report.period || 'Public report' }}</span>
    </div>
    <p class="report-source">{{ report.sourceName || report.organization || 'Source document' }}</p>
    <h3>{{ report.title }}</h3>
    <p class="report-summary">{{ report.summary || 'Open the report to inspect extracted figures and ask a question with citations.' }}</p>
    <div v-if="report.metrics?.length" class="report-metric-preview">
      <span class="metric-spark" aria-hidden="true"></span>
      <span>{{ report.metrics[0].label }}</span>
      <strong>{{ report.metrics[0].value }} <small>{{ report.metrics[0].unit }}</small></strong>
    </div>
    <div class="report-card-bottom">
      <a v-if="report.sourceUrl" :href="report.sourceUrl" target="_blank" rel="noopener noreferrer" class="report-source-link">Open source <span aria-hidden="true">↗</span></a>
      <NuxtLink class="report-open" :to="`/reports/${encodeURIComponent(report.id)}`">Explore report <span aria-hidden="true">→</span></NuxtLink>
    </div>
  </article>
</template>

<style scoped>
.report-card { display: flex; flex-direction: column; min-height: 286px; padding: 20px; transition: border-color .16s ease, transform .16s ease; }
.report-card:hover { border-color: #9eb593; transform: translateY(-2px); }
.report-card-top { align-items: center; display: flex; justify-content: space-between; }
.report-glyph { align-items: center; background: var(--bl-forest); border-radius: 8px; color: var(--bl-lime); display: inline-flex; font-size: 9px; font-weight: 800; height: 32px; justify-content: center; letter-spacing: .04em; width: 32px; }
.report-period { background: #f0f2ee; border-radius: 999px; color: #5d655b; font-size: 10px; font-weight: 650; padding: 6px 9px; }
.report-source { color: var(--bl-spruce); font-size: 10px; font-weight: 750; letter-spacing: .09em; margin: 19px 0 7px; text-transform: uppercase; }
.report-card h3 { color: var(--bl-ink); font-size: 20px; letter-spacing: -.045em; line-height: 1.2; margin: 0; }
.report-summary { color: var(--bl-muted); font-size: 12px; line-height: 1.55; margin: 10px 0 0; }
.report-metric-preview { align-items: center; border-top: 1px solid #edf0eb; color: #5f665d; display: grid; font-size: 10px; gap: 5px 8px; grid-template-columns: 7px minmax(0, 1fr) auto; margin-top: 16px; padding-top: 13px; }
.metric-spark { background: var(--bl-lime); border: 1px solid #6d9a4c; border-radius: 50%; height: 7px; width: 7px; }
.report-metric-preview strong { color: var(--bl-forest); font-size: 11px; }
.report-metric-preview small { color: var(--bl-muted); font-size: 9px; font-weight: 550; }
.report-card-bottom { align-items: center; display: flex; justify-content: space-between; margin-top: auto; padding-top: 17px; }
.report-source-link { color: #66725f; font-size: 10px; text-decoration: underline; text-underline-offset: 3px; }
.report-open { color: var(--bl-forest); font-size: 11px; font-weight: 750; text-decoration: none; }
.report-open:hover { text-decoration: underline; text-underline-offset: 3px; }
</style>
