<template>
  <div class="space-y-4">
    <h2 class="text-lg font-bold text-[#333] flex items-center gap-2">
      <span>📷</span> 图片OCR识别
    </h2>

    <p class="text-sm text-[#888] leading-relaxed">
      上传旅游攻略截图或照片，自动提取文字并智能匹配到对应攻略板块。
      <span class="text-[#e8734a] font-medium">纯本地识别，不上传服务器。</span>
    </p>

    <!-- 状态提示 -->
    <div v-if="ocrStatusMsg" class="card" :class="ocrStatusType === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'">
      <div class="text-sm" :class="ocrStatusType === 'error' ? 'text-red-600' : 'text-blue-600'">
        {{ ocrStatusMsg }}
      </div>
    </div>

    <!-- 上传区域 -->
    <div
      class="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer"
      :class="isDragOver ? 'border-[#e8734a] bg-[#e8734a]/5' : 'border-[#ddd] hover:border-[#e8734a]/40 bg-[#faf9f6]'"
      @click="triggerUpload"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" multiple class="hidden" @change="handleFileSelect" />
      <div class="text-4xl mb-3">📸</div>
      <div class="text-sm text-[#666] font-medium mb-1">点击上传或拖拽图片到此处</div>
      <div class="text-xs text-[#aaa]">支持 JPG / PNG / WEBP，单图 ≤ 10MB</div>
    </div>

    <!-- 上传预览 -->
    <div v-if="previewImages.length > 0" class="card">
      <h3 class="font-bold text-sm text-[#555] mb-3">上传图片 ({{ previewImages.length }})</h3>
      <div class="flex gap-2 overflow-x-auto pb-2">
        <div v-for="(img, idx) in previewImages" :key="idx" class="relative flex-shrink-0">
          <img :src="img.url" class="w-20 h-20 object-cover rounded-lg border border-[#eae5df]" />
          <button class="absolute -top-2 -right-2 w-5 h-5 bg-red-400 text-white rounded-full text-xs flex items-center justify-center"
            @click="removeImage(idx)">✕</button>
        </div>
      </div>
      <div class="flex gap-2 mt-3">
        <button class="btn-primary text-sm" @click="startOCR" :disabled="ocrUtil.isRecognizing">
          {{ ocrUtil.isRecognizing ? '识别中...' : '🔍 开始识别' }}
        </button>
        <button class="btn-ghost text-sm" @click="clearAll">清空</button>
      </div>
    </div>

    <!-- OCR 进度 -->
    <div v-if="ocrUtil.isRecognizing" class="card">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-2xl animate-bounce">🔬</span>
        <span class="text-sm text-[#666]">{{ ocrUtil.ocrStatus || '正在识别...' }}</span>
      </div>
      <div class="w-full bg-[#f0ebe3] rounded-full h-2">
        <div class="h-2 rounded-full bg-[#e8734a] transition-all duration-300"
          :style="{ width: ocrUtil.ocrProgress + '%' }"></div>
      </div>
      <div class="text-xs text-[#999] mt-1">{{ ocrUtil.ocrProgress }}%</div>
    </div>

    <!-- 识别结果 -->
    <div v-if="ocrUtil.ocrText && !ocrUtil.isRecognizing" class="card">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-bold text-sm text-[#555]">📝 识别结果</h3>
        <div class="flex gap-2">
          <button class="text-xs text-[#e8734a] hover:underline" @click="applyToForm">📥 填充到表单</button>
          <button class="text-xs text-[#999] hover:text-red-400" @click="ocrUtil.clearHistory()">🗑️</button>
        </div>
      </div>
      <div class="bg-[#faf9f6] rounded-xl p-3 max-h-[300px] overflow-y-auto">
        <pre class="text-xs text-[#666] whitespace-pre-wrap font-sans leading-relaxed">{{ ocrUtil.ocrText }}</pre>
      </div>
    </div>

    <!-- 匹配板块预览 -->
    <div v-if="matchedModules && Object.keys(matchedModules).length > 0" class="card">
      <h3 class="font-bold text-sm text-[#555] mb-3">🎯 智能匹配板块</h3>
      <div class="space-y-2">
        <div v-for="(content, module) in matchedModules" :key="module"
          class="p-2 bg-[#faf9f6] rounded-lg border border-[#eae5df]">
          <div class="text-xs font-bold text-[#e8734a] mb-1">{{ moduleLabel(module) }}</div>
          <div class="text-xs text-[#666] max-h-[80px] overflow-y-auto whitespace-pre-wrap">{{ content }}</div>
        </div>
      </div>
    </div>

    <!-- OCR 识别历史 -->
    <div v-if="ocrUtil.ocrHistory.length > 0" class="card">
      <h3 class="font-bold text-sm text-[#555] mb-3">📋 识别记录</h3>
      <div class="space-y-2">
        <div v-for="(record, idx) in ocrUtil.ocrHistory" :key="idx"
          class="flex items-center justify-between p-2 bg-[#faf9f6] rounded-lg text-xs">
          <div class="flex items-center gap-2">
            <span>{{ record.fileName }}</span>
            <span class="text-[#aaa]">{{ formatTime(record.timestamp) }}</span>
          </div>
          <span class="text-[#999]">{{ record.text.length }} 字</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useOCR, matchToModules, mergeOcrResults } from '@/composables/useOCR'

