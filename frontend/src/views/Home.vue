<template>
  <div class="home min-h-screen pb-16">
    <!-- 头部 -->
    <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold">AI商家服务平台</h1>
        <div v-if="userStore.user" class="flex items-center gap-2">
          <span class="bg-white/20 px-3 py-1 rounded-full text-sm">
            积分: {{ userStore.user.points }}
          </span>
        </div>
      </div>
    </header>

    <!-- 轮播图 -->
    <div v-if="homeData.banners?.length" class="p-4">
      <div class="rounded-xl overflow-hidden h-40 bg-gray-200">
        <img
          :src="homeData.banners[0].image"
          class="w-full h-full object-cover"
          alt="banner"
        />
      </div>
    </div>

    <!-- 公告 -->
    <div v-if="homeData.announcements?.length" class="px-4 py-2">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <span class="text-yellow-600 font-medium">公告:</span>
          <span class="text-gray-700 text-sm">{{ homeData.announcements[0].title }}</span>
        </div>
      </div>
    </div>

    <!-- 功能入口 -->
    <div class="p-4">
      <h2 class="text-lg font-bold mb-4">功能入口</h2>
      <div class="grid grid-cols-4 gap-4">
        <div
          v-for="app in homeData.apps?.slice(0, 8) || []"
          :key="app.id"
          @click="goToApp(app)"
          class="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-shadow"
        >
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">🤖</span>
          </div>
          <span class="text-xs text-gray-700">{{ app.name }}</span>
        </div>
      </div>
    </div>

    <!-- 全部应用 -->
    <div class="p-4">
      <h2 class="text-lg font-bold mb-4 flex items-center justify-between">
        <span>全部应用</span>
        <router-link to="/apps" class="text-blue-500 text-sm">查看更多 →</router-link>
      </h2>
      <div class="space-y-3">
        <div
          v-for="app in homeData.apps || []"
          :key="app.id"
          @click="goToApp(app)"
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
    </div>

    <!-- 底部导航 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around py-2 px-4 z-50">
      <router-link to="/" class="flex flex-col items-center text-blue-500">
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
const homeData = ref<any>({
  banners: [],
  announcements: [],
  apps: []
})

const fetchHomeData = async () => {
  try {
    const res = await request.get('/home')
    homeData.value = res
  } catch (error) {
    console.error('获取首页数据失败', error)
  }
}

const goToApp = (app: any) => {
  if (!userStore.token) {
    router.push('/login')
    return
  }
  router.push(`/apps/${app.id}`)
}

onMounted(() => {
  fetchHomeData()
  if (userStore.token && !userStore.user) {
    userStore.getUserInfo()
  }
})
</script>
