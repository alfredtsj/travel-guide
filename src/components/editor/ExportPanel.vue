<template>
  <div class="bg-white rounded-2xl shadow-2xl p-8 w-[420px] max-w-[90vw]" @click.stop>
    <div class="text-center mb-6">
      <div class="text-4xl mb-2">📥</div>
      <h2 class="text-xl font-bold text-[#333]">导出攻略海报</h2>
      <p class="text-sm text-[#888] mt-1">选择分辨率和格式，一键保存</p>
    </div>

    <!-- 分辨率选择 -->
    <div class="mb-5">
      <label class="label">分辨率</label>
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
    <div class="mb-6">
      <label class="label">导出格式</label>
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

    <!-- 预览图 -->
    <div v-if="previewUrl" class="mb-4 rounded-xl overflow-hidden border border-[#eae5df]">
      <img :src="previewUrl" class="w-full" alt="预览" />
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-3">
      <button class="btn-primary flex-1 text-sm" @click="handleExport" :disabled="exportUtil.isExporting">
        {{ exportUtil.isExporting ? '导出中...' : '⬇️ 下载图片' }}
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
import { ref, nextTick } from 'vue'
import { useExport } from '@/composables/useExport'

const props = defineProps({
  posterRef: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const exportUtil = useExport()

const selectedResolution = ref('1080p')
const selectedFormat = ref('png')
const previewUrl = ref('')
const exportedCanvas = ref(null)

const formats = [
  { value: 'png', label: 'PNG', desc: '透明底' },
  { value: 'jpg', label: 'JPG', desc: '高清' },
  { value: 'webp', label: 'WebP', desc: '压缩' }
]

async function handleExport() {
  if (!props.posterRef?.posterEl) return
  try {
    const result = await exportUtil.exportImage(props.posterRef.posterEl, {
      resolution: selectedResolution.value,
      format: selectedFormat.value
    })
    exportedCanvas.value = result.canvas
    previewUrl.value = result.dataUrl

    // 跟踪导出统计
    fetch('/.netlify/functions/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'export' })
    }).catch(() => {})

    // 自动下载
    const ext = selectedFormat.value
    const filename = `旅行攻略_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.${ext}`
    exportUtil.downloadBlob(result.blob, filename)
  } catch (err) {
    console.error('导出失败:', err)
    alert('导出失败，请重试')
  }
}

async function handleCopy() {
  if (!exportedCanvas.value) return
  const success = await exportUtil.copyImage(exportedCanvas.value)
  if (success) {
    alert('已复制到剪贴板')
  } else {
    alert('复制失败，请尝试下载')
  }
}
</script>
