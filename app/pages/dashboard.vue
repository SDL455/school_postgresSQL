<template>
  <div class="dashboard-page">
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon primary">
          <Icon name="mdi:account-school" size="28" />
        </div>
        <div class="stat-content">
          <div class="stat-value">
            {{ stats?.overview?.activeStudents || 0 }}
          </div>
          <div class="stat-label">ນັກຮຽນທັງໝົດ</div>
          <div
            class="stat-change positive"
            v-if="stats?.overview?.maleStudents !== undefined"
          >
            <Icon name="mdi:gender-male" size="14" />
            <span>{{ stats.overview.maleStudents }} ຊາຍ</span>
            <Icon name="mdi:gender-female" size="14" style="margin-left: 8px" />
            <span>{{ stats.overview.femaleStudents }} ຍິງ</span>
          </div>
        </div>
      </div>

      <div class="stat-card secondary">
        <div class="stat-icon secondary">
          <Icon name="mdi:human-male-board" size="28" />
        </div>
        <div class="stat-content">
          <div class="stat-value">
            {{ stats?.overview?.activeTeachers || 0 }}
          </div>
          <div class="stat-label">ອາຈານທັງໝົດ</div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon success">
          <Icon name="mdi:google-classroom" size="28" />
        </div>
        <div class="stat-content">
          <div class="stat-value">
            {{ stats?.overview?.totalClassrooms || 0 }}
          </div>
          <div class="stat-label">ຫ້ອງຮຽນ</div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon warning">
          <Icon name="mdi:book-open-variant" size="28" />
        </div>
        <div class="stat-content">
          <div class="stat-value">
            {{ stats?.overview?.totalSubjects || 0 }}
          </div>
          <div class="stat-label">ວິຊາຮຽນ</div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div
      class="grid gap-6"
      style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr))"
    >
      <!-- Classroom Statistics -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <Icon name="mdi:chart-bar" size="20" style="margin-right: 8px" />
            ນັກຮຽນແຕ່ລະຫ້ອງ
          </h3>
        </div>
        <div class="card-body">
          <div v-if="loading" class="text-center p-6">
            <div class="spinner"></div>
          </div>
          <div v-else-if="stats?.classroomStats?.length">
            <div class="table-container">
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
                    <td>
                      <span class="badge badge-primary">{{
                        room.roomName
                      }}</span>
                    </td>
                    <td class="text-center">{{ room.maleCount }}</td>
                    <td class="text-center">{{ room.femaleCount }}</td>
                    <td class="text-center font-semibold">
                      {{ room.totalStudents }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-center p-6 text-muted">ບໍ່ມີຂໍ້ມູນ</div>
        </div>
      </div>

      <!-- Grade Statistics -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <Icon
              name="mdi:clipboard-check"
              size="20"
              style="margin-right: 8px"
            />
            ສະຖິຕິເສັ່ງ/ຕົກ
          </h3>
        </div>
        <div class="card-body">
          <div
            v-if="stats?.gradeStats"
            class="flex items-center justify-center gap-8 p-6"
          >
            <div class="text-center">
              <div class="stat-value text-success">
                {{ stats.gradeStats.passed }}
              </div>
              <div class="stat-label">ເສັ່ງ</div>
            </div>
            <div class="text-center">
              <div class="stat-value text-error">
                {{ stats.gradeStats.failed }}
              </div>
              <div class="stat-label">ຕົກ</div>
            </div>
            <div class="text-center">
              <div class="stat-value text-primary">
                {{ stats.gradeStats.passRate }}%
              </div>
              <div class="stat-label">ອັດຕາເສັ່ງ</div>
            </div>
          </div>
          <div v-else class="text-center p-6 text-muted">ບໍ່ມີຂໍ້ມູນຄະແນນ</div>
        </div>
      </div>
    </div>

    <!-- Teachers by Department -->
    <div class="card mt-6">
      <div class="card-header">
        <h3 class="card-title">
          <Icon name="mdi:account-group" size="20" style="margin-right: 8px" />
          ອາຈານແຍກຕາມພາກວິຊາ
        </h3>
      </div>
      <div class="card-body">
        <div
          v-if="stats?.teachersByDepartment?.length"
          class="flex flex-wrap gap-4"
        >
          <div
            v-for="dept in stats.teachersByDepartment"
            :key="dept.department"
            class="stat-card"
            style="flex: 1; min-width: 150px; margin: 0"
          >
            <div class="stat-icon primary">
              <Icon :name="getDepartmentIcon(dept.department)" size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dept._count.id }}</div>
              <div class="stat-label">
                {{ getDepartmentLabel(dept.department) }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center p-6 text-muted">ບໍ່ມີຂໍ້ມູນອາຈານ</div>
      </div>
    </div>

    <!-- Current Academic Year -->
    <div v-if="stats?.currentAcademicYear" class="card mt-6">
      <div class="card-header">
        <h3 class="card-title">
          <Icon
            name="mdi:calendar-school"
            size="20"
            style="margin-right: 8px"
          />
          ປີຮຽນປັດຈຸບັນ
        </h3>
        <span class="badge badge-success">{{
          stats.currentAcademicYear.status
        }}</span>
      </div>
      <div class="card-body">
        <div class="flex items-center gap-4">
          <Icon name="mdi:calendar" size="24" class="text-primary" />
          <div>
            <div class="font-semibold">
              {{ stats.currentAcademicYear.yearName }}
            </div>
            <div class="text-muted text-sm">
              {{ formatDate(stats.currentAcademicYear.startDate) }} -
              {{ formatDate(stats.currentAcademicYear.endDate) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useDashboardStore } from "~/stores/dashboard";

definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const loading = computed(() => dashboardStore.loading);
const stats = computed(() => dashboardStore.stats);

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

const departmentIcons: Record<string, string> = {
  MATH: "mdi:calculator",
  SCIENCE: "mdi:flask",
  LANGUAGE: "mdi:translate",
  SOCIAL: "mdi:earth",
  ARTS: "mdi:palette",
  PHYSICAL: "mdi:run",
  TECHNOLOGY: "mdi:laptop",
  GENERAL: "mdi:book",
};

function getDepartmentLabel(dept: string) {
  return departmentLabels[dept] || dept;
}

function getDepartmentIcon(dept: string) {
  return departmentIcons[dept] || "mdi:book";
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("lo-LA");
}

onMounted(async () => {
  await authStore.initialize();
  if (!authStore.isAuthenticated) {
    navigateTo("/login");
    return;
  }
  await dashboardStore.fetchStats();
});
</script>

<style scoped>
.dashboard-page {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
