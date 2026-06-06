import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'editor',
    component: () => import('@/views/Editor.vue')
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/AdminLogin.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      next('/admin/login')
      return
    }
  }
  next()
})

export default router
