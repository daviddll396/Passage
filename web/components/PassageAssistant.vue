<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue';
import { budgetRequest } from '../utils/budgetApi.js';

const props = defineProps({
  apiBase: { type: String, required: true },
  report: { type: Object, default: null },
});

const prompt = ref('');
const turns = ref([]);
const conversationLog = ref(null);
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
const maxBytes = 8 * 1024 * 1024;
const canAsk = computed(() => Boolean(attached.value?.id || props.report?.id));
const uploadRequest = useState('passage-upload-request', () => false);

watch(turns, () => {
  nextTick(() => {
    if (conversationLog.value) conversationLog.value.scrollTop = conversationLog.value.scrollHeight;
  });
}, { deep: true, flush: 'post' });

function openUploadDialog() {
  uploadError.value = '';
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
  uploadDialog.value?.showModal();
}

watch(uploadRequest, (requested) => {
  if (!requested) return;
  openUploadDialog();
  uploadRequest.value = false;
});

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
  attached.value = null;
  sourcePdf.value = null;
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
  } catch (cause) {
    uploadError.value = cause.message;
  } finally {
    uploading.value = false;
  }
}

function revealAnswer(turn, answer) {
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

  const path = attached.value?.id
    ? `/budget/uploads/${encodeURIComponent(attached.value.id)}/ask`
    : `/budget/reports/${encodeURIComponent(props.report.id)}/ask`;
  const turn = reactive({
    question,
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
      body: { question },
    });
    if (result.abstained === true && attached.value?.id && sourcePdf.value) {
      result = await budgetRequest(props.apiBase, `/budget/uploads/${encodeURIComponent(attached.value.id)}/ask-source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/pdf', 'X-Passage-Question': question },
        body: sourcePdf.value,
      });
    }
    turn.citations = Array.isArray(result.citations) ? result.citations : [];
    turn.abstained = result.abstained === true;
    revealAnswer(turn, result.answer || 'No answer was returned.');
  } catch (cause) {
    turn.error = cause.message;
    turn.status = 'error';
  } finally {
    busy.value = false;
  }
}

function onEnter(event) {
  if (event.shiftKey) return;
  event.preventDefault();
  sendPrompt();
}

function onDialogCancel(event) {
  if (uploading.value) event.preventDefault();
}

onBeforeUnmount(() => typingTimers.forEach((timer) => window.clearInterval(timer)));
</script>

<template>
  <div class="passage-assistant" :class="{ 'has-conversation': turns.length }">
    <div v-if="turns.length" ref="conversationLog" class="assistant-conversation" role="log" aria-label="Document conversation" tabindex="0">
      <article v-for="(turn, index) in turns" :key="index" class="assistant-turn">
        <p class="conversation-question">{{ turn.question }}</p>
        <div class="conversation-answer" :aria-live="turn.status === 'typing' ? 'off' : 'polite'">
          <div v-if="turn.status === 'loading'" class="answer-loading" role="status">
            <span>Looking through the document</span>
            <span class="loading-track" aria-hidden="true"><span></span></span>
          </div>
          <p v-else-if="turn.error" class="conversation-error" role="alert">{{ turn.error }}</p>
          <template v-else>
            <p class="assistant-answer">{{ turn.visibleAnswer }}<span v-if="turn.status === 'typing'" class="typing-caret" aria-hidden="true"></span></p>
            <div v-if="turn.status === 'done' && turn.citations.length" class="assistant-citations">
              <p>Supporting passages</p>
              <article v-for="(citation, citationIndex) in turn.citations" :key="`${citation.page}-${citationIndex}`" class="assistant-citation" tabindex="0">
                <span>{{ citation.label || 'Source passage' }}</span>
                <blockquote v-if="citation.kind === 'summary' || citation.kind === 'metadata'">{{ citation.value }}</blockquote>
                <blockquote v-else>“{{ citation.quote }}”</blockquote>
                <small>{{ citation.kind === 'summary' ? 'Extracted summary, not a page quotation' : citation.kind === 'metadata' ? 'Document listing metadata' : citation.page == null ? 'Source page not identified' : `Page ${citation.page}` }}</small>
              </article>
            </div>
            <p v-else-if="turn.status === 'done' && !turn.abstained" class="citation-note">No supporting passage was returned.</p>
          </template>
        </div>
      </article>
    </div>

    <form class="passage-prompt" @submit.prevent="sendPrompt">
      <div v-if="attached" class="attached-file">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 2.75h6l4 4v10.5H5a2 2 0 0 1-2-2v-10.5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.4"/><path d="M11 3v4h4M6.5 11h7M6.5 14h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        <span :title="attached.name">{{ attached.name }}</span>
        <button type="button" aria-label="Remove attached document" @click="removeAttachment">×</button>
      </div>
      <label class="sr-only" for="passage-prompt">Ask a question about the document</label>
      <textarea
        id="passage-prompt"
        v-model="prompt"
        rows="2"
        maxlength="1000"
        :disabled="busy"
        :placeholder="attached ? `Ask about ${attached.name}` : report ? `Ask about ${report.title}` : 'Upload a PDF to get started'"
        @keydown.enter.exact="onEnter"
      ></textarea>
      <div class="prompt-actions">
        <button class="attach-button" type="button" :disabled="busy" @click="openUploadDialog">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7 10.7 4.6-4.6a2.4 2.4 0 0 1 3.4 3.4l-6.3 6.3a4 4 0 0 1-5.7-5.7l6.1-6.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          <span>{{ attached ? 'Replace PDF' : 'Add a PDF' }}</span>
        </button>
        <span class="prompt-source">{{ attached ? 'Private document' : report ? report.title : 'Choose an example or upload a PDF' }}</span>
        <button class="send-button" type="submit" :disabled="busy || !prompt.trim() || !canAsk" aria-label="Send prompt">
          <span v-if="busy">Thinking</span>
          <span v-else>Send</span>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 15V5m0 0L6 9m4-4 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </form>

    <dialog ref="uploadDialog" class="upload-dialog" aria-labelledby="upload-dialog-title" @cancel="onDialogCancel">
      <div class="upload-dialog-head">
        <div>
          <p class="upload-dialog-kicker">Private document</p>
          <h2 id="upload-dialog-title">Add a PDF</h2>
        </div>
        <button class="dialog-close" type="button" aria-label="Close upload dialog" :disabled="uploading" @click="uploadDialog?.close()">×</button>
      </div>
      <label class="dialog-dropzone" :class="{ 'is-dragging': dragging }" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @drop.prevent="dragging = false; chooseFile($event.dataTransfer?.files?.[0])">
        <input ref="fileInput" class="file-input" type="file" accept="application/pdf,.pdf" aria-label="Choose a PDF file" :aria-invalid="Boolean(uploadError)" @change="onFileChange">
        <svg viewBox="0 0 38 38" fill="none" aria-hidden="true"><path d="M10 4h12l7 7v22H10a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M22 4v7h7M14 22l5-5 5 5m-5-5v11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <strong>{{ selectedFile ? selectedFile.name : 'Choose a PDF or drop it here' }}</strong>
        <span>{{ selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF files up to 8 MB' }}</span>
      </label>
      <p v-if="uploadError" class="upload-dialog-error" role="alert">{{ uploadError }}</p>
      <p class="upload-dialog-privacy">This tab keeps the original PDF and can resend it when the extracted details do not answer a question. The server discards each PDF after processing it. This private session expires after 30 minutes.</p>
      <div class="upload-dialog-actions">
        <button class="dialog-cancel" type="button" :disabled="uploading" @click="uploadDialog?.close()">Cancel</button>
        <button class="dialog-confirm" type="button" :disabled="!selectedFile || uploading" @click="uploadPdf">{{ uploading ? 'Reading the PDF…' : 'Attach document' }}</button>
      </div>
      <div v-if="uploading" class="loading-track upload-progress" role="status" aria-label="Reading PDF"><span></span></div>
    </dialog>
  </div>
</template>
