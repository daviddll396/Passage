export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ['~/assets/css/budgetlens.css'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:4000',
    },
  },
});
