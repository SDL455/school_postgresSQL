<template>
  <div>
    <NuxtLayout name="blank">
      <div class="text-center p-12">
        <div
          class="spinner"
          style="width: 48px; height: 48px; margin: 0 auto"
        ></div>
        <p class="mt-4 text-muted">ກຳລັງໂຫຼດ...</p>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  layout: false,
});

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initialize();

  if (authStore.isAuthenticated) {
    navigateTo("/dashboard");
  } else {
    navigateTo("/login");
  }
});
</script>
