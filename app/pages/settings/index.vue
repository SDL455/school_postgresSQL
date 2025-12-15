<template>
  <div v-if="authStore.isAdmin">
    <h2 class="text-xl font-semibold mb-6">ຕັ້ງຄ່າລະບົບ</h2>
    
    <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));">
      <!-- Academic Years -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <Icon name="mdi:calendar" size="20" style="margin-right: 8px;" />
            ປີຮຽນ
          </h3>
          <button class="btn btn-primary btn-sm" @click="showYearModal = true">
            <Icon name="mdi:plus" size="16" />
          </button>
        </div>
        <div class="card-body">
          <div v-for="year in academicYears" :key="year.id" class="flex items-center justify-between py-2 border-b last:border-0">
            <div>
              <div class="font-medium">{{ year.yearName }}</div>
              <div class="text-xs text-muted">
                {{ formatDate(year.startDate) }} - {{ formatDate(year.endDate) }}
              </div>
            </div>
            <span class="badge" :class="year.status === 'OPEN' ? 'badge-success' : 'badge-neutral'">
              {{ year.status === 'OPEN' ? 'ເປີດ' : 'ປິດ' }}
            </span>
          </div>
          <div v-if="academicYears.length === 0" class="text-center text-muted py-4">
            ບໍ່ມີປີຮຽນ
          </div>
        </div>
      </div>
      
      <!-- Grade Levels -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <Icon name="mdi:stairs" size="20" style="margin-right: 8px;" />
            ຊັ້ນຮຽນ
          </h3>
          <button class="btn btn-primary btn-sm" @click="showLevelModal = true">
            <Icon name="mdi:plus" size="16" />
          </button>
        </div>
        <div class="card-body">
          <div v-for="level in gradeLevels" :key="level.id" class="flex items-center justify-between py-2 border-b last:border-0">
            <div>
              <span class="badge badge-primary">{{ level.levelCode }}</span>
              <span class="ml-2">{{ level.levelName }}</span>
            </div>
            <span class="text-muted text-sm">{{ level._count?.classrooms || 0 }} ຫ້ອງ</span>
          </div>
          <div v-if="gradeLevels.length === 0" class="text-center text-muted py-4">
            ບໍ່ມີຊັ້ນຮຽນ
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Year Modal -->
    <div v-if="showYearModal" class="modal-overlay" @click.self="showYearModal = false">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">ເພີ່ມປີຮຽນ</h3>
          <button class="modal-close" @click="showYearModal = false">
            <Icon name="mdi:close" size="20" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">ຊື່ປີຮຽນ *</label>
            <input v-model="yearForm.yearName" type="text" class="form-input" placeholder="2024-2025" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">ເລີ່ມ *</label>
              <input v-model="yearForm.startDate" type="date" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">ສິ້ນສຸດ *</label>
              <input v-model="yearForm.endDate" type="date" class="form-input" required />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showYearModal = false">ຍົກເລີກ</button>
          <button class="btn btn-primary" @click="createYear">ເພີ່ມ</button>
        </div>
      </div>
    </div>
    
    <!-- Add Level Modal -->
    <div v-if="showLevelModal" class="modal-overlay" @click.self="showLevelModal = false">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">ເພີ່ມຊັ້ນຮຽນ</h3>
          <button class="modal-close" @click="showLevelModal = false">
            <Icon name="mdi:close" size="20" />
          </button>
        </div>
        <div class="modal-body">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">ລະຫັດ *</label>
              <input v-model="levelForm.levelCode" type="text" class="form-input" placeholder="M1" required />
            </div>
            <div class="form-group">
              <label class="form-label">ລຳດັບ *</label>
              <input v-model.number="levelForm.levelOrder" type="number" class="form-input" min="1" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">ຊື່ຊັ້ນ *</label>
            <input v-model="levelForm.levelName" type="text" class="form-input" placeholder="ມ.1" required />
          </div>
          <div class="form-group">
            <label class="form-label">ລາຍລະອຽດ</label>
            <input v-model="levelForm.description" type="text" class="form-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showLevelModal = false">ຍົກເລີກ</button>
          <button class="btn btn-primary" @click="createLevel">ເພີ່ມ</button>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="card">
    <div class="card-body text-center py-12">
      <Icon name="mdi:lock" size="48" class="text-muted mb-4" />
      <p class="text-muted">ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const { getAcademicYears, createAcademicYear, getGradeLevels, createGradeLevel } = useApi()

const academicYears = ref<any[]>([])
const gradeLevels = ref<any[]>([])

const showYearModal = ref(false)
const showLevelModal = ref(false)

const yearForm = ref({
  yearName: '',
  startDate: '',
  endDate: '',
})

const levelForm = ref({
  levelCode: '',
  levelName: '',
  levelOrder: 1,
  description: '',
})

async function fetchData() {
  const [yearsRes, levelsRes] = await Promise.all([
    getAcademicYears(),
    getGradeLevels(),
  ])
  
  if (yearsRes.success) academicYears.value = yearsRes.data || []
  if (levelsRes.success) gradeLevels.value = levelsRes.data || []
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('lo-LA')
}

async function createYear() {
  const response = await createAcademicYear(yearForm.value)
  if (response.success) {
    showYearModal.value = false
    yearForm.value = { yearName: '', startDate: '', endDate: '' }
    await fetchData()
  } else {
    alert(response.message)
  }
}

async function createLevel() {
  const response = await createGradeLevel(levelForm.value)
  if (response.success) {
    showLevelModal.value = false
    levelForm.value = { levelCode: '', levelName: '', levelOrder: 1, description: '' }
    await fetchData()
  } else {
    alert(response.message)
  }
}

onMounted(async () => {
  await authStore.initialize()
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  
  if (authStore.isAdmin) {
    await fetchData()
  }
})
</script>

<style scoped>
.last\:border-0:last-child {
  border-bottom: none;
}
</style>
