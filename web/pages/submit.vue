<script setup>
import { computed, reactive, ref } from 'vue';
import { roleRequest } from '../utils/rolesApi.js';

useHead({ title: 'Post a role' });
const { public: { apiBase } } = useRuntimeConfig();
const description = ref('');
const sourceUrl = ref('');
const analyzedDescription = ref('');
const evidence = ref(null);
const questions = ref([]);
const analyzing = ref(false);
const submitting = ref(false);
const errorMessage = ref('');
const confirmation = ref(null);
const editable = reactive({
  title: '', companyName: '', employmentType: '', location: '', workMode: '',
  salaryMin: '', salaryMax: '', salaryCurrency: '', salaryPeriod: '',
  minimumExperienceMonths: '', eligibleCountriesText: '', skillsText: '',
  applicationUrl: '', applicationEmail: '',
});
const hasPreview = computed(() => evidence.value !== null);
const previewMatches = computed(() => hasPreview.value && analyzedDescription.value === description.value.trim());
const canSubmit = computed(() => previewMatches.value && editable.title.trim() && editable.companyName.trim() && description.value.trim() &&
  (editable.location.trim() || editable.workMode) && (editable.applicationUrl.trim() || editable.applicationEmail.trim()));

function editFromExtraction(draft) {
  Object.assign(editable, {
    ...draft,
    salaryMin: draft.salaryMin ?? '',
    salaryMax: draft.salaryMax ?? '',
    minimumExperienceMonths: draft.minimumExperienceMonths ?? '',
    eligibleCountriesText: draft.eligibleCountries?.join(', ') || '',
    skillsText: draft.skills?.join(', ') || '',
    workMode: draft.workMode || '',
  });
}

async function analyzeDescription() {
  const text = description.value.trim();
  if (!text) return;
  analyzing.value = true;
  errorMessage.value = '';
  confirmation.value = null;
  try {
    const result = await roleRequest(apiBase, '/roles/extract', { method: 'POST', body: { description: text } });
    editFromExtraction(result.draft);
    evidence.value = result.evidence;
    questions.value = result.questions;
    analyzedDescription.value = text;
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    analyzing.value = false;
  }
}

function evidenceFor(field) {
  return evidence.value?.[field] || '';
}

function splitList(text) {
  return text.split(',').map((item) => item.trim()).filter(Boolean);
}

