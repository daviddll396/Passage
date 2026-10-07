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
    error.value = 'This PDF is larger than 10 MB. Choose a smaller file.';
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
      <NuxtLink class="back-link" to="/">← Back to report library</NuxtLink>
      <section class="upload-heading">
        <p class="bl-overline">Private report analysis</p>
        <h1>Bring a report.<br><span>Ask what it says.</span></h1>
        <p>Upload a public budget PDF to extract its key figures, then ask a question and inspect the cited evidence.</p>
      </section>

      <div class="upload-layout">
        <section class="upload-workspace" aria-label="Upload a budget report">
          <div v-if="!report" class="upload-card bl-card">
            <div class="upload-card-head">
              <div><span class="upload-step">01</span><h2>Choose your PDF</h2></div>
              <span class="private-tag"><span aria-hidden="true">◉</span> Private by default</span>
            </div>

            <label
              class="drop-zone"
              :class="{ 'is-dragging': dragging, 'has-file': selectedFile }"
              @dragover.prevent="dragging = true"
              @dragleave.prevent="dragging = false"
              @drop.prevent="onDrop"
            >
              <input ref="input" type="file" accept="application/pdf,.pdf" @change="onFileChange">
              <span class="upload-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"/></svg></span>
              <strong>{{ selectedFile ? selectedFile.name : 'Drop a PDF here, or browse' }}</strong>
              <span>{{ selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to analyze` : 'PDF only · Up to 8 MB' }}</span>
              <span v-if="!selectedFile" class="browse-label">Choose a file</span>
            </label>

            <p v-if="error" class="upload-error" role="alert">{{ error }}</p>
            <div class="upload-actions">
              <button class="bl-button bl-button-primary" type="button" :disabled="!selectedFile || loading" @click="analyzeReport">
                {{ loading ? 'Reading your report…' : 'Extract report details' }} <span v-if="!loading" aria-hidden="true">↗</span>
              </button>
              <button v-if="selectedFile" class="clear-file" type="button" :disabled="loading" @click="clearFile">Remove file</button>
            </div>
            <div class="upload-privacy"><span class="privacy-check" aria-hidden="true">✓</span><p>The PDF is sent to Gemini for extraction, then discarded by BudgetLens. The extracted report and chat expire after 30 minutes.</p></div>
          </div>

          <section v-else class="extracted-report bl-card" aria-labelledby="extracted-title">
            <div class="extracted-top">
              <span class="extraction-status"><i aria-hidden="true"></i> Report analyzed</span>
              <button class="start-over" type="button" @click="report = null; uploadId = ''; error = ''">Analyze another PDF</button>
            </div>
            <p class="bl-overline">Extracted from your document</p>
            <h2 id="extracted-title">{{ report.title || 'Budget report' }}</h2>
            <p class="extracted-meta">{{ [report.organization, report.period].filter(Boolean).join(' · ') || 'Report details were not stated in the document.' }}</p>
            <p v-if="report.summary" class="extracted-summary">{{ report.summary }}</p>

            <div v-if="report.metrics?.length" class="extracted-metrics">
              <div v-for="metric in report.metrics" :key="metric.label" class="extracted-metric">
                <span>{{ metric.label }}</span><strong>{{ metric.value }} <small>{{ metric.unit }}</small></strong>
                <small class="metric-page">{{ metric.sourcePage == null ? 'Source page not identified' : `Page ${metric.sourcePage}` }}</small>
              </div>
            </div>
            <div v-else class="bl-state extracted-empty"><strong>No structured figures were extracted</strong><p>You can still ask a question about the text the model could read.</p></div>

            <div v-if="report.evidence?.length" class="extracted-evidence">
              <p class="evidence-heading">Evidence found in the document</p>
              <blockquote v-for="(item, index) in report.evidence" :key="`${item.page}-${index}`">
                <span>{{ item.label || 'Extracted passage' }}</span><p>“{{ item.quote }}”</p>
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
            <span class="aside-label">What you get</span>
            <h2>Context with a trail back to the source.</h2>
            <ul>
              <li>Key figures and reporting period</li>
              <li>Evidence snippets from the PDF</li>
              <li>Answers with page citations</li>
              <li>An explicit unknown when evidence is missing</li>
            </ul>
          </div>
          <div class="aside-card privacy-aside">
            <span class="privacy-icon" aria-hidden="true">⌁</span>
            <strong>Your document stays yours.</strong>
            <p>Your PDF is sent to Gemini for analysis, then discarded by BudgetLens. It is never added to the public library.</p>
          </div>
        </aside>
      </div>
    </main>
  </BudgetShell>
</template>

<style scoped>
.upload-main { padding-top: 33px; }
.back-link { color: #657060; font-size: 12px; text-decoration: none; }
.back-link:hover { color: var(--bl-forest); text-decoration: underline; text-underline-offset: 3px; }
.upload-heading { margin: 42px 0 35px; max-width: 700px; }
.upload-heading h1 { color: var(--bl-ink); font-size: clamp(48px, 6.4vw, 74px); letter-spacing: -.08em; line-height: .94; margin: 19px 0 16px; }
.upload-heading h1 span { color: var(--bl-forest); }
.upload-heading > p:last-child { color: var(--bl-muted); font-size: 15px; line-height: 1.65; margin: 0; max-width: 550px; }
.upload-layout { align-items: start; display: grid; gap: 20px; grid-template-columns: minmax(0, 1fr) 290px; }
.upload-workspace { display: grid; gap: 15px; min-width: 0; }
.upload-card, .extracted-report { padding: 24px; }
.upload-card-head { align-items: center; display: flex; justify-content: space-between; margin-bottom: 21px; }
.upload-card-head > div { align-items: center; display: flex; gap: 10px; }
.upload-step { align-items: center; background: var(--bl-forest); border-radius: 50%; color: var(--bl-lime); display: inline-flex; font-size: 9px; font-weight: 800; height: 27px; justify-content: center; width: 27px; }
.upload-card-head h2 { color: var(--bl-ink); font-size: 17px; letter-spacing: -.04em; margin: 0; }
.private-tag { align-items: center; background: var(--bl-linen); border-radius: 999px; color: var(--bl-forest); display: inline-flex; font-size: 10px; font-weight: 700; gap: 6px; padding: 7px 10px; }
.drop-zone { align-items: center; background: #fbfcfa; border: 1.5px dashed #b8c4b1; border-radius: 13px; cursor: pointer; display: flex; flex-direction: column; min-height: 235px; justify-content: center; padding: 23px; text-align: center; transition: background .16s ease, border-color .16s ease; }
.drop-zone:hover, .drop-zone.is-dragging { background: #f1f7ed; border-color: #638b4b; }
.drop-zone.has-file { background: #f5f9f2; border-style: solid; }
.drop-zone input { height: 1px; opacity: 0; overflow: hidden; position: absolute; width: 1px; }
.drop-zone:focus-within { border-color: #638b4b; box-shadow: 0 0 0 3px #9fe87045; }
.upload-icon { align-items: center; background: var(--bl-linen); border-radius: 12px; color: var(--bl-forest); display: flex; height: 48px; justify-content: center; margin-bottom: 15px; width: 48px; }
.upload-icon svg { fill: none; height: 25px; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; width: 25px; }
.drop-zone strong { color: var(--bl-ink); font-size: 14px; max-width: 100%; overflow-wrap: anywhere; }
.drop-zone > span:nth-last-child(2) { color: #7a8376; font-size: 11px; margin-top: 7px; }
.browse-label { color: var(--bl-forest); font-size: 11px; font-weight: 750; margin-top: 13px; text-decoration: underline; text-underline-offset: 3px; }
.upload-error { background: #fff5f2; border: 1px solid #edccc5; border-radius: 8px; color: #8c3c31; font-size: 12px; line-height: 1.5; margin: 13px 0 0; padding: 10px 12px; }
.upload-actions { align-items: center; display: flex; gap: 16px; margin-top: 17px; }
.upload-actions .bl-button { font-size: 12px; min-height: 43px; }
.clear-file, .start-over { background: none; border: 0; color: #657060; cursor: pointer; font-size: 11px; text-decoration: underline; text-underline-offset: 3px; }
.upload-privacy { align-items: flex-start; border-top: 1px solid #edf0ea; display: flex; gap: 9px; margin-top: 20px; padding-top: 14px; }
.privacy-check { align-items: center; background: var(--bl-linen); border-radius: 50%; color: var(--bl-forest); display: inline-flex; flex: 0 0 18px; font-size: 9px; font-weight: 800; height: 18px; justify-content: center; margin-top: 1px; }
.upload-privacy p { color: #778071; font-size: 10px; line-height: 1.55; margin: 0; }
.upload-aside { display: grid; gap: 13px; }
.aside-card { border-radius: 15px; padding: 20px; }
.dark-aside { background: var(--bl-forest); color: white; }
.aside-label { color: var(--bl-lime); font-size: 9px; font-weight: 750; letter-spacing: .12em; text-transform: uppercase; }
.dark-aside h2 { color: white; font-size: 23px; letter-spacing: -.06em; line-height: 1.07; margin: 13px 0 18px; }
.dark-aside ul { border-top: 1px solid #ffffff2b; list-style: none; margin: 0; padding: 9px 0 0; }
.dark-aside li { color: #e0e9db; font-size: 11px; line-height: 1.4; padding: 8px 0 8px 16px; position: relative; }
.dark-aside li::before { background: var(--bl-lime); border-radius: 50%; content: ""; height: 5px; left: 0; position: absolute; top: 13px; width: 5px; }
.privacy-aside { background: var(--bl-fog); }
.privacy-icon { color: var(--bl-forest); display: block; font-size: 25px; line-height: 1; margin-bottom: 14px; }
.privacy-aside strong { color: var(--bl-ink); font-size: 13px; }
.privacy-aside p { color: var(--bl-muted); font-size: 11px; line-height: 1.55; margin: 7px 0 0; }
.extracted-top { align-items: center; border-bottom: 1px solid #edf0ea; display: flex; justify-content: space-between; margin-bottom: 19px; padding-bottom: 12px; }
.extraction-status { align-items: center; color: var(--bl-spruce); display: flex; font-size: 10px; font-weight: 750; gap: 7px; }
.extraction-status i { background: var(--bl-lime); border: 1px solid #609443; border-radius: 50%; height: 7px; width: 7px; }
.extracted-report > .bl-overline { font-size: 9px; }
.extracted-report h2 { color: var(--bl-ink); font-size: 27px; letter-spacing: -.055em; line-height: 1.05; margin: 11px 0 7px; }
.extracted-meta { color: #687264; font-size: 11px; margin: 0; }
.extracted-summary { color: #515a4d; font-size: 13px; line-height: 1.65; margin: 17px 0; }
.extracted-metrics { display: grid; gap: 9px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 20px; }
.extracted-metric { background: #f4f7f1; border-radius: 9px; min-width: 0; padding: 12px; }
.extracted-metric > span { color: #5f695a; display: block; font-size: 10px; }
.extracted-metric strong { color: var(--bl-forest); display: block; font-size: 15px; letter-spacing: -.035em; margin-top: 7px; overflow-wrap: anywhere; }
.extracted-metric strong small { color: #62705b; font-size: 9px; font-weight: 550; }
.metric-page { color: #858b81; display: block; font-size: 9px; margin-top: 6px; }
.extracted-empty { margin-top: 19px; }
.extracted-evidence { border-top: 1px solid #edf0ea; margin-top: 22px; padding-top: 17px; }
.evidence-heading { color: #445b37; font-size: 10px; font-weight: 800; letter-spacing: .08em; margin: 0; text-transform: uppercase; }
.extracted-evidence blockquote { background: #fafbf9; border-left: 3px solid #83b65f; margin: 11px 0 0; padding: 11px 13px; }
.extracted-evidence blockquote span { color: #405c31; font-size: 10px; font-weight: 750; }
.extracted-evidence blockquote p { color: #454c43; font-size: 11px; line-height: 1.55; margin: 5px 0; }
.extracted-evidence blockquote small { color: #7a8376; font-size: 9px; }
.upload-question { margin-top: 1px; }
@media (max-width: 780px) { .upload-layout { grid-template-columns: 1fr; } .upload-aside { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) {
  .upload-main { padding-top: 23px; }
  .upload-heading { margin: 31px 0 27px; }
  .upload-heading h1 { font-size: clamp(47px, 13vw, 62px); }
  .upload-heading > p:last-child { font-size: 13px; }
  .upload-card, .extracted-report { padding: 17px; }
  .private-tag { font-size: 9px; padding: 6px 8px; }
  .upload-card-head h2 { font-size: 15px; }
  .drop-zone { min-height: 205px; padding: 16px; }
  .upload-aside { grid-template-columns: 1fr; }
  .extracted-metrics { grid-template-columns: 1fr; }
}
</style>
