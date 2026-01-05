<template>
  <div class="home">
    <h1>欢迎使用 Scaff AI</h1>
    <p>这是一个基于 Nuxt.js 的前端应用</p>

    <div v-if="health" class="status">
      <p>API 状态: <span class="success">正常</span></p>
      <p>服务器时间: {{ health.time }}</p>
    </div>
    <div v-else class="status">
      <p>API 状态: <span class="error">未连接</span></p>
      <p>请确保 API 服务已启动 (端口 7000)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface HealthResponse {
  status: string;
  time: string;
}

const config = useRuntimeConfig();
const health = ref<HealthResponse | null>(null);

onMounted(async () => {
  try {
    const res = await $fetch<HealthResponse>(`${config.public.apiBase.replace('/api', '')}/health`);
    health.value = res;
  } catch {
    health.value = null;
  }
});
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 16px;
}

.status {
  margin-top: 24px;
  padding: 16px;
  border-radius: 8px;
  background: #f5f5f5;
}

.success {
  color: #52c41a;
  font-weight: bold;
}

.error {
  color: #ff4d4f;
  font-weight: bold;
}
</style>
