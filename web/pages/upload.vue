<script setup>
import { ref } from 'vue';
import { budgetRequest } from '../utils/budgetApi.js';

useHead({ title: 'Analyze a PDF' });
const { public: { apiBase } } = useRuntimeConfig();
const input = ref(null);
const selectedFile = ref(null);
const report = ref(null);
const uploadId = ref('');
const loading = ref(false);
const error = ref('');
const dragging = ref(false);
const maxBytes = 8 * 1024 * 1024;

function chooseFile(file) {
  error.value = '';
  report.value = null;
  uploadId.value = '';
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    selectedFile.value = null;
    error.value = 'Choose a PDF file to continue.';
    return;
  }
  if (file.size > maxBytes) {
    selectedFile.value = null;
    error.value = 'This PDF is larger than 8 MB. Choose a smaller file.';
    return;
  }
  selectedFile.value = file;
}

function onFileChange(event) {
  chooseFile(event.target.files?.[0]);
}

function clearFile() {
  selectedFile.value = null;
  if (input.value) input.value.value = '';
}

function onDrop(event) {
  dragging.value = false;
  chooseFile(event.dataTransfer?.files?.[0]);
}

async function analyzeReport() {
  if (!selectedFile.value || loading.value) return;
  loading.value = true;
  error.value = '';
  try {
    const result = await budgetRequest(apiBase, '/budget/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/pdf' },
      body: selectedFile.value,
    });
    report.value = result.report;
    uploadId.value = result.uploadId;
    selectedFile.value = null;
    if (input.value) input.value.value = '';
  } catch (cause) {
    error.value = cause.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <BudgetShell>
    <main class="bl-main upload-main">
      <NuxtLink class="back-link" to="/#reports"><span aria-hidden="true">←</span> Report library</NuxtLink>

      <section class="upload-hero" aria-labelledby="upload-title">
        <div class="upload-heading">
          <p class="bl-kicker">Private report analysis</p>
          <h1 id="upload-title">Bring a report.<br><span>Read what it says.</span></h1>
          <p>Upload a public budget PDF to extract key figures, then ask about the report and inspect the supporting evidence.</p>
        </div>
        <div class="upload-art" aria-hidden="true">
          <img src="/images/budgetlens-report-folder.png" alt="" fetchpriority="high">
        </div>
      </section>

      <div class="upload-layout">
        <section class="upload-workspace" aria-label="Upload a budget report">
          <div v-if="!report" class="upload-card bl-panel">
            <div class="upload-card-head">
              <div>
                <p class="bl-kicker">Your source document</p>
                <h2>Choose a PDF to analyze</h2>
              </div>
              <span class="private-tag">Private session</span>
            </div>

            <label
              class="drop-zone"
              :class="{ 'is-dragging': dragging, 'has-file': selectedFile }"
              @dragover.prevent="dragging = true"
              @dragleave.prevent="dragging = false"
              @drop.prevent="onDrop"
            >
              <input ref="input" class="file-input" type="file" accept="application/pdf,.pdf" aria-label="Choose a PDF file" :aria-invalid="Boolean(error)" @change="onFileChange">
              <svg class="upload-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M15 6.5h13l9 9v24H15a4 4 0 0 1-4-4v-25a4 4 0 0 1 4-4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="M28 7v9h9M20 27h12M20 32h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M24 22v-7m0 0-3 3m3-3 3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <strong>{{ selectedFile ? selectedFile.name : 'Drop your PDF here' }}</strong>
              <span>{{ selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to analyze` : 'or choose a file from your device' }}</span>
              <span v-if="!selectedFile" class="browse-label">PDF only · Up to 8 MB</span>
            </label>

            <p v-if="error" class="upload-error" role="alert">{{ error }}</p>
            <div class="upload-actions">
              <button class="bl-button bl-button-primary" type="button" :disabled="!selectedFile || loading" @click="analyzeReport">
                {{ loading ? 'Reading your report…' : 'Extract report details' }}
              </button>
              <button v-if="selectedFile" class="clear-file" type="button" :disabled="loading" @click="clearFile">Remove file</button>
            </div>
            <p class="upload-privacy">The PDF is sent to Gemini for extraction, then discarded by BudgetLens. It is not added to the public library.</p>
          </div>

          <section v-else class="extracted-report bl-panel" aria-labelledby="extracted-title">
            <div class="extracted-top">
              <div>
                <p class="bl-kicker">Extraction complete</p>
                <p class="extracted-session">This private report session expires after 30 minutes.</p>
              </div>
              <button class="start-over" type="button" @click="report = null; uploadId = ''; error = ''">Analyze another PDF</button>
            </div>
            <p class="bl-kicker">Extracted from your document</p>
            <h2 id="extracted-title">{{ report.title || 'Budget report' }}</h2>
            <p class="extracted-meta">{{ [report.organization, report.period].filter(Boolean).join(' · ') || 'Report details were not stated in the document.' }}</p>
            <p v-if="report.summary" class="extracted-summary">{{ report.summary }}</p>

            <div v-if="report.metrics?.length" class="extracted-metrics">
              <article v-for="metric in report.metrics" :key="metric.label" class="extracted-metric">
                <span>{{ metric.label }}</span>
                <strong>{{ metric.value }} <small>{{ metric.unit }}</small></strong>
                <small class="metric-page">{{ metric.sourcePage == null ? 'Source page not identified' : `Page ${metric.sourcePage}` }}</small>
              </article>
            </div>
            <div v-else class="bl-state extracted-empty">
              <strong>No structured figures were extracted</strong>
              <p>You can still ask a question about the text the model could read.</p>
            </div>

            <div v-if="report.evidence?.length" class="extracted-evidence">
              <p class="evidence-heading">Evidence found in the document</p>
              <blockquote v-for="(item, index) in report.evidence" :key="`${item.page}-${index}`" class="source-passage">
                <span>{{ item.label || 'Extracted passage' }}</span>
                <p>“{{ item.quote }}”</p>
                <small>{{ item.page == null ? 'Source page not identified' : `Page ${item.page}` }}</small>
              </blockquote>
            </div>
          </section>

          <BudgetQuestion
            v-if="uploadId"
            class="upload-question"
            :api-base="apiBase"
            :ask-path="`/budget/uploads/${encodeURIComponent(uploadId)}/ask`"
            :suggestions="['What are the main figures?', 'What does this report not explain?']"
          />
        </section>

        <aside class="upload-aside">
          <div class="aside-card dark-aside">
            <p class="aside-label">What you get</p>
            <h2>A clear answer, with a trail back to the page.</h2>
            <ul>
              <li>Key figures and reporting period</li>
              <li>Relevant passages from the PDF</li>
              <li>Answers with page citations when available</li>
              <li>A clear response when evidence is missing</li>
            </ul>
          </div>
          <div class="aside-card privacy-aside">
            <p class="bl-kicker">Privacy and expiry</p>
            <h3>Your document stays out of the library.</h3>
            <p>BudgetLens sends the PDF to Gemini for analysis, then discards the file. Extracted report data and questions expire after 30 minutes.</p>
          </div>
        </aside>
      </div>
    </main>
  </BudgetShell>
</template>
