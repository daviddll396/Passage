<script setup>
import { onMounted, ref } from 'vue';
import { formatExperience, formatRoleSalary, roleRequest } from '../../utils/rolesApi.js';

const { public: { apiBase } } = useRuntimeConfig();
const route = useRoute();
const role = ref(null);
const loading = ref(true);
const errorMessage = ref('');

async function loadRole() {
  loading.value = true;
  errorMessage.value = '';
  try {
    role.value = await roleRequest(apiBase, `/roles/${encodeURIComponent(route.params.id)}`);
    useHead({ title: role.value.title || 'Role details' });
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}

function sourceLabel(item) {
  return item?.sourceType === 'recruiter' ? 'Recruiter submitted' : (item?.sourceName || 'External listing');
}

onMounted(loadRole);
</script>

<template>
  <div>
    <header class="site-nav">
      <NuxtLink class="brand" to="/" aria-label="OpenRole home"><span class="brand-mark" aria-hidden="true"></span><span>openrole</span></NuxtLink>
      <nav class="nav-links" aria-label="Main navigation"><NuxtLink class="nav-link" to="/">Browse roles</NuxtLink><NuxtLink class="nav-link nav-demo" to="/staff/demo">Staff preview</NuxtLink><NuxtLink class="nav-link nav-cta" to="/submit">Post a role</NuxtLink></nav>
    </header>
    <main class="page-wrap detail-page">
      <NuxtLink class="back-link" to="/">← All roles</NuxtLink>
      <div v-if="loading" class="state-panel" aria-live="polite">Loading role details…</div>
      <div v-else-if="errorMessage" class="state-panel error" role="alert"><strong>This role could not be loaded</strong><p>{{ errorMessage }}</p><NuxtLink class="secondary-button" to="/">Back to roles</NuxtLink></div>
      <template v-else-if="role">
        <section class="role-header">
          <div class="title-side">
            <a v-if="role.sourceUrl" class="source-chip source-link-chip" :href="role.sourceUrl" target="_blank" rel="noopener noreferrer">{{ sourceLabel(role) }}</a><span v-else class="source-chip">{{ sourceLabel(role) }}</span>
            <h1>{{ role.title }}</h1>
            <p class="company">{{ role.companyName || 'Company not listed' }}</p>
            <div class="detail-tags">
              <span v-if="role.location" class="pill">{{ role.location }}</span>
              <span v-if="role.workMode" class="pill">{{ role.workMode }}</span>
              <span v-if="role.employmentType" class="pill">{{ role.employmentType }}</span>
              <span v-if="role.minimumExperienceMonths != null" class="pill">{{ formatExperience(role.minimumExperienceMonths) }}</span>
            </div>
          </div>
          <aside class="apply-panel" aria-label="Application details">
            <p class="eyebrow">Compensation</p>
            <strong class="salary">{{ formatRoleSalary(role) || 'Not listed' }}</strong>
            <a v-if="role.applicationUrl" class="primary-button" :href="role.applicationUrl" target="_blank" rel="noopener noreferrer">Apply for this role <span aria-hidden="true">↗</span></a>
            <a v-else-if="role.applicationEmail" class="primary-button" :href="`mailto:${role.applicationEmail}`">Email to apply <span aria-hidden="true">↗</span></a>
          </aside>
        </section>

        <div class="detail-grid">
          <section class="description-panel" aria-labelledby="description-title">
            <div class="section-heading"><div><p class="eyebrow">The role</p><h2 id="description-title">About this opportunity</h2></div></div>
            <p class="description-text">{{ role.description || role.excerpt || 'No description was provided.' }}</p>
          </section>
          <aside class="facts-panel" aria-labelledby="facts-title">
            <h2 id="facts-title">At a glance</h2>
            <dl>
              <template v-if="role.location"><dt>Location</dt><dd>{{ role.location }}</dd></template>
              <template v-if="role.workMode"><dt>Work style</dt><dd>{{ role.workMode }}</dd></template>
              <template v-if="role.employmentType"><dt>Employment</dt><dd>{{ role.employmentType }}</dd></template>
              <template v-if="role.minimumExperienceMonths != null"><dt>Experience</dt><dd>{{ formatExperience(role.minimumExperienceMonths) }}</dd></template>
              <template v-if="role.eligibleCountries?.length"><dt>Eligible applicants</dt><dd>{{ role.eligibleCountries.join(', ') }}</dd></template>
              <template v-if="role.skills?.length"><dt>Skills</dt><dd class="skill-list">{{ role.skills.join(' · ') }}</dd></template>
              <template v-if="role.applicationEmail"><dt>Contact</dt><dd><a :href="`mailto:${role.applicationEmail}`">{{ role.applicationEmail }}</a></dd></template>
            </dl>
            <p v-if="!role.location && !role.workMode && !role.employmentType && !role.minimumExperienceMonths && !role.eligibleCountries?.length && !role.skills?.length" class="no-facts">No additional details were listed.</p>
          </aside>
        </div>
      </template>
    </main>
    <footer class="site-footer">OpenRole · Check the source before you apply.</footer>
  </div>
</template>

<style scoped>
.detail-page { max-width: 1040px; padding-top: 30px; }
.back-link { color: #62705a; display: inline-block; font-size: 12px; font-weight: 650; margin-bottom: 22px; text-decoration: none; }
.back-link:hover { color: var(--forest); text-decoration: underline; }
.role-header { align-items: center; background: #eef2e9; border-radius: 28px; display: flex; gap: 40px; justify-content: space-between; padding: clamp(25px, 5vw, 48px); }
.title-side { min-width: 0; }
h1 { color: var(--forest); font-size: clamp(34px, 5.4vw, 54px); letter-spacing: -.065em; line-height: 1.04; margin: 17px 0 8px; max-width: 680px; }
.company { color: #5f6c57; font-size: 15px; margin: 0; }
.detail-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 19px; }
.detail-tags .pill { text-transform: capitalize; }
.source-link-chip { text-decoration: none; }
.source-link-chip:hover { background: #e5eade; text-decoration: underline; text-underline-offset: 2px; }
.apply-panel { background: white; border: 1px solid #dfe5d9; border-radius: 10px; display: flex; flex: 0 0 218px; flex-direction: column; gap: 12px; padding: 19px; }
.apply-panel .eyebrow { font-size: 9px; }
.salary { color: var(--forest); font-size: 16px; letter-spacing: -.3px; }
.apply-panel .primary-button { gap: 10px; width: 100%; }
.detail-grid { align-items: start; display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr) 290px; margin-top: 15px; }
.description-panel, .facts-panel { background: white; border: 1px solid var(--line); border-radius: 10px; padding: 22px; }
.description-panel .section-heading h2 { font-size: 19px; margin-top: 7px; }
.description-text { color: #4d5a47; font-size: 14px; line-height: 1.75; margin: 19px 0 0; overflow-wrap: anywhere; white-space: pre-line; }
.facts-panel h2 { color: var(--forest); font-size: 15px; letter-spacing: -.2px; margin: 1px 0 17px; }
dl { display: grid; gap: 6px 12px; grid-template-columns: 1fr 1.2fr; margin: 0; }
dt { color: #7c8676; font-size: 10px; padding: 9px 0; }
dd { border-bottom: 1px solid #edf0ea; color: #36452f; font-size: 11px; font-weight: 650; margin: 0; overflow-wrap: anywhere; padding: 9px 0; text-align: right; }
dd a { color: #456437; }
.skill-list { line-height: 1.5; }
.no-facts { color: #7c8676; font-size: 12px; line-height: 1.6; }
@media (max-width: 760px) {
  .role-header { align-items: stretch; border-radius: 20px; flex-direction: column; gap: 22px; padding: 22px; }
  .apply-panel { flex: auto; }
  .detail-grid { grid-template-columns: 1fr; }
  .description-panel, .facts-panel { padding: 18px; }
}
</style>
