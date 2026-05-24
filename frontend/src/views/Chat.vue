<template>
  <div class="chat min-h-screen flex flex-col pb-16">
    <header class="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <router-link to="/" class="text-gray-600">
          <span class="text-xl">←</span>
        </router-link>
        <h1 class="text-lg font-bold">AI对话</h1>
      </div>
    </header>

    <!-- 会话列表 -->
    <div v-if="!currentSession" class="flex-1 p-4">
      <div class="mb-4">
        <button
          @click="createSession"
          :disabled="creating"
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {{ creating ? '创建中...' : '新建对话' }}
        </button>
      </div>

      <div v-if="loading" class="text-center py-10">
        <p class="text-gray-500">加载中...</p>
      </div>

      <div v-else-if="sessions.length" class="space-y-3">
        <div
          v-for="session in sessions"
          :key="session.id"
          @click="selectSession(session)"
          class="p-4 bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-shadow"
        >
          <h3 class="font-medium mb-1">{{ session.title }}</h3>
          <p class="text-xs text-gray-500">
            {{ formatDate(session.updatedAt) }}
          </p>
        </div>
      </div>

      <div v-else class="text-center py-10">
        <p class="text-gray-500 mb-2">暂无对话</p>
        <p class="text-gray-400 text-sm">点击上方按钮开始新对话</p>
      </div>
    </div>

    <!-- 对话内容 -->
    <div v-else class="flex-1 flex flex-col">
      <div class="p-4 border-b border-gray-100 bg-white">
        <div class="flex items-center justify-between">
          <button @click="currentSession = null" class="text-gray-600">
            <span class="text-xl">←</span>
          </button>
          <span class="font-medium">{{ currentSession.title }}</span>
          <button
            @click="deleteSession"
            class="text-red-500 text-sm"
          >
            删除
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto p-4 space-y-4">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex gap-3',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            v-if="message.role === 'assistant'"
            class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0"
          >
            🤖
          </div>
          <div
            :class="[
              'max-w-[80%] p-3 rounded-lg',
              message.role === 'user'
                ? 'bg-blue-500 text-white rounded-br-sm'
                : 'bg-white shadow-sm rounded-bl-sm'
            ]"
          >
            <div class="whitespace-pre-wrap">{{ message.content }}</div>
          </div>
          <div
            v-if="message.role === 'user'"
            class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0"
          >
            👤
          </div>
        </div>

        <div v-if="sending" class="flex gap-3">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
            🤖
          </div>
          <div class="bg-white shadow-sm rounded-lg rounded-bl-sm p-3">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s;"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-gray-100 bg-white">
        <div class="flex gap-3">
          <textarea
            v-model="inputMessage"
            @keydown.enter.prevent="sendMessage"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            rows="1"
            placeholder="输入消息..."
          ></textarea>
          <button
            @click="sendMessage"
            :disabled="sending || !inputMessage.trim()"
            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around py-2 px-4 z-50">
      <router-link to="/" class="flex flex-col items-center text-gray-400">
        <span class="text-xl">🏠</span>
        <span class="text-xs">首页</span>
      </router-link>
      <router-link to="/chat" class="flex flex-col items-center text-blue-500">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const creating = ref(false)
const sending = ref(false)
const sessions = ref<any[]>([])
const currentSession = ref<any>(null)
const messages = ref<any[]>([])
const inputMessage = ref('')

const fetchSessions = async () => {
  try {
    loading.value = true
    const res = await request.get('/chat/sessions')
    sessions.value = res
  } catch (error) {
    console.error('获取会话列表失败', error)
  } finally {
    loading.value = false
  }
}

const createSession = async () => {
  try {
    creating.value = true
    const res = await request.post('/chat/sessions', {})
    currentSession.value = res
    messages.value = []
  } catch (error) {
    console.error('创建会话失败', error)
  } finally {
    creating.value = false
  }
}

const selectSession = async (session: any) => {
  try {
    const res = await request.get(`/chat/sessions/${session.id}`)
    currentSession.value = res
    messages.value = res.messages || []
  } catch (error) {
    console.error('获取会话详情失败', error)
  }
}

const deleteSession = async () => {
  if (!currentSession.value) return
  if (!confirm('确定要删除这个会话吗？')) return
  
  try {
    await request.delete(`/chat/sessions/${currentSession.value.id}`)
    currentSession.value = null
    messages.value = []
    await fetchSessions()
  } catch (error) {
    console.error('删除会话失败', error)
  }
}

const sendMessage = async () => {
  if (!currentSession.value || sending.value || !inputMessage.value.trim()) return
  
  const content = inputMessage.value.trim()
  inputMessage.value = ''
  
  try {
    sending.value = true
    
    // 添加用户消息到界面
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content
    }
    messages.value.push(userMessage)
    
    const res = await request.post('/chat/messages', {
      sessionId: currentSession.value.id,
      content
    })
    
    messages.value.push(res.assistantMessage)
    
    // 刷新用户信息
    await userStore.getUserInfo()
  } catch (error) {
    console.error('发送消息失败', error)
  } finally {
    sending.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  if (userStore.token) {
    fetchSessions()
  } else {
    router.push('/login')
  }
})
</script>
