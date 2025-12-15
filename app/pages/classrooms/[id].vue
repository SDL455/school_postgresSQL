<template>
  <div v-if="classroom">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button class="btn btn-ghost" @click="$router.back()">
          <Icon name="mdi:arrow-left" size="20" />
        </button>
        <div>
          <h1 class="text-2xl font-bold">{{ classroom.roomName }}</h1>
          <p class="text-muted">{{ classroom.gradeLevel?.levelName }} - {{ classroom.academicYear?.yearName }}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-outline" @click="printList">
          <Icon name="mdi:printer" size="18" />
          ພິມລາຍຊື່
        </button>
      </div>
    </div>
    
    <!-- Stats -->
    <div class="stats-grid mb-6">
      <div class="stat-card primary">
        <div class="stat-icon primary">
          <Icon name="mdi:account-group" size="28" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ classroom.statistics?.totalStudents || 0 }}</div>
          <div class="stat-label">ນັກຮຽນທັງໝົດ</div>
        </div>
      </div>
      <div class="stat-card secondary">
        <div class="stat-icon secondary">
          <Icon name="mdi:gender-male" size="28" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ classroom.statistics?.maleCount || 0 }}</div>
          <div class="stat-label">ນັກຮຽນຊາຍ</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon success">
          <Icon name="mdi:gender-female" size="28" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ classroom.statistics?.femaleCount || 0 }}</div>
          <div class="stat-label">ນັກຮຽນຍິງ</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon warning">
          <Icon name="mdi:human-male-board" size="28" />
        </div>
        <div class="stat-content">
          <div class="stat-value" v-if="classroom.homeroomTeacher">1</div>
          <div class="stat-value" v-else>-</div>
          <div class="stat-label">ຄູປະຈຳ</div>
          <div class="text-xs text-muted mt-1" v-if="classroom.homeroomTeacher">
            {{ classroom.homeroomTeacher.firstName }} {{ classroom.homeroomTeacher.lastName }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Students List -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          <Icon name="mdi:account-school" size="20" style="margin-right: 8px;" />
          ລາຍຊື່ນັກຮຽນ
        </h3>
      </div>
      <div class="card-body" style="padding: 0;">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 60px;">ລຳດັບ</th>
              <th>ລະຫັດ</th>
              <th>ຊື່ ແລະ ນາມສະກຸນ</th>
              <th>ເພດ</th>
              <th>ເບີໂທ</th>
              <th>ຜູ້ປົກຄອງ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in classroom.students" :key="student.id">
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ student.studentCode }}</td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="avatar avatar-sm">{{ student.firstName.charAt(0) }}</div>
                  <span>{{ student.firstName }} {{ student.lastName }}</span>
                </div>
              </td>
              <td>
                <span class="badge" :class="student.gender === 'MALE' ? 'badge-primary' : 'badge-secondary'">
                  {{ student.gender === 'MALE' ? 'ຊາຍ' : 'ຍິງ' }}
                </span>
              </td>
              <td>{{ student.phone || '-' }}</td>
              <td>
                <div v-if="student.guardianName">
                  <div>{{ student.guardianName }}</div>
                  <div class="text-xs text-muted">{{ student.guardianPhone }}</div>
                </div>
                <span v-else class="text-muted">-</span>
              </td>
            </tr>
            <tr v-if="!classroom.students?.length">
              <td colspan="6" class="text-center text-muted py-6">ບໍ່ມີນັກຮຽນໃນຫ້ອງນີ້</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Schedule -->
    <div class="card mt-6" v-if="classroom.schedules?.length">
      <div class="card-header">
        <h3 class="card-title">
          <Icon name="mdi:timetable" size="20" style="margin-right: 8px;" />
          ຕາຕະລາງຮຽນ
        </h3>
      </div>
      <div class="card-body">
        <div class="grid gap-4" style="grid-template-columns: repeat(6, 1fr);">
          <div 
            v-for="day in daysOfWeek" 
            :key="day.value"
            class="text-center"
          >
            <div class="font-semibold mb-2">{{ day.label }}</div>
            <div class="space-y-2">
              <div 
                v-for="schedule in getSchedulesByDay(day.value)"
                :key="schedule.id"
                class="p-2 rounded-lg text-xs"
                style="background: var(--primary-50);"
              >
                <div class="font-medium">{{ schedule.subject?.subjectName }}</div>
                <div class="text-muted">{{ schedule.startTime }} - {{ schedule.endTime }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else-if="loading" class="text-center p-12">
    <div class="spinner"></div>
  </div>
  
  <div v-else class="text-center p-12">
    <Icon name="mdi:alert-circle" size="48" class="text-muted mb-4" />
    <p class="text-muted">ບໍ່ພົບຫ້ອງຮຽນ</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const authStore = useAuthStore()
const { getClassroom } = useApi()

const classroom = ref<any>(null)
const loading = ref(true)

const daysOfWeek = [
  { value: 'MONDAY', label: 'ຈັນ' },
  { value: 'TUESDAY', label: 'ອັງຄານ' },
  { value: 'WEDNESDAY', label: 'ພຸດ' },
  { value: 'THURSDAY', label: 'ພະຫັດ' },
  { value: 'FRIDAY', label: 'ສຸກ' },
  { value: 'SATURDAY', label: 'ເສົາ' },
]

async function fetchClassroom() {
  loading.value = true
  const id = parseInt(route.params.id as string)
  const response = await getClassroom(id)
  
  if (response.success) {
    classroom.value = response.data
  }
  loading.value = false
}

function getSchedulesByDay(day: string) {
  return classroom.value?.schedules?.filter((s: any) => s.dayOfWeek === day) || []
}

function printList() {
  window.print()
}

onMounted(async () => {
  await authStore.initialize()
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  
  await fetchClassroom()
})
</script>

<style scoped>
.space-y-2 > * + * {
  margin-top: 0.5rem;
}

@media print {
  .btn, .card-header button {
    display: none !important;
  }
}
</style>
