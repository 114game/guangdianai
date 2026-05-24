<template>
  <div class="profile min-h-screen pb-16">
    <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
          👤
        </div>
        <div class="flex-1">
          <h1 class="text-xl font-bold">{{ userStore.user?.nickname || '用户' }}</h1>
          <p class="text-white/80 text-sm mt-1">
            {{ userStore.user?.phone || userStore.user?.email }}
          </p>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between bg-white/10 rounded-xl p-4">
        <div class="text-center">
          <p class="text-2xl font-bold">{{ userStore.user?.points || 0 }}</p>
          <p class="text-white/80 text-sm">积分</p>
        </div>
      </div>
    </header>

    <div class="p-4">
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div
          @click="showCardRedeem = true"
          class="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
        >
          <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
            🎁
          </div>
          <div class="flex-1">
            <p class="font-medium">卡密兑换</p>
            <p class="text-sm text-gray-500">输入卡密兑换积分</p>
          </div>
          <span class="text-gray-400">›</span>
        </div>

        <router-link
          to="/works"
          class="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50"
        >
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
            📁
          </div>
          <div class="flex-1">
            <p class="font-medium">我的作品</p>
            <p class="text-sm text-gray-500">查看历史创作</p>
          </div>
          <span class="text-gray-400">›</span>
        </router-link>

        <div
          @click="fetchPointLogs"
          class="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
        >
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-500">
            📊
          </div>
          <div class="flex-1">
            <p class="font-medium">积分记录</p>
            <p class="text-sm text-gray-500">查看积分流水</p>
          </div>
          <span class="text-gray-400">›</span>
        </div>

        <div
          class="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
          @click="handleLogout"
        >
          <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-500">
            🚪
          </div>
          <div class="flex-1">
            <p class="font-medium text-red-500">退出登录</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡密兑换弹窗 -->
    <div v-if="showCardRedeem" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold mb-4">卡密兑换</h3>
        <input
          v-model="cardCode"
          type="text"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
          placeholder="请输入卡密"
        />
        <div class="flex gap-3">
          <button
            @click="showCardRedeem = false"
            class="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600"
          >
            取消
          </button>
          <button
            @click="handleRedeem"
            :disabled="redeeming"
            class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg disabled:opacity-50"
          >
            {{ redeeming ? '兑换中...' : '兑换' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 积分记录弹窗 -->
    <div v-if="showPointLogs" class="fixed inset-0 bg-black/50 flex items-end z-50">
      <div class="bg-white rounded-t-xl w-full max-h-[70vh]">
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 class="text-lg font-bold">积分记录</h3>
          <button @click="showPointLogs = false" class="text-gray-500 text-xl">×</button>
        </div>
        <div class="overflow-auto p-4" style="max-height: 60vh;">
          <div v-if="pointLogs.length" class="space-y-3">
            <div
              v-for="log in pointLogs"
              :key="log.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium">{{ log.remark }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(log.createdAt) }}</p>
              </div>
              <span
                :class="[
                  'font-bold',
                  log.amount > 0 ? 'text-green-500' : 'text-red-500'
                ]"
              >
                {{ log.amount > 0 ? '+' : '' }}{{ log.amount }}
              </span>
            </div>
          </div>
          <div v-else class="text-center py-10 text-gray-500">
            暂无记录
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around py-2 px-4 z-40">
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
      <router-link to="/profile" class="flex flex-col items-center text-blue-500">
        <span class="text-xl">👤</span>
        <span class="text-xs">我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const showCardRedeem = ref(false)
const showPointLogs = ref(false)
const cardCode = ref('')
const redeeming = ref(false)
const pointLogs = ref<any[]>([])

const handleLogout = () => {
  if (!confirm('确定要退出登录吗？')) return
  userStore.logout()
  router.push('/login')
}

const handleRedeem = async () => {
  if (!cardCode.value.trim()) {
    alert('请输入卡密')
    return
  }
  
  try {
    redeeming.value = true
    await request.post('/user/card/redeem', { code: cardCode.value })
    alert('兑换成功')
    showCardRedeem.value = false
    cardCode.value = ''
    await userStore.getUserInfo()
  } catch (error) {
    console.error('兑换失败', error)
  } finally {
    redeeming.value = false
  }
}

const fetchPointLogs = async () => {
  try {
    const res = await request.get('/user/points/logs')
    pointLogs.value = res.logs
    showPointLogs.value = true
  } catch (error) {
    console.error('获取积分记录失败', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  if (userStore.token && !userStore.user) {
    userStore.getUserInfo()
  }
})
</script>
