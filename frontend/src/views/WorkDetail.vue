<template>
  <div class="work-detail min-h-screen pb-16">
    <header class="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <router-link to="/works" class="text-gray-600">
          <span class="text-xl">←</span>
        </router-link>
        <h1 class="text-lg font-bold">作品详情</h1>
      </div>
    </header>

    <div v-if="loading" class="p-4 text-center">
      <p class="text-gray-500">加载中...</p>
    </div>

    <div v-else-if="work" class="p-4">
      <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-blue-500">🤖</span>
          <h2 class="font-bold text-lg">{{ work.title }}</h2>
        </div>
        <p class="text-sm text-gray-500 mb-2">
          {{ work.app?.name }}
        </p>
        <p class="text-xs text-gray-400">
          {{ formatDate(work.createdAt) }}
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
        <h3 class="font-bold mb-3">输入</h3>
        <div class="bg-gray-50 p-4 rounded-lg">
          <pre class="whitespace-pre-wrap text-sm">{{ JSON.stringify(work.inputData, null, 2) }}</pre>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold">输出</h3>
          <div class="flex gap-2">
            <button
              @click="copyResult"
              class="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm"
            >
              复制
            </button>
            <button
              @click="deleteWork"
              class="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm"
            >
              删除
            </button>
          </div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
          {{ work.outputData?.content || JSON.stringify(work.outputData, null, 2) }}
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
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const work = ref<any>(null)

const fetchWork = async () => {
  try {
    loading.value = true
    const res = await request.get(`/works/${route.params.id}`)
    work.value = res
  } catch (error) {
    console.error('获取作品详情失败', error)
  } finally {
    loading.value = false
  }
}

const copyResult = async () => {
  try {
    const content = work.value.outputData?.content || JSON.stringify(work.value.outputData, null, 2)
    await navigator.clipboard.writeText(content)
    alert('复制成功')
  } catch (error) {
    console.error('复制失败', error)
  }
}

const deleteWork = async () => {
  if (!confirm('确定要删除这个作品吗？')) return
  
  try {
    await request.delete(`/works/${route.params.id}`)
    alert('删除成功')
    router.push('/works')
  } catch (error) {
    console.error('删除作品失败', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchWork()
})
</script>