async function submitRole() {
  if (!canSubmit.value) return;
  submitting.value = true;
  errorMessage.value = '';
  try {
    confirmation.value = await roleRequest(apiBase, '/roles/submissions', {
      method: 'POST',
      body: {
        draft: {
          title: editable.title.trim(),
          companyName: editable.companyName.trim(),
          employmentType: editable.employmentType.trim() || null,
          location: editable.location.trim() || null,
          workMode: editable.workMode || null,
          salaryMin: editable.salaryMin === '' ? null : Number(editable.salaryMin),
          salaryMax: editable.salaryMax === '' ? null : Number(editable.salaryMax),
          salaryCurrency: editable.salaryCurrency.trim().toUpperCase() || null,
          salaryPeriod: editable.salaryPeriod || null,
          minimumExperienceMonths: editable.minimumExperienceMonths === '' ? null : Number(editable.minimumExperienceMonths),
          eligibleCountries: splitList(editable.eligibleCountriesText).length ? splitList(editable.eligibleCountriesText) : null,
          skills: splitList(editable.skillsText),
          applicationUrl: editable.applicationUrl.trim() || null,
          applicationEmail: editable.applicationEmail.trim() || null,
        },
        description: description.value.trim(),
        sourceUrl: sourceUrl.value.trim() || null,
      },
    });
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div>
    <header class="site-nav">
      <NuxtLink class="brand" to="/" aria-label="OpenRole home"><span class="brand-mark" aria-hidden="true"></span><span>openrole</span></NuxtLink>
      <nav class="nav-links" aria-label="Main navigation"><NuxtLink class="nav-link" to="/">Browse roles</NuxtLink><NuxtLink class="nav-link nav-demo" to="/staff/demo">Staff preview</NuxtLink></nav>
    </header>
    <main class="page-wrap submit-page">
      <section class="submit-intro">
        <p class="eyebrow"><span class="signal-dot" aria-hidden="true"></span> For recruiters</p>
        <h1>Make the next move<br>clear for someone.</h1>
        <p>Paste your job description. OpenRole will suggest the details it can support with the text, then you can edit them before review.</p>
        <div class="review-note"><strong>Every new role is reviewed.</strong><span>Submissions stay pending until an OpenRole staff member approves them.</span></div>
      </section>

      <section class="form-panel" aria-labelledby="paste-title">
        <div class="panel-heading"><div><p class="eyebrow">01 / Start with the source</p><h2 id="paste-title">Paste a job description</h2></div><span class="source-stamp">Your text stays the source</span></div>
        <label class="field-label" for="job-description">Job description <span class="required">Required</span></label>
        <textarea id="job-description" v-model="description" class="textarea source-text" maxlength="8000" rows="8" placeholder="Paste the role description, including the details candidates need to decide whether to apply."></textarea>
        <div class="field-footer"><span>Up to 8,000 characters. Missing details stay blank.</span><span>{{ description.length }} / 8,000</span></div>
        <label class="field-label source-url-label" for="source-url">Original listing URL <span class="optional">Optional</span></label>
        <input id="source-url" v-model="sourceUrl" class="input" type="url" maxlength="2048" placeholder="https://company.com/careers/role">
        <button class="primary-button analyze-button" type="button" :disabled="analyzing || !description.trim() || description.length > 8000" @click="analyzeDescription">
          {{ analyzing ? 'Reading the description…' : hasPreview ? 'Analyze again' : 'Draft role details' }} <span aria-hidden="true">↗</span>
        </button>
        <p class="ai-note">AI suggestions use only facts from the pasted description. Review each field before submitting.</p>
      </section>

      <section v-if="errorMessage" class="state-panel error submission-error" role="alert"><strong>Could not continue</strong><p>{{ errorMessage }}</p></section>
      <section v-if="confirmation" class="confirmation-panel" role="status" aria-live="polite">
        <span class="confirmation-mark" aria-hidden="true">✓</span><div><p class="eyebrow">Sent for review</p><h2>Your role is in the queue.</h2><p>Reference <strong>#{{ confirmation.id }}</strong> · Status: {{ confirmation.status }}. It will appear in public search after staff review.</p><NuxtLink class="secondary-button" to="/">Return to role search</NuxtLink></div>
      </section>

      <section v-if="hasPreview && !confirmation" class="preview-section" aria-labelledby="preview-title">
        <div class="section-heading preview-heading"><div><p class="eyebrow">02 / Check and edit</p><h2 id="preview-title">Suggested role details</h2><p>Each cited line comes from the description above. Edit anything that needs correction.</p></div><span class="pill"><span class="signal-dot" aria-hidden="true"></span> AI draft · needs your review</span></div>
        <p v-if="!previewMatches" class="stale-message" role="status">The description changed after this draft. Run “Analyze again” to refresh its evidence.</p>

        <form class="draft-form" @submit.prevent="submitRole">
          <div class="draft-grid">
            <label class="field"><span class="field-label">Role title <span class="required">Required</span></span><input v-model="editable.title" class="input" maxlength="180" required><small v-if="evidenceFor('title')" class="evidence"><b>Source</b> “{{ evidenceFor('title') }}”</small><small v-else class="evidence missing">No supporting text found. Add this from your own knowledge.</small></label>
            <label class="field"><span class="field-label">Company <span class="required">Required</span></span><input v-model="editable.companyName" class="input" maxlength="180" required><small v-if="evidenceFor('companyName')" class="evidence"><b>Source</b> “{{ evidenceFor('companyName') }}”</small><small v-else class="evidence missing">No supporting text found. Add this from your own knowledge.</small></label>
            <label class="field"><span class="field-label">Location <span class="optional">Location or work style required</span></span><input v-model="editable.location" class="input" maxlength="180" placeholder="Not stated"><small v-if="evidenceFor('location')" class="evidence"><b>Source</b> “{{ evidenceFor('location') }}”</small></label>
            <label class="field"><span class="field-label">Work style</span><select v-model="editable.workMode" class="select"><option value="">Not stated</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select><small v-if="evidenceFor('workMode')" class="evidence"><b>Source</b> “{{ evidenceFor('workMode') }}”</small></label>
            <label class="field"><span class="field-label">Employment type</span><input v-model="editable.employmentType" class="input" maxlength="120" placeholder="Not stated"><small v-if="evidenceFor('employmentType')" class="evidence"><b>Source</b> “{{ evidenceFor('employmentType') }}”</small></label>
            <label class="field"><span class="field-label">Minimum experience (months)</span><input v-model.number="editable.minimumExperienceMonths" class="input" type="number" min="0" max="600" step="1" placeholder="Not stated"><small v-if="evidenceFor('minimumExperienceMonths')" class="evidence"><b>Source</b> “{{ evidenceFor('minimumExperienceMonths') }}”</small></label>
            <label class="field"><span class="field-label">Minimum salary</span><input v-model.number="editable.salaryMin" class="input" type="number" min="0" step="0.01" placeholder="Not stated"><small v-if="evidenceFor('salaryMin')" class="evidence"><b>Source</b> “{{ evidenceFor('salaryMin') }}”</small></label>
            <label class="field"><span class="field-label">Maximum salary</span><input v-model.number="editable.salaryMax" class="input" type="number" min="0" step="0.01" placeholder="Not stated"><small v-if="evidenceFor('salaryMax')" class="evidence"><b>Source</b> “{{ evidenceFor('salaryMax') }}”</small></label>
            <label class="field"><span class="field-label">Salary currency</span><input v-model="editable.salaryCurrency" class="input" maxlength="3" placeholder="e.g. NGN"><small v-if="evidenceFor('salaryCurrency')" class="evidence"><b>Source</b> “{{ evidenceFor('salaryCurrency') }}”</small></label>
            <label class="field"><span class="field-label">Salary period</span><select v-model="editable.salaryPeriod" class="select"><option value="">Not stated</option><option value="hourly">Hourly</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="contract">Contract</option></select><small v-if="evidenceFor('salaryPeriod')" class="evidence"><b>Source</b> “{{ evidenceFor('salaryPeriod') }}”</small></label>
            <label class="field"><span class="field-label">Eligible countries</span><input v-model="editable.eligibleCountriesText" class="input" maxlength="1000" placeholder="Comma-separated, or leave blank"><small v-if="evidenceFor('eligibleCountries')" class="evidence"><b>Source</b> “{{ evidenceFor('eligibleCountries') }}”</small><small v-else class="evidence missing">Eligibility was not stated. Leave blank if unknown.</small></label>
            <label class="field"><span class="field-label">Skills</span><input v-model="editable.skillsText" class="input" maxlength="1000" placeholder="Comma-separated skills"><small v-if="evidenceFor('skills')" class="evidence"><b>Source</b> “{{ evidenceFor('skills') }}”</small></label>
            <label class="field"><span class="field-label">Application URL <span class="optional">URL or email required</span></span><input v-model="editable.applicationUrl" class="input" type="url" maxlength="2048" placeholder="https://"><small v-if="evidenceFor('applicationUrl')" class="evidence"><b>Source</b> “{{ evidenceFor('applicationUrl') }}”</small></label>
            <label class="field"><span class="field-label">Application email</span><input v-model="editable.applicationEmail" class="input" type="email" maxlength="254" placeholder="hiring@example.com"><small v-if="evidenceFor('applicationEmail')" class="evidence"><b>Source</b> “{{ evidenceFor('applicationEmail') }}”</small></label>
          </div>

          <aside v-if="questions.length" class="questions-panel" aria-labelledby="questions-title"><div class="questions-heading"><span class="question-mark" aria-hidden="true">?</span><div><strong id="questions-title">Details to confirm</strong><p>These facts were missing or unclear in the pasted text.</p></div></div><ul><li v-for="(question, index) in questions" :key="index">{{ question }}</li></ul></aside>
          <div class="submit-row"><p>We’ll send the edited fields and original description for staff review.</p><button class="primary-button" type="submit" :disabled="!canSubmit || submitting">{{ submitting ? 'Sending for review…' : 'Submit for review' }} <span aria-hidden="true">↗</span></button></div>
          <p v-if="!canSubmit" class="submit-hint">Add a title, company, location or work style, and application link or email to continue.</p>
        </form>
      </section>
    </main>
    <footer class="site-footer">OpenRole · Recruiter submissions are checked before publication.</footer>
  </div>
</template>

<style scoped>
.submit-page { max-width: 900px; padding-top: 44px; }
.submit-intro { margin: 0 0 26px; }
.submit-intro h1 { color: var(--forest); font-size: clamp(39px, 6vw, 62px); letter-spacing: -.07em; line-height: 1; margin: 17px 0 13px; }
.submit-intro > p:last-of-type { color: #63705c; font-size: 14px; line-height: 1.7; margin: 0; max-width: 620px; }
.review-note { border-left: 2px solid #7aaa55; display: grid; gap: 5px; margin-top: 20px; padding: 1px 0 1px 13px; }
.review-note strong { color: var(--forest); font-size: 12px; }
.review-note span { color: #76806f; font-size: 11px; }
.form-panel, .preview-section, .confirmation-panel { background: white; border: 1px solid var(--line); border-radius: 10px; padding: clamp(19px, 3.5vw, 28px); }
.panel-heading { align-items: flex-start; display: flex; justify-content: space-between; margin-bottom: 21px; }
.panel-heading .eyebrow, .preview-heading .eyebrow { font-size: 9px; }
.panel-heading h2, .preview-heading h2 { color: var(--forest); font-size: 20px; letter-spacing: -.6px; margin: 7px 0 0; }
.source-stamp { background: #f2f4ef; border-radius: 999px; color: #65715d; font-size: 9px; font-weight: 650; padding: 7px 10px; }
.field-label { align-items: center; display: flex; gap: 8px; justify-content: space-between; }
.required, .optional { color: #7d8875; font-size: 9px; font-weight: 500; }
.source-text { min-height: 168px; }
.field-footer { color: #8a9384; display: flex; font-size: 10px; justify-content: space-between; margin-top: 7px; }
.source-url-label { margin: 18px 0 7px; }
.analyze-button { gap: 14px; margin-top: 17px; min-width: 175px; }
.ai-note { color: #7a8573; font-size: 10px; line-height: 1.5; margin: 10px 0 0; }
.submission-error { margin-top: 14px; }
.preview-section { margin-top: 14px; }
.preview-heading { align-items: start; margin-bottom: 20px; }
.preview-heading h2 { font-size: 21px; }
.preview-heading > div > p:last-child { color: #788271; font-size: 11px; line-height: 1.5; margin: 7px 0 0; }
.preview-heading > .pill { flex: 0 0 auto; font-size: 9px; }
.preview-heading .signal-dot { height: 6px; width: 6px; }
.stale-message { background: #fbf4dc; border-radius: 7px; color: #735b1d; font-size: 11px; line-height: 1.5; margin: 0 0 16px; padding: 10px 12px; }
.draft-grid { display: grid; gap: 18px 14px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.field { min-width: 0; }
.field .field-label { justify-content: flex-start; }
.evidence { color: #798473; display: block; font-size: 10px; line-height: 1.5; margin-top: 6px; overflow-wrap: anywhere; }
.evidence b { color: #4a6340; font-size: 9px; margin-right: 4px; text-transform: uppercase; }
.evidence.missing { color: #92998d; }
.questions-panel { background: #f4f6f1; border: 1px solid #e6eae1; border-radius: 8px; margin-top: 22px; padding: 15px; }
.questions-heading { align-items: center; display: flex; gap: 9px; }
.question-mark { align-items: center; background: white; border: 1px solid #dbe2d4; border-radius: 50%; color: #5b7447; display: flex; flex: 0 0 25px; font-size: 12px; font-weight: 750; height: 25px; justify-content: center; }
.questions-heading strong { color: #3a4c31; display: block; font-size: 11px; }
.questions-heading p { color: #7d8875; font-size: 10px; margin: 3px 0 0; }
.questions-panel ul { color: #55624e; display: grid; font-size: 11px; gap: 7px; margin: 12px 0 0; padding-left: 18px; }
.submit-row { align-items: center; border-top: 1px solid #edf0ea; display: flex; gap: 20px; justify-content: space-between; margin-top: 23px; padding-top: 17px; }
.submit-row p { color: #7b8576; font-size: 10px; line-height: 1.5; margin: 0; max-width: 350px; }
.submit-row .primary-button { flex: 0 0 auto; gap: 12px; }
.submit-hint { color: #9a5e32; font-size: 10px; margin: 9px 0 0; text-align: right; }
.confirmation-panel { align-items: flex-start; background: #f3f7ef; border-color: #dce8d3; display: flex; gap: 15px; margin-top: 14px; }
.confirmation-mark { align-items: center; background: var(--forest); border-radius: 50%; color: var(--lime); display: flex; flex: 0 0 34px; font-size: 16px; height: 34px; justify-content: center; }
.confirmation-panel h2 { color: var(--forest); font-size: 20px; letter-spacing: -.5px; margin: 6px 0; }
.confirmation-panel p:not(.eyebrow) { color: #64715c; font-size: 12px; line-height: 1.6; margin: 0 0 14px; }
.confirmation-panel .secondary-button { min-height: 38px; }
@media (max-width: 650px) {
  .submit-page { padding-top: 28px; }
  .submit-intro h1 { font-size: 44px; }
  .panel-heading { gap: 10px; }
  .source-stamp { max-width: 112px; text-align: center; }
  .draft-grid { gap: 16px; grid-template-columns: 1fr; }
  .preview-heading { flex-direction: column; }
  .submit-row { align-items: stretch; flex-direction: column; gap: 12px; }
  .submit-row .primary-button { width: 100%; }
  .submit-hint { text-align: left; }
}
</style>
