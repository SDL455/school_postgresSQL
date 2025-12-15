import { defineStore } from 'pinia'

interface User {
  id: number
  username: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'REGISTRAR' | 'TEACHER'
  teacher?: {
    id: number
    firstName: string
    lastName: string
  }
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  initialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isManager: (state) => state.user?.role === 'MANAGER',
    isRegistrar: (state) => state.user?.role === 'REGISTRAR',
    isTeacher: (state) => state.user?.role === 'TEACHER',
    canManageUsers: (state) => state.user?.role === 'ADMIN',
    canManageStudents: (state) => ['ADMIN', 'MANAGER', 'REGISTRAR'].includes(state.user?.role || ''),
    canManageTeachers: (state) => ['ADMIN', 'MANAGER'].includes(state.user?.role || ''),
    canEnterGrades: (state) => ['ADMIN', 'MANAGER', 'TEACHER'].includes(state.user?.role || ''),
    fullName: (state) => {
      if (state.user?.teacher) {
        return `${state.user.teacher.firstName} ${state.user.teacher.lastName}`
      }
      return state.user?.username || ''
    },
  },

  actions: {
    async initialize() {
      if (this.initialized) return
      
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        this.token = savedToken
        await this.fetchCurrentUser()
      }
      this.initialized = true
    },

    async login(username: string, password: string) {
      this.loading = true
      try {
        const response = await $fetch<any>('/api/auth/login', {
          method: 'POST',
          body: { username, password },
        })
        
        if (response.success) {
          this.token = response.data.token
          this.user = response.data.user
          localStorage.setItem('token', response.data.token)
          return { success: true }
        }
        
        return { success: false, message: response.message }
      } catch (error: any) {
        const message = error?.data?.message || 'ເກີດຂໍ້ຜິດພາດ'
        return { success: false, message }
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentUser() {
      if (!this.token) return
      
      try {
        const response = await $fetch<any>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        
        if (response.success) {
          this.user = response.data
        } else {
          this.logout()
        }
      } catch {
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      navigateTo('/login')
    },

    getAuthHeaders() {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {}
    },
  },
})
