<template>
  <div>
    <!-- Header Actions -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <div class="form-group" style="margin-bottom: 0; min-width: 250px;">
          <input 
            v-model="search"
            type="text" 
            class="form-input" 
            placeholder="ຄົ້ນຫາອາຈານ..."
            @input="debouncedSearch"
          />
        </div>
        <select v-model="filterDepartment" class="form-input form-select" style="width: auto;">
          <option value="">ທຸກພາກວິຊາ</option>
          <option v-for="(label, key) in departmentLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
        <select v-model="filterStatus" class="form-input form-select" style="width: auto;">
          <option value="">ທຸກສະຖານະ</option>
          <option value="FULLTIME">ປະຈຳ</option>
          <option value="PARTTIME">ພາກສ່ວນ</option>
          <option value="RESIGNED">ອອກແລ້ວ</option>
        </select>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <Icon name="mdi:plus" size="18" />
        ເພີ່ມອາຈານ
      </button>
    </div>
    
    <!-- Teachers Table -->
    <div class="card">
      <div class="card-body" style="padding: 0;">
        <div v-if="loading" class="text-center p-6">
          <div class="spinner"></div>
        </div>
        <div v-else class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>ລະຫັດ</th>
                <th>ຊື່ ແລະ ນາມສະກຸນ</th>
                <th>ເພດ</th>
                <th>ພາກວິຊາ</th>
                <th>ວິຊາເອກ</th>
                <th>ເບີໂທ</th>
                <th>ຫ້ອງປະຈຳ</th>
                <th>ສະຖານະ</th>
                <th style="width: 120px;">ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="teacher in teachers" :key="teacher.id">
                <td>
                  <span class="font-medium">{{ teacher.teacherCode }}</span>
                </td>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar avatar-sm">
                      {{ teacher.firstName.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-medium">{{ teacher.firstName }} {{ teacher.lastName }}</div>
                      <div v-if="teacher.email" class="text-muted text-xs">{{ teacher.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge" :class="teacher.gender === 'MALE' ? 'badge-primary' : 'badge-secondary'">
                    {{ teacher.gender === 'MALE' ? 'ຊາຍ' : 'ຍິງ' }}
                  </span>
                </td>
                <td>{{ departmentLabels[teacher.department] || teacher.department }}</td>
                <td>{{ teacher.mainSubject || '-' }}</td>
                <td>{{ teacher.phone || '-' }}</td>
                <td>
                  <div v-if="teacher.homeroomClassrooms?.length">
                    <span 
                      v-for="room in teacher.homeroomClassrooms" 
                      :key="room.id"
                      class="badge badge-success mr-1"
                    >
                      {{ room.roomName }}
                    </span>
                  </div>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span class="badge" :class="getStatusBadgeClass(teacher.status)">
                    {{ getStatusLabel(teacher.status) }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-1">
                    <button class="btn btn-ghost btn-sm" @click="openEditModal(teacher)">
                      <Icon name="mdi:pencil" size="16" />
                    </button>
                    <button class="btn btn-ghost btn-sm text-error" @click="confirmDelete(teacher)">
                      <Icon name="mdi:delete" size="16" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="teachers.length === 0">
                <td colspan="9" class="text-center text-muted py-6">
                  ບໍ່ພົບອາຈານ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="card-footer flex justify-between items-center">
        <div class="text-muted text-sm">
          ສະແດງ {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} ຈາກ {{ pagination.total }}
        </div>
        <div class="flex gap-2">
          <button 
            class="btn btn-outline btn-sm" 
            :disabled="pagination.page <= 1"
            @click="goToPage(pagination.page - 1)"
          >
            <Icon name="mdi:chevron-left" size="18" />
          </button>
          <span class="flex items-center px-3">{{ pagination.page }} / {{ pagination.totalPages }}</span>
          <button 
            class="btn btn-outline btn-sm" 
            :disabled="pagination.page >= pagination.totalPages"
            @click="goToPage(pagination.page + 1)"
          >
            <Icon name="mdi:chevron-right" size="18" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal" style="max-width: 600px;">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? 'ແກ້ໄຂອາຈານ' : 'ເພີ່ມອາຈານໃໝ່' }}</h3>
          <button class="modal-close" @click="closeModal">
            <Icon name="mdi:close" size="20" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">ລະຫັດອາຈານ *</label>
                <input v-model="form.teacherCode" type="text" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">ເພດ *</label>
                <select v-model="form.gender" class="form-input form-select" required>
                  <option value="MALE">ຊາຍ</option>
                  <option value="FEMALE">ຍິງ</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">ຊື່ *</label>
                <input v-model="form.firstName" type="text" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">ນາມສະກຸນ *</label>
                <input v-model="form.lastName" type="text" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">ວັນເດືອນປີເກີດ</label>
                <input v-model="form.dateOfBirth" type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">ເບີໂທ</label>
                <input v-model="form.phone" type="tel" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">ອີເມວ</label>
                <input v-model="form.email" type="email" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">ວິຊາເອກ</label>
                <input v-model="form.mainSubject" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">ພາກວິຊາ *</label>
                <select v-model="form.department" class="form-input form-select" required>
                  <option v-for="(label, key) in departmentLabels" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">ສະຖານະ</label>
                <select v-model="form.status" class="form-input form-select">
                  <option value="FULLTIME">ປະຈຳ</option>
                  <option value="PARTTIME">ພາກສ່ວນ</option>
                  <option value="RESIGNED">ອອກແລ້ວ</option>
                </select>
              </div>
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label">ທີ່ຢູ່</label>
                <textarea v-model="form.address" class="form-input form-textarea" rows="2"></textarea>
              </div>
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
    
    <!-- Delete Confirmation -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">ຢືນຢັນການລົບ</h3>
          <button class="modal-close" @click="showDeleteModal = false">
            <Icon name="mdi:close" size="20" />
          </button>
        </div>
        <div class="modal-body">
          <p>ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບອາຈານ <strong>{{ teacherToDelete?.firstName }} {{ teacherToDelete?.lastName }}</strong>?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showDeleteModal = false">ຍົກເລີກ</button>
          <button class="btn btn-danger" @click="handleDelete">ລົບ</button>
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
const { getTeachers, createTeacher, updateTeacher, deleteTeacher } = useApi()

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

// State
const teachers = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

// Filters
const search = ref('')
const filterDepartment = ref('')
const filterStatus = ref('')

// Modals
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const teacherToDelete = ref<any>(null)

// Form
const defaultForm = {
  teacherCode: '',
  firstName: '',
  lastName: '',
  gender: 'MALE',
  dateOfBirth: '',
  phone: '',
  email: '',
  address: '',
  mainSubject: '',
  department: 'GENERAL',
  status: 'FULLTIME',
}

const form = ref({ ...defaultForm })

// Methods
async function fetchTeachers() {
  loading.value = true
  const response = await getTeachers({
    page: pagination.value.page,
    limit: pagination.value.limit,
    search: search.value,
    department: filterDepartment.value,
    status: filterStatus.value,
  })
  
  if (response.success) {
    teachers.value = response.data || []
    pagination.value = response.pagination || pagination.value
  }
  loading.value = false
}

function debouncedSearch() {
  setTimeout(() => {
    pagination.value.page = 1
    fetchTeachers()
  }, 300)
}

function goToPage(page: number) {
  pagination.value.page = page
  fetchTeachers()
}

function openCreateModal() {
  isEdit.value = false
  editingId.value = null
  form.value = { ...defaultForm }
  showModal.value = true
}

function openEditModal(teacher: any) {
  isEdit.value = true
  editingId.value = teacher.id
  form.value = {
    teacherCode: teacher.teacherCode,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    gender: teacher.gender,
    dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.split('T')[0] : '',
    phone: teacher.phone || '',
    email: teacher.email || '',
    address: teacher.address || '',
    mainSubject: teacher.mainSubject || '',
    department: teacher.department,
    status: teacher.status,
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  form.value = { ...defaultForm }
}

async function handleSubmit() {
  submitting.value = true
  
  const data = {
    ...form.value,
    dateOfBirth: form.value.dateOfBirth || null,
  }
  
  let response
  if (isEdit.value && editingId.value) {
    response = await updateTeacher(editingId.value, data)
  } else {
    response = await createTeacher(data)
  }
  
  if (response.success) {
    closeModal()
    await fetchTeachers()
  } else {
    alert(response.message)
  }
  
  submitting.value = false
}

function confirmDelete(teacher: any) {
  teacherToDelete.value = teacher
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!teacherToDelete.value) return
  
  const response = await deleteTeacher(teacherToDelete.value.id)
  if (response.success) {
    showDeleteModal.value = false
    teacherToDelete.value = null
    await fetchTeachers()
  } else {
    alert(response.message)
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    FULLTIME: 'ປະຈຳ',
    PARTTIME: 'ພາກສ່ວນ',
    RESIGNED: 'ອອກແລ້ວ',
  }
  return labels[status] || status
}

function getStatusBadgeClass(status: string) {
  const classes: Record<string, string> = {
    FULLTIME: 'badge-success',
    PARTTIME: 'badge-warning',
    RESIGNED: 'badge-neutral',
  }
  return classes[status] || 'badge-neutral'
}

// Watch filters
watch([filterDepartment, filterStatus], () => {
  pagination.value.page = 1
  fetchTeachers()
})

// Init
onMounted(async () => {
  await authStore.initialize()
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  
  await fetchTeachers()
})
</script>
