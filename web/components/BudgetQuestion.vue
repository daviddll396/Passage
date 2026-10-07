<script setup>
import { ref, watch } from 'vue';
import { budgetRequest } from '../utils/budgetApi.js';

const props = defineProps({
  apiBase: { type: String, required: true },
  askPath: { type: String, required: true },
  suggestions: { type: Array, default: () => [] },
});

const question = ref('');
const answer = ref('');
const citations = ref([]);
const error = ref('');
const loading = ref(false);

watch(() => props.askPath, () => {
  question.value = '';
  answer.value = '';
  citations.value = [];
  error.value = '';
});

async function ask(value = question.value) {
  const text = value.trim();
  if (!text || loading.value) return;
  question.value = text;
  loading.value = true;
  error.value = '';
  answer.value = '';
  citations.value = [];
  try {
    const result = await budgetRequest(props.apiBase, props.askPath, {
      method: 'POST',
      body: { question: text },
    });
    answer.value = result.answer;
    citations.value = Array.isArray(result.citations) ? result.citations : [];
  } catch (cause) {
    error.value = cause.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="question-card bl-card" aria-labelledby="ask-title">
    <div class="question-intro">
      <span class="question-mark" aria-hidden="true">✳</span>
      <div>
        <p class="bl-overline">Ask the document</p>
        <h2 id="ask-title">Get an answer you can check.</h2>
        <p>Answers use this report only. Each response includes the supporting passage.</p>
      </div>
    </div>

    <form class="question-form" @submit.prevent="ask()">
      <label class="sr-only" for="report-question">Ask a question about this report</label>
      <textarea id="report-question" v-model="question" maxlength="1000" rows="3" placeholder="Ask about a figure, period, or what the report says…" :disabled="loading"></textarea>
      <div class="question-form-bottom">
        <span>Gemini answers only when you ask.</span>
        <button class="bl-button bl-button-primary" type="submit" :disabled="loading || !question.trim()">
          {{ loading ? 'Reading the report…' : 'Ask question' }} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </form>

    <div v-if="suggestions.length" class="question-suggestions" aria-label="Suggested questions">
      <span>Try asking</span>
      <button v-for="suggestion in suggestions" :key="suggestion" type="button" :disabled="loading" @click="ask(suggestion)">{{ suggestion }}</button>
    </div>

    <p v-if="error" class="question-error" role="alert">{{ error }}</p>

    <div v-if="answer" class="answer-panel" aria-live="polite">
      <p class="answer-label">Answer</p>
      <p class="answer-copy">{{ answer }}</p>
      <div v-if="citations.length" class="citation-list">
        <p class="citation-heading">Evidence in the report</p>
        <blockquote v-for="(citation, index) in citations" :key="`${citation.page}-${index}`">
          <span>{{ citation.label || 'Source passage' }}</span>
          <p v-if="citation.kind === 'metadata'">{{ citation.value }}</p>
          <p v-else>“{{ citation.quote }}”</p>
          <small>{{ citation.kind === 'metadata' ? 'Report listing metadata' : citation.page == null ? 'Source page not identified' : `Page ${citation.page}` }}</small>
        </blockquote>
      </div>
      <p v-else class="no-citation">No supporting passage was returned. Treat this answer as unverified.</p>
    </div>
  </section>
</template>

<style scoped>
.question-card { padding: 23px; }
.question-intro { align-items: flex-start; display: flex; gap: 14px; }
.question-mark { align-items: center; background: var(--bl-forest); border-radius: 11px; color: var(--bl-lime); display: flex; flex: 0 0 38px; font-size: 17px; height: 38px; justify-content: center; }
.question-intro .bl-overline { font-size: 9px; }
.question-intro h2 { color: var(--bl-ink); font-size: 23px; letter-spacing: -.045em; line-height: 1.1; margin: 7px 0; }
.question-intro > div > p:last-child { color: var(--bl-muted); font-size: 12px; line-height: 1.6; margin: 0; }
.question-form { background: #fafbf9; border: 1px solid #dce2d9; border-radius: 11px; margin-top: 22px; padding: 13px; }
.question-form textarea { background: transparent; border: 0; color: var(--bl-ink); font-size: 14px; line-height: 1.55; outline: 0; resize: vertical; width: 100%; }
.question-form textarea::placeholder { color: #929891; }
.question-form:focus-within { border-color: #6a8d51; box-shadow: 0 0 0 3px #9fe87045; }
.question-form-bottom { align-items: center; border-top: 1px solid #eaede8; display: flex; justify-content: space-between; margin-top: 7px; padding-top: 10px; }
.question-form-bottom > span { color: #81877e; font-size: 10px; }
.question-form-bottom .bl-button { font-size: 11px; min-height: 38px; padding: 0 13px; }
.question-suggestions { align-items: center; display: flex; flex-wrap: wrap; gap: 7px; margin-top: 15px; }
.question-suggestions > span { color: #70776e; font-size: 10px; font-weight: 700; margin-right: 3px; }
.question-suggestions button { background: white; border: 1px solid #dfe4dc; border-radius: 999px; color: #425b33; cursor: pointer; font-size: 10px; padding: 7px 10px; }
.question-suggestions button:hover:not(:disabled) { background: var(--bl-linen); }
.question-error { background: #fff5f2; border: 1px solid #edccc5; border-radius: 8px; color: #8c3c31; font-size: 12px; line-height: 1.5; margin: 15px 0 0; padding: 11px 13px; }
.answer-panel { background: #f3f8ef; border: 1px solid #dce8d2; border-radius: 11px; margin-top: 17px; padding: 16px; }
.answer-label, .citation-heading { color: #42622e; font-size: 10px; font-weight: 800; letter-spacing: .08em; margin: 0; text-transform: uppercase; }
.answer-copy { color: #303a2b; font-size: 14px; line-height: 1.7; margin: 8px 0 0; white-space: pre-line; }
.citation-list { border-top: 1px solid #dce7d6; margin-top: 16px; padding-top: 13px; }
.citation-list blockquote { background: white; border-left: 3px solid #83b65f; border-radius: 0 7px 7px 0; margin: 10px 0 0; padding: 11px 13px; }
.citation-list blockquote > span { color: #405c31; display: block; font-size: 10px; font-weight: 750; }
.citation-list blockquote p { color: #454c43; font-size: 12px; line-height: 1.55; margin: 5px 0; }
.citation-list blockquote small { color: #7a8376; font-size: 10px; }
.no-citation { color: #805e16; font-size: 11px; line-height: 1.5; margin: 11px 0 0; }
.sr-only { clip: rect(0, 0, 0, 0); clip-path: inset(50%); height: 1px; overflow: hidden; position: absolute; white-space: nowrap; width: 1px; }
@media (max-width: 520px) {
  .question-card { padding: 17px; }
  .question-intro h2 { font-size: 20px; }
  .question-form-bottom { align-items: flex-start; flex-direction: column; gap: 10px; }
}
</style>
