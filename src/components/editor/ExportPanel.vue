<template>
  <div class="bg-white rounded-2xl shadow-2xl p-8 w-[420px] max-w-[90vw]" @click.stop>
    <div class="text-center mb-6">
      <div class="text-4xl mb-2">📥</div>
      <h2 class="text-xl font-bold text-[#333]">导出攻略海报</h2>
      <p class="text-sm text-[#888] mt-1">选择分辨率和格式，一键保存</p>
    </div>

    <!-- 分辨率选择 -->
    <div class="mb-5">
      <label class="block text-xs text-[#888] mb-2 font-medium">分辨率</label>
      <div class="grid grid-cols-3 gap-2">
        <button v-for="(cfg, key) in resolutions" :key="key"
          class="py-3 rounded-xl text-center transition-all border-2"
          :class="selectedResolution === key
            ? 'border-[#e8734a] bg-[#e8734a]/5'
            : 'border-[#eae5df] hover:border-[#e8734a]/30'"
          @click="selectedResolution = key">
          <div class="text-sm font-bold">{{ key.toUpperCase() }}</div>
          <div class="text-[10px] text-[#999]">{{ cfg.width }}x{{ cfg.height }}</div>
        </button>
      </div>
    </div>

    <!-- 格式选择 -->
    <div class="mb-5">
      <label class="block text-xs text-[#888] mb-2 font-medium">导出格式</label>
      <div class="grid grid-cols-3 gap-2">
        <button v-for="fmt in formats" :key="fmt.value"
          class="py-3 rounded-xl text-center transition-all border-2"
          :class="selectedFormat === fmt.value
            ? 'border-[#e8734a] bg-[#e8734a]/5'
            : 'border-[#eae5df] hover:border-[#e8734a]/30'"
          @click="selectedFormat = fmt.value">
          <div class="text-sm font-bold">{{ fmt.label }}</div>
          <div class="text-[10px] text-[#999]">{{ fmt.desc }}</div>
        </button>
      </div>
    </div>

    <!-- 导出状态 -->
    <div v-if="statusMsg" class="mb-4 p-3 rounded-xl" :class="statusBg">
      <div class="flex items-center gap-2 mb-1">
        <span v-if="statusType === 'loading'" class="text-lg animate-spin">⏳</span>
        <span v-else-if="statusType === 'done'" class="text-lg">✅</span>
        <span v-else class="text-lg">❌</span>
        <span class="text-sm font-medium">{{ statusMsg }}</span>
      </div>
      <div v-if="statusType === 'loading'" class="w-full bg-[#f0ebe3] rounded-full h-2 mt-2">
        <div class="h-2 rounded-full bg-[#e8734a] transition-all duration-300"
          :style="{ width: progress + '%' }"></div>
      </div>
    </div>

    <!-- 错误详情 -->
    <div v-if="errorDetail" class="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
      <div class="text-sm text-red-600 whitespace-pre-wrap">{{ errorDetail }}</div>
      <button class="text-xs text-red-400 underline mt-2" @click="errorDetail = ''">关闭</button>
    </div>

    <!-- 预览图 -->
    <div v-if="previewUrl" class="mb-4 rounded-xl overflow-hidden border border-[#eae5df]">
      <img :src="previewUrl" class="w-full cursor-pointer" alt="预览" @click="openPreview" />
      <div class="text-center text-xs text-[#aaa] py-2 bg-[#faf9f6]">
        💡 点击放大 | 右键"图片另存为"下载
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-3">
      <button class="btn-primary flex-1 text-sm" @click="handleExport" :disabled="isExporting">
        {{ isExporting ? '导出中...' : '⬇️ 生成并下载' }}
      </button>
      <button v-if="exportedCanvas" class="btn-secondary text-sm" @click="handleCopy">
        📋 复制
      </button>
    </div>

    <button class="btn-ghost w-full mt-3 text-sm" @click="$emit('close')">
      关闭
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import html2canvas from 'html2canvas'

const emit = defineEmits(['close'])

const selectedResolution = ref('1080p')
const selectedFormat = ref('png')
const previewUrl = ref('')
const exportedCanvas = ref(null)
const isExporting = ref(false)
const progress = ref(0)
const statusMsg = ref('')
const statusType = ref('')  // loading | done | error
const errorDetail = ref('')

const resolutions = {
  '1080p': { width: 1080, height: 1526, label: '1080P 高清', scale: 2 },
  '2k': { width: 1440, height: 2034, label: '2K 超清', scale: 2.5 },
  '4k': { width: 2160, height: 3052, label: '4K 极清', scale: 4 }
}

