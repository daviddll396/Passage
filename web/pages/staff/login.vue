<script setup>
import { onMounted, reactive, ref } from 'vue';
import { roleRequest } from '../../utils/rolesApi.js';

useHead({ title: 'Staff sign in' });
const { public: { apiBase } } = useRuntimeConfig();
const credentials = reactive({ email: '', password: '' });
const checking = ref(true);
const submitting = ref(false);
const message = ref('');
const errorMessage = ref('');

onMounted(async () => {
  try {
    const result = await roleRequest(apiBase, '/auth/me', { credentials: 'include' });
    if (result.user?.role === 'staff') await navigateTo('/staff');
    else message.value = 'This account does not have staff access.';
  } catch (error) {
    if (error.status !== 401) errorMessage.value = error.message;
  } finally {
    checking.value = false;
  }
});

async function signIn() {
  submitting.value = true;
  message.value = '';
  errorMessage.value = '';
  try {
    const result = await roleRequest(apiBase, '/auth/login', {
      method: 'POST', credentials: 'include', body: credentials,
    });
    if (result.user?.role !== 'staff') {
      message.value = 'This account does not have staff access. Ask an OpenRole administrator for help.';
      return;
    }
    await navigateTo('/staff');
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
    <main class="page-wrap login-page">
      <section class="login-intro"><p class="eyebrow"><span class="signal-dot" aria-hidden="true"></span> OpenRole staff</p><h1>Review roles<br>with care.</h1><p>Sign in with an account provisioned for the staff team.</p><NuxtLink to="/staff/demo" class="preview-link">View the read-only preview <span aria-hidden="true">↗</span></NuxtLink></section>
      <form class="login-card" aria-labelledby="login-title" @submit.prevent="signIn">
        <p class="eyebrow">Staff access</p><h2 id="login-title">Sign in to OpenRole</h2>
        <p v-if="checking" class="checking-message" role="status">Checking your session…</p>
        <p v-if="message" class="notice notice-info" role="status">{{ message }}</p>
        <p v-if="errorMessage" class="notice notice-error" role="alert">{{ errorMessage }}</p>
        <label class="field-label" for="staff-email">Email</label><input id="staff-email" v-model="credentials.email" class="input" type="email" name="email" autocomplete="username" maxlength="254" required>
        <label class="field-label password-label" for="staff-password">Password</label><input id="staff-password" v-model="credentials.password" class="input" type="password" name="password" autocomplete="current-password" maxlength="128" required>
        <button class="primary-button" type="submit" :disabled="submitting">{{ submitting ? 'Signing in…' : 'Sign in' }} <span aria-hidden="true">↗</span></button>
        <p class="login-footnote">Staff accounts are created by OpenRole administrators.</p>
      </form>
    </main>
    <footer class="site-footer">OpenRole · Staff access</footer>
  </div>
</template>

<style scoped>
.login-page { align-items: center; display: grid; gap: clamp(36px, 8vw, 100px); grid-template-columns: minmax(0, 1fr) minmax(320px, 420px); max-width: 1000px; min-height: calc(100vh - 148px); }
.login-intro h1 { color: var(--forest); font-size: clamp(42px, 6vw, 68px); letter-spacing: -.075em; line-height: .98; margin: 18px 0 16px; }
.login-intro > p:not(.eyebrow) { color: #65715e; font-size: 14px; line-height: 1.65; margin: 0; max-width: 340px; }
.preview-link { color: #52713c; display: inline-block; font-size: 12px; font-weight: 700; margin-top: 22px; text-decoration: none; }
.preview-link:hover { text-decoration: underline; text-underline-offset: 3px; }
.login-card { background: white; border: 1px solid var(--line); border-radius: 10px; padding: clamp(22px, 4vw, 34px); }
.login-card h2 { color: var(--forest); font-size: 21px; letter-spacing: -.7px; margin: 8px 0 22px; }
.login-card > .eyebrow { font-size: 9px; }
.login-card .field-label { margin-bottom: 7px; }
.password-label { margin-top: 17px; }
.login-card .primary-button { gap: 14px; margin-top: 21px; width: 100%; }
.login-footnote { color: #818b79; font-size: 10px; line-height: 1.5; margin: 12px 0 0; text-align: center; }
.checking-message { color: #74806c; font-size: 11px; }
.notice { border-radius: 7px; font-size: 11px; line-height: 1.5; margin: 0 0 15px; padding: 10px 11px; }
.notice-info { background: #f1f4ed; color: #506542; }
.notice-error { background: #fff0ed; color: #91392e; }
@media (max-width: 700px) {
  .login-page { align-items: start; gap: 30px; grid-template-columns: 1fr; min-height: auto; padding-top: 35px; }
  .login-intro h1 { font-size: 47px; }
}
</style>
