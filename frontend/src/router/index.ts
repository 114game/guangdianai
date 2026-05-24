import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/Chat.vue')
  },
  {
    path: '/apps',
    name: 'Apps',
    component: () => import('@/views/Apps.vue')
  },
  {
    path: '/apps/:id',
    name: 'AppDetail',
    component: () => import('@/views/AppDetail.vue')
  },
  {
    path: '/works',
    name: 'Works',
    component: () => import('@/views/Works.vue')
  },
  {
    path: '/works/:id',
    name: 'WorkDetail',
    component: () => import('@/views/WorkDetail.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
