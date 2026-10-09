<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue';
import { budgetRequest } from '../utils/budgetApi.js';

const props = defineProps({
  apiBase: { type: String, required: true },
  report: { type: Object, default: null },
  instanceId: { type: String, default: 'hero' },
  showAttach: { type: Boolean, default: true },
});

const prompt = ref('');
const turns = ref([]);
const conversationLog = ref(null);
const promptInput = ref(null);
const busy = ref(false);
const attached = ref(null);
const uploadDialog = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null);
const sourcePdf = shallowRef(null);
const uploading = ref(false);
const uploadError = ref('');
const dragging = ref(false);
const typingTimers = new Set();
let disposed = false;
const maxBytes = 8 * 1024 * 1024;
const canAsk = computed(() => Boolean(attached.value?.id || props.report?.id));
const uploadRequest = useState('passage-upload-request', () => '');

watch(turns, () => {
  nextTick(() => {
    if (conversationLog.value) conversationLog.value.scrollTop = conversationLog.value.scrollHeight;
  });
}, { deep: true, flush: 'post' });

function openUploadDialog() {
  scrollHeroIfNeeded();
  uploadError.value = '';
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
  uploadDialog.value?.showModal();
}

function scrollHeroIfNeeded() {
  if (props.instanceId !== 'hero') return;
  const hero = document.getElementById('hero');
  if (!hero) return;
  const { top, bottom } = hero.getBoundingClientRect();
  if (top >= 0 && bottom <= window.innerHeight) return;
  hero.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

watch(uploadRequest, async (target) => {
  if (target !== props.instanceId) return;
  await nextTick();
  openUploadDialog();
  uploadRequest.value = '';
}, { immediate: true, flush: 'post' });

function chooseFile(file) {
  uploadError.value = '';
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    selectedFile.value = null;
    uploadError.value = 'Choose a PDF file to continue.';
    return;
  }
  if (file.size > maxBytes) {
    selectedFile.value = null;
    uploadError.value = 'This PDF is larger than 8 MB. Choose a smaller file.';
    return;
  }
  selectedFile.value = file;
}

function onFileChange(event) {
  chooseFile(event.target.files?.[0]);
}

function removeAttachment() {
  turns.value = [];
  attached.value = null;
  sourcePdf.value = null;
}

function conversationHistory() {
  const history = turns.value
    .filter((turn) => (turn.status === 'typing' || turn.status === 'done') && !turn.abstained && turn.question.trim() && turn.answer.trim())
    .slice(-3)
    .map((turn) => ({ question: turn.question.trim().slice(0, 300), answer: turn.answer.trim().slice(0, 500) }));
  const fits = () => new TextEncoder().encode(JSON.stringify(history)).byteLength <= 3_000;

  while (history.length > 1 && !fits()) history.shift();
  while (history.length === 1 && !fits()) {
    const newest = history[0];
    if (newest.answer.length > 1) newest.answer = newest.answer.slice(0, -1);
    else if (newest.question.length > 1) newest.question = newest.question.slice(0, -1);
    else break;
  }
  return history;
}

function encodeHistory(history) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(history))));
}

async function uploadPdf() {
  if (!selectedFile.value || uploading.value) return;
  uploading.value = true;
  uploadError.value = '';
  try {
    const file = selectedFile.value;
    const result = await budgetRequest(props.apiBase, '/budget/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/pdf' },
      body: file,
    });
    attached.value = { id: result.uploadId, name: file.name };
    sourcePdf.value = file;
    turns.value = [];
    prompt.value = '';
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
    uploadDialog.value?.close();
    if (props.instanceId === 'hero') {
      await nextTick();
      promptInput.value?.focus({ preventScroll: true });
      scrollHeroIfNeeded();
    }
  } catch (cause) {
    uploadError.value = cause.message;
  } finally {
    uploading.value = false;
  }
}

function revealAnswer(turn, answer) {
  if (disposed) return;
  turn.status = 'typing';
  const increment = Math.max(1, Math.ceil(answer.length / 100));
  let index = 0;
  const timer = window.setInterval(() => {
    index = Math.min(answer.length, index + increment);
    turn.visibleAnswer = answer.slice(0, index);
    if (index >= answer.length) {
      window.clearInterval(timer);
      typingTimers.delete(timer);
      turn.status = 'done';
    }
  }, 24);
  typingTimers.add(timer);
}

