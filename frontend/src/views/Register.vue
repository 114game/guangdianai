<template>
  <div class="register min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">创建账户</h1>
        <p class="text-gray-500 mt-2">注册您的新账户</p>
      </div>

      <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          @click="registerType = 'phone'"
          :class="[
            'flex-1 py-2 rounded-md text-sm font-medium transition-colors',
            registerType === 'phone'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500'
          ]"
        >
          手机号注册
        </button>
        <button
          @click="registerType = 'email'"
          :class="[
            'flex-1 py-2 rounded-md text-sm font-medium transition-colors',
            registerType === 'email'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500'
          ]"
        >
          邮箱注册
        </button>
      </div>

      <div class="space-y-4">
        <div v-if="registerType === 'phone'">
          <label class="block text-sm font-medium text-gray-700 mb-1">手机号</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="请输入手机号"
          />
        </div>

        <div v-if="registerType === 'email'">
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="请输入邮箱"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">验证码</label>
          <div class="flex gap-2">
            <input
              v-model="form.code"
              type="text"
              class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="请输入验证码"
            />
            <button
              @click="sendCode"
              :disabled="countdown > 0"
              class="px-4 py-3 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="请输入密码"
          />
          <button
            @click="showPassword = !showPassword"
            type="button"
            class="text-sm text-gray-500 mt-1"
          >
            {{ showPassword ? '隐藏密码' : '显示密码' }}
          </button>
        </div>

        <button
          @click="handleRegister"
          :disabled="loading"
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </div>

      <div class="mt-6 text-center">
        <span class="text-gray-500">已有账户？</span>
        <router-link to="/login" class="text-blue-500 font-medium ml-1">
          立即登录
        </router-link>
      </div>

      <div class="mt-4 text-center">
        <router-link to="/" class="text-gray-500 text-sm">← 返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const registerType = ref<'phone' | 'email'>('phone')
const showPassword = ref(false)
const loading = ref(false)
const countdown = ref(0)
const form = ref({
  phone: '',
  email: '',
  code: '',
  password: ''
})

const sendCode = () => {
  // 模拟发送验证码
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleRegister = async () => {
  try {
    loading.value = true
    await userStore.register({
      phone: registerType.value === 'phone' ? form.value.phone : undefined,
      email: registerType.value === 'email' ? form.value.email : undefined,
      password: form.value.password,
      code: form.value.code
    })
    router.push('/')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
