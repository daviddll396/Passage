<script setup>
import { formatExperience, formatRoleSalary } from '../utils/rolesApi.js';

defineProps({ role: { type: Object, required: true } });

function sourceLabel(role) {
  return role.sourceType === 'recruiter' ? 'Recruiter submitted' : (role.sourceName || 'External listing');
}
</script>

<template>
  <!-- Card and badge hierarchy adapted from Career1, shadcnblocks-vue's free/basic Career listings: https://shadcnblocks-vue.com/preview?category=career. Ported to native Vue/CSS; no Tailwind or shadcn runtime is required. -->
  <article class="role-card">
    <div class="role-card-main">
      <div class="role-title-row">
        <div><NuxtLink class="role-title" :to="`/roles/${role.id}`">{{ role.title }}</NuxtLink><p class="company-line">{{ role.companyName || 'Company not listed' }}</p></div>
        <NuxtLink class="card-arrow" :to="`/roles/${role.id}`" :aria-label="`View ${role.title}`">↗</NuxtLink>
      </div>
      <div class="role-tags">
        <span v-if="role.workMode" class="pill">{{ role.workMode }}</span>
        <span v-if="role.location" class="pill">{{ role.location }}</span>
        <span v-if="role.employmentType" class="pill">{{ role.employmentType }}</span>
        <span v-if="role.minimumExperienceMonths != null" class="pill">{{ formatExperience(role.minimumExperienceMonths) }}</span>
      </div>
      <p v-if="role.excerpt" class="role-excerpt">{{ role.excerpt }}</p>
      <div class="role-bottom"><a v-if="role.sourceUrl" class="source-chip" :href="role.sourceUrl" target="_blank" rel="noopener noreferrer">{{ sourceLabel(role) }}</a><span v-else class="source-chip">{{ sourceLabel(role) }}</span><span v-if="role.skills?.length" class="skill-line">{{ role.skills.slice(0, 4).join(' · ') }}</span></div>
    </div>
    <div class="role-card-aside"><strong v-if="formatRoleSalary(role)">{{ formatRoleSalary(role) }}</strong><span v-else class="not-listed">Pay not listed</span><NuxtLink :to="`/roles/${role.id}`">View role <span aria-hidden="true">→</span></NuxtLink></div>
  </article>
</template>

<style scoped>
.role-card { align-items: stretch; background: white; border: 1px solid var(--line); border-radius: 10px; display: grid; grid-template-columns: minmax(0, 1fr) 190px; transition: border-color .15s ease; }
.role-card:hover { border-color: #b9c5ae; }
.role-card-main { min-width: 0; padding: 19px 21px; }
.role-title-row { align-items: flex-start; display: flex; justify-content: space-between; }
.role-title { color: var(--forest); font-size: 17px; font-weight: 750; letter-spacing: -.4px; line-height: 1.3; text-decoration: none; }
.role-title:hover { text-decoration: underline; text-underline-offset: 3px; }
.company-line { color: #687264; font-size: 12px; margin: 4px 0 0; }
.card-arrow { align-items: center; background: #f1f4ed; border-radius: 50%; color: var(--forest); display: inline-flex; flex: 0 0 29px; font-size: 14px; height: 29px; justify-content: center; text-decoration: none; width: 29px; }
.role-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 13px; }
.role-tags .pill { font-size: 10px; padding: 5px 8px; text-transform: capitalize; }
.role-excerpt { color: #626d5d; display: -webkit-box; font-size: 12px; line-height: 1.55; margin: 12px 0 0; max-width: 720px; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.role-bottom { align-items: center; display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.role-bottom .source-chip { text-decoration: none; }
.role-bottom a.source-chip:hover { background: #e5eade; text-decoration: underline; text-underline-offset: 2px; }
.skill-line { color: #788271; font-size: 10px; }
.role-card-aside { align-items: flex-start; border-left: 1px solid #edf0ea; display: flex; flex-direction: column; justify-content: center; padding: 17px 19px; }
.role-card-aside strong { color: var(--forest); font-size: 13px; letter-spacing: -.2px; }
.not-listed { color: #7b8576; font-size: 11px; }
.role-card-aside a { color: #55713e; font-size: 11px; font-weight: 700; margin-top: 12px; text-decoration: none; }
.role-card-aside a:hover { text-decoration: underline; }
@media (max-width: 760px) {
  .role-card { grid-template-columns: 1fr; }
  .role-card-main { padding: 17px; }
  .role-card-aside { align-items: center; border-left: 0; border-top: 1px solid #edf0ea; flex-direction: row; justify-content: space-between; padding: 12px 17px; }
  .role-card-aside a { margin: 0; }
}
</style>
