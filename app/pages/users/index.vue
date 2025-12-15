<template>
  <div v-if="authStore.isAdmin">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">ຈັດການຜູ້ໃຊ້ລະບົບ</h2>
      <button class="btn btn-primary" @click="openCreateModal">
        <Icon name="mdi:plus" size="18" />
        ເພີ່ມຜູ້ໃຊ້
      </button>
    </div>
    
    <div class="card">
      <div class="card-body" style="padding: 0;">
        <div v-if="loading" class="text-center p-6">
          <div class="spinner"></div>
        </div>
        <div v-else class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>ຊື່ຜູ້ໃຊ້</th>
                <th>ອີເມວ</th>
                <th>ບົດບາດ</th>
                <th>ສະຖານະ</th>
                <th>ວັນທີສ້າງ</th>
                <th style="width: 120px;">ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar avatar-sm">{{ user.username.charAt(0).toUpperCase() }}</div>
                    <span class="font-medium">{{ user.username }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge" :class="getRoleBadgeClass(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="user.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'">
                    {{ user.status === 'ACTIVE' ? 'ໃຊ້ງານ' : 'ລະງັບ' }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="flex gap-1">
                    <button class="btn btn-ghost btn-sm" @click="openEditModal(user)">
                      <Icon name="mdi:pencil" size="16" />
                    </button>
                    <button 
                      class="btn btn-ghost btn-sm text-error" 
                      @click="confirmDelete(user)"
                      :disabled="user.id === authStore.user?.id"
                    >
                      <Icon name="mdi:delete" size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal" style="max-width: 450px;">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? 'ແກ້ໄຂຜູ້ໃຊ້' : 'ເພີ່ມຜູ້ໃຊ້ໃໝ່' }}</h3>
          <button class="modal-close" @click="closeModal">
            <Icon name="mdi:close" size="20" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label class="form-label">ຊື່ຜູ້ໃຊ້ *</label>
              <input v-model="form.username" type="text" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">ອີເມວ *</label>
              <input v-model="form.email" type="email" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">{{ isEdit ? 'ລະຫັດຜ່ານໃໝ່ (ເວັ້ນວ່າງຖ້າບໍ່ປ່ຽນ)' : 'ລະຫັດຜ່ານ *' }}</label>
              <input v-model="form.password" type="password" class="form-input" :required="!isEdit" />
            </div>
            <div class="form-group">
              <label class="form-label">ບົດບາດ *</label>
              <select v-model="form.role" class="form-input form-select" required>
                <option value="ADMIN">ຜູ້ອຳນວຍການ</option>
                <option value="MANAGER">ຜູ້ບໍລິຫານ</option>
                <option value="REGISTRAR">ບັນຊີລົງທະບຽນ</option>
                <option value="TEACHER">ອາຈານ</option>
              </select>
            </div>
            <div v-if="isEdit" class="form-group">
              <label class="form-label">ສະຖານະ</label>
              <select v-model="form.status" class="form-input form-select">
                <option value="ACTIVE">ໃຊ້ງານ</option>
                <option value="INACTIVE">ປິດ</option>
                <option value="SUSPENDED">ລະງັບ</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeModal">ຍົກເລີກ</button>
          <button class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
            <span v-if="submitting" class="spinner" style="width: 16px; height: 16px;"></span>
            <span v-else>{{ isEdit ? 'ບັນທຶກ' : 'ເພີ່ມ' }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">ຢືນຢັນການລົບ</h3>
          <button class="modal-close" @click="showDeleteModal = false">
            <Icon name="mdi:close" size="20" />
          </button>
        </div>
        <div class="modal-body">
          <p>ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບຜູ້ໃຊ້ <strong>{{ userToDelete?.username }}</strong>?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showDeleteModal = false">ຍົກເລີກ</button>
          <button class="btn btn-danger" @click="handleDelete">ລົບ</button>
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
const { getUsers, createUser, updateUser, deleteUser } = useApi()

const users = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const userToDelete = ref<any>(null)

const defaultForm = {
  username: '',
  email: '',
  password: '',
  role: 'TEACHER',
  status: 'ACTIVE',
}

const form = ref({ ...defaultForm })

const roleLabels: Record<string, string> = {
  ADMIN: 'ຜູ້ອຳນວຍການ',
  MANAGER: 'ຜູ້ບໍລິຫານ',
  REGISTRAR: 'ບັນຊີລົງທະບຽນ',
  TEACHER: 'ອາຈານ',
}

async function fetchUsers() {
  loading.value = true
  const response = await getUsers({ limit: 100 })
  if (response.success) {
    users.value = response.data || []
  }
  loading.value = false
}

function getRoleLabel(role: string) {
  return roleLabels[role] || role
}

function getRoleBadgeClass(role: string) {
  const classes: Record<string, string> = {
    ADMIN: 'badge-error',
    MANAGER: 'badge-warning',
    REGISTRAR: 'badge-primary',
    TEACHER: 'badge-success',
  }
  return classes[role] || 'badge-neutral'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('lo-LA')
}

function openCreateModal() {
  isEdit.value = false
  editingId.value = null
  form.value = { ...defaultForm }
  showModal.value = true
}

function openEditModal(user: any) {
  isEdit.value = true
  editingId.value = user.id
  form.value = {
    username: user.username,
    email: user.email,
    password: '',
    role: user.role,
    status: user.status,
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSubmit() {
  submitting.value = true
  
  const data: any = {
    username: form.value.username,
    email: form.value.email,
    role: form.value.role,
  }
  
  if (form.value.password) {
    data.password = form.value.password
  }
  
  if (isEdit.value) {
    data.status = form.value.status
  }
  
  let response
  if (isEdit.value && editingId.value) {
    response = await updateUser(editingId.value, data)
  } else {
    response = await createUser(data)
  }
  
  if (response.success) {
    closeModal()
    await fetchUsers()
  } else {
    alert(response.message)
  }
  
  submitting.value = false
}

function confirmDelete(user: any) {
  userToDelete.value = user
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!userToDelete.value) return
  
  const response = await deleteUser(userToDelete.value.id)
  if (response.success) {
    showDeleteModal.value = false
    userToDelete.value = null
    await fetchUsers()
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
    await fetchUsers()
  }
})
</script>
