<script setup>
import { onMounted, ref } from 'vue';
import { formatRoleSalary, roleRequest } from '../../utils/rolesApi.js';

useHead({ title: 'Staff review queue' });
const { public: { apiBase } } = useRuntimeConfig();
const roles = ref([]);
const user = ref(null);
const loading = ref(true);
const busyId = ref('');
const errorMessage = ref('');
const notice = ref('');
const needsStaff = ref(false);

async function loadQueue() {
  loading.value = true;
  errorMessage.value = '';
  notice.value = '';
  needsStaff.value = false;
  try {
    const session = await roleRequest(apiBase, '/auth/me', { credentials: 'include' });
    user.value = session.user;
    if (user.value?.role !== 'staff') {
      needsStaff.value = true;
      return;
    }
    const result = await roleRequest(apiBase, '/staff/roles?status=pending', { credentials: 'include' });
    roles.value = result.roles;
  } catch (error) {
    if (error.status === 401) needsStaff.value = true;
    else errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}

async function setStatus(role, status) {
  busyId.value = role.id;
  errorMessage.value = '';
  notice.value = '';
  try {
    await roleRequest(apiBase, `/staff/roles/${encodeURIComponent(role.id)}`, {
      method: 'PATCH', credentials: 'include', body: { status },
    });
    roles.value = roles.value.filter((item) => item.id !== role.id);
    notice.value = `${role.title} ${status === 'published' ? 'was published' : 'was closed'}.`;
  } catch (error) {
    if (error.status === 401 || error.status === 403) needsStaff.value = true;
    else errorMessage.value = error.message;
  } finally {
    busyId.value = '';
  }
}

async function signOut() {
  try { await roleRequest(apiBase, '/auth/logout', { method: 'POST', credentials: 'include' }); } catch { /* Continue to the sign-in page if the API is unavailable. */ }
  await navigateTo('/staff/login');
}

onMounted(loadQueue);
</script>

<template>
  <div>
    <header class="site-nav">
      <NuxtLink class="brand" to="/" aria-label="OpenRole home"><span class="brand-mark" aria-hidden="true"></span><span>openrole</span></NuxtLink>
      <nav class="nav-links" aria-label="Staff navigation"><NuxtLink class="nav-link" to="/staff/demo">Preview</NuxtLink><NuxtLink class="nav-link" to="/">Public roles</NuxtLink><button class="nav-link sign-out" type="button" @click="signOut">Sign out</button></nav>
    </header>
    <main class="page-wrap staff-page">
      <section class="staff-heading">
        <div><p class="eyebrow"><span class="signal-dot" aria-hidden="true"></span> Staff workspace</p><h1>Role review queue</h1><p>Check recruiter submissions before they appear in public search.</p></div>
        <span v-if="user" class="user-chip">{{ user.name }} · staff</span>
      </section>

      <div v-if="notice" class="notice success" role="status">{{ notice }}</div>
      <div v-if="errorMessage" class="state-panel error" role="alert"><strong>The queue could not be loaded</strong><p>{{ errorMessage }}</p><button class="secondary-button" type="button" @click="loadQueue">Try again</button></div>
      <div v-else-if="needsStaff" class="access-panel" role="status"><strong>Staff access required</strong><p>Sign in with an account provisioned for the OpenRole staff team.</p><NuxtLink class="primary-button" to="/staff/login">Staff sign in <span aria-hidden="true">↗</span></NuxtLink></div>
      <div v-else-if="loading" class="state-panel" role="status">Checking access and loading pending submissions…</div>
      <div v-else-if="roles.length" class="queue-list">
        <article v-for="role in roles" :key="role.id" class="queue-card">
          <div class="queue-main">
            <div class="queue-title"><div><a v-if="role.sourceUrl" class="source-chip source-link-chip" :href="role.sourceUrl" target="_blank" rel="noopener noreferrer">{{ role.sourceName || 'Recruiter submitted' }}</a><span v-else class="source-chip">{{ role.sourceName || 'Recruiter submitted' }}</span><h2>{{ role.title }}</h2><p class="company">{{ role.companyName || 'Company not listed' }} <span aria-hidden="true">·</span> {{ role.id }}</p></div><span class="pending-chip">Pending review</span></div>
            <div class="metadata"><span v-if="role.location">{{ role.location }}</span><span v-if="role.workMode">{{ role.workMode }}</span><span v-if="role.employmentType">{{ role.employmentType }}</span><span v-if="formatRoleSalary(role)">{{ formatRoleSalary(role) }}</span><span v-if="role.skills?.length">{{ role.skills.join(' · ') }}</span></div>
            <details class="description-details"><summary>Read submitted description and evidence</summary><p>{{ role.description }}</p></details>
            <div class="references"><a v-if="role.applicationUrl" :href="role.applicationUrl" target="_blank" rel="noopener noreferrer">Application link ↗</a><a v-if="role.applicationEmail" :href="`mailto:${role.applicationEmail}`">{{ role.applicationEmail }}</a><span v-if="!role.applicationUrl && !role.applicationEmail">No application contact</span></div>
          </div>
          <div class="review-actions" :aria-label="`Review actions for ${role.title}`">
            <button class="secondary-button" type="button" :disabled="busyId === role.id" @click="setStatus(role, 'closed')">{{ busyId === role.id ? 'Saving…' : 'Close' }}</button>
            <button class="primary-button" type="button" :disabled="busyId === role.id" @click="setStatus(role, 'published')">{{ busyId === role.id ? 'Saving…' : 'Publish' }}</button>
          </div>
        </article>
      </div>
      <div v-else class="state-panel empty-queue"><strong>No roles are waiting for review</strong><p>New recruiter submissions will appear here.</p></div>
    </main>
    <footer class="site-footer">OpenRole · Staff review queue</footer>
  </div>
</template>

<style scoped>
.staff-page { max-width: 1050px; padding-top: 43px; }
.staff-heading { align-items: end; display: flex; justify-content: space-between; margin-bottom: 23px; }
.staff-heading h1 { color: var(--forest); font-size: clamp(30px, 4vw, 42px); letter-spacing: -.06em; margin: 12px 0 7px; }
.staff-heading p:not(.eyebrow) { color: #697462; font-size: 13px; margin: 0; }
.user-chip { background: white; border: 1px solid var(--line); border-radius: 999px; color: #5c6955; font-size: 10px; padding: 8px 11px; }
.queue-list { display: grid; gap: 11px; }
.queue-card { background: white; border: 1px solid var(--line); border-radius: 10px; }
.queue-main { padding: 20px 21px 15px; }
.queue-title { align-items: flex-start; display: flex; justify-content: space-between; }
.queue-title h2 { color: var(--forest); font-size: 17px; letter-spacing: -.35px; margin: 9px 0 4px; }
.source-link-chip { text-decoration: none; }
.source-link-chip:hover { background: #e5eade; text-decoration: underline; text-underline-offset: 2px; }
.company { color: #6b7665; font-size: 11px; margin: 0; }
.company span { margin: 0 4px; }
.pending-chip { background: #f7f0dc; border-radius: 999px; color: #786122; font-size: 9px; font-weight: 700; padding: 6px 9px; }
.metadata { color: #66725e; display: flex; flex-wrap: wrap; font-size: 10px; gap: 7px 14px; margin-top: 15px; }
.description-details { border-top: 1px solid #edf0ea; margin-top: 15px; padding-top: 12px; }
.description-details summary { color: #4f6b3d; cursor: pointer; font-size: 11px; font-weight: 700; }
.description-details p { color: #596652; font-size: 12px; line-height: 1.7; margin: 11px 0 0; overflow-wrap: anywhere; white-space: pre-line; }
.references { display: flex; flex-wrap: wrap; gap: 8px 15px; margin-top: 13px; }
.references a, .references span { color: #566f43; font-size: 10px; font-weight: 650; overflow-wrap: anywhere; }
.references a:hover { text-decoration: underline; }
.review-actions { border-top: 1px solid #edf0ea; display: flex; gap: 8px; justify-content: flex-end; padding: 12px 18px; }
.review-actions .primary-button, .review-actions .secondary-button { min-height: 38px; padding: 0 16px; }
.notice { border-radius: 8px; font-size: 12px; margin-bottom: 12px; padding: 12px 14px; }
.success { background: #edf5e8; color: #3c5c29; }
.access-panel { background: #eef2e9; border-radius: 10px; padding: 22px; }
.access-panel strong { color: var(--forest); font-size: 15px; }
.access-panel p { color: #626f59; font-size: 12px; line-height: 1.6; margin: 6px 0 15px; }
.access-panel .primary-button { gap: 12px; }
.empty-queue { padding: 34px 24px; }
.sign-out { background: transparent; border: 0; cursor: pointer; padding: 0; }
@media (max-width: 650px) {
  .staff-page { padding-top: 30px; }
  .staff-heading { align-items: flex-start; flex-direction: column; gap: 13px; }
  .queue-main { padding: 16px; }
  .queue-title h2 { font-size: 15px; }
  .review-actions { padding: 10px; }
  .review-actions button { flex: 1; }
}
</style>
