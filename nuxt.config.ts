// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@tresjs/nuxt'
  ],

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] }
    ]
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Patturn — Experimental Design Lab',
      meta: [
        { name: 'description', content: 'An experimental playground for next-gen interfaces, interactions, and motion design.' },
        { name: 'theme-color', content: '#0a0a0a' }
      ]
    }
  }
})