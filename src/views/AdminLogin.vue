<template>
  <div class="min-h-screen bg-[#f5f0eb] flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🔐</div>
        <h1 class="text-2xl font-bold text-[#333]">管理员登录</h1>
      </div>

      <div class="space-y-4">
        <div>
          <label class="label">管理密码</label>
          <input
            v-model="password"
            type="password"
            class="input"
            placeholder="请输入管理密码"
            @keydown.enter="handleLogin"
          />
        </div>

        <div v-if="error" class="text-sm text-red-400 bg-red-50 rounded-lg px-4 py-3">
          {{ error }}
        </div>

        <button
          class="btn-primary w-full"
          :disabled="loading"
          @click="handleLogin"
        >
          {{ loading ? '验证中...' : '登 录' }}
        </button>
      </div>

      <div class="mt-6 text-center">
        <router-link to="/" class="text-sm text-[#999] hover:text-[#e8734a]">
          ← 返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const admin = useAdminStore()

const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!password.value) {
    error.value = '请输入密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const success = await admin.login(password.value)
    if (success) {
      router.push('/admin')
    } else {
      error.value = '密码错误'
    }
  } catch {
    error.value = '登录失败，请检查网络'
  } finally {
    loading.value = false
  }
}
</script>
