<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="app-sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <div class="app-sidebar-header">
        <div class="app-sidebar-logo">
          <div class="app-sidebar-logo-icon">
            <Icon name="mdi:school" size="24" />
          </div>
          <span v-if="!isSidebarCollapsed" class="app-sidebar-logo-text"
            >ໂຮງຮຽນ SMS</span
          >
        </div>
      </div>

      <nav class="app-sidebar-menu">
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="app-sidebar-menu-item"
        >
          <NuxtLink
            :to="item.path"
            class="app-sidebar-menu-link"
            :class="{ active: isActiveRoute(item.path) }"
          >
            <Icon :name="item.icon" size="20" class="app-sidebar-menu-icon" />
            <span v-if="!isSidebarCollapsed">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>

      <div
        class="sidebar-footer"
        style="position: absolute; bottom: 0; left: 0; right: 0; padding: 1rem"
      >
        <button
          class="app-sidebar-menu-link"
          style="width: 100%; border: none; cursor: pointer"
          @click="handleLogout"
        >
          <Icon name="mdi:logout" size="20" />
          <span v-if="!isSidebarCollapsed">ອອກຈາກລະບົບ</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="app-main">
      <header class="app-header">
        <div class="app-header-left">
          <button class="btn btn-ghost" @click="toggleSidebar">
            <Icon
              :name="isSidebarCollapsed ? 'mdi:menu' : 'mdi:menu-open'"
              size="24"
            />
          </button>
          <h1 class="app-header-title">{{ pageTitle }}</h1>
        </div>

        <div class="app-header-right">
          <div class="dropdown">
            <button
              class="btn btn-ghost flex items-center gap-2"
              @click="toggleDropdown"
            >
              <div class="avatar avatar-sm">
                {{ userInitials }}
              </div>
              <span>{{ authStore.fullName }}</span>
              <Icon name="mdi:chevron-down" size="20" />
            </button>

            <div
              v-if="isDropdownOpen"
              class="dropdown-menu"
              style="opacity: 1; visibility: visible; transform: translateY(0)"
            >
              <div class="dropdown-item">
                <Icon name="mdi:account" size="18" />
                <span>{{ authStore.user?.username }}</span>
              </div>
              <div class="dropdown-item">
                <Icon name="mdi:shield-account" size="18" />
                <span>{{ roleLabel }}</span>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" @click="handleLogout">
                <Icon name="mdi:logout" size="18" />
                <span>ອອກຈາກລະບົບ</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="app-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const route = useRoute();

const isSidebarCollapsed = ref(false);
const isDropdownOpen = ref(false);

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    "/dashboard": "ໜ້າຫຼັກ",
    "/students": "ຈັດການນັກຮຽນ",
    "/teachers": "ຈັດການອາຈານ",
    "/classrooms": "ຈັດການຫ້ອງຮຽນ",
    "/subjects": "ຈັດການວິຊາ",
    "/grades": "ຈັດການຄະແນນ",
    "/attendance": "ບັນທຶກການເຂົ້າຮຽນ",
    "/schedules": "ຕາຕະລາງຮຽນ",
    "/reports": "ລາຍງານ",
    "/settings": "ຕັ້ງຄ່າ",
    "/users": "ຈັດການຜູ້ໃຊ້",
  };
  return titles[route.path] || "ລະບົບຈັດການໂຮງຮຽນ";
});

const menuItems = computed(() => {
  const baseItems = [
    { path: "/dashboard", label: "ໜ້າຫຼັກ", icon: "mdi:view-dashboard" },
    { path: "/students", label: "ນັກຮຽນ", icon: "mdi:account-school" },
    { path: "/teachers", label: "ອາຈານ", icon: "mdi:human-male-board" },
    { path: "/classrooms", label: "ຫ້ອງຮຽນ", icon: "mdi:google-classroom" },
    { path: "/subjects", label: "ວິຊາ", icon: "mdi:book-open-variant" },
    { path: "/grades", label: "ຄະແນນ", icon: "mdi:clipboard-text" },
    { path: "/attendance", label: "ການເຂົ້າຮຽນ", icon: "mdi:calendar-check" },
    { path: "/schedules", label: "ຕາຕະລາງ", icon: "mdi:timetable" },
    { path: "/reports", label: "ລາຍງານ", icon: "mdi:chart-bar" },
  ];

  if (authStore.isAdmin) {
    baseItems.push(
      { path: "/users", label: "ຜູ້ໃຊ້", icon: "mdi:account-group" },
      { path: "/settings", label: "ຕັ້ງຄ່າ", icon: "mdi:cog" }
    );
  }

  return baseItems;
});

const userInitials = computed(() => {
  if (authStore.user?.teacher) {
    const first = authStore.user.teacher.firstName.charAt(0);
    const last = authStore.user.teacher.lastName.charAt(0);
    return `${first}${last}`;
  }
  return authStore.user?.username.charAt(0).toUpperCase() || "U";
});

const roleLabel = computed(() => {
  const roles: Record<string, string> = {
    ADMIN: "ຜູ້ອຳນວຍການ",
    MANAGER: "ຜູ້ບໍລິຫານ",
    REGISTRAR: "ບັນຊີລົງທະບຽນ",
    TEACHER: "ອາຈານ",
  };
  return roles[authStore.user?.role || ""] || "";
});

function isActiveRoute(path: string) {
  return route.path === path || route.path.startsWith(path + "/");
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function handleLogout() {
  authStore.logout();
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".dropdown")) {
      isDropdownOpen.value = false;
    }
  });
});
</script>

<style scoped>
.app-sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.app-sidebar.collapsed .app-sidebar-header {
  justify-content: center;
  padding: 0 var(--space-2);
}

.app-sidebar.collapsed .app-sidebar-menu-link {
  justify-content: center;
  padding: var(--space-3);
}

.sidebar-collapsed .app-main {
  margin-left: var(--sidebar-collapsed-width);
}

.sidebar-footer button {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  transition: all var(--transition-fast);
}

.sidebar-footer button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>
