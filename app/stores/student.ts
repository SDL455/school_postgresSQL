import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

interface Student {
  id: number
  studentCode: string
  firstName: string
  lastName: string
  gender: 'MALE' | 'FEMALE'
  dateOfBirth?: string
  phone?: string
  email?: string
  guardianName?: string
  guardianPhone?: string
  classroomId?: number
  classroom?: any
  status: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface StudentState {
  students: Student[]
  currentStudent: Student | null
  pagination: Pagination
  loading: boolean
  filters: {
    search: string
    classroomId: number | null
    gradeLevelId: number | null
    gender: string
    status: string
  }
}

export const useStudentStore = defineStore('student', {
  state: (): StudentState => ({
    students: [],
    currentStudent: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    loading: false,
    filters: {
      search: '',
      classroomId: null,
      gradeLevelId: null,
      gender: '',
      status: '',
    },
  }),

  actions: {
    async fetchStudents(page = 1) {
      const authStore = useAuthStore()
      this.loading = true
      
      try {
        const params = new URLSearchParams()
        params.append('page', String(page))
        params.append('limit', String(this.pagination.limit))
        
        if (this.filters.search) params.append('search', this.filters.search)
        if (this.filters.classroomId) params.append('classroomId', String(this.filters.classroomId))
        if (this.filters.gradeLevelId) params.append('gradeLevelId', String(this.filters.gradeLevelId))
        if (this.filters.gender) params.append('gender', this.filters.gender)
        if (this.filters.status) params.append('status', this.filters.status)
        
        const response = await $fetch<any>(`/api/students?${params.toString()}`, {
          headers: authStore.getAuthHeaders(),
        })
        
        if (response.success) {
          this.students = response.data
          this.pagination = response.pagination
        }
      } catch (error) {
        console.error('Failed to fetch students:', error)
      } finally {
        this.loading = false
      }
    },

    async getStudent(id: number) {
      const authStore = useAuthStore()
      this.loading = true
      
      try {
        const response = await $fetch<any>(`/api/students/${id}`, {
          headers: authStore.getAuthHeaders(),
        })
        
        if (response.success) {
          this.currentStudent = response.data
          return response.data
        }
      } catch (error) {
        console.error('Failed to get student:', error)
      } finally {
        this.loading = false
      }
    },

    async createStudent(data: Partial<Student>) {
      const authStore = useAuthStore()
      
      try {
        const response = await $fetch<any>('/api/students', {
          method: 'POST',
          body: data,
          headers: authStore.getAuthHeaders(),
        })
        
        if (response.success) {
          await this.fetchStudents()
          return { success: true, data: response.data }
        }
        return { success: false, message: response.message }
      } catch (error: any) {
        return { success: false, message: error?.data?.message || 'ເກີດຂໍ້ຜິດພາດ' }
      }
    },

    async updateStudent(id: number, data: Partial<Student>) {
      const authStore = useAuthStore()
      
      try {
        const response = await $fetch<any>(`/api/students/${id}`, {
          method: 'PUT',
          body: data,
          headers: authStore.getAuthHeaders(),
        })
        
        if (response.success) {
          await this.fetchStudents()
          return { success: true, data: response.data }
        }
        return { success: false, message: response.message }
      } catch (error: any) {
        return { success: false, message: error?.data?.message || 'ເກີດຂໍ້ຜິດພາດ' }
      }
    },

    async deleteStudent(id: number) {
      const authStore = useAuthStore()
      
      try {
        const response = await $fetch<any>(`/api/students/${id}`, {
          method: 'DELETE',
          headers: authStore.getAuthHeaders(),
        })
        
        if (response.success) {
          await this.fetchStudents()
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (error: any) {
        return { success: false, message: error?.data?.message || 'ເກີດຂໍ້ຜິດພາດ' }
      }
    },

    async assignClassroom(studentIds: number[], classroomId: number) {
      const authStore = useAuthStore()
      
      try {
        const response = await $fetch<any>('/api/students/assign-classroom', {
          method: 'POST',
          body: { studentIds, classroomId },
          headers: authStore.getAuthHeaders(),
        })
        
        if (response.success) {
          await this.fetchStudents()
          return { success: true, message: response.message }
        }
        return { success: false, message: response.message }
      } catch (error: any) {
        return { success: false, message: error?.data?.message || 'ເກີດຂໍ້ຜິດພາດ' }
      }
    },

    setFilters(filters: Partial<StudentState['filters']>) {
      this.filters = { ...this.filters, ...filters }
    },

    resetFilters() {
      this.filters = {
        search: '',
        classroomId: null,
        gradeLevelId: null,
        gender: '',
        status: '',
      }
    },
  },
})
