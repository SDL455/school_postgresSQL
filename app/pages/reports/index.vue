<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">ລາຍງານ ແລະ ສະຖິຕິ</h2>
      <div class="flex gap-2">
        <button class="btn btn-outline" @click="exportData">
          <Icon name="mdi:file-excel" size="18" />
          Export Excel
        </button>
        <button class="btn btn-outline" @click="printReport">
          <Icon name="mdi:printer" size="18" />
          ພິມ
        </button>
      </div>
    </div>
    
    <!-- Report Types -->
    <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
      <div class="card" @click="selectedReport = 'students'" style="cursor: pointer;">
        <div class="card-body">
          <div class="flex items-center gap-4">
            <div class="stat-icon primary">
              <Icon name="mdi:account-school" size="28" />
            </div>
            <div>
              <h3 class="font-semibold">ລາຍງານນັກຮຽນ</h3>
              <p class="text-muted text-sm">ຈຳນວນນັກຮຽນແຍກຕາມຫ້ອງ, ຊັ້ນ, ເພດ</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card" @click="selectedReport = 'teachers'" style="cursor: pointer;">
        <div class="card-body">
          <div class="flex items-center gap-4">
            <div class="stat-icon secondary">
              <Icon name="mdi:human-male-board" size="28" />
            </div>
            <div>
              <h3 class="font-semibold">ລາຍງານອາຈານ</h3>
              <p class="text-muted text-sm">ຈຳນວນອາຈານແຍກຕາມພາກວິຊາ</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card" @click="selectedReport = 'grades'" style="cursor: pointer;">
        <div class="card-body">
          <div class="flex items-center gap-4">
            <div class="stat-icon success">
              <Icon name="mdi:clipboard-check" size="28" />
            </div>
            <div>
              <h3 class="font-semibold">ລາຍງານຜົນການຮຽນ</h3>
              <p class="text-muted text-sm">ສະຖິຕິເສັ່ງ/ຕົກ ແຍກຕາມຫ້ອງ</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card" @click="selectedReport = 'attendance'" style="cursor: pointer;">
        <div class="card-body">
          <div class="flex items-center gap-4">
            <div class="stat-icon warning">
              <Icon name="mdi:calendar-check" size="28" />
            </div>
            <div>
              <h3 class="font-semibold">ລາຍງານການເຂົ້າຮຽນ</h3>
              <p class="text-muted text-sm">ສະຖິຕິການຂາດຮຽນ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Report Content -->
    <div v-if="selectedReport" class="card mt-6">
      <div class="card-header">
        <h3 class="card-title">{{ reportTitles[selectedReport] }}</h3>
        <button class="btn btn-ghost btn-sm" @click="selectedReport = null">
          <Icon name="mdi:close" size="18" />
        </button>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center p-6">
          <div class="spinner"></div>
        </div>
        
        <!-- Student Report -->
        <div v-else-if="selectedReport === 'students' && stats">
          <div class="mb-6">
            <h4 class="font-semibold mb-3">ສະຫຼຸບຈຳນວນນັກຮຽນ</h4>
            <div class="grid grid-cols-4 gap-4">
              <div class="p-4 rounded-lg" style="background: var(--primary-50);">
                <div class="text-2xl font-bold text-primary-600">{{ stats.overview?.activeStudents || 0 }}</div>
                <div class="text-sm text-muted">ນັກຮຽນທັງໝົດ</div>
              </div>
              <div class="p-4 rounded-lg" style="background: var(--secondary-50);">
                <div class="text-2xl font-bold text-secondary-600">{{ stats.overview?.maleStudents || 0 }}</div>
                <div class="text-sm text-muted">ນັກຮຽນຊາຍ</div>
              </div>
              <div class="p-4 rounded-lg" style="background: var(--success-50);">
                <div class="text-2xl font-bold text-success-600">{{ stats.overview?.femaleStudents || 0 }}</div>
                <div class="text-sm text-muted">ນັກຮຽນຍິງ</div>
              </div>
              <div class="p-4 rounded-lg" style="background: var(--warning-50);">
                <div class="text-2xl font-bold text-warning-600">{{ stats.overview?.totalClassrooms || 0 }}</div>
                <div class="text-sm text-muted">ຫ້ອງຮຽນ</div>
              </div>
            </div>
          </div>
          
          <h4 class="font-semibold mb-3">ນັກຮຽນແຍກຕາມຫ້ອງ</h4>
          <table class="table">
            <thead>
              <tr>
                <th>ຫ້ອງຮຽນ</th>
                <th class="text-center">ຊາຍ</th>
                <th class="text-center">ຍິງ</th>
                <th class="text-center">ລວມ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in stats.classroomStats" :key="room.id">
                <td>{{ room.roomName }}</td>
                <td class="text-center">{{ room.maleCount }}</td>
                <td class="text-center">{{ room.femaleCount }}</td>
                <td class="text-center font-semibold">{{ room.totalStudents }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Teacher Report -->
        <div v-else-if="selectedReport === 'teachers' && stats">
          <h4 class="font-semibold mb-3">ອາຈານແຍກຕາມພາກວິຊາ</h4>
          <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
            <div 
              v-for="dept in stats.teachersByDepartment" 
              :key="dept.department"
              class="p-4 rounded-lg" 
              style="background: var(--neutral-50);"
            >
              <div class="text-2xl font-bold">{{ dept._count.id }}</div>
              <div class="text-sm text-muted">{{ getDepartmentLabel(dept.department) }}</div>
            </div>
          </div>
        </div>
        
        <!-- Grades Report -->
        <div v-else-if="selectedReport === 'grades' && stats?.gradeStats">
          <h4 class="font-semibold mb-3">ສະຖິຕິຜົນການຮຽນ</h4>
          <div class="grid grid-cols-3 gap-4">
            <div class="p-6 rounded-lg text-center" style="background: var(--success-50);">
              <div class="text-4xl font-bold text-success-600">{{ stats.gradeStats.passed }}</div>
              <div class="text-muted">ນັກຮຽນເສັ່ງ</div>
            </div>
            <div class="p-6 rounded-lg text-center" style="background: var(--error-50);">
              <div class="text-4xl font-bold text-error-600">{{ stats.gradeStats.failed }}</div>
              <div class="text-muted">ນັກຮຽນຕົກ</div>
            </div>
            <div class="p-6 rounded-lg text-center" style="background: var(--primary-50);">
              <div class="text-4xl font-bold text-primary-600">{{ stats.gradeStats.passRate }}%</div>
              <div class="text-muted">ອັດຕາເສັ່ງ</div>
            </div>
          </div>
        </div>
        
        <!-- Attendance Report -->
        <div v-else-if="selectedReport === 'attendance' && stats?.attendanceStats">
          <h4 class="font-semibold mb-3">ສະຖິຕິການເຂົ້າຮຽນ (30 ມື້ຜ່ານມາ)</h4>
          <div class="grid grid-cols-4 gap-4">
            <div class="p-4 rounded-lg text-center" style="background: var(--success-50);">
              <div class="text-2xl font-bold text-success-600">{{ stats.attendanceStats.present }}</div>
              <div class="text-muted">ເຂົ້າ</div>
            </div>
            <div class="p-4 rounded-lg text-center" style="background: var(--error-50);">
              <div class="text-2xl font-bold text-error-600">{{ stats.attendanceStats.absent }}</div>
              <div class="text-muted">ຂາດ</div>
            </div>
            <div class="p-4 rounded-lg text-center" style="background: var(--warning-50);">
              <div class="text-2xl font-bold text-warning-600">{{ stats.attendanceStats.late }}</div>
              <div class="text-muted">ສາຍ</div>
            </div>
            <div class="p-4 rounded-lg text-center" style="background: var(--primary-50);">
              <div class="text-2xl font-bold text-primary-600">{{ stats.attendanceStats.excused }}</div>
              <div class="text-muted">ອະນຸຍາດ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useDashboardStore } from '~/stores/dashboard'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const selectedReport = ref<string | null>(null)
