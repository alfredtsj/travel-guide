import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { defaultTemplates } from '@/templates/default-templates.js'

export const useEditorStore = defineStore('editor', () => {
  // ===== 攻略内容数据 =====
  const guideData = reactive({
    destination: '',        // 目的地
    days: '',               // 出行天数
    date: '',               // 出行日期
    people: '',             // 出行人数
    theme: '',              // 旅行主题
    transport: '',          // 交通攻略
    localTransport: '',     // 当地交通
    transportTips: '',      // 交通贴士
    transportCost: '',      // 交通费用
    accommodation: '',      // 住宿区域
    hotelName: '',          // 酒店/民宿名称
    hotelPrice: '',         // 住宿价格
    hotelExp: '',           // 入住体验
    hotelTips: '',          // 住宿小贴士
    essentials: '',         // 必备物品
    documents: '',          // 证件资料
    clothing: '',           // 穿搭建议
    weatherPrep: '',        // 防晒/防雨
    medicine: '',           // 药品准备
    network: '',            // 流量网络
    itinerary: [],          // 每日行程 [{day, spots, duration, route}]
    food: '',               // 必吃美食
    foodShops: '',          // 探店店铺
    foodPrice: '',          // 人均消费
    foodReview: '',         // 口味点评
    foodAvoid: '',          // 避雷店铺
    tipsScenic: '',         // 景区坑点
    tipsConsume: '',        // 消费避雷
    tipsBooking: '',        // 预约须知
    tipsHours: '',          // 营业时间
    customNotes: '',        // 自定义备注
  })

  // 板块显示开关
  const sectionVisibility = reactive({
    basic: true,
    transport: true,
    accommodation: true,
    preparation: true,
    itinerary: true,
    food: true,
    tips: true,
    custom: true
  })

  // ===== 模板相关 =====
  const templates = ref([...defaultTemplates])
  const currentTemplateId = ref(defaultTemplates[0]?.id || 'template-xiaohongshu')

  const currentTemplate = computed(() => {
    return templates.value.find(t => t.id === currentTemplateId.value) || templates.value[0]
  })

  // ===== 样式自定义 =====
  const customStyle = reactive({
    // 配色
    primaryColor: '#e8734a',
    titleColor: '#333333',
    textColor: '#555555',
    bgColor: '#fffdf9',
    accentColor: '#f5a88a',
    // 风格
    visualStyle: 'flat',      // flat | sketchy | gradient | film | fresh
    fontStyle: 'sans',        // sans | cute | serif | bold
    layoutDensity: 'normal',  // compact | normal | loose
    // 细节
    fontSize: 'normal',       // small | normal | large
    lineSpacing: 'normal',    // tight | normal | wide
    letterSpacing: 'normal',  // tight | normal | wide
    bgOpacity: 100,
    showDecor: true,
    showStickers: true,
    showIcons: true,
    cardStyle: 'rounded',
    customLabel: '',
    watermark: false
  })

  // 预设配色套餐
  const colorPresets = [
    { name: '莫兰迪', primary: '#b8a9c9', title: '#4a4a5a', text: '#6b6b7b', bg: '#f5f0f0', accent: '#d4c5e0' },
    { name: '马卡龙', primary: '#ffaaa5', title: '#555555', text: '#777777', bg: '#fff8f0', accent: '#ffd3b6' },
    { name: '复古', primary: '#c17817', title: '#3c2a1e', text: '#5c4a3e', bg: '#faf3e0', accent: '#d4a05a' },
    { name: '高级灰', primary: '#888888', title: '#333333', text: '#666666', bg: '#f5f5f5', accent: '#aaaaaa' },
    { name: '森林绿', primary: '#5b8c5a', title: '#2d3a2d', text: '#4a5a4a', bg: '#f2f7f2', accent: '#8ab88a' },
    { name: '海风蓝', primary: '#5b9bd5', title: '#2c3e50', text: '#4a6070', bg: '#f0f5fa', accent: '#8abcd5' },
    { name: '日落橙', primary: '#e8734a', title: '#4a3020', text: '#6a5040', bg: '#fdf6f0', accent: '#f5a88a' },
    { name: '樱花粉', primary: '#e8919c', title: '#5a3a40', text: '#7a5a60', bg: '#fdf5f7', accent: '#f5b8c0' }
  ]

  function applyColorPreset(preset) {
    Object.assign(customStyle, {
      primaryColor: preset.primary,
      titleColor: preset.title,
      textColor: preset.text,
      bgColor: preset.bg,
      accentColor: preset.accent
    })
  }

  function resetStyle() {
    Object.assign(customStyle, {
      primaryColor: currentTemplate.value.colors?.primary || '#e8734a',
      titleColor: currentTemplate.value.colors?.title || '#333333',
      textColor: currentTemplate.value.colors?.text || '#555555',
      bgColor: currentTemplate.value.colors?.bg || '#fffdf9',
      accentColor: currentTemplate.value.colors?.accent || '#f5a88a',
      visualStyle: 'flat',
      fontStyle: 'sans',
      layoutDensity: 'normal',
      fontSize: 'normal',
      lineSpacing: 'normal',
      letterSpacing: 'normal',
      bgOpacity: 100,
      showDecor: true,
      showStickers: true,
      showIcons: true,
      cardStyle: 'rounded',
      customLabel: '',
      watermark: false
    })
  }

  function selectTemplate(templateId) {
    currentTemplateId.value = templateId
    const t = templates.value.find(t => t.id === templateId)
    if (t?.colors) {
      customStyle.primaryColor = t.colors.primary
      customStyle.titleColor = t.colors.title
      customStyle.textColor = t.colors.text
      customStyle.bgColor = t.colors.bg
      customStyle.accentColor = t.colors.accent
    }
  }

  // ===== OCR 识别临时数据 =====
  const ocrResults = ref(null)
  const ocrMatched = ref({})

  function setOcrResults(text, matched) {
    ocrResults.value = text
    ocrMatched.value = matched || {}
  }

  function clearOcrResults() {
    ocrResults.value = null
    ocrMatched.value = {}
  }

  // ===== 草稿保存 =====
  function saveDraft() {
    const draft = {
      guideData: { ...guideData, itinerary: [...guideData.itinerary] },
      currentTemplateId: currentTemplateId.value,
      customStyle: { ...customStyle },
      sectionVisibility: { ...sectionVisibility },
      timestamp: Date.now()
    }
    localStorage.setItem('guide_draft', JSON.stringify(draft))
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem('guide_draft')
      if (!raw) return false
      const draft = JSON.parse(raw)
      Object.assign(guideData, draft.guideData)
      currentTemplateId.value = draft.currentTemplateId
      Object.assign(customStyle, draft.customStyle)
      if (draft.sectionVisibility) Object.assign(sectionVisibility, draft.sectionVisibility)
      return true
    } catch {
      return false
    }
  }

  function clearAll() {
    Object.keys(guideData).forEach(k => {
      if (k === 'itinerary') guideData.itinerary = []
      else if (typeof guideData[k] === 'string') guideData[k] = ''
    })
    resetStyle()
    currentTemplateId.value = templates.value[0]?.id
  }

  // 自动保存（防抖）
  let saveTimer = null
  function autoSave() {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(saveDraft, 500)
  }

  // ===== 撤销/重做 =====
  const history = ref([])
  const historyIndex = ref(-1)
  const maxHistory = 30

  function pushHistory() {
    const snapshot = JSON.parse(JSON.stringify({
      guideData: { ...guideData, itinerary: [...guideData.itinerary] },
      customStyle: { ...customStyle }
    }))
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(snapshot)
    if (history.value.length > maxHistory) history.value.shift()
    historyIndex.value = history.value.length - 1
  }

  function undo() {
    if (historyIndex.value <= 0) return
    historyIndex.value--
    restoreSnapshot(history.value[historyIndex.value])
  }

  function redo() {
    if (historyIndex.value >= history.value.length - 1) return
    historyIndex.value++
    restoreSnapshot(history.value[historyIndex.value + 1])
  }

  function restoreSnapshot(snapshot) {
    if (!snapshot) return
    Object.assign(guideData, snapshot.guideData)
    guideData.itinerary = snapshot.guideData.itinerary || []
    Object.assign(customStyle, snapshot.customStyle)
  }

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  return {
    guideData,
    sectionVisibility,
    templates,
    currentTemplateId,
    currentTemplate,
    customStyle,
    colorPresets,
    ocrResults,
    ocrMatched,
    applyColorPreset,
    resetStyle,
    selectTemplate,
    setOcrResults,
    clearOcrResults,
    saveDraft,
    loadDraft,
    clearAll,
    autoSave,
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo
  }
})
