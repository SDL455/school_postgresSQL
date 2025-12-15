<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="login-logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
        </div>
        <h1 class="login-title">ລະບົບຈັດການໂຮງຮຽນ</h1>
        <p class="login-subtitle">School Management System</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleLogin">
        <div v-if="error" class="alert alert-error mb-4">
          <Icon name="mdi:alert-circle" size="20" />
          <span>{{ error }}</span>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="username">ຊື່ຜູ້ໃຊ້</label>
          <input 
            id="username"
            v-model="form.username"
            type="text" 
            class="form-input" 
            placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label" for="password">ລະຫັດຜ່ານ</label>
          <div style="position: relative;">
            <input 
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'" 
              class="form-input" 
              style="padding-right: 40px;"
              placeholder="ປ້ອນລະຫັດຜ່ານ"
              required
            />
            <button 
              type="button"
              style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--neutral-500);"
              @click="showPassword = !showPassword"
            >
              <Icon :name="showPassword ? 'mdi:eye-off' : 'mdi:eye'" size="20" />
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary w-full btn-lg mt-6"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner" style="width: 20px; height: 20px;"></span>
          <span v-else>ເຂົ້າສູ່ລະບົບ</span>
        </button>
      </form>
      
      <div class="mt-6 text-center text-muted" style="font-size: var(--text-xs);">
        <p>© 2024 School Management System</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'blank',
})

const authStore = useAuthStore()

const form = ref({
  username: '',
  password: '',
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  const result = await authStore.login(form.value.username, form.value.password)
  
  if (result.success) {
    navigateTo('/dashboard')
  } else {
    error.value = result.message || 'ເກີດຂໍ້ຜິດພາດ'
  }
  
  loading.value = false
}

// Redirect if already logged in
onMounted(async () => {
  await authStore.initialize()
  if (authStore.isAuthenticated) {
    navigateTo('/dashboard')
  }
})
</script>
