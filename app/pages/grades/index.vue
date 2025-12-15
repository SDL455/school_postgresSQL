<template>
  <div>
    <!-- Filters -->
    <div class="card mb-6">
      <div class="card-body">
        <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">ຫ້ອງຮຽນ</label>
            <select v-model="selectedClassroom" class="form-input form-select" @change="fetchStudentsForGrades">
              <option :value="null">-- ເລືອກຫ້ອງ --</option>
              <option v-for="room in classrooms" :key="room.id" :value="room.id">
                {{ room.roomName }}
              </option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">ວິຊາ</label>
            <select v-model="selectedSubject" class="form-input form-select">
              <option :value="null">-- ເລືອກວິຊາ --</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.subjectName }}
              </option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">ພາກຮຽນ</label>
            <select v-model="selectedTerm" class="form-input form-select">
              <option :value="null">-- ເລືອກພາກ --</option>
              <option v-for="term in terms" :key="term.id" :value="term.id">
                {{ term.termName }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Grades Entry -->
    <div v-if="selectedClassroom && selectedSubject && selectedTerm" class="card">
      <div class="card-header">
        <h3 class="card-title">
          <Icon name="mdi:clipboard-text" size="20" style="margin-right: 8px;" />
          ປ້ອນຄະແນນ
        </h3>
        <button class="btn btn-primary" :disabled="saving" @click="saveAllGrades">
          <span v-if="saving" class="spinner" style="width: 16px; height: 16px;"></span>
          <span v-else>
            <Icon name="mdi:content-save" size="18" />
            ບັນທຶກທັງໝົດ
          </span>
        </button>
      </div>
      <div class="card-body" style="padding: 0;">
        <div v-if="loading" class="text-center p-6">
          <div class="spinner"></div>
        </div>
        <div v-else class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 60px;">ລຳດັບ</th>
                <th>ນັກຮຽນ</th>
                <th style="width: 100px;">ກາງພາກ (20%)</th>
                <th style="width: 100px;">ປາຍພາກ (40%)</th>
                <th style="width: 100px;">ວຽກບ້ານ (15%)</th>
                <th style="width: 100px;">ສອບຍ່ອຍ (15%)</th>
                <th style="width: 100px;">ເຂົ້າຮຽນ (10%)</th>
                <th style="width: 80px;">ລວມ</th>
                <th style="width: 80px;">ຜົນ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(grade, index) in grades" :key="grade.studentId">
                <td class="text-center">{{ index + 1 }}</td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar avatar-sm">{{ grade.student.firstName.charAt(0) }}</div>
                    <span>{{ grade.student.firstName }} {{ grade.student.lastName }}</span>
                  </div>
                </td>
                <td>
                  <input 
                    v-model.number="grade.midtermScore" 
                    type="number" 
                    min="0" 
                    max="100"
                    class="form-input" 
                    style="height: 32px; font-size: 13px;"
                    @change="calculateTotal(grade)"
                  />
                </td>
                <td>
                  <input 
                    v-model.number="grade.finalScore" 
                    type="number" 
                    min="0" 
                    max="100"
                    class="form-input" 
                    style="height: 32px; font-size: 13px;"
                    @change="calculateTotal(grade)"
                  />
                </td>
                <td>
                  <input 
                    v-model.number="grade.homeworkScore" 
                    type="number" 
                    min="0" 
                    max="100"
                    class="form-input" 
                    style="height: 32px; font-size: 13px;"
                    @change="calculateTotal(grade)"
                  />
                </td>
                <td>
                  <input 
                    v-model.number="grade.quizScore" 
                    type="number" 
                    min="0" 
                    max="100"
                    class="form-input" 
                    style="height: 32px; font-size: 13px;"
                    @change="calculateTotal(grade)"
                  />
                </td>
                <td>
                  <input 
                    v-model.number="grade.attendanceScore" 
                    type="number" 
                    min="0" 
                    max="100"
                    class="form-input" 
                    style="height: 32px; font-size: 13px;"
                    @change="calculateTotal(grade)"
                  />
                </td>
                <td class="text-center font-semibold">
                  {{ grade.totalScore?.toFixed(1) || '-' }}
                </td>
                <td class="text-center">
                  <span 
                    v-if="grade.totalScore !== undefined"
                    class="badge"
                    :class="grade.totalScore >= 50 ? 'badge-success' : 'badge-error'"
                  >
                    {{ grade.totalScore >= 50 ? 'ເສັ່ງ' : 'ຕົກ' }}
                  </span>
                </td>
              </tr>
              <tr v-if="grades.length === 0">
                <td colspan="9" class="text-center text-muted py-6">
                  ບໍ່ມີນັກຮຽນໃນຫ້ອງນີ້
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div v-else class="card">
      <div class="card-body text-center py-12">
        <Icon name="mdi:clipboard-text-outline" size="48" class="text-muted mb-4" />
        <p class="text-muted">ກະລຸນາເລືອກຫ້ອງຮຽນ, ວິຊາ ແລະ ພາກຮຽນເພື່ອປ້ອນຄະແນນ</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const { getClassrooms, getSubjects, getAcademicYears, getGrades, saveGrade, getClassroom } = useApi()

const classrooms = ref<any[]>([])
const subjects = ref<any[]>([])
const terms = ref<any[]>([])
const grades = ref<any[]>([])

const selectedClassroom = ref<number | null>(null)
const selectedSubject = ref<number | null>(null)
const selectedTerm = ref<number | null>(null)
const selectedAcademicYear = ref<number | null>(null)

const loading = ref(false)
const saving = ref(false)

async function fetchData() {
  const [classroomsRes, subjectsRes, yearsRes] = await Promise.all([
    getClassrooms({ all: true }),
    getSubjects({ all: true }),
    getAcademicYears(),
  ])
  
  if (classroomsRes.success) classrooms.value = classroomsRes.data || []
  if (subjectsRes.success) subjects.value = subjectsRes.data || []
  if (yearsRes.success) {
    const openYear = yearsRes.data?.find((y: any) => y.status === 'OPEN')
    if (openYear) {
      selectedAcademicYear.value = openYear.id
      terms.value = openYear.terms || []
    }
  }
}

async function fetchStudentsForGrades() {
  if (!selectedClassroom.value) {
    grades.value = []
    return
  }
  
  loading.value = true
  
  const response = await getClassroom(selectedClassroom.value)
  
  if (response.success && response.data?.students) {
    grades.value = response.data.students.map((student: any) => ({
      studentId: student.id,
      student,
      midtermScore: null,
      finalScore: null,
      homeworkScore: null,
      quizScore: null,
      attendanceScore: null,
      totalScore: undefined,
    }))
    
    // Load existing grades
    if (selectedSubject.value && selectedTerm.value) {
      await loadExistingGrades()
    }
  }
  
  loading.value = false
}

async function loadExistingGrades() {
  if (!selectedClassroom.value || !selectedSubject.value || !selectedTerm.value) return
  
  const response = await getGrades({
    classroomId: selectedClassroom.value,
    subjectId: selectedSubject.value,
    termId: selectedTerm.value,
  })
  
  if (response.success && response.data) {
    response.data.forEach((existingGrade: any) => {
      const grade = grades.value.find(g => g.studentId === existingGrade.studentId)
      if (grade) {
        grade.midtermScore = existingGrade.midtermScore
        grade.finalScore = existingGrade.finalScore
        grade.homeworkScore = existingGrade.homeworkScore
        grade.quizScore = existingGrade.quizScore
        grade.attendanceScore = existingGrade.attendanceScore
        grade.totalScore = existingGrade.totalScore
      }
    })
  }
}

function calculateTotal(grade: any) {
  const midterm = grade.midtermScore || 0
  const final = grade.finalScore || 0
  const homework = grade.homeworkScore || 0
  const quiz = grade.quizScore || 0
  const attendance = grade.attendanceScore || 0
  
  grade.totalScore = (midterm * 0.2) + (final * 0.4) + (homework * 0.15) + (quiz * 0.15) + (attendance * 0.1)
}

async function saveAllGrades() {
  if (!selectedSubject.value || !selectedTerm.value || !selectedAcademicYear.value) {
    alert('ກະລຸນາເລືອກວິຊາ ແລະ ພາກຮຽນ')
    return
  }
  
  saving.value = true
  
  for (const grade of grades.value) {
    if (grade.midtermScore !== null || grade.finalScore !== null) {
      await saveGrade({
        studentId: grade.studentId,
        subjectId: selectedSubject.value,
        termId: selectedTerm.value,
        academicYearId: selectedAcademicYear.value,
        midtermScore: grade.midtermScore,
        finalScore: grade.finalScore,
        homeworkScore: grade.homeworkScore,
        quizScore: grade.quizScore,
        attendanceScore: grade.attendanceScore,
      })
    }
  }
  
  alert('ບັນທຶກຄະແນນສຳເລັດ')
  saving.value = false
}

watch([selectedSubject, selectedTerm], () => {
  if (selectedClassroom.value && selectedSubject.value && selectedTerm.value) {
    loadExistingGrades()
  }
})

onMounted(async () => {
  await authStore.initialize()
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  
  await fetchData()
})
</script>
