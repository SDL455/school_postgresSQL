<template>
  <div>
    <!-- Filters -->
    <div class="card mb-6">
      <div class="card-body">
        <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">ຫ້ອງຮຽນ</label>
            <select v-model="selectedClassroom" class="form-input form-select" @change="fetchStudentsForAttendance">
              <option :value="null">-- ເລືອກຫ້ອງ --</option>
              <option v-for="room in classrooms" :key="room.id" :value="room.id">
                {{ room.roomName }}
              </option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">ວັນທີ</label>
            <input v-model="selectedDate" type="date" class="form-input" @change="loadExistingAttendance" />
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">ຄາບທີ</label>
            <select v-model="selectedPeriod" class="form-input form-select">
              <option v-for="n in 8" :key="n" :value="n">ຄາບທີ {{ n }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Attendance Entry -->
    <div v-if="selectedClassroom && selectedDate" class="card">
      <div class="card-header">
        <h3 class="card-title">
          <Icon name="mdi:calendar-check" size="20" style="margin-right: 8px;" />
          ບັນທຶກການເຂົ້າຮຽນ - {{ formatDate(selectedDate) }}
        </h3>
        <div class="flex gap-2">
          <button class="btn btn-outline btn-sm" @click="markAll('PRESENT')">
            <Icon name="mdi:check-all" size="16" />
            ໝາຍເຂົ້າທັງໝົດ
          </button>
          <button class="btn btn-primary" :disabled="saving" @click="saveAttendance">
            <span v-if="saving" class="spinner" style="width: 16px; height: 16px;"></span>
            <span v-else>
              <Icon name="mdi:content-save" size="18" />
              ບັນທຶກ
            </span>
          </button>
        </div>
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
                <th style="width: 120px;">ເຂົ້າ</th>
                <th style="width: 120px;">ຂາດ</th>
                <th style="width: 120px;">ສາຍ</th>
                <th style="width: 120px;">ອະນຸຍາດ</th>
                <th>ໝາຍເຫດ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(att, index) in attendances" :key="att.studentId">
                <td class="text-center">{{ index + 1 }}</td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar avatar-sm">{{ att.student.firstName.charAt(0) }}</div>
                    <span>{{ att.student.firstName }} {{ att.student.lastName }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <input 
                    type="radio" 
                    :name="'att-' + att.studentId" 
                    value="PRESENT"
                    v-model="att.status"
                    style="width: 20px; height: 20px; accent-color: var(--success-500);"
                  />
                </td>
                <td class="text-center">
                  <input 
                    type="radio" 
                    :name="'att-' + att.studentId" 
                    value="ABSENT"
                    v-model="att.status"
                    style="width: 20px; height: 20px; accent-color: var(--error-500);"
                  />
                </td>
                <td class="text-center">
                  <input 
                    type="radio" 
                    :name="'att-' + att.studentId" 
                    value="LATE"
                    v-model="att.status"
                    style="width: 20px; height: 20px; accent-color: var(--warning-500);"
                  />
                </td>
                <td class="text-center">
                  <input 
                    type="radio" 
                    :name="'att-' + att.studentId" 
                    value="EXCUSED"
                    v-model="att.status"
                    style="width: 20px; height: 20px; accent-color: var(--primary-500);"
                  />
                </td>
                <td>
                  <input 
                    v-model="att.note" 
                    type="text" 
                    class="form-input" 
                    style="height: 32px; font-size: 13px;"
                    placeholder="ໝາຍເຫດ..."
                  />
                </td>
              </tr>
              <tr v-if="attendances.length === 0">
                <td colspan="7" class="text-center text-muted py-6">
                  ບໍ່ມີນັກຮຽນໃນຫ້ອງນີ້
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Summary -->
      <div v-if="attendances.length > 0" class="card-footer">
        <div class="flex gap-6">
          <span class="flex items-center gap-2">
            <span class="badge badge-success">ເຂົ້າ</span>
            <strong>{{ countStatus('PRESENT') }}</strong>
          </span>
          <span class="flex items-center gap-2">
            <span class="badge badge-error">ຂາດ</span>
            <strong>{{ countStatus('ABSENT') }}</strong>
          </span>
          <span class="flex items-center gap-2">
            <span class="badge badge-warning">ສາຍ</span>
            <strong>{{ countStatus('LATE') }}</strong>
          </span>
          <span class="flex items-center gap-2">
            <span class="badge badge-primary">ອະນຸຍາດ</span>
            <strong>{{ countStatus('EXCUSED') }}</strong>
          </span>
        </div>
      </div>
    </div>
    
    <div v-else class="card">
      <div class="card-body text-center py-12">
        <Icon name="mdi:calendar-check-outline" size="48" class="text-muted mb-4" />
        <p class="text-muted">ກະລຸນາເລືອກຫ້ອງຮຽນ ແລະ ວັນທີເພື່ອບັນທຶກການເຂົ້າຮຽນ</p>
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
const { getClassrooms, getClassroom, getAttendances, saveAttendances, getAcademicYears } = useApi()

const classrooms = ref<any[]>([])
const attendances = ref<any[]>([])
const terms = ref<any[]>([])

const selectedClassroom = ref<number | null>(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedPeriod = ref(1)
const selectedTerm = ref<number | null>(null)

const loading = ref(false)
const saving = ref(false)

async function fetchData() {
  const [classroomsRes, yearsRes] = await Promise.all([
    getClassrooms({ all: true }),
    getAcademicYears(),
  ])
  
  if (classroomsRes.success) classrooms.value = classroomsRes.data || []
  if (yearsRes.success) {
    const openYear = yearsRes.data?.find((y: any) => y.status === 'OPEN')
    if (openYear) {
      terms.value = openYear.terms || []
      const openTerm = openYear.terms?.find((t: any) => t.status === 'OPEN')
      if (openTerm) selectedTerm.value = openTerm.id
    }
  }
}

async function fetchStudentsForAttendance() {
  if (!selectedClassroom.value) {
    attendances.value = []
    return
  }
  
  loading.value = true
  
  const response = await getClassroom(selectedClassroom.value)
  
  if (response.success && response.data?.students) {
    attendances.value = response.data.students.map((student: any) => ({
      studentId: student.id,
      student,
      status: 'PRESENT',
      note: '',
    }))
    
    await loadExistingAttendance()
  }
  
  loading.value = false
}

async function loadExistingAttendance() {
  if (!selectedClassroom.value || !selectedDate.value) return
  
  const response = await getAttendances({
    classroomId: selectedClassroom.value,
    date: selectedDate.value,
  })
  
  if (response.success && response.data) {
    response.data.forEach((existing: any) => {
      const att = attendances.value.find(a => a.studentId === existing.studentId)
      if (att) {
        att.status = existing.status
        att.note = existing.note || ''
      }
    })
  }
}

function markAll(status: string) {
  attendances.value.forEach(att => {
    att.status = status
  })
}

function countStatus(status: string) {
  return attendances.value.filter(a => a.status === status).length
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('lo-LA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function saveAttendance() {
  if (!selectedClassroom.value || !selectedTerm.value) {
    alert('ກະລຸນາເລືອກຫ້ອງຮຽນ')
    return
  }
  
  saving.value = true
  
  const response = await saveAttendances({
    classroomId: selectedClassroom.value,
    termId: selectedTerm.value,
    date: selectedDate.value,
    periodNumber: selectedPeriod.value,
    attendances: attendances.value.map(a => ({
      studentId: a.studentId,
      status: a.status,
      note: a.note,
    }))
  })
  
  if (response.success) {
    alert('ບັນທຶກການເຂົ້າຮຽນສຳເລັດ')
  } else {
    alert(response.message)
  }
  
  saving.value = false
}

watch(selectedDate, () => {
  if (selectedClassroom.value) {
    loadExistingAttendance()
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
