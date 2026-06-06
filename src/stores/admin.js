import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

const API_BASE = '/.netlify/functions'

export const useAdminStore = defineStore('admin', () => {
  // 认证
  const token = ref(localStorage.getItem('admin_token') || '')
  const isLoggedIn = ref(!!token.value)

  async function login(password) {
    const res = await fetch(`${API_BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    const data = await res.json()
    if (data.token) {
      token.value = data.token
      isLoggedIn.value = true
      localStorage.setItem('admin_token', data.token)
      return true
    }
    return false
  }

  function logout() {
    token.value = ''
    isLoggedIn.value = false
    localStorage.removeItem('admin_token')
  }

  function changePassword(oldPwd, newPwd) {
    return fetch(`${API_BASE}/auth`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd })
    }).then(r => r.json())
  }

  // 模板管理
  const adminTemplates = ref([])
  const templateLoading = ref(false)

  async function fetchTemplates() {
    templateLoading.value = true
    try {
      const res = await fetch(`${API_BASE}/templates`, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })
      adminTemplates.value = await res.json()
    } catch (e) {
      console.error('获取模板失败:', e)
    } finally {
      templateLoading.value = false
    }
  }

  async function uploadTemplate(formData) {
    const res = await fetch(`${API_BASE}/templates`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token.value}` },
      body: formData
    })
    return res.json()
  }

  async function updateTemplate(id, data) {
    const res = await fetch(`${API_BASE}/templates`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ id, ...data })
    })
    return res.json()
  }

  async function deleteTemplate(id) {
    const res = await fetch(`${API_BASE}/templates?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    return res.json()
  }

  // 站点配置
  const siteConfig = reactive({
    title: '旅行攻略海报生成器',
    subtitle: '手动编辑 + 模板美化 + 一键出图',
    logo: '',
    footer: '© Travel Guide Poster',
    announcement: '',
    defaultResolution: '1080p',
    defaultStyle: 'flat'
  })

  async function fetchSiteConfig() {
    try {
      const res = await fetch(`${API_BASE}/config`, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })
      const data = await res.json()
      if (data && Object.keys(data).length) Object.assign(siteConfig, data)
    } catch (e) {
      console.error('获取配置失败:', e)
    }
  }

  async function saveSiteConfig(config) {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(config)
    })
    return res.json()
  }

  // 统计
  const stats = ref({ views: 0, exports: 0, topTemplates: [] })

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })
      stats.value = await res.json()
    } catch (e) {
      console.error('获取统计失败:', e)
    }
  }

  return {
    token, isLoggedIn,
    login, logout, changePassword,
    adminTemplates, templateLoading,
    fetchTemplates, uploadTemplate, updateTemplate, deleteTemplate,
    siteConfig, fetchSiteConfig, saveSiteConfig,
    stats, fetchStats
  }
})