const editor = useEditorStore()
const ocrUtil = useOCR()

const fileInput = ref(null)
const isDragOver = ref(false)
const previewImages = ref([])
const matchedModules = ref(null)
const ocrStatusMsg = ref('')
const ocrStatusType = ref('info')

function triggerUpload() {
  fileInput.value?.click()
}

function handleDrop(e) {
  isDragOver.value = false
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  addImages(files)
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files)
  addImages(files)
}

function addImages(files) {
  ocrStatusMsg.value = ''
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      alert(`图片 ${file.name} 超过 10MB 限制，已跳过`)
      continue
    }
    const url = URL.createObjectURL(file)
    previewImages.value.push({ file, url })
  }
}

function removeImage(idx) {
  URL.revokeObjectURL(previewImages.value[idx].url)
  previewImages.value.splice(idx, 1)
}

function clearAll() {
  previewImages.value.forEach(img => URL.revokeObjectURL(img.url))
  previewImages.value = []
  ocrUtil.clearHistory()
  matchedModules.value = null
  ocrStatusMsg.value = ''
}

async function startOCR() {
  ocrStatusMsg.value = ''
  const allTexts = []

  for (const img of previewImages.value) {
    try {
      const text = await ocrUtil.recognizeImage(img.file)
      allTexts.push(text)
    } catch (err) {
      console.error('[OCR] 识别失败:', err)
      ocrStatusMsg.value = err.message || '识别失败，请重试'
      ocrStatusType.value = 'error'
      return
    }
  }

  if (allTexts.length > 0) {
    const merged = mergeOcrResults(allTexts)
    matchedModules.value = matchToModules(merged)
    ocrStatusMsg.value = ''
  }
}

function applyToForm() {
  if (!matchedModules.value) return
  for (const [module, content] of Object.entries(matchedModules.value)) {
    if (module === 'itinerary') {
      if (content && !editor.guideData.itinerary.some(d => d.spots)) {
        editor.guideData.itinerary = [{
          day: 1, spots: content, duration: '', route: ''
        }]
      }
    } else if (editor.guideData[module] !== undefined) {
      editor.guideData[module] = content
    }
  }
  editor.autoSave()
  alert('已填充到对应板块，可在「内容」标签页查看和修改')
}

function moduleLabel(module) {
  const labels = {
    destination: '目的地', days: '出行天数', date: '出行日期', people: '出行人数',
    theme: '旅行主题', transport: '往返交通', localTransport: '当地交通',
    transportTips: '交通贴士', transportCost: '交通费用', accommodation: '住宿区域',
    hotelName: '酒店名称', hotelPrice: '住宿价格', hotelExp: '入住体验',
    hotelTips: '住宿贴士', essentials: '必备物品', documents: '证件资料',
    clothing: '穿搭建议', weatherPrep: '防晒防雨', medicine: '药品准备',
    network: '流量网络', food: '必吃美食', foodShops: '探店推荐',
    foodPrice: '人均消费', foodReview: '口味点评', foodAvoid: '避雷店铺',
    tipsScenic: '景区避坑', tipsConsume: '消费避雷', tipsBooking: '预约须知',
    tipsHours: '营业时间', customNotes: '自定义备注'
  }
  return labels[module] || module
}

function formatTime(ts) {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
</script>
