<script setup>
defineProps({ report: { type: Object, required: true } });
</script>

<template>
  <article class="report-card bl-panel">
    <div class="report-card-copy">
      <div class="record-meta">
        <span class="record-source">{{ report.sourceName || report.organization || 'Source document' }}</span>
        <span class="record-period">{{ report.period || 'Example document' }}</span>
      </div>
      <h3>{{ report.title }}</h3>
      <p class="record-summary">{{ report.summary || 'Open the document to inspect its details and ask a question with citations.' }}</p>
    </div>

    <div v-if="report.metrics?.[0]" class="record-figure">
      <span class="record-figure-label">Source detail</span>
      <p>{{ report.metrics[0].label }}</p>
      <strong>{{ report.metrics[0].value }} <small>{{ report.metrics[0].unit }}</small></strong>
      <small class="record-page">{{ report.metrics[0].sourcePage == null ? 'Source page not identified' : `Page ${report.metrics[0].sourcePage}` }}</small>
    </div>

    <div class="report-card-actions">
      <a v-if="report.sourceUrl" :href="report.sourceUrl" target="_blank" rel="noopener noreferrer" class="source-action">View original report</a>
      <NuxtLink class="report-action" :to="`/reports/${encodeURIComponent(report.id)}`">Read this document <span aria-hidden="true">→</span></NuxtLink>
    </div>
  </article>
</template>
