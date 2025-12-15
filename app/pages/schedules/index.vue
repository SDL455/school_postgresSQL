<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <select v-model="selectedClassroom" class="form-input form-select" style="width: auto;">
          <option :value="null">-- ເລືອກຫ້ອງ --</option>
          <option v-for="room in classrooms" :key="room.id" :value="room.id">
            {{ room.roomName }}
          </option>
        </select>
      </div>
      <button class="btn btn-primary" @click="openCreateModal" v-if="selectedClassroom">
        <Icon name="mdi:plus" size="18" />
        ເພີ່ມຕາຕະລາງ
      </button>
    </div>
    
    <div v-if="selectedClassroom && schedules.length > 0" class="card">
      <div class="card-header">
        <h3 class="card-title">
          <Icon name="mdi:timetable" size="20" style="margin-right: 8px;" />
          ຕາຕະລາງຮຽນ
        </h3>
      </div>
      <div class="card-body" style="overflow-x: auto;">
        <table class="table" style="min-width: 900px;">
          <thead>
            <tr>
              <th style="width: 80px;">ຄາບ/ມື້</th>
              <th v-for="day in daysOfWeek" :key="day.value" class="text-center">
                {{ day.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="period in 8" :key="period">
              <td class="text-center font-semibold" style="background: var(--neutral-50);">
                {{ period }}
              </td>
              <td v-for="day in daysOfWeek" :key="day.value" class="text-center">
                <div 
                  v-if="getSchedule(day.value, period)"
                  class="p-2 rounded-lg text-xs"
                  style="background: var(--primary-50);"
                >
                  <div class="font-medium">{{ getSchedule(day.value, period)?.subject?.subjectName }}</div>
                  <div class="text-muted">{{ getSchedule(day.value, period)?.teacher?.firstName }}</div>
                  <div class="text-muted">{{ getSchedule(day.value, period)?.startTime }} - {{ getSchedule(day.value, period)?.endTime }}</div>
                </div>
                <span v-else class="text-muted">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-else-if="selectedClassroom" class="card">
      <div class="card-body text-center py-12">
        <Icon name="mdi:timetable" size="48" class="text-muted mb-4" />
        <p class="text-muted">ບໍ່ມີຕາຕະລາງສຳລັບຫ້ອງນີ້</p>
      </div>
    </div>
    
    <div v-else class="card">
      <div class="card-body text-center py-12">
        <Icon name="mdi:timetable" size="48" class="text-muted mb-4" />
        <p class="text-muted">ກະລຸນາເລືອກຫ້ອງຮຽນເພື່ອເບິ່ງຕາຕະລາງ</p>
      </div>
    </div>
    
    <!-- Create Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">ເພີ່ມຕາຕະລາງ</h3>
          <button class="modal-close" @click="closeModal">
            <Icon name="mdi:close" size="20" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">ມື້ *</label>
                <select v-model="form.dayOfWeek" class="form-input form-select" required>
                  <option v-for="day in daysOfWeek" :key="day.value" :value="day.value">
                    {{ day.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">ຄາບທີ *</label>
                <select v-model="form.periodNumber" class="form-input form-select" required>
                  <option v-for="n in 8" :key="n" :value="n">ຄາບທີ {{ n }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">ວິຊາ *</label>
              <select v-model="form.subjectId" class="form-input form-select" required>
                <option :value="null">-- ເລືອກວິຊາ --</option>
                <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                  {{ subject.subjectName }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">ອາຈານ *</label>
              <select v-model="form.teacherId" class="form-input form-select" required>
                <option :value="null">-- ເລືອກອາຈານ --</option>
                <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                  {{ teacher.firstName }} {{ teacher.lastName }}
                </option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">ເວລາເລີ່ມ *</label>
                <input v-model="form.startTime" type="time" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">ເວລາສິ້ນສຸດ *</label>
                <input v-model="form.endTime" type="time" class="form-input" required />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeModal">ຍົກເລີກ</button>
          <button class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
            <span v-if="submitting" class="spinner" style="width: 16px; height: 16px;"></span>
            <span v-else>ເພີ່ມ</span>
          </button>
        </div>
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
const { getClassrooms, getSubjects, getTeachers, getSchedules, createSchedule } = useApi()

const classrooms = ref<any[]>([])
const subjects = ref<any[]>([])
const teachers = ref<any[]>([])
const schedules = ref<any[]>([])

const selectedClassroom = ref<number | null>(null)
const showModal = ref(false)
const submitting = ref(false)

const daysOfWeek = [
  { value: 'MONDAY', label: 'ຈັນ' },
  { value: 'TUESDAY', label: 'ອັງຄານ' },
  { value: 'WEDNESDAY', label: 'ພຸດ' },
  { value: 'THURSDAY', label: 'ພະຫັດ' },
  { value: 'FRIDAY', label: 'ສຸກ' },
  { value: 'SATURDAY', label: 'ເສົາ' },
]

const defaultForm = {
  dayOfWeek: 'MONDAY',
  periodNumber: 1,
  subjectId: null as number | null,
  teacherId: null as number | null,
  startTime: '08:00',
  endTime: '09:00',
}

const form = ref({ ...defaultForm })

async function fetchData() {
  const [classroomsRes, subjectsRes, teachersRes] = await Promise.all([
    getClassrooms({ all: true }),
    getSubjects({ all: true }),
    getTeachers({ all: true }),
  ])
  
  if (classroomsRes.success) classrooms.value = classroomsRes.data || []
  if (subjectsRes.success) subjects.value = subjectsRes.data || []
  if (teachersRes.success) teachers.value = teachersRes.data || []
}

async function fetchSchedules() {
  if (!selectedClassroom.value) {
    schedules.value = []
    return
  }
  
  const response = await getSchedules({ classroomId: selectedClassroom.value })
  if (response.success) {
    schedules.value = response.data || []
  }
}

function getSchedule(day: string, period: number) {
  return schedules.value.find(s => s.dayOfWeek === day && s.periodNumber === period)
}

function openCreateModal() {
  form.value = { ...defaultForm }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSubmit() {
  if (!selectedClassroom.value) return
  
  submitting.value = true
  
  const response = await createSchedule({
    ...form.value,
    classroomId: selectedClassroom.value,
  })
  
  if (response.success) {
    closeModal()
    await fetchSchedules()
  } else {
    alert(response.message)
  }
  
  submitting.value = false
}

watch(selectedClassroom, () => {
  fetchSchedules()
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
