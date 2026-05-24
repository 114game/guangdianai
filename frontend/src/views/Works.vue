<template>
  <div class="works min-h-screen pb-16">
    <header class="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <router-link to="/" class="text-gray-600">
          <span class="text-xl">←</span>
        </router-link>
        <h1 class="text-lg font-bold">我的作品</h1>
      </div>
    </header>

    <div class="p-4">
      <div v-if="loading" class="text-center py-10">
        <p class="text-gray-500">加载中...</p>
      </div>

      <div v-else-if="works.length" class="space-y-3">
        <div
          v-for="work in works"
          :key="work.id"
          @click="goToDetail(work)"
          class="p-4 bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-blue-500">🤖</span>
                <h3 class="font-medium">{{ work.title }}</h3>
              </div>
              <p class="text-sm text-gray-500 mb-2">
                {{ work.app?.name }}
              </p>
              <p class="text-xs text-gray-400">
                {{ formatDate(work.createdAt) }}
              </p>
            </div>
            <div class="text-gray-400">
              <span class="text-lg">›</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-10">
        <p class="text-gray-500">暂无作品</p>
        <router-link to="/" class="text-blue-500 text-sm mt-2 inline-block">
          去创作
        </router-link>
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
      <router-link to="/works" class="flex flex-col items-center text-blue-500">
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
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const works = ref<any[]>([])

const fetchWorks = async () => {
  try {
    loading.value = true
    const res = await request.get('/works')
    works.value = res.works
  } catch (error) {
    console.error('获取作品列表失败', error)
  } finally {
    loading.value = false
  }
}

const goToDetail = (work: any) => {
  router.push(`/works/${work.id}`)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchWorks()
})
</script>
