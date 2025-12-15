<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <div class="form-group" style="margin-bottom: 0; min-width: 250px">
          <input
            v-model="search"
            type="text"
            class="form-input"
            placeholder="ຄົ້ນຫາວິຊາ..."
            @input="debouncedSearch"
          />
        </div>
        <select
          v-model="filterDepartment"
          class="form-input form-select"
          style="width: auto"
        >
          <option value="">ທຸກພາກວິຊາ</option>
          <option
            v-for="(label, key) in departmentLabels"
            :key="key"
            :value="key"
          >
            {{ label }}
          </option>
        </select>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <Icon name="mdi:plus" size="18" />
        ເພີ່ມວິຊາ
      </button>
    </div>

    <div class="card">
      <div class="card-body" style="padding: 0">
        <div v-if="loading" class="text-center p-6">
          <div class="spinner"></div>
        </div>
        <div v-else class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>ລະຫັດ</th>
                <th>ຊື່ວິຊາ</th>
                <th>ພາກວິຊາ</th>
                <th>ໜ່ວຍກິດ</th>
                <th>ຊົ່ວໂມງ/ອາທິດ</th>
                <th>ຊັ້ນທີ່ສອນ</th>
                <th>ສະຖານະ</th>
                <th style="width: 100px">ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="subject in subjects" :key="subject.id">
                <td class="font-medium">{{ subject.subjectCode }}</td>
                <td>{{ subject.subjectName }}</td>
                <td>
                  {{
                    departmentLabels[subject.department] || subject.department
                  }}
                </td>
                <td>{{ subject.credits || "-" }}</td>
                <td>{{ subject.hoursPerWeek || "-" }}</td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="sgl in subject.subjectGradeLevels"
                      :key="sgl.id"
                      class="badge badge-primary"
                    >
                      {{ sgl.gradeLevel?.levelName }}
                    </span>
                    <span
                      v-if="!subject.subjectGradeLevels?.length"
                      class="text-muted"
                      >-</span
                    >
                  </div>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="
                      subject.status === 'ACTIVE'
                        ? 'badge-success'
                        : 'badge-neutral'
                    "
                  >
                    {{ subject.status === "ACTIVE" ? "ໃຊ້ງານ" : "ປິດ" }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="openEditModal(subject)"
                  >
                    <Icon name="mdi:pencil" size="16" />
                  </button>
                </td>
              </tr>
              <tr v-if="subjects.length === 0">
                <td colspan="8" class="text-center text-muted py-6">
                  ບໍ່ພົບວິຊາ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal" style="max-width: 500px">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ isEdit ? "ແກ້ໄຂວິຊາ" : "ເພີ່ມວິຊາໃໝ່" }}
          </h3>
          <button class="modal-close" @click="closeModal">
            <Icon name="mdi:close" size="20" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label class="form-label">ລະຫັດວິຊາ *</label>
              <input
                v-model="form.subjectCode"
                type="text"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">ຊື່ວິຊາ *</label>
              <input
                v-model="form.subjectName"
                type="text"
                class="form-input"
                required
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">ພາກວິຊາ *</label>
                <select
                  v-model="form.department"
                  class="form-input form-select"
                  required
                >
                  <option
                    v-for="(label, key) in departmentLabels"
                    :key="key"
                    :value="key"
                  >
                    {{ label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">ສະຖານະ</label>
                <select v-model="form.status" class="form-input form-select">
                  <option value="ACTIVE">ໃຊ້ງານ</option>
                  <option value="INACTIVE">ປິດ</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">ໜ່ວຍກິດ</label>
                <input
                  v-model.number="form.credits"
                  type="number"
                  step="0.5"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">ຊົ່ວໂມງ/ອາທິດ</label>
                <input
                  v-model.number="form.hoursPerWeek"
                  type="number"
                  class="form-input"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">ລາຍລະອຽດ</label>
              <textarea
                v-model="form.description"
                class="form-input form-textarea"
                rows="2"
              ></textarea>
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
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const { getSubjects, createSubject } = useApi();

const departmentLabels: Record<string, string> = {
  MATH: "ຄະນິດສາດ",
  SCIENCE: "ວິທະຍາສາດ",
  LANGUAGE: "ພາສາ",
  SOCIAL: "ສັງຄົມ",
  ARTS: "ສິລະປະ",
  PHYSICAL: "ພະລະສຶກສາ",
  TECHNOLOGY: "ເຕັກໂນໂລຊີ",
  GENERAL: "ທົ່ວໄປ",
};

const subjects = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);

const search = ref("");
const filterDepartment = ref("");

const showModal = ref(false);
const isEdit = ref(false);
const editingId = ref<number | null>(null);

const defaultForm = {
  subjectCode: "",
  subjectName: "",
  department: "GENERAL",
  credits: null as number | null,
  hoursPerWeek: null as number | null,
  description: "",
  status: "ACTIVE",
};

const form = ref({ ...defaultForm });

async function fetchSubjects() {
  loading.value = true;
  const response = await getSubjects({
    all: true,
    search: search.value,
    department: filterDepartment.value,
  });

  if (response.success) {
    subjects.value = response.data || [];
  }
  loading.value = false;
}

function debouncedSearch() {
  setTimeout(() => fetchSubjects(), 300);
}

function openCreateModal() {
  isEdit.value = false;
  editingId.value = null;
  form.value = { ...defaultForm };
  showModal.value = true;
}

function openEditModal(subject: any) {
  isEdit.value = true;
  editingId.value = subject.id;
  form.value = {
    subjectCode: subject.subjectCode,
    subjectName: subject.subjectName,
    department: subject.department,
    credits: subject.credits,
    hoursPerWeek: subject.hoursPerWeek,
    description: subject.description || "",
    status: subject.status,
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function handleSubmit() {
  submitting.value = true;

  const response = await createSubject(form.value);

  if (response.success) {
    closeModal();
    await fetchSubjects();
  } else {
    alert(response.message);
  }

  submitting.value = false;
}

watch(filterDepartment, () => fetchSubjects());

onMounted(async () => {
  await authStore.initialize();
  if (!authStore.isAuthenticated) {
    navigateTo("/login");
    return;
  }

  await fetchSubjects();
});
</script>
