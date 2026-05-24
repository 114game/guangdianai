import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  const user = ref<any>(null)
  const token = ref<string>(localStorage.getItem('token') || '')

  const login = async (data: { phone?: string; email?: string; password: string }) => {
    let res
    if (data.phone) {
      res = await request.post('/user/login/phone', data)
    } else if (data.email) {
      res = await request.post('/user/login/email', data)
    } else {
      throw new Error('请输入手机号或邮箱')
    }
    
    user.value = res.user
    token.value = res.token
    localStorage.setItem('token', res.token)
  }

  const register = async (data: { phone?: string; email?: string; password: string; code: string }) => {
    let res
    if (data.phone) {
      res = await request.post('/user/register/phone', data)
    } else if (data.email) {
      res = await request.post('/user/register/email', data)
    } else {
      throw new Error('请输入手机号或邮箱')
    }
    
    user.value = res.user
    token.value = res.token
    localStorage.setItem('token', res.token)
  }

  const getUserInfo = async () => {
    const res = await request.get('/user/info')
    user.value = res
  }

  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  return { user, token, login, register, getUserInfo, logout }
})
