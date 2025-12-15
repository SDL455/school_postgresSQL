import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for login page
  if (to.path === '/login') {
    return
  }
  
  const authStore = useAuthStore()
  
  // Initialize auth if not done
  if (!authStore.initialized) {
    await authStore.initialize()
  }
  
  // Check if authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
