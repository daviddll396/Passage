<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { budgetRequest } from '../utils/budgetApi.js';

useHead({ title: 'Ask your PDFs. Check the source.' });
const { public: { apiBase } } = useRuntimeConfig();
const route = useRoute();
const router = useRouter();
const uploadRequest = useState('passage-upload-request', () => '');
const reports = ref([]);
const loading = ref(true);
const error = ref('');
const featured = computed(() => reports.value[0] || null);
const selectedReportId = ref('');
const librarySelection = ref(0);
const selectedReport = computed(() => reports.value.find((report) => report.id === selectedReportId.value) || featured.value);

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

function selectReport(report) {
  selectedReportId.value = report.id;
  librarySelection.value += 1;
}

function requestHeroUpload() {
  uploadRequest.value = 'hero';
  document.getElementById('hero')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function consumeUploadQuery() {
  if (route.query.upload !== '1') return;
  requestHeroUpload();
  const { upload, ...query } = route.query;
  router.replace({ path: route.path, query, hash: route.hash });
}

onMounted(() => {
  loadReports();
  consumeUploadQuery();
});
watch(() => route.query.upload, consumeUploadQuery);

function updatePromptLight(event) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
  const prompt = event.target.closest?.('.passage-prompt');
  if (!prompt) return;
  const bounds = prompt.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  prompt.style.setProperty('--prompt-light-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
  prompt.style.setProperty('--prompt-light-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
}

function resetPromptLight(event) {
  const prompt = event.target.closest?.('.passage-prompt') || event.currentTarget.querySelector('.passage-prompt');
  if (!prompt || prompt.contains(event.relatedTarget)) return;
  prompt.style.removeProperty('--prompt-light-x');
  prompt.style.removeProperty('--prompt-light-y');
}
</script>

<template>
  <PassageShell>
    <main class="bl-main bl-home">
      <section id="hero" class="home-hero" aria-labelledby="home-title">
        <div class="hero-copy">
          <h1 id="home-title"><span class="hero-title-line">Know what <span class="hero-logo-tile" aria-hidden="true"></span> your</span><br><em>documents say.</em></h1>
          <p class="hero-supporting">Ask your PDF a question. Follow the answer back to its source.</p>
        </div>

        <div class="hero-actions">
          <a class="hero-action-primary" href="#reports">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5.5 2.75h6l4 4v10.5h-10a1.5 1.5 0 0 1-1.5-1.5v-11.5a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M11.5 3v4h4M7.5 10h6M7.5 13h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            Try an example
          </a>
          <a class="hero-action-secondary" href="https://github.com/daviddll396/Passage" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.75-1.31-3.75-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.76 2.26 3.82 1.6.1-.72.39-1.21.7-1.49-2.48-.28-5.1-1.24-5.1-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.29-2.62 5.23-5.12 5.51.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg>
            View on GitHub
          </a>
        </div>

        <div class="hero-question-wrap" @pointermove="updatePromptLight" @pointerout="resetPromptLight" @pointerleave="resetPromptLight">
          <PassageAssistant :api-base="apiBase" :report="featured" />
        </div>
      </section>

      <section class="tech-strip" aria-labelledby="tech-strip-title">
        <h2 id="tech-strip-title">Built with tools we trust.</h2>
        <ul class="tech-strip-list" aria-label="Tools used to build Passage">
          <li><img class="tech-strip-icon" src="/brand/technology/nuxt.svg" width="26" height="26" alt="" aria-hidden="true"><span class="tech-strip-wordmark">Nuxt</span></li>
          <li><img class="tech-strip-icon" src="/brand/technology/typescript.svg" width="26" height="26" alt="" aria-hidden="true"><span class="tech-strip-wordmark">TypeScript</span></li>
          <li><img class="tech-strip-icon" src="/brand/technology/express.svg" width="26" height="26" alt="" aria-hidden="true"><span class="tech-strip-wordmark">Express</span></li>
          <li><img class="tech-strip-icon" src="/brand/technology/mysql.svg" width="26" height="26" alt="" aria-hidden="true"><span class="tech-strip-wordmark">MySQL</span></li>
          <li><img class="tech-strip-icon" src="/brand/technology/gemini.svg" width="26" height="26" alt="" aria-hidden="true"><span class="tech-strip-wordmark">Gemini</span></li>
          <li><img class="tech-strip-icon" src="/brand/technology/gcp.svg" width="26" height="26" alt="" aria-hidden="true"><span class="tech-strip-wordmark">GCP</span></li>
        </ul>
      </section>

      <section class="feature-section home-section" aria-labelledby="features-title">
        <div class="home-section-heading">
          <div>
            <h2 id="features-title">Built for closer reading.</h2>
          </div>
          <p>Ask questions, check the source, and keep your PDF in view.</p>
        </div>

        <div class="feature-bento">
          <article class="bento-card bento-card-evidence">
            <span class="bento-index">01</span>
            <div class="bento-icon-wrap" aria-hidden="true">
              <svg class="bento-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <path d="M11 5.5h12l6 6v23H11a2 2 0 0 1-2-2v-25a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M23 6v6h6M14 18h10M14 22.5h8M14 27h5M23 28l3 3 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="bento-card-copy">
              <h3>Answers with evidence</h3>
              <p>Review the supporting passages and page details returned with an answer.</p>
            </div>
          </article>

          <article class="bento-card bento-card-ask">
            <span class="bento-index">02</span>
            <div class="bento-icon-wrap" aria-hidden="true">
            <svg class="bento-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path d="M8 8.5h24v17H19l-7 6v-6H8v-17Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              <path d="M14 15h12M14 20h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            </div>
            <div class="bento-card-copy">
              <h3>Ask in your own words</h3>
              <p>Ask about a sample or an uploaded PDF in plain language.</p>
            </div>
          </article>

          <article class="bento-card bento-card-private">
            <span class="bento-index">03</span>
            <div class="bento-icon-wrap" aria-hidden="true">
            <svg class="bento-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path d="M11 17.5h18v14H11v-14Z" stroke="currentColor" stroke-width="1.5" />
              <path d="M15 17.5v-4a5 5 0 0 1 10 0v4M20 23v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            </div>
            <div class="bento-card-copy">
              <h3>Private by design</h3>
              <p>The original PDF is discarded after processing; private sessions expire after 30 minutes.</p>
            </div>
          </article>

          <article class="bento-card bento-card-upload">
            <span class="bento-index">04</span>
            <div class="bento-icon-wrap" aria-hidden="true">
              <svg class="bento-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <path d="M11 5.5h12l6 6v23H11a2 2 0 0 1-2-2v-25a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M23 6v6h6M14 18h12M14 22.5h12M14 27h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
            <div class="bento-card-copy">
              <h3>Bring your own PDF</h3>
              <p>Upload a PDF up to 8 MB to ask questions about your own document.</p>
            </div>
          </article>
        </div>
      </section>

      <section id="how-it-works" class="process-section" aria-labelledby="how-title">
        <div class="process-heading">
          <h2 id="how-title">From your question to the source.</h2>
          <p>Keep the document in view from the first question to the cited passage.</p>
        </div>
        <div class="process-panel">
          <div class="process-copy">
            <h3>Read with the evidence in view.</h3>
            <p>Start with a PDF, ask in everyday language, then open the passage behind each answer.</p>
            <ul class="process-steps">
              <li><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4.2 4.2L19 6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Open a PDF</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4.2 4.2L19 6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Ask in plain language</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4.2 4.2L19 6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Check the source</span></li>
            </ul>
            <a class="hero-action-primary process-cta" href="#reports">Try an example</a>
          </div>
          <div class="process-preview" aria-hidden="true">
            <div class="process-preview-topbar">
              <span class="process-preview-brand">Passage</span>
              <span class="process-preview-label">Illustrative preview</span>
            </div>
            <div class="process-preview-window">
              <div class="process-preview-document">
                <div class="process-preview-document-head"><span>DOCUMENT</span><span>PDF</span></div>
                <div class="process-preview-doc-title"></div>
                <div class="process-preview-lines"><i></i><i></i><i></i><i></i><i></i></div>
                <div class="process-preview-highlight"><i></i><i></i></div>
                <div class="process-preview-lines"><i></i><i></i><i></i></div>
              </div>
              <div class="process-preview-answer">
                <span class="process-preview-eyebrow">SAMPLE QUESTION</span>
                <p class="process-preview-question">What does this section explain?</p>
                <span class="process-preview-eyebrow">ANSWER</span>
                <p class="process-preview-answer-copy">See the explanation beside the passage it came from.</p>
                <div class="process-preview-citation">
                  <div class="process-preview-citation-head"><span>SUPPORTING PASSAGE</span><span class="process-preview-page">Example · p. 12</span></div>
                  <p>Relevant text from your document appears here for review.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reports" class="library-section" aria-labelledby="reports-title" aria-live="polite">
        <div class="library-heading">
          <div class="library-heading-copy">
            <p class="library-eyebrow">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 6.5C10.3 5 7.2 4.5 4.5 5v13.1c2.8-.5 5.5 0 7.5 1.4m0-13C13.7 5 16.8 4.5 19.5 5v13.1c-2.8-.5-5.5 0-7.5 1.4m0-13v13.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              The reading room
            </p>
            <h2 id="reports-title">A good place to start.</h2>
            <p class="library-intro">Browse public reports, inspect their sources, and ask questions in your own words.</p>
          </div>
          <button type="button" class="hero-action-primary library-upload" @click="requestHeroUpload">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 2.75h5.5l3.75 3.75v10a.75.75 0 0 1-.75.75h-9a.75.75 0 0 1-.75-.75v-13a.75.75 0 0 1 .75-.75Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M11.5 3v4h4M10 13V9m0 0-2 2m2-2 2 2" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Upload a PDF
          </button>
        </div>

        <div v-if="loading" class="library-loading">
          <p class="library-loading-status" role="status"><span class="passage-spinner" aria-hidden="true"></span>Loading example documents</p>
          <div class="library-grid">
            <article v-for="item in 2" :key="item" class="report-placeholder" aria-hidden="true">
              <span class="placeholder-source"></span>
              <span class="placeholder-title"></span>
              <span class="placeholder-title-short"></span>
              <span class="placeholder-body"></span>
              <span class="placeholder-body-short"></span>
              <div class="placeholder-actions"><span class="placeholder-action"></span><span class="placeholder-action-secondary"></span></div>
            </article>
          </div>
        </div>
        <div v-else-if="error" class="bl-state library-unavailable" role="status">
          <svg class="library-state-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 12.5c-4.1-3.7-11.4-4.4-17.5-3.3v27.1c6.5-1.1 13-.2 17.5 2.9m0-26.7c4.1-3.7 11.4-4.4 17.5-3.3v27.1c-6.5-1.1-13-.2-17.5 2.9m0-26.7v27.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div class="library-state-copy">
            <span class="library-state-eyebrow">PUBLIC REPORTS</span>
            <strong>We couldn’t open the reading room.</strong>
            <p>The public report list did not load. Try again in a moment, or upload a PDF instead.</p>
          </div>
          <div class="library-error-actions">
            <button type="button" class="retry-button" @click="loadReports">Try again</button>
            <button type="button" class="library-upload-link" @click="requestHeroUpload">Upload a PDF</button>
          </div>
        </div>
        <div v-else-if="reports.length" class="library-grid" :class="{ 'single-report': reports.length === 1 }">
          <BudgetReportCard v-for="report in reports" :key="report.id" :report="report" selectable :selected="report.id === selectedReport?.id" @select="selectReport" />
        </div>
        <div v-else class="bl-state library-empty">
          <svg class="library-state-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 12.5c-4.1-3.7-11.4-4.4-17.5-3.3v27.1c6.5-1.1 13-.2 17.5 2.9m0-26.7c4.1-3.7 11.4-4.4 17.5-3.3v27.1c-6.5-1.1-13-.2-17.5 2.9m0-26.7v27.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div class="library-state-copy">
            <span class="library-state-eyebrow">PUBLIC REPORTS</span>
            <strong>No sample reports are available yet.</strong>
            <p>Upload a PDF to ask questions and follow the cited passages.</p>
          </div>
          <button type="button" class="bl-button bl-button-primary library-empty-upload" @click="requestHeroUpload">Upload a PDF</button>
        </div>

        <section class="library-workspace" aria-labelledby="library-assistant-title">
          <div class="library-assistant-heading">
            <div>
              <p class="library-assistant-eyebrow">YOUR READING ROOM</p>
              <h3 id="library-assistant-title">Ask this document</h3>
              <p v-if="loading" class="library-selected-source library-selected-source-loading" aria-hidden="true"><span></span></p>
              <p v-else-if="selectedReport" class="library-selected-source"><strong>{{ selectedReport.title }}</strong><span> · {{ selectedReport.sourceName || selectedReport.organization || 'Public example' }}</span></p>
              <p v-else class="library-selected-source">Upload a PDF to start a private conversation.</p>
            </div>
          </div>
          <PassageAssistant :key="`${selectedReport?.id || 'library'}-${librarySelection}`" instance-id="library" :api-base="apiBase" :report="selectedReport" :show-attach="false" />
        </section>
      </section>

      <section class="faq-section home-section" aria-labelledby="faq-title">
        <div class="home-section-heading faq-heading">
          <div>
            <p class="faq-eyebrow">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 6.2C9.9 4.7 6.7 4.4 4 5.2v13.1c2.9-.7 5.6-.2 8 1.1m0-13.2c2.1-1.5 5.3-1.8 8-.9v13.1c-2.9-.7-5.6-.2-8 1.1m0-13.2v13.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.7 10.2a1.35 1.35 0 1 1 2.4.8c-.5.5-1.1.7-1.1 1.6m0 2h.01" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              A few answers
            </p>
            <h2 id="faq-title">A few things worth knowing.</h2>
            <p class="faq-support">Find out what you can ask, how your PDF is handled, and when a private session expires.</p>
          </div>
        </div>
        <div class="faq-list">
          <details>
            <summary><span class="faq-number" aria-hidden="true">01</span><span>What can I ask about a document?</span></summary>
            <p>Ask about details in the document. Passage uses the extracted information to answer and shows supporting passages when it finds them. If the available evidence does not support an answer, it says so.</p>
          </details>
          <details>
            <summary><span class="faq-number" aria-hidden="true">02</span><span>Can I use my own PDF?</span></summary>
            <p>Yes. Use any Upload a PDF action to attach a file up to 8 MB. Your private session expires after 30 minutes.</p>
          </details>
          <details>
            <summary><span class="faq-number" aria-hidden="true">03</span><span>Does Passage keep my original PDF?</span></summary>
            <p>No. The API sends the PDF for processing, then discards the original file. Uploaded documents are not added to the public sample library.</p>
          </details>
        </div>
      </section>

      <section class="closing-cta" aria-labelledby="closing-title">
        <div class="closing-copy">
          <p class="closing-eyebrow">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 6.5C10.3 5 7.2 4.5 4.5 5v13.1c2.8-.5 5.5 0 7.5 1.4m0-13C13.7 5 16.8 4.5 19.5 5v13.1c-2.8-.5-5.5 0-7.5 1.4m0-13v13.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            READY FOR A CLOSER LOOK?
          </p>
          <h2 id="closing-title">Find the passage that answers it.</h2>
          <p class="closing-support">Bring your PDF, ask a question, and follow the answer back to its source.</p>
          <div class="closing-actions">
            <button type="button" class="closing-action closing-action-upload" @click="requestHeroUpload">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5.5 2.75h6l4 4v10.5h-10a1.5 1.5 0 0 1-1.5-1.5v-11.5a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M11.5 3v4h4M7.5 10h6M7.5 13h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
              Upload a PDF
            </button>
            <a href="#reports" class="closing-action closing-action-example">
              Try an example
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.75 10h12.5m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div>
      </section>
    </main>
  </PassageShell>
</template>
