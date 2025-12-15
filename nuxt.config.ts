// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/fonts',
    '@pinia/nuxt'
  ],

  css: [
    '~/assets/css/main.css'
  ],

  app: {
    head: {
      title: 'ລະບົບຈັດການໂຮງຮຽນ | School Management System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ລະບົບຈັດການງານບໍລິການໂຮງຮຽນ - ຈັດການນັກຮຽນ, ອາຈານ, ຫ້ອງຮຽນ, ວິຊາ, ຄະແນນ ແລະ ສະຖິຕິ' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    public: {
      apiBase: '/api'
    }
  },

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  routeRules: {
    '/api/**': { cors: true }
  }
})