<template>
  <div class="apps min-h-screen pb-16">
    <header class="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <router-link to="/" class="text-gray-600">
          <span class="text-xl">←</span>
        </router-link>
        <h1 class="text-lg font-bold">全部应用</h1>
      </div>
    </header>

    <div class="p-4">
      <div v-if="loading" class="text-center py-10">
        <p class="text-gray-500">加载中...</p>
      </div>

      <div v-else-if="apps.length" class="space-y-3">
        <div
          v-for="app in apps"
          :key="app.id"
          @click="goToDetail(app)"
          class="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-shadow"
        >
          <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl">
            🤖
          </div>
          <div class="flex-1">
            <h3 class="font-medium">{{ app.name }}</h3>
            <p class="text-sm text-gray-500">{{ app.description || 'AI智能助手' }}</p>
          </div>
          <div class="text-right">
            <span class="text-sm text-orange-500">{{ app.points }}积分</span>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-10">
        <p class="text-gray-500">暂无应用</p>
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
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const apps = ref<any[]>([])

const fetchApps = async () => {
  try {
    loading.value = true
    const res = await request.get('/apps')
    apps.value = res
  } catch (error) {
    console.error('获取应用列表失败', error)
  } finally {
    loading.value = false
  }
}

const goToDetail = (app: any) => {
  if (!userStore.token) {
    router.push('/login')
    return
  }
  router.push(`/apps/${app.id}`)
}

onMounted(() => {
  fetchApps()
})
</script>
