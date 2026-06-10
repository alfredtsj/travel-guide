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
        <button v-for="(cfg, key) in exportUtil.resolutions" :key="key"
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

    <!-- 导出进度 -->
    <div v-if="exportUtil.isExporting" class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-lg animate-spin">⏳</span>
        <span class="text-sm text-[#666]">正在渲染海报...</span>
      </div>
      <div class="w-full bg-[#f0ebe3] rounded-full h-2">
        <div class="h-2 rounded-full bg-[#e8734a] transition-all duration-300"
          :style="{ width: exportUtil.exportProgress + '%' }"></div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="exportError" class="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
      <div class="text-sm text-red-600 whitespace-pre-wrap">{{ exportError }}</div>
      <button class="text-xs text-red-400 underline mt-2" @click="exportError = ''">关闭</button>
    </div>

    <!-- 预览图（导出后显示，可右键保存） -->
    <div v-if="previewUrl" class="mb-4 rounded-xl overflow-hidden border border-[#eae5df]">
      <img :src="previewUrl" class="w-full cursor-pointer" alt="预览 - 右键可保存" @click="openPreview" title="点击放大 / 右键保存" />
      <div class="text-center text-xs text-[#aaa] py-2 bg-[#faf9f6]">
        💡 点击图片放大 | 右键"图片另存为"下载
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-3">
      <button class="btn-primary flex-1 text-sm" @click="handleExport" :disabled="exportUtil.isExporting">
        {{ exportUtil.isExporting ? '导出中...' : '⬇️ 生成并下载' }}
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
import { useExport } from '@/composables/useExport'

const emit = defineEmits(['close'])

const exportUtil = useExport()

const selectedResolution = ref('1080p')
const selectedFormat = ref('png')
const previewUrl = ref('')
const exportedCanvas = ref(null)
const exportError = ref('')

const formats = [
  { value: 'png', label: 'PNG', desc: '透明底' },
  { value: 'jpg', label: 'JPG', desc: '高清' },
  { value: 'webp', label: 'WebP', desc: '小体积' }
]

async function handleExport() {
  exportError.value = ''
  previewUrl.value = ''

  // 直接查找海报 DOM 元素（绕开 Vue ref 传递问题）
  const el = document.querySelector('.poster-wrapper')

  console.log('[ExportPanel] poster-wrapper found:', !!el)
  if (!el) {
    exportError.value = '❌ 未找到海报元素\n\n可能原因：\n1. 页面还未完全加载\n2. 请关闭弹窗后重试\n3. 刷新页面后重试'
    return
  }

  try {
    console.log('[ExportPanel] 开始导出...')
    const result = await exportUtil.exportImage(el, {
      resolution: selectedResolution.value,
      format: selectedFormat.value
    })

    console.log('[ExportPanel] 导出成功')
    exportedCanvas.value = result.canvas
    previewUrl.value = result.dataUrl

    // 自动下载
    const ext = selectedFormat.value
    const dateStr = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')
    const filename = `旅行攻略_${dateStr}.${ext}`
    console.log('[ExportPanel] 下载文件名:', filename)

    // 延迟一下确保 UI 更新
    setTimeout(() => {
      exportUtil.downloadBlob(result.blob, filename)
    }, 300)

    // 统计
    fetch('/.netlify/functions/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'export' })
    }).catch(() => {})
  } catch (err) {
    console.error('[ExportPanel] 错误:', err)
    exportError.value = '导出失败：' + (err.message || '未知错误')
  }
}

async function handleCopy() {
  if (!exportedCanvas.value) return
  const success = await exportUtil.copyImage(exportedCanvas.value)
  if (success) {
    alert('已复制到剪贴板，可直接粘贴到微信/QQ/文档中')
  } else {
    alert('复制失败，请尝试下载后手动分享。浏览器可能不支持此功能。')
  }
}

function openPreview() {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}
</script>