async function sendPrompt() {
  const question = prompt.value.trim();
  if (!question || busy.value || !canAsk.value) return;
  const history = conversationHistory();
  const path = attached.value?.id
    ? `/budget/uploads/${encodeURIComponent(attached.value.id)}/ask`
    : `/budget/reports/${encodeURIComponent(props.report.id)}/ask`;

  const turn = reactive({
    question,
    answer: '',
    visibleAnswer: '',
    citations: [],
    status: 'loading',
    error: '',
  });
  turns.value.push(turn);
  prompt.value = '';
  busy.value = true;

  try {
    let result = await budgetRequest(props.apiBase, path, {
      method: 'POST',
      body: { question, history },
    });
    if (result.abstained === true && attached.value?.id && sourcePdf.value) {
      result = await budgetRequest(props.apiBase, `/budget/uploads/${encodeURIComponent(attached.value.id)}/ask-source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/pdf', 'X-Passage-Question': question, 'X-Passage-History': encodeHistory(history) },
        body: sourcePdf.value,
      });
    }
    turn.citations = Array.isArray(result.citations) ? result.citations : [];
    turn.abstained = result.abstained === true;
    turn.kind = result.kind;
    turn.answer = typeof result.answer === 'string' ? result.answer : '';
    revealAnswer(turn, result.answer || 'No answer was returned.');
  } catch (cause) {
    turn.error = cause.message;
    turn.status = 'error';
  } finally {
    busy.value = false;
  }
}

function onEnter(event) {
  if (event.shiftKey || event.isComposing || event.keyCode === 229) return;
  event.preventDefault();
  sendPrompt();
}

function onDialogCancel(event) {
  if (uploading.value) event.preventDefault();
}

onBeforeUnmount(() => {
  disposed = true;
  typingTimers.forEach((timer) => window.clearInterval(timer));
});
</script>

<template>
  <div class="passage-assistant" :class="{ 'has-conversation': turns.length }">
    <Transition name="conversation">
      <div v-if="turns.length" ref="conversationLog" class="assistant-conversation" data-lenis-prevent role="log" aria-label="Document conversation" tabindex="0">
        <div class="assistant-conversation-heading" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none"><path d="M5 2.75h6l4 4v10.5H5a2 2 0 0 1-2-2v-10.5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M11 3v4h4M6.5 11h7M6.5 14h5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>
          <span>Document conversation</span>
        </div>
        <TransitionGroup name="conversation-turn" tag="div" class="assistant-turns">
          <article v-for="(turn, index) in turns" :key="index" class="assistant-turn">
            <p class="conversation-question">{{ turn.question }}</p>
            <div class="assistant-response">
              <span class="assistant-avatar" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none"><path d="M5 2.75h6l4 4v10.5H5a2 2 0 0 1-2-2v-10.5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M11 3v4h4M6.5 11h7M6.5 14h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              </span>
              <div class="assistant-message">
                <span class="assistant-label">Passage</span>
                <div class="conversation-answer" :aria-live="turn.status === 'typing' ? 'off' : 'polite'">
                  <div v-if="turn.status === 'loading'" class="answer-loading" role="status">
                    <span>Looking through the document</span>
                    <span class="passage-spinner" aria-hidden="true"></span>
                  </div>
                  <p v-else-if="turn.error" class="conversation-error" role="alert">{{ turn.error }}</p>
                  <template v-else>
                    <p class="assistant-answer">{{ turn.visibleAnswer }}<span v-if="turn.status === 'typing'" class="typing-caret" aria-hidden="true"></span></p>
                    <div v-if="turn.status === 'done' && turn.citations.length" class="assistant-citations">
                      <p>Supporting passages</p>
                      <article v-for="(citation, citationIndex) in turn.citations" :key="`${citation.page}-${citationIndex}`" class="assistant-citation" tabindex="0">
                        <div class="assistant-citation-heading">
                          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 2.25h5l3 3v8.5H4a1.5 1.5 0 0 1-1.5-1.5v-8.5A1.5 1.5 0 0 1 4 2.25Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M9 2.5v3h3M5.5 8h5M5.5 10.5h3.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
                          <span>{{ citation.label || 'Source passage' }}</span>
                        </div>
                        <blockquote v-if="citation.kind === 'summary' || citation.kind === 'metadata'">{{ citation.value }}</blockquote>
                        <blockquote v-else>“{{ citation.quote }}”</blockquote>
                        <small>
                          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 3.5h11v9h-11z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M5 6h6M5 8.5h6M5 11h3.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
                          {{ citation.kind === 'summary' ? 'Extracted summary, not a page quotation' : citation.kind === 'metadata' ? 'Document listing metadata' : citation.page == null ? 'Source page not identified' : `Page ${citation.page}` }}
                        </small>
                      </article>
                    </div>
                    <p v-else-if="turn.status === 'done' && !turn.abstained && turn.kind !== 'conversation'" class="citation-note">No supporting passage was returned.</p>
                  </template>
                </div>
              </div>
            </div>
          </article>
        </TransitionGroup>
      </div>
    </Transition>

    <form class="passage-prompt" @submit.prevent="sendPrompt">
      <div v-if="attached" class="attached-file">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 2.75h6l4 4v10.5H5a2 2 0 0 1-2-2v-10.5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.4"/><path d="M11 3v4h4M6.5 11h7M6.5 14h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        <span :title="attached.name">{{ attached.name }}</span>
        <button type="button" aria-label="Remove attached document" @click="removeAttachment">×</button>
      </div>
      <label class="sr-only" :for="`${instanceId}-passage-prompt`">Ask a question about the document</label>
      <textarea
        ref="promptInput"
        :id="`${instanceId}-passage-prompt`"
        v-model="prompt"
        rows="2"
        maxlength="1000"
        :placeholder="attached ? `Ask about ${attached.name}` : report ? `Ask about ${report.title}` : 'Choose a sample or add a PDF to ask a question'"
        @keydown.enter.exact="onEnter"
      ></textarea>
      <div class="prompt-actions">
        <button v-if="showAttach" class="attach-button" type="button" :disabled="busy" @click="openUploadDialog">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7 10.7 4.6-4.6a2.4 2.4 0 0 1 3.4 3.4l-6.3 6.3a4 4 0 0 1-5.7-5.7l6.1-6.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          <span>{{ attached ? 'Replace PDF' : 'Add a PDF' }}</span>
        </button>
        <span class="prompt-source">{{ attached ? 'Private document' : report ? report.title : 'No document selected' }}</span>
        <button class="send-button" type="submit" :disabled="busy || !prompt.trim() || !canAsk" :aria-label="busy ? 'Sending question' : 'Send question'">
          <span v-if="busy" class="passage-spinner" aria-hidden="true"></span>
          <svg v-else viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 15V5m0 0L6 9m4-4 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </form>

    <dialog ref="uploadDialog" class="upload-dialog" data-lenis-prevent :aria-labelledby="`${instanceId}-upload-dialog-title`" @cancel="onDialogCancel">
      <div class="upload-dialog-head">
        <div class="upload-dialog-title-group">
          <span class="upload-dialog-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none"><path d="M5 2.75h6l4 4v10.5H5a2 2 0 0 1-2-2v-10.5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M11 3v4h4M6.5 11h7M6.5 14h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          </span>
          <div>
            <p class="upload-dialog-kicker">Private document</p>
            <h2 :id="`${instanceId}-upload-dialog-title`">Add a PDF</h2>
          </div>
        </div>
        <button class="dialog-close" type="button" aria-label="Close upload dialog" :disabled="uploading" @click="uploadDialog?.close()">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
      <label class="dialog-dropzone" :class="{ 'is-dragging': dragging }" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @drop.prevent="dragging = false; chooseFile($event.dataTransfer?.files?.[0])">
        <input ref="fileInput" class="file-input" type="file" accept="application/pdf,.pdf" aria-label="Choose a PDF file" :aria-invalid="Boolean(uploadError)" @change="onFileChange">
        <svg viewBox="0 0 38 38" fill="none" aria-hidden="true"><path d="M10 4h12l7 7v22H10a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M22 4v7h7M14 22l5-5 5 5m-5-5v11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <strong>{{ selectedFile ? selectedFile.name : 'Choose a PDF or drop it here' }}</strong>
        <span>{{ selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF files up to 8 MB' }}</span>
      </label>
      <p v-if="uploadError" class="upload-dialog-error" role="alert">{{ uploadError }}</p>
      <p class="upload-dialog-privacy"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.25 7V5a3.75 3.75 0 0 1 7.5 0v2M3.5 7.25h9v6.5h-9z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 9.75v1.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg><span>This tab keeps the original PDF and can resend it when the extracted details do not answer a question. The server discards each PDF after processing it. This private session expires after 30 minutes.</span></p>
      <div class="upload-dialog-actions">
        <button class="dialog-cancel" type="button" :disabled="uploading" @click="uploadDialog?.close()">Cancel</button>
        <button class="dialog-confirm" type="button" :disabled="!selectedFile || uploading" :aria-busy="uploading" @click="uploadPdf">{{ uploading ? 'Reading the PDF…' : 'Attach document' }}</button>
      </div>
      <div v-if="uploading" class="loading-track upload-progress" role="status" aria-label="Reading PDF"><span></span></div>
    </dialog>
  </div>
</template>