const formats = [
  { value: 'png', label: 'PNG', desc: '透明底' },
  { value: 'jpg', label: 'JPG', desc: '高清' },
  { value: 'webp', label: 'WebP', desc: '小体积' }
]

const statusBg = computed(() => {
  if (statusType.value === 'error') return 'bg-red-50 border border-red-200'
  if (statusType.value === 'done') return 'bg-green-50 border border-green-200'
  return 'bg-blue-50 border border-blue-200'
})

import { computed } from 'vue'

async function handleExport() {
  errorDetail.value = ''
  previewUrl.value = ''
  statusMsg.value = ''
  statusType.value = ''

  // Step 1: 查找海报元素
  statusMsg.value = '正在查找海报...'
  statusType.value = 'loading'
  progress.value = 5

  console.log('[Export] 开始导出，查找 .poster-wrapper')
  const el = document.querySelector('.poster-wrapper')

  if (!el) {
    // 尝试其他选择器
    const el2 = document.querySelector('[class*="poster"]')
    if (!el2) {
      statusType.value = 'error'
      statusMsg.value = '未找到海报元素'
      errorDetail.value = '请在编辑器中填写至少一个内容板块，确保右侧预览区已显示海报。如仍有问题请刷新页面。'
      console.error('[Export] 未找到 .poster-wrapper')
      return
    }
  }

  const sourceEl = el || document.querySelector('[class*="poster"]')
  console.log('[Export] 找到元素:', sourceEl.tagName, sourceEl.className, sourceEl.getBoundingClientRect())

  isExporting.value = true
  progress.value = 10
  statusMsg.value = '正在初始化截图引擎...'

  try {
    // Step 2: 配置
    const conf = resolutions[selectedResolution.value] || resolutions['1080p']
    progress.value = 20

    // Step 3: 用 html2canvas 渲染
    statusMsg.value = '正在渲染海报（可能需要几秒）...'
    console.log('[Export] 调用 html2canvas, scale:', conf.scale)

    const canvas = await html2canvas(sourceEl, {
      scale: conf.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: sourceEl.scrollWidth || 420,
      windowHeight: sourceEl.scrollHeight || 800
    })

    console.log('[Export] Canvas 尺寸:', canvas.width, 'x', canvas.height)
    progress.value = 70
    statusMsg.value = '正在生成导出文件...'

    // Step 4: 裁剪到目标分辨率
    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = conf.width
    finalCanvas.height = Math.min(conf.height, canvas.height)
    const ctx = finalCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, 0, conf.width, finalCanvas.height)

    progress.value = 85

    // Step 5: 生成 blob
    const mimeMap = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }
    const mimeType = mimeMap[selectedFormat.value] || 'image/png'

    const blob = await new Promise((resolve, reject) => {
      finalCanvas.toBlob((b) => {
        if (b) resolve(b)
        else reject(new Error('Blob 生成失败'))
      }, mimeType, 0.92)
    })

    console.log('[Export] Blob:', (blob.size / 1024).toFixed(1), 'KB')

    progress.value = 95
    exportedCanvas.value = finalCanvas
    previewUrl.value = finalCanvas.toDataURL(mimeType, 0.92)

    // Step 6: 下载
    statusMsg.value = '正在触发下载...'
    downloadBlob(blob)

    progress.value = 100
    statusType.value = 'done'
    statusMsg.value = '导出成功！文件已开始下载'

    // 3秒后清空状态
    setTimeout(() => {
      if (statusType.value === 'done') {
        statusMsg.value = ''
        statusType.value = ''
      }
    }, 3000)

  } catch (err) {
    console.error('[Export] 失败:', err)
    statusType.value = 'error'
    statusMsg.value = '导出失败'
    errorDetail.value = '错误信息：' + (err.message || '未知错误') + '\n\n请尝试：\n1. 刷新页面后重试\n2. 换一个分辨率\n3. 确保右侧预览区已显示海报内容'
  } finally {
    isExporting.value = false
  }
}

function downloadBlob(blob) {
  const ext = selectedFormat.value
  const dateStr = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')
  const filename = `旅行攻略_${dateStr}.${ext}`

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()

  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 300)

  console.log('[Export] 下载已触发:', filename)
}

async function handleCopy() {
  if (!exportedCanvas.value) return
  try {
    const blob = await new Promise(resolve => exportedCanvas.value.toBlob(resolve, 'image/png'))
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    alert('已复制到剪贴板，可直接粘贴到微信/QQ/文档中')
  } catch {
    alert('复制失败，浏览器可能不支持。请用「生成并下载」保存到本地。')
  }
}

function openPreview() {
  if (previewUrl.value) window.open(previewUrl.value, '_blank')
}
</script>
