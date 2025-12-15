<template>
  <div>
    <!-- Header Actions -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <select v-model="filterGradeLevel" class="form-input form-select" style="width: auto;">
          <option value="">ທຸກຊັ້ນ</option>
          <option v-for="level in gradeLevels" :key="level.id" :value="level.id">
            {{ level.levelName }}
          </option>
        </select>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <Icon name="mdi:plus" size="18" />
        ເພີ່ມຫ້ອງຮຽນ
      </button>
    </div>
    
    <!-- Classrooms Grid -->
    <div v-if="loading" class="text-center p-6">
      <div class="spinner"></div>
    </div>
    <div v-else class="grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
      <div 
        v-for="classroom in classrooms" 
        :key="classroom.id"
        class="card"
        style="cursor: pointer;"
        @click="viewClassroom(classroom)"
      >
        <div class="card-body">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-bold">{{ classroom.roomName }}</h3>
              <span class="badge badge-primary">{{ classroom.gradeLevel?.levelName }}</span>
            </div>
            <div class="flex gap-1">
              <button class="btn btn-ghost btn-sm" @click.stop="openEditModal(classroom)">
                <Icon name="mdi:pencil" size="16" />
              </button>
            </div>
          </div>
          
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-sm">
              <Icon name="mdi:account-school" size="18" class="text-primary" />
              <span>ນັກຮຽນ: <strong>{{ classroom._count?.students || 0 }}</strong> ຄົນ</span>
            </div>
            
            <div v-if="classroom.homeroomTeacher" class="flex items-center gap-2 text-sm">
              <Icon name="mdi:human-male-board" size="18" class="text-secondary" />
              <span>ຄູປະຈຳ: {{ classroom.homeroomTeacher.firstName }} {{ classroom.homeroomTeacher.lastName }}</span>
            </div>
            <div v-else class="flex items-center gap-2 text-sm text-muted">
              <Icon name="mdi:human-male-board" size="18" />
              <span>ຍັງບໍ່ມີຄູປະຈຳ</span>
            </div>
            
            <div class="flex items-center gap-2 text-sm text-muted">
              <Icon name="mdi:calendar" size="18" />
              <span>{{ classroom.academicYear?.yearName }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="classrooms.length === 0" class="col-span-full text-center text-muted py-12">
        ບໍ່ພົບຫ້ອງຮຽນ
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? 'ແກ້ໄຂຫ້ອງຮຽນ' : 'ເພີ່ມຫ້ອງຮຽນໃໝ່' }}</h3>
          <button class="modal-close" @click="closeModal">
            <Icon name="mdi:close" size="20" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label class="form-label">ລະຫັດຫ້ອງ *</label>
              <input v-model="form.roomCode" type="text" class="form-input" placeholder="e.g. M4-1" required />
            </div>
            <div class="form-group">
              <label class="form-label">ຊື່ຫ້ອງ *</label>
              <input v-model="form.roomName" type="text" class="form-input" placeholder="e.g. ມ.4/1" required />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">ຊັ້ນຮຽນ *</label>
                <select v-model="form.gradeLevelId" class="form-input form-select" required>
                  <option :value="null">-- ເລືອກຊັ້ນ --</option>
                  <option v-for="level in gradeLevels" :key="level.id" :value="level.id">
                    {{ level.levelName }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">ໝາຍເລກຫ້ອງ *</label>
                <input v-model.number="form.section" type="number" min="1" class="form-input" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">ປີຮຽນ *</label>
              <select v-model="form.academicYearId" class="form-input form-select" required>
                <option :value="null">-- ເລືອກປີຮຽນ --</option>
                <option v-for="year in academicYears" :key="year.id" :value="year.id">
                  {{ year.yearName }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">ຄູປະຈຳຫ້ອງ</label>
              <select v-model="form.homeroomTeacherId" class="form-input form-select">
                <option :value="null">-- ເລືອກຄູປະຈຳ --</option>
                <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                  {{ teacher.firstName }} {{ teacher.lastName }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">ຈຳນວນນັກຮຽນສູງສຸດ</label>
              <input v-model.number="form.capacity" type="number" min="1" class="form-input" />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="closeModal">ຍົກເລີກ</button>
          <button type="button" class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
            <span v-if="submitting" class="spinner" style="width: 16px; height: 16px;"></span>
            <span v-else>{{ isEdit ? 'ບັນທຶກ' : 'ເພີ່ມ' }}</span>
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
const { getClassrooms, createClassroom, updateClassroom, getTeachers, getGradeLevels, getAcademicYears } = useApi()

// State
const classrooms = ref<any[]>([])
const teachers = ref<any[]>([])
const gradeLevels = ref<any[]>([])
const academicYears = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)

// Filters
const filterGradeLevel = ref('')

// Modals
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

// Form
const defaultForm = {
  roomCode: '',
  roomName: '',
  section: 1,
  capacity: null as number | null,
  gradeLevelId: null as number | null,
  academicYearId: null as number | null,
  homeroomTeacherId: null as number | null,
}

const form = ref({ ...defaultForm })

// Methods
async function fetchClassrooms() {
  loading.value = true
  const response = await getClassrooms({
    all: true,
    gradeLevelId: filterGradeLevel.value,
  })
  
  if (response.success) {
    classrooms.value = response.data || []
  }
  loading.value = false
}

async function fetchData() {
  const [teachersRes, gradeLevelsRes, yearsRes] = await Promise.all([
    getTeachers({ all: true }),
    getGradeLevels(),
    getAcademicYears(),
  ])
  
  if (teachersRes.success) teachers.value = teachersRes.data || []
  if (gradeLevelsRes.success) gradeLevels.value = gradeLevelsRes.data || []
  if (yearsRes.success) academicYears.value = yearsRes.data || []
}

function viewClassroom(classroom: any) {
  navigateTo(`/classrooms/${classroom.id}`)
}

function openCreateModal() {
  isEdit.value = false
  editingId.value = null
  form.value = { ...defaultForm }
  
  // Set default academic year
  const openYear = academicYears.value.find(y => y.status === 'OPEN')
  if (openYear) {
    form.value.academicYearId = openYear.id
  }
  
  showModal.value = true
}

function openEditModal(classroom: any) {
  isEdit.value = true
  editingId.value = classroom.id
  form.value = {
    roomCode: classroom.roomCode,
    roomName: classroom.roomName,
    section: classroom.section,
    capacity: classroom.capacity,
    gradeLevelId: classroom.gradeLevelId,
    academicYearId: classroom.academicYearId,
    homeroomTeacherId: classroom.homeroomTeacherId,
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  form.value = { ...defaultForm }
}

async function handleSubmit() {
  submitting.value = true
  
  let response
  if (isEdit.value && editingId.value) {
    response = await updateClassroom(editingId.value, form.value)
  } else {
    response = await createClassroom(form.value)
  }
  
  if (response.success) {
    closeModal()
    await fetchClassrooms()
  } else {
    alert(response.message)
  }
  
  submitting.value = false
}

// Watch filters
watch(filterGradeLevel, () => {
  fetchClassrooms()
})

// Init
onMounted(async () => {
  await authStore.initialize()
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  
  await Promise.all([
    fetchClassrooms(),
    fetchData(),
  ])
})
</script>

<style scoped>
.space-y-3 > * + * {
  margin-top: 0.75rem;
}
</style>
