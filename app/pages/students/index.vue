<template>
  <div>
    <!-- Header Actions -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <div class="form-group" style="margin-bottom: 0; min-width: 250px">
          <input
            v-model="search"
            type="text"
            class="form-input"
            placeholder="ຄົ້ນຫານັກຮຽນ..."
            @input="debouncedSearch"
          />
        </div>
        <select
          v-model="filterClassroom"
          class="form-input form-select"
          style="width: auto"
        >
          <option value="">ທຸກຫ້ອງ</option>
          <option v-for="room in classrooms" :key="room.id" :value="room.id">
            {{ room.roomName }}
          </option>
        </select>
        <select
          v-model="filterGender"
          class="form-input form-select"
          style="width: auto"
        >
          <option value="">ທຸກເພດ</option>
          <option value="MALE">ຊາຍ</option>
          <option value="FEMALE">ຍິງ</option>
        </select>
        <select
          v-model="filterStatus"
          class="form-input form-select"
          style="width: auto"
        >
          <option value="">ທຸກສະຖານະ</option>
          <option value="STUDYING">ກຳລັງຮຽນ</option>
          <option value="GRADUATED">ຈົບແລ້ວ</option>
          <option value="TRANSFERRED">ຍ້າຍອອກ</option>
          <option value="SUSPENDED">ພັກຮຽນ</option>
        </select>
      </div>
      <div class="flex gap-2">
        <button
          v-if="selectedStudents.length > 0"
          class="btn btn-secondary"
          @click="showAssignModal = true"
        >
          <Icon name="mdi:account-multiple-plus" size="18" />
          ແຍກຫ້ອງ ({{ selectedStudents.length }})
        </button>
        <button class="btn btn-primary" @click="openCreateModal">
          <Icon name="mdi:plus" size="18" />
          ເພີ່ມນັກຮຽນ
        </button>
      </div>
    </div>

    <!-- Students Table -->
    <div class="card">
      <div class="card-body" style="padding: 0">
        <div v-if="loading" class="text-center p-6">
          <div class="spinner"></div>
        </div>
        <div v-else class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 40px">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th>ລະຫັດ</th>
                <th>ຊື່ ແລະ ນາມສະກຸນ</th>
                <th>ເພດ</th>
                <th>ຫ້ອງຮຽນ</th>
                <th>ເບີໂທ</th>
                <th>ສະຖານະ</th>
                <th style="width: 120px">ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in students" :key="student.id">
                <td>
                  <input
                    type="checkbox"
                    :checked="selectedStudents.includes(student.id)"
                    @change="toggleSelect(student.id)"
                  />
                </td>
                <td>
                  <span class="font-medium">{{ student.studentCode }}</span>
                </td>
                <td>
                  <div class="flex items-center gap-3">
                    <div
                      class="avatar avatar-sm"
                      :class="
                        student.gender === 'MALE'
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-pink-100 text-pink-700'
                      "
                      style="background: var(--primary-100)"
                    >
                      {{ student.firstName.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-medium">
                        {{ student.firstName }} {{ student.lastName }}
                      </div>
                      <div v-if="student.email" class="text-muted text-xs">
                        {{ student.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="
                      student.gender === 'MALE'
                        ? 'badge-primary'
                        : 'badge-secondary'
                    "
                    style="
                      background: var(--secondary-100);
                      color: var(--secondary-700);
                    "
                  >
                    {{ student.gender === "MALE" ? "ຊາຍ" : "ຍິງ" }}
                  </span>
                </td>
                <td>
                  <span v-if="student.classroom" class="badge badge-success">
                    {{ student.classroom.roomName }}
                  </span>
                  <span v-else class="badge badge-neutral">ບໍ່ມີຫ້ອງ</span>
                </td>
                <td>{{ student.phone || "-" }}</td>
                <td>
                  <span
                    class="badge"
                    :class="getStatusBadgeClass(student.status)"
                  >
                    {{ getStatusLabel(student.status) }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-1">
                    <button
                      class="btn btn-ghost btn-sm"
                      @click="openEditModal(student)"
                    >
                      <Icon name="mdi:pencil" size="16" />
                    </button>
                    <button
                      class="btn btn-ghost btn-sm text-error"
                      @click="confirmDelete(student)"
                    >
                      <Icon name="mdi:delete" size="16" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="students.length === 0">
                <td colspan="8" class="text-center text-muted py-6">
                  ບໍ່ພົບນັກຮຽນ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages > 1"
        class="card-footer flex justify-between items-center"
      >
        <div class="text-muted text-sm">
          ສະແດງ {{ (pagination.page - 1) * pagination.limit + 1 }} -
          {{
            Math.min(pagination.page * pagination.limit, pagination.total)
          }}
          ຈາກ {{ pagination.total }}
        </div>
        <div class="flex gap-2">
          <button
            class="btn btn-outline btn-sm"
            :disabled="pagination.page <= 1"
            @click="goToPage(pagination.page - 1)"
          >
            <Icon name="mdi:chevron-left" size="18" />
          </button>
          <span class="flex items-center px-3"
            >{{ pagination.page }} / {{ pagination.totalPages }}</span
          >
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
      <div class="modal" style="max-width: 600px">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ isEdit ? "ແກ້ໄຂນັກຮຽນ" : "ເພີ່ມນັກຮຽນໃໝ່" }}
          </h3>
          <button class="modal-close" @click="closeModal">
            <Icon name="mdi:close" size="20" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">ລະຫັດນັກຮຽນ *</label>
                <input
                  v-model="form.studentCode"
                  type="text"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">ເພດ *</label>
                <select
                  v-model="form.gender"
                  class="form-input form-select"
                  required
                >
                  <option value="MALE">ຊາຍ</option>
                  <option value="FEMALE">ຍິງ</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">ຊື່ *</label>
                <input
                  v-model="form.firstName"
                  type="text"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">ນາມສະກຸນ *</label>
                <input
                  v-model="form.lastName"
                  type="text"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">ວັນເດືອນປີເກີດ</label>
                <input
                  v-model="form.dateOfBirth"
                  type="date"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">ເບີໂທ</label>
                <input v-model="form.phone" type="tel" class="form-input" />
              </div>
              <div class="form-group" style="grid-column: span 2">
                <label class="form-label">ທີ່ຢູ່</label>
                <textarea
                  v-model="form.address"
                  class="form-input form-textarea"
                  rows="2"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">ຊື່ຜູ້ປົກຄອງ</label>
                <input
                  v-model="form.guardianName"
                  type="text"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">ເບີໂທຜູ້ປົກຄອງ</label>
                <input
                  v-model="form.guardianPhone"
                  type="tel"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">ຫ້ອງຮຽນ</label>
                <select
                  v-model="form.classroomId"
                  class="form-input form-select"
                >
                  <option :value="null">-- ເລືອກຫ້ອງ --</option>
                  <option
                    v-for="room in classrooms"
                    :key="room.id"
                    :value="room.id"
                  >
                    {{ room.roomName }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">ສະຖານະ</label>
                <select v-model="form.status" class="form-input form-select">
                  <option value="STUDYING">ກຳລັງຮຽນ</option>
                  <option value="GRADUATED">ຈົບແລ້ວ</option>
                  <option value="TRANSFERRED">ຍ້າຍອອກ</option>
                  <option value="SUSPENDED">ພັກຮຽນ</option>
                  <option value="DROPPED">ອອກກາງຄັນ</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="closeModal">
            ຍົກເລີກ
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="submitting"
            @click="handleSubmit"
          >
            <span
              v-if="submitting"
              class="spinner"
              style="width: 16px; height: 16px"
            ></span>
            <span v-else>{{ isEdit ? "ບັນທຶກ" : "ເພີ່ມ" }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Assign Classroom Modal -->
    <div
      v-if="showAssignModal"
      class="modal-overlay"
      @click.self="showAssignModal = false"
    >
      <div class="modal" style="max-width: 400px">
        <div class="modal-header">
          <h3 class="modal-title">ແຍກຫ້ອງໃຫ້ນັກຮຽນ</h3>
          <button class="modal-close" @click="showAssignModal = false">
            <Icon name="mdi:close" size="20" />
          </button>
        </div>
        <div class="modal-body">
          <p class="mb-4">ເລືອກ {{ selectedStudents.length }} ນັກຮຽນ</p>
          <div class="form-group">
            <label class="form-label">ຫ້ອງຮຽນປາຍທາງ</label>
            <select v-model="assignClassroomId" class="form-input form-select">
              <option :value="null">-- ເລືອກຫ້ອງ --</option>
              <option
                v-for="room in classrooms"
                :key="room.id"
                :value="room.id"
              >
                {{ room.roomName }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showAssignModal = false">
            ຍົກເລີກ
          </button>
          <button
            class="btn btn-primary"
            :disabled="!assignClassroomId"
            @click="handleAssignClassroom"
          >
            ແຍກຫ້ອງ
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="showDeleteModal = false"
    >
      <div class="modal" style="max-width: 400px">
        <div class="modal-header">
          <h3 class="modal-title">ຢືນຢັນການລົບ</h3>
          <button class="modal-close" @click="showDeleteModal = false">
            <Icon name="mdi:close" size="20" />
          </button>
        </div>
        <div class="modal-body">
          <p>
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບນັກຮຽນ
            <strong
              >{{ studentToDelete?.firstName }}
              {{ studentToDelete?.lastName }}</strong
            >?
          </p>
          <p class="text-muted text-sm mt-2">ການລົບນີ້ບໍ່ສາມາດກູ້ຄືນໄດ້</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showDeleteModal = false">
            ຍົກເລີກ
          </button>
          <button class="btn btn-danger" @click="handleDelete">ລົບ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getClassrooms,
  request,
} = useApi();

// State
const students = ref<any[]>([]);
const classrooms = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

// Filters
const search = ref("");
const filterClassroom = ref("");
const filterGender = ref("");
const filterStatus = ref("");

// Selection
const selectedStudents = ref<number[]>([]);

// Modals
const showModal = ref(false);
const showAssignModal = ref(false);
const showDeleteModal = ref(false);
const isEdit = ref(false);
const editingId = ref<number | null>(null);
const studentToDelete = ref<any>(null);
const assignClassroomId = ref<number | null>(null);

// Form
const defaultForm = {
  studentCode: "",
  firstName: "",
  lastName: "",
  gender: "MALE",
  dateOfBirth: "",
  phone: "",
  address: "",
  guardianName: "",
  guardianPhone: "",
  classroomId: null as number | null,
  status: "STUDYING",
};

const form = ref({ ...defaultForm });

// Computed
const isAllSelected = computed(() => {
  return (
    students.value.length > 0 &&
    selectedStudents.value.length === students.value.length
  );
});

// Methods
async function fetchStudents() {
  loading.value = true;
  const response = await getStudents({
    page: pagination.value.page,
    limit: pagination.value.limit,
    search: search.value,
    classroomId: filterClassroom.value,
    gender: filterGender.value,
    status: filterStatus.value,
  });

  if (response.success) {
    students.value = response.data || [];
    pagination.value = response.pagination || pagination.value;
  }
  loading.value = false;
}

async function fetchClassrooms() {
  const response = await getClassrooms({ all: true });
  if (response.success) {
    classrooms.value = response.data || [];
  }
}

function debouncedSearch() {
  setTimeout(() => {
    pagination.value.page = 1;
    fetchStudents();
  }, 300);
}

function goToPage(page: number) {
  pagination.value.page = page;
  fetchStudents();
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedStudents.value = [];
  } else {
    selectedStudents.value = students.value.map((s) => s.id);
  }
}

function toggleSelect(id: number) {
  const index = selectedStudents.value.indexOf(id);
  if (index > -1) {
    selectedStudents.value.splice(index, 1);
  } else {
    selectedStudents.value.push(id);
  }
}

function openCreateModal() {
  isEdit.value = false;
  editingId.value = null;
  form.value = { ...defaultForm };
  showModal.value = true;
}

function openEditModal(student: any) {
  isEdit.value = true;
  editingId.value = student.id;
  form.value = {
    studentCode: student.studentCode,
    firstName: student.firstName,
    lastName: student.lastName,
    gender: student.gender,
    dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
    phone: student.phone || "",
    address: student.address || "",
    guardianName: student.guardianName || "",
    guardianPhone: student.guardianPhone || "",
    classroomId: student.classroomId,
    status: student.status,
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  form.value = { ...defaultForm };
}

async function handleSubmit() {
  submitting.value = true;

  const data = {
    ...form.value,
    dateOfBirth: form.value.dateOfBirth || null,
  };

  let response;
  if (isEdit.value && editingId.value) {
    response = await updateStudent(editingId.value, data);
  } else {
    response = await createStudent(data);
  }

  if (response.success) {
    closeModal();
    await fetchStudents();
  } else {
    alert(response.message);
  }

  submitting.value = false;
}

function confirmDelete(student: any) {
  studentToDelete.value = student;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!studentToDelete.value) return;

  const response = await deleteStudent(studentToDelete.value.id);
  if (response.success) {
    showDeleteModal.value = false;
    studentToDelete.value = null;
    await fetchStudents();
  } else {
    alert(response.message);
  }
}

async function handleAssignClassroom() {
  if (!assignClassroomId.value || selectedStudents.value.length === 0) return;

  const response = await request("/api/students/assign-classroom", {
    method: "POST",
    body: {
      studentIds: selectedStudents.value,
      classroomId: assignClassroomId.value,
    },
  });

  if (response.success) {
    showAssignModal.value = false;
    assignClassroomId.value = null;
    selectedStudents.value = [];
    await fetchStudents();
  } else {
    alert(response.message);
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    STUDYING: "ກຳລັງຮຽນ",
    GRADUATED: "ຈົບແລ້ວ",
    TRANSFERRED: "ຍ້າຍອອກ",
    SUSPENDED: "ພັກຮຽນ",
    DROPPED: "ອອກກາງຄັນ",
  };
  return labels[status] || status;
}

function getStatusBadgeClass(status: string) {
  const classes: Record<string, string> = {
    STUDYING: "badge-success",
    GRADUATED: "badge-primary",
    TRANSFERRED: "badge-warning",
    SUSPENDED: "badge-neutral",
    DROPPED: "badge-error",
  };
  return classes[status] || "badge-neutral";
}

// Watch filters
watch([filterClassroom, filterGender, filterStatus], () => {
  pagination.value.page = 1;
  fetchStudents();
});

// Init
onMounted(async () => {
  await authStore.initialize();
  if (!authStore.isAuthenticated) {
    navigateTo("/login");
    return;
  }

  await Promise.all([fetchStudents(), fetchClassrooms()]);
});
</script>

<style scoped>
.bg-primary-100 {
  background: var(--primary-100) !important;
}
.text-primary-700 {
  color: var(--primary-700) !important;
}
.bg-pink-100 {
  background: #fce7f3 !important;
}
.text-pink-700 {
  color: #be185d !important;
}
</style>
