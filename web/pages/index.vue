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
  <PassageShell>
    <main class="bl-main bl-home">
      <section class="home-hero" aria-labelledby="home-title">
        <div class="hero-copy">
          <h1 id="home-title">Know what your<br><em>documents say.</em></h1>
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

        <div class="hero-question-wrap">
          <PassageAssistant :api-base="apiBase" :report="featured" />
        </div>
      </section>

      <section class="feature-section home-section" aria-labelledby="features-title">
        <div class="home-section-heading">
          <div>
            <h2 id="features-title">Stay close to the source.</h2>
          </div>
          <p>Ask a question, then inspect the passages behind the answer.</p>
        </div>

        <div class="feature-bento">
          <article class="bento-card bento-card-evidence">
            <div class="bento-card-copy">
              <span class="bento-index">Evidence</span>
              <h3>See where an answer comes from.</h3>
              <p>Supporting passages and page details appear with the answer when the document provides them.</p>
            </div>
            <div class="evidence-stack" aria-hidden="true">
              <div class="evidence-sheet evidence-sheet-back"><i></i><i></i><i></i><i></i></div>
              <div class="evidence-sheet evidence-sheet-mid"><i></i><i></i><i></i><i></i></div>
              <div class="evidence-sheet evidence-sheet-front">
                <span class="sheet-label">SUPPORTING PASSAGE</span>
                <i></i><i></i><i></i>
                <span class="sheet-page">Source page</span>
              </div>
              <div class="evidence-answer"><span>Answer</span><small>Evidence</small></div>
            </div>
          </article>

          <article class="bento-card bento-card-ask">
            <svg class="bento-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path d="M8 8.5h24v17H19l-7 6v-6H8v-17Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              <path d="M14 15h12M14 20h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <span class="bento-index">Questions</span>
            <h3>Ask in your own words.</h3>
            <p>Use a public example or attach a PDF and ask what you need to know.</p>
          </article>

          <article class="bento-card bento-card-private">
            <svg class="bento-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path d="M11 17.5h18v14H11v-14Z" stroke="currentColor" stroke-width="1.5" />
              <path d="M15 17.5v-4a5 5 0 0 1 10 0v4M20 23v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <span class="bento-index">Private PDFs</span>
            <h3>Your upload stays temporary.</h3>
            <p>Passage discards the original PDF after processing. The private session expires after 30 minutes.</p>
          </article>
        </div>
      </section>

      <section id="how-it-works" class="process-section" aria-labelledby="how-title">
        <div class="home-section-heading process-heading">
          <div>
            <h2 id="how-title">Question to evidence.</h2>
          </div>
          <p>Keep the document in view from the first question to the cited passage.</p>
        </div>
        <div class="process-grid">
          <article class="process-item">
            <svg viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M10 4.75h10.5L27 11v20H10a2 2 0 0 1-2-2V6.75a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M20 5v6h6M13 17h9M13 21h11M13 25h7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <h3>Open a document</h3>
            <p>Choose a public example or add a PDF of your own.</p>
          </article>
          <article class="process-item">
            <svg viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M6 8h24v17H17l-7 6v-6H6V8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 14h12M12 19h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <h3>Ask a question</h3>
            <p>Write what you want to understand in plain language.</p>
          </article>
          <article class="process-item">
            <svg viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M7 8h22v20H7z" stroke="currentColor" stroke-width="1.4"/><path d="M12 14h12M12 18h8M12 22h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="m23 25 2 2 4-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <h3>Check the passage</h3>
            <p>Review the evidence attached to the answer.</p>
          </article>
        </div>
      </section>

      <section id="reports" class="library-section" aria-labelledby="reports-title" aria-live="polite">
        <div class="section-heading">
          <div>
            <h2 id="reports-title">Try a sample document.</h2>
          </div>
          <NuxtLink to="/upload" class="section-link">Upload a PDF</NuxtLink>
        </div>

        <div v-if="loading" class="library-grid" aria-label="Loading reports">
          <div v-for="item in 2" :key="item" class="report-placeholder" aria-hidden="true"><span></span><span></span><span></span></div>
        </div>
        <div v-else-if="error" class="bl-state library-unavailable" role="status">
          <div>
            <strong>Sample reports are unavailable right now.</strong>
            <p>Try again, or upload your own PDF.</p>
          </div>
          <div class="library-error-actions">
            <button type="button" class="retry-button" @click="loadReports">Try again</button>
            <NuxtLink to="/upload">Upload a PDF</NuxtLink>
          </div>
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

      <section class="faq-section home-section" aria-labelledby="faq-title">
        <div class="home-section-heading faq-heading">
          <div>
            <h2 id="faq-title">Good to know.</h2>
          </div>
        </div>
        <div class="faq-list">
          <details>
            <summary>What can I ask about a document?</summary>
            <p>Ask about details in the document. Passage answers from the extracted information and shows supporting passages when it finds them. If the available evidence does not support an answer, it says so.</p>
          </details>
          <details>
            <summary>Can I use my own PDF?</summary>
            <p>Yes. Upload a PDF up to 8 MB from the prompt or upload page. Your private session expires after 30 minutes.</p>
          </details>
          <details>
            <summary>Does Passage keep my original PDF?</summary>
            <p>No. The API sends the PDF for processing, then discards the original file. Uploaded documents are not added to the public sample library.</p>
          </details>
        </div>
      </section>

      <section class="closing-cta" aria-labelledby="closing-title">
        <div class="closing-copy">
          <h2 id="closing-title">Find the passage<br>that answers it.</h2>
          <NuxtLink to="/upload" class="bl-button bl-button-accent">Upload a PDF</NuxtLink>
        </div>
      </section>
    </main>
  </PassageShell>
</template>
