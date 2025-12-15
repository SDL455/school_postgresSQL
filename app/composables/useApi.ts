import { useAuthStore } from '~/stores/auth'

export function useApi() {
  const authStore = useAuthStore()
  
  const request = async <T>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: any
      params?: Record<string, string | number | boolean | undefined | null>
    } = {}
  ): Promise<{ success: boolean; data?: T; message?: string; pagination?: any }> => {
    const { method = 'GET', body, params } = options
    
    try {
      let queryString = ''
      if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value))
          }
        })
        queryString = searchParams.toString()
        if (queryString) queryString = '?' + queryString
      }
      
      const response = await $fetch<any>(`${url}${queryString}`, {
        method,
        body: method !== 'GET' ? body : undefined,
        headers: authStore.getAuthHeaders(),
      })
      
      return response
    } catch (error: any) {
      const message = error?.data?.message || error?.message || 'ເກີດຂໍ້ຜິດພາດ'
      return { success: false, message }
    }
  }
  
  // Students
  const getStudents = (params?: any) => request<any[]>('/api/students', { params })
  const getStudent = (id: number) => request<any>(`/api/students/${id}`)
  const createStudent = (data: any) => request<any>('/api/students', { method: 'POST', body: data })
  const updateStudent = (id: number, data: any) => request<any>(`/api/students/${id}`, { method: 'PUT', body: data })
  const deleteStudent = (id: number) => request<any>(`/api/students/${id}`, { method: 'DELETE' })
  
  // Teachers
  const getTeachers = (params?: any) => request<any[]>('/api/teachers', { params })
  const createTeacher = (data: any) => request<any>('/api/teachers', { method: 'POST', body: data })
  const updateTeacher = (id: number, data: any) => request<any>(`/api/teachers/${id}`, { method: 'PUT', body: data })
  const deleteTeacher = (id: number) => request<any>(`/api/teachers/${id}`, { method: 'DELETE' })
  
  // Classrooms
  const getClassrooms = (params?: any) => request<any[]>('/api/classrooms', { params })
  const getClassroom = (id: number) => request<any>(`/api/classrooms/${id}`)
  const createClassroom = (data: any) => request<any>('/api/classrooms', { method: 'POST', body: data })
  const updateClassroom = (id: number, data: any) => request<any>(`/api/classrooms/${id}`, { method: 'PUT', body: data })
  
  // Subjects
  const getSubjects = (params?: any) => request<any[]>('/api/subjects', { params })
  const createSubject = (data: any) => request<any>('/api/subjects', { method: 'POST', body: data })
  
  // Academic Years
  const getAcademicYears = () => request<any[]>('/api/academic-years')
  const createAcademicYear = (data: any) => request<any>('/api/academic-years', { method: 'POST', body: data })
  
  // Grade Levels
  const getGradeLevels = () => request<any[]>('/api/grade-levels')
  const createGradeLevel = (data: any) => request<any>('/api/grade-levels', { method: 'POST', body: data })
  
  // Grades
  const getGrades = (params?: any) => request<any[]>('/api/grades', { params })
  const saveGrade = (data: any) => request<any>('/api/grades', { method: 'POST', body: data })
  
  // Attendances
  const getAttendances = (params?: any) => request<any[]>('/api/attendances', { params })
  const saveAttendances = (data: any) => request<any>('/api/attendances', { method: 'POST', body: data })
  
  // Schedules
  const getSchedules = (params?: any) => request<any[]>('/api/schedules', { params })
  const createSchedule = (data: any) => request<any>('/api/schedules', { method: 'POST', body: data })
  
  // Users
  const getUsers = (params?: any) => request<any[]>('/api/users', { params })
  const createUser = (data: any) => request<any>('/api/users', { method: 'POST', body: data })
  const updateUser = (id: number, data: any) => request<any>(`/api/users/${id}`, { method: 'PUT', body: data })
  const deleteUser = (id: number) => request<any>(`/api/users/${id}`, { method: 'DELETE' })
  
  // Dashboard
  const getDashboardStats = (params?: any) => request<any>('/api/dashboard/stats', { params })
  
  return {
    request,
    // Students
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    // Teachers
    getTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    // Classrooms
    getClassrooms,
    getClassroom,
    createClassroom,
    updateClassroom,
    // Subjects
    getSubjects,
    createSubject,
    // Academic
    getAcademicYears,
    createAcademicYear,
    getGradeLevels,
    createGradeLevel,
    // Grades
    getGrades,
    saveGrade,
    // Attendances
    getAttendances,
    saveAttendances,
    // Schedules
    getSchedules,
    createSchedule,
    // Users
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    // Dashboard
    getDashboardStats,
  }
}
