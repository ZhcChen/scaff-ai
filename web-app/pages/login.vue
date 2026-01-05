<template>
  <div class="login-container">
    <div class="login-box">
      <h1>登录</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="请输入用户名" required />
        </div>
        <div class="form-item">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? "登录中..." : "登录" }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponse, LoginResponse } from "~/types";

const { $api } = useNuxtApp();
const { login } = useAuth();

const form = reactive({
  username: "",
  password: "",
});
const loading = ref(false);
const error = ref("");

const handleLogin = async () => {
  loading.value = true;
  error.value = "";

  try {
    const res = await $api<ApiResponse<LoginResponse>>("/auth/login", {
      method: "POST",
      body: form,
    });

    if (res.code === 0 && res.data) {
      login(res.data.token, res.data.user);
      navigateTo("/");
    } else {
      error.value = res.message || "登录失败";
    }
  } catch (e) {
    error.value = "网络错误，请重试";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

.login-box {
  width: 360px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 32px;
}

.form-item {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #1677ff;
}

button {
  width: 100%;
  padding: 12px;
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  background: #91caff;
  cursor: not-allowed;
}

.error {
  color: #ff4d4f;
  text-align: center;
  margin-top: 16px;
}
</style>
