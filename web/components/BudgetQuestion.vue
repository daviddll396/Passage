<script setup>
import { ref, watch } from 'vue';
import { budgetRequest } from '../utils/budgetApi.js';

const props = defineProps({
  apiBase: { type: String, required: true },
  askPath: { type: String, required: true },
  sourceLabel: { type: String, default: '' },
  suggestions: { type: Array, default: () => [] },
  title: { type: String, default: 'Ask this document' },
  placeholder: { type: String, default: 'What would you like to know about this document?' },
  compact: { type: Boolean, default: false },
});

const question = ref('');
const answer = ref('');
const citations = ref([]);
const abstained = ref(false);
const error = ref('');
const loading = ref(false);

watch(() => props.askPath, () => {
  question.value = '';
  answer.value = '';
  citations.value = [];
  abstained.value = false;
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
  abstained.value = false;
  try {
    const result = await budgetRequest(props.apiBase, props.askPath, {
      method: 'POST',
      body: { question: text },
    });
    answer.value = result.answer;
    citations.value = Array.isArray(result.citations) ? result.citations : [];
    abstained.value = result.abstained === true;
  } catch (cause) {
    error.value = cause.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="question-card bl-panel" :class="{ 'question-card-compact': compact }" aria-labelledby="ask-title">
    <div class="question-intro">
      <h2 id="ask-title">{{ title }}</h2>
    </div>

    <form class="question-form" @submit.prevent="ask()">
      <label class="sr-only" for="report-question">Ask a question about this document</label>
      <textarea
        id="report-question"
        v-model="question"
        maxlength="1000"
        :rows="compact ? 2 : 4"
        :placeholder="placeholder"
        :disabled="loading"
      ></textarea>
      <div class="question-form-bottom">
        <span v-if="sourceLabel" class="source-context">Source · <strong>{{ sourceLabel }}</strong></span>
        <button class="bl-button bl-button-primary" type="submit" :disabled="loading || !question.trim()">
          {{ loading ? 'Checking the source…' : 'Ask question' }}
        </button>
      </div>
    </form>

    <div v-if="suggestions.length" class="question-suggestions" aria-label="Suggested questions">
      <span>Try asking</span>
      <button v-for="suggestion in suggestions" :key="suggestion" type="button" :disabled="loading" @click="ask(suggestion)">{{ suggestion }}</button>
    </div>

    <p v-if="error" class="question-error" role="alert">{{ error }}</p>

    <div v-if="answer" class="answer-panel" aria-live="polite">
      <div class="answer-copy-wrap">
        <p class="answer-copy">{{ answer }}</p>
      </div>
      <div v-if="citations.length" class="citation-list">
        <p class="citation-heading">Supporting evidence</p>
        <article v-for="(citation, index) in citations" :key="`${citation.kind || 'document'}-${citation.page}-${index}`" class="citation-card">
          <span class="citation-label">{{ citation.label || 'Source passage' }}</span>
          <p v-if="citation.kind === 'metadata'">{{ citation.value }}</p>
          <p v-else>“{{ citation.quote }}”</p>
          <small>{{ citation.kind === 'metadata' ? 'Document listing metadata' : citation.page == null ? 'Source page not identified' : `Page ${citation.page}` }}</small>
        </article>
      </div>
      <p v-else-if="!abstained" class="no-citation">No supporting passage was returned.</p>
    </div>
  </section>
</template>
