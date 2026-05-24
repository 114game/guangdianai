<template>
  <div class="app-detail min-h-screen pb-16">
    <header class="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <router-link to="/apps" class="text-gray-600">
          <span class="text-xl">←</span>
        </router-link>
        <h1 class="text-lg font-bold">{{ app?.name }}</h1>
      </div>
    </header>

    <div v-if="loading" class="p-4 text-center">
      <p class="text-gray-500">加载中...</p>
    </div>

    <div v-else-if="app" class="p-4">
      <!-- 表单区域 -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div v-for="field in app.fields" :key="field.id" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ field.name }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          
          <input
            v-if="field.fieldType === 'text'"
            v-model="formData[field.key]"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :placeholder="field.placeholder"
            :required="field.required"
          />
          
          <textarea
            v-else-if="field.fieldType === 'textarea'"
            v-model="formData[field.key]"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            rows="4"
            :placeholder="field.placeholder"
            :required="field.required"
          ></textarea>
          
          <input
            v-else-if="field.fieldType === 'number'"
            v-model.number="formData[field.key]"
            type="number"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :placeholder="field.placeholder"
            :required="field.required"
          />
          
          <select
            v-else-if="field.fieldType === 'select'"
            v-model="formData[field.key]"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :required="field.required"
          >
            <option value="">请选择</option>
            <option
              v-for="(opt, idx) in field.options"
              :key="idx"
              :value="opt"
            >
              {{ opt }}
            </option>
          </select>
        </div>

        <button
          @click="handleExecute"
          :disabled="executing"
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
        >
          {{ executing ? '生成中...' : `生成 (${app.points}积分)` }}
        </button>
      </div>

      <!-- 结果区域 -->
      <div v-if="result" class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg">生成结果</h3>
          <div class="flex gap-2">
            <button
              @click="copyResult"
              class="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm"
            >
              复制
            </button>
          </div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
          {{ result }}
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around py-2 px-4 z-50">
      <router-link to="/" class="flex flex-col items-center text-gray-400">
        <span class="text-xl">🏠</span>
        <span class="text-xs">首页</span>
      </router-link>
      <router-link to="/chat" class="flex flex-col items-center text-gray-400">
        <span class="text-xl">💬</span>
        <span class="text-xs">对话</span>
      </router-link>
      <router-link to="/works" class="flex flex-col items-center text-gray-400">
        <span class="text-xl">📁</span>
        <span class="text-xs">作品</span>
      </router-link>
      <router-link to="/profile" class="flex flex-col items-center text-gray-400">
        <span class="text-xl">👤</span>
        <span class="text-xs">我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const executing = ref(false)
const app = ref<any>(null)
const formData = ref<any>({})
const result = ref('')

const fetchApp = async () => {
  try {
    loading.value = true
    const res = await request.get(`/apps/${route.params.id}`)
    app.value = res
    // 初始化表单数据
    res.fields.forEach((field: any) => {
      formData.value[field.key] = field.defaultValue || ''
    })
  } catch (error) {
    console.error('获取应用详情失败', error)
  } finally {
    loading.value = false
  }
}

const handleExecute = async () => {
  try {
    executing.value = true
    const res = await request.post(`/apps/${route.params.id}/execute`, {
      inputData: formData.value
    })
    result.value = res.content
    // 刷新用户信息
    await userStore.getUserInfo()
  } catch (error) {
    console.error('执行应用失败', error)
  } finally {
    executing.value = false
  }
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(result.value)
    alert('复制成功')
  } catch (error) {
    console.error('复制失败', error)
  }
}

onMounted(() => {
  fetchApp()
})
</script>
