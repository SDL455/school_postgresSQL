import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

interface DashboardStats {
  currentAcademicYear: any
  overview: {
    totalStudents: number
    activeStudents: number
    maleStudents: number
    femaleStudents: number
    totalTeachers: number
    activeTeachers: number
    totalClassrooms: number
    totalSubjects: number
  }
  studentsByStatus: any[]
  teachersByDepartment: any[]
  classroomStats: any[]
  gradeStats: any
  attendanceStats: any
}

interface DashboardState {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    stats: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchStats(academicYearId?: number) {
      const authStore = useAuthStore()
      this.loading = true
      this.error = null
      
      try {
        const params = academicYearId ? `?academicYearId=${academicYearId}` : ''
        const response = await $fetch<any>(`/api/dashboard/stats${params}`, {
          headers: authStore.getAuthHeaders(),
        })
        
        if (response.success) {
          this.stats = response.data
        }
      } catch (error: any) {
        this.error = error?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ'
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        this.loading = false
      }
    },
  },
})
