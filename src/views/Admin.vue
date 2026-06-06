<template>
  <div class="min-h-screen bg-[#f5f0eb]">
    <!-- 顶部导航 -->
    <header class="bg-white border-b border-[#eae5df] sticky top-0 z-30">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-[#e8734a] rounded-xl flex items-center justify-center text-white font-bold">T</div>
          <div>
            <h1 class="text-lg font-bold text-[#333]">后台管理</h1>
            <p class="text-xs text-[#999]">模板上传 | 系统配置 | 数据统计</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <router-link to="/" class="text-sm text-[#888] hover:text-[#e8734a]">← 前台</router-link>
          <button class="text-sm text-[#999] hover:text-red-400" @click="handleLogout">退出登录</button>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-6 py-8">
      <!-- Tab 切换 -->
      <div class="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-[#eae5df]">
        <button v-for="tab in adminTabs" :key="tab.id"
          class="flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all"
          :class="activeTab === tab.id
            ? 'bg-[#e8734a] text-white shadow-md'
            : 'text-[#888] hover:text-[#333] hover:bg-[#f5f0eb]'"
          @click="activeTab = tab.id">
          <span class="mr-2">{{ tab.icon }}</span>{{ tab.label }}
        </button>
      </div>

      <!-- 模板管理 -->
      <div v-if="activeTab === 'templates'" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-[#333]">模板管理</h2>
          <button class="btn-primary text-sm" @click="showUploadDialog = true">+ 上传模板</button>
        </div>

        <!-- 模板列表 -->
        <div v-if="admin.templateLoading" class="text-center py-12 text-[#999]">加载中...</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="tpl in admin.adminTemplates" :key="tpl.id"
            class="card relative group">
            <div class="flex items-center justify-between mb-3">
              <div class="flex gap-2">
                <div class="w-6 h-6 rounded" :style="{ background: tpl.colors?.primary || '#e8734a' }"></div>
                <div class="w-6 h-6 rounded" :style="{ background: tpl.colors?.accent || '#f5a88a' }"></div>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="text-xs px-2 py-1 rounded bg-[#f0ebe3] hover:bg-[#e8734a] hover:text-white"
                  @click="editTemplate(tpl)">✏️</button>
                <button class="text-xs px-2 py-1 rounded bg-[#f0ebe3] hover:bg-red-400 hover:text-white"
                  @click="handleDeleteTemplate(tpl.id)">🗑️</button>
              </div>
            </div>
            <h3 class="font-bold text-sm mb-1">{{ tpl.name }}</h3>
            <div class="flex gap-1 mb-2 flex-wrap">
              <span v-for="s in tpl.scene" :key="s" class="text-[10px] px-2 py-0.5 rounded bg-[#f0ebe3] text-[#888]">{{ s }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span :class="tpl.status === 'active' ? 'text-green-500' : 'text-[#ccc]'"
                class="text-xs font-medium">{{ tpl.status === 'active' ? '● 已启用' : '○ 已下架' }}</span>
              <button class="text-xs text-[#e8734a] hover:underline"
                @click="toggleTemplateStatus(tpl)">
                {{ tpl.status === 'active' ? '下架' : '启用' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统配置 -->
      <div v-if="activeTab === 'config'">
        <div class="card">
          <h2 class="text-xl font-bold text-[#333] mb-6">网站基础配置</h2>
          <div class="space-y-4 max-w-lg">
            <div>
              <label class="label">网站标题</label>
              <input class="input" v-model="admin.siteConfig.title" />
            </div>
            <div>
              <label class="label">副标题</label>
              <input class="input" v-model="admin.siteConfig.subtitle" />
            </div>
            <div>
              <label class="label">底部文案</label>
              <input class="input" v-model="admin.siteConfig.footer" />
            </div>
            <div>
              <label class="label">首页公告</label>
              <textarea class="textarea" rows="2" v-model="admin.siteConfig.announcement" placeholder="留空则不显示公告"></textarea>
            </div>
            <div>
              <label class="label">默认导出分辨率</label>
              <select class="input" v-model="admin.siteConfig.defaultResolution">
                <option value="1080p">1080P 高清</option>
                <option value="2k">2K 超清</option>
                <option value="4k">4K 极清</option>
              </select>
            </div>
            <button class="btn-primary" @click="saveConfig">💾 保存配置</button>
          </div>
        </div>

        <!-- 修改密码 -->
        <div class="card mt-6">
          <h3 class="text-lg font-bold text-[#333] mb-4">修改管理员密码</h3>
          <div class="space-y-3 max-w-xs">
            <div>
              <label class="label">旧密码</label>
              <input class="input" type="password" v-model="pwdForm.oldPassword" />
            </div>
            <div>
              <label class="label">新密码</label>
              <input class="input" type="password" v-model="pwdForm.newPassword" />
            </div>
            <button class="btn-secondary" @click="handleChangePassword">修改密码</button>
          </div>
        </div>
      </div>

      <!-- 数据统计 -->
      <div v-if="activeTab === 'stats'">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="card text-center">
            <div class="text-3xl mb-2">👁️</div>
            <div class="text-3xl font-bold text-[#e8734a]">{{ admin.stats.views || 0 }}</div>
            <div class="text-sm text-[#888] mt-1">页面访问量</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl mb-2">📥</div>
            <div class="text-3xl font-bold text-[#e8734a]">{{ admin.stats.exports || 0 }}</div>
            <div class="text-sm text-[#888] mt-1">海报导出次数</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl mb-2">🎨</div>
            <div class="text-3xl font-bold text-[#e8734a]">{{ admin.adminTemplates.length }}</div>
            <div class="text-sm text-[#888] mt-1">模板总数</div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-bold text-[#333] mb-4">热门模板排行</h3>
          <div v-if="admin.stats.topTemplates?.length" class="space-y-3">
            <div v-for="(t, idx) in admin.stats.topTemplates" :key="idx"
              class="flex items-center gap-3 p-3 bg-[#faf9f6] rounded-xl">
              <div class="w-8 h-8 rounded-lg bg-[#e8734a] flex items-center justify-center text-white text-sm font-bold">
                {{ idx + 1 }}
              </div>
              <div class="flex-1">
                <div class="text-sm font-medium">{{ t.name }}</div>
              </div>
              <div class="text-sm text-[#e8734a] font-bold">{{ t.count }} 次</div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-[#999] text-sm">
            暂无数据，用户生成海报后将显示排行
          </div>
        </div>
      </div>
    </div>

    <!-- 上传模板弹窗 -->
    <Teleport to="body">
      <div v-if="showUploadDialog" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" @click.self="showUploadDialog = false">
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-[480px] max-w-[90vw]">
          <h2 class="text-xl font-bold text-[#333] mb-4">上传新模板</h2>
          <div class="space-y-4">
            <div>
              <label class="label">模板名称</label>
              <input class="input" v-model="uploadForm.name" placeholder="如：日系樱花风" />
            </div>
            <div>
              <label class="label">风格标签</label>
              <input class="input" v-model="uploadForm.tag" placeholder="如：清新" />
            </div>
            <div>
              <label class="label">适用场景（逗号分隔）</label>
              <input class="input" v-model="uploadForm.scenes" placeholder="如：短途游,单人旅行" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">主题色</label>
                <input type="color" v-model="uploadForm.primary" class="w-full h-10 rounded cursor-pointer" />
              </div>
              <div>
                <label class="label">装饰色</label>
                <input type="color" v-model="uploadForm.accent" class="w-full h-10 rounded cursor-pointer" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">标题色</label>
                <input type="color" v-model="uploadForm.titleColor" value="#333333" class="w-full h-10 rounded cursor-pointer" />
              </div>
              <div>
                <label class="label">背景色</label>
                <input type="color" v-model="uploadForm.bgColor" value="#fffdf9" class="w-full h-10 rounded cursor-pointer" />
              </div>
            </div>
            <div>
              <label class="label">模板缩略图（选传）</label>
              <input type="file" accept="image/*" @change="handleThumbUpload" class="input" />
            </div>
            <div class="flex gap-3 pt-2">
              <button class="btn-primary flex-1" @click="handleUpload" :disabled="uploading">
                {{ uploading ? '上传中...' : '确认上传' }}
              </button>
              <button class="btn-secondary" @click="showUploadDialog = false">取消</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const admin = useAdminStore()

const activeTab = ref('templates')
const showUploadDialog = ref(false)
const uploading = ref(false)

const adminTabs = [
  { id: 'templates', label: '模板管理', icon: '🎨' },
  { id: 'config', label: '系统配置', icon: '⚙️' },
  { id: 'stats', label: '数据统计', icon: '📊' }
]

const uploadForm = reactive({
  name: '',
  tag: '',
  scenes: '',
  primary: '#e8734a',
  accent: '#f5a88a',
  titleColor: '#333333',
  textColor: '#555555',
  bgColor: '#fffdf9',
  thumbFile: null
})

const pwdForm = reactive({
  oldPassword: '',
  newPassword: ''
})

function handleLogout() {
  admin.logout()
  router.push('/admin/login')
}

async function handleUpload() {
  if (!uploadForm.name) {
    alert('请输入模板名称')
    return
  }
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('name', uploadForm.name)
    fd.append('tag', uploadForm.tag)
    fd.append('scene', uploadForm.scenes)
    fd.append('primary', uploadForm.primary)
    fd.append('accent', uploadForm.accent)
    fd.append('titleColor', uploadForm.titleColor)
    fd.append('textColor', uploadForm.textColor)
    fd.append('bgColor', uploadForm.bgColor)
    if (uploadForm.thumbFile) fd.append('thumbnail', uploadForm.thumbFile)

    await admin.uploadTemplate(fd)
    showUploadDialog.value = false
    Object.assign(uploadForm, {
      name: '', tag: '', scenes: '', primary: '#e8734a', accent: '#f5a88a',
      titleColor: '#333333', textColor: '#555555', bgColor: '#fffdf9', thumbFile: null
    })
    admin.fetchTemplates()
  } catch (e) {
    alert('上传失败')
  } finally {
    uploading.value = false
  }
}

function handleThumbUpload(e) {
  uploadForm.thumbFile = e.target.files[0]
}

async function handleDeleteTemplate(id) {
  if (!confirm('确定删除此模板？')) return
  await admin.deleteTemplate(id)
  admin.fetchTemplates()
}

async function toggleTemplateStatus(tpl) {
  const newStatus = tpl.status === 'active' ? 'inactive' : 'active'
  await admin.updateTemplate(tpl.id, { status: newStatus })
  admin.fetchTemplates()
}

function editTemplate(tpl) {
  // 简化编辑：直接弹出修改名称等
  const newName = prompt('修改模板名称', tpl.name)
  if (newName && newName !== tpl.name) {
    admin.updateTemplate(tpl.id, { name: newName }).then(() => admin.fetchTemplates())
  }
}

async function saveConfig() {
  await admin.saveSiteConfig(admin.siteConfig)
  alert('配置已保存')
}

async function handleChangePassword() {
  if (!pwdForm.oldPassword || !pwdForm.newPassword) {
    alert('请填写完整')
    return
  }
  try {
    const res = await admin.changePassword(pwdForm.oldPassword, pwdForm.newPassword)
    if (res.success) {
      alert('密码已修改')
      pwdForm.oldPassword = ''
      pwdForm.newPassword = ''
    } else {
      alert(res.error || '修改失败')
    }
  } catch {
    alert('修改失败')
  }
}

onMounted(() => {
  admin.fetchTemplates()
  admin.fetchSiteConfig()
  admin.fetchStats()
})
</script>