const loading = computed(() => dashboardStore.loading)
const stats = computed(() => dashboardStore.stats)

const reportTitles: Record<string, string> = {
  students: 'ລາຍງານນັກຮຽນ',
  teachers: 'ລາຍງານອາຈານ',
  grades: 'ລາຍງານຜົນການຮຽນ',
  attendance: 'ລາຍງານການເຂົ້າຮຽນ',
}

const departmentLabels: Record<string, string> = {
  MATH: 'ຄະນິດສາດ',
  SCIENCE: 'ວິທະຍາສາດ',
  LANGUAGE: 'ພາສາ',
  SOCIAL: 'ສັງຄົມ',
  ARTS: 'ສິລະປະ',
  PHYSICAL: 'ພະລະສຶກສາ',
  TECHNOLOGY: 'ເຕັກໂນໂລຊີ',
  GENERAL: 'ທົ່ວໄປ',
}

function getDepartmentLabel(dept: string) {
  return departmentLabels[dept] || dept
}

function exportData() {
  alert('ກຳລັງພັດທະນາຟັງຊັນນີ້...')
}

function printReport() {
  window.print()
}

onMounted(async () => {
  await authStore.initialize()
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  
  await dashboardStore.fetchStats()
})
</script>

<style scoped>
@media print {
  .btn {
    display: none !important;
  }
}
</style>
