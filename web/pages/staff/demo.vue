<script setup>
useHead({ title: 'Staff queue preview' });

const samples = [
  {
    title: 'Sample frontend engineer', companyName: 'Sample organisation', location: 'Lagos, Nigeria',
    workMode: 'Hybrid', employmentType: 'Full-time', salary: 'Sample pay: NGN 700,000–900,000 / month',
    skills: ['Vue', 'TypeScript'],
    description: 'SAMPLE ROLE. This example shows how a recruiter submission can be checked. The organisation, role details, and pay are fictional.',
  },
  {
    title: 'Sample customer support specialist', companyName: 'Example company', location: 'Remote',
    workMode: 'Remote', employmentType: 'Full-time', salary: '', skills: ['Customer support', 'Writing'],
    description: 'SAMPLE ROLE. This example has no salary listed. It demonstrates the review layout without representing an open job.',
  },
];
</script>

<template>
  <div>
    <header class="site-nav">
      <NuxtLink class="brand" to="/" aria-label="OpenRole home"><span class="brand-mark" aria-hidden="true"></span><span>openrole</span></NuxtLink>
      <nav class="nav-links" aria-label="Main navigation"><NuxtLink class="nav-link" to="/">Browse roles</NuxtLink><NuxtLink class="nav-link nav-cta" to="/staff/login">Staff sign in</NuxtLink></nav>
    </header>
    <main class="page-wrap demo-page">
      <section class="demo-heading">
        <div><p class="eyebrow"><span class="signal-dot" aria-hidden="true"></span> Staff workspace preview</p><h1>A read-only look inside.</h1><p>See how pending role submissions are presented for review.</p></div>
        <div class="demo-banner"><strong>Sample data · not a live queue</strong><span>These fictional roles are not saved, searchable, or connected to staff actions.</span></div>
      </section>
      <section class="sample-list" aria-label="Sample roles for review">
        <article v-for="(role, index) in samples" :key="role.title" class="sample-card">
          <div class="sample-card-top"><span class="sample-label">Sample role {{ String(index + 1).padStart(2, '0') }}</span><span class="pending-label">Pending · sample</span></div>
          <h2>{{ role.title }}</h2><p class="company">{{ role.companyName }} <span aria-hidden="true">·</span> Sample recruiter</p>
          <div class="metadata"><span>{{ role.location }}</span><span>{{ role.workMode }}</span><span>{{ role.employmentType }}</span><span v-if="role.salary">{{ role.salary }}</span></div>
          <div class="skill-list"><span v-for="skill in role.skills" :key="skill" class="pill">{{ skill }}</span></div>
          <details class="sample-description"><summary>Read sample description</summary><p>{{ role.description }}</p></details>
        </article>
      </section>
      <p class="read-only-note">Review actions are disabled in this preview. <NuxtLink to="/staff/login">Sign in with a staff account</NuxtLink> to open the live queue.</p>
    </main>
    <footer class="site-footer">OpenRole · Example content is marked as sample.</footer>
  </div>
</template>

<style scoped>
.demo-page { max-width: 1000px; padding-top: 43px; }
.demo-heading { align-items: end; display: flex; gap: 28px; justify-content: space-between; margin-bottom: 22px; }
.demo-heading h1 { color: var(--forest); font-size: clamp(33px, 5vw, 48px); letter-spacing: -.065em; margin: 12px 0 7px; }
.demo-heading > div:first-child > p:last-child { color: #697462; font-size: 13px; margin: 0; }
.demo-banner { background: #eef2e9; border: 1px solid #dfe6d8; border-radius: 10px; display: grid; flex: 0 1 310px; gap: 5px; padding: 13px 15px; }
.demo-banner strong { color: var(--forest); font-size: 11px; }
.demo-banner span { color: #697562; font-size: 10px; line-height: 1.5; }
.sample-list { display: grid; gap: 11px; }
.sample-card { background: white; border: 1px solid var(--line); border-radius: 10px; padding: 20px; }
.sample-card-top { align-items: center; display: flex; justify-content: space-between; }
.sample-label { color: #65715c; font-size: 9px; font-weight: 750; letter-spacing: .07em; text-transform: uppercase; }
.pending-label { background: #f7f0dc; border-radius: 999px; color: #786122; font-size: 9px; font-weight: 700; padding: 6px 9px; }
.sample-card h2 { color: var(--forest); font-size: 17px; letter-spacing: -.35px; margin: 10px 0 4px; }
.company { color: #6b7665; font-size: 11px; margin: 0; }
.company span { margin: 0 4px; }
.metadata { color: #66725e; display: flex; flex-wrap: wrap; font-size: 10px; gap: 7px 14px; margin-top: 15px; }
.skill-list { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 13px; }
.sample-description { border-top: 1px solid #edf0ea; margin-top: 15px; padding-top: 12px; }
.sample-description summary { color: #4f6b3d; cursor: pointer; font-size: 11px; font-weight: 700; }
.sample-description p { color: #596652; font-size: 12px; line-height: 1.7; margin: 11px 0 0; }
.read-only-note { color: #778271; font-size: 11px; line-height: 1.6; margin: 18px 0 0; }
.read-only-note a { color: #4f6c3b; font-weight: 700; }
@media (max-width: 700px) {
  .demo-page { padding-top: 28px; }
  .demo-heading { align-items: stretch; flex-direction: column; gap: 14px; }
  .demo-banner { flex: auto; }
  .sample-card { padding: 16px; }
}
</style>
