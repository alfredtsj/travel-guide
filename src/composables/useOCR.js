import { ref } from 'vue'

// OCR 智能匹配关键词映射
const MODULE_KEYWORDS = {
  destination: ['目的地', '城市', '地点', '旅游城市', '旅行目的地', '去'],
  days: ['天数', '天', '几日', '日游'],
  date: ['日期', '时间', '出行时间', '出发日期'],
  people: ['人数', '人', '出行人数', '成人', '儿童'],
  theme: ['主题', '类型', '旅行主题', '亲子', '徒步', '美食', '小众'],
  transport: ['交通', '往返', '飞机', '高铁', '火车', '机票', '航班', '出发', '到达'],
  localTransport: ['当地交通', '公交', '地铁', '打车', '租车', '出行方式', '步行'],
  transportTips: ['交通贴士', '贴士', '注意', '提醒', '建议', '避免'],
  transportCost: ['交通费用', '费用', '价格', '票价', '花费'],
  accommodation: ['住宿', '区域', '位置', '附近', '住在', '地段'],
  hotelName: ['酒店', '民宿', '旅店', '客栈', '入住', '名称'],
  hotelPrice: ['价格', '每晚', '费用', '房价', '住宿费'],
  hotelExp: ['体验', '评价', '感受', '入住体验', '环境', '服务'],
  hotelTips: ['住宿贴士', '小贴士', '注意', '建议'],
  essentials: ['必备', '物品', '行李', '装备', '带', '准备'],
  documents: ['证件', '身份证', '护照', '签证', '资料'],
  clothing: ['穿搭', '衣服', '服装', '穿着', '搭配'],
  weatherPrep: ['防晒', '防雨', '天气', '雨伞', '防晒霜'],
  medicine: ['药品', '药', '感冒', '晕车', '肠胃'],
  network: ['流量', '网络', 'WiFi', 'Wi-Fi', '上网', 'SIM', 'sim'],
  food: ['美食', '必吃', '好吃', '推荐', '特色', '小吃', '地道'],
  foodShops: ['店铺', '店', '餐厅', '探店', '打卡', '馆子'],
  foodPrice: ['消费', '人均', '价格', '费用', '多少钱'],
  foodReview: ['口味', '好吃', '点评', '评价', '推荐', '踩雷'],
  foodAvoid: ['避雷', '不好吃', '别去', '坑', '失望'],
  tipsScenic: ['景区', '景点', '坑', '注意', '门票'],
  tipsConsume: ['消费', '价格', '坑', '宰客', '贵'],
  tipsBooking: ['预约', '预定', '预订', '限流', '名额'],
  tipsHours: ['营业', '时间', '开门', '关门', '开放时间'],
}

export function matchToModules(ocrText) {
  const results = {}
  const lines = ocrText.split(/[\n\r]+/).filter(l => l.trim())
  for (const line of lines) {
    const cleanLine = line.trim()
    if (!cleanLine || cleanLine.length < 2) continue
    let matched = false
    for (const [module, keywords] of Object.entries(MODULE_KEYWORDS)) {
      for (const kw of keywords) {
        if (cleanLine.includes(kw)) {
          if (!results[module]) results[module] = []
          if (!results[module].includes(cleanLine)) results[module].push(cleanLine)
          matched = true
          break
        }
      }
      if (matched) break
    }
    if (!matched) {
      if (!results.customNotes) results.customNotes = []
      if (!results.customNotes.includes(cleanLine)) results.customNotes.push(cleanLine)
    }
  }
  const formatted = {}
  for (const [key, lines] of Object.entries(results)) {
    formatted[key] = lines.join('\n')
  }
  return formatted
}

export function mergeOcrResults(ocrTexts) {
  const allLines = new Set()
  for (const text of ocrTexts) {
    text.split(/[\n\r]+/).filter(l => l.trim()).forEach(l => allLines.add(l.trim()))
  }
  return [...allLines].sort().join('\n')
}

// ========== 核心：纯本地 OCR，零 CDN 依赖 ==========

export function useOCR() {
  const isRecognizing = ref(false)
  const ocrProgress = ref(0)
  const ocrStatus = ref('')
  const ocrText = ref('')
  const ocrHistory = ref([])

  let _worker = null

  async function getWorker() {
    if (_worker) return _worker

    ocrStatus.value = '正在加载 OCR 引擎...'
    ocrProgress.value = 5

    // 动态导入 tesseract.js（浏览器端 import）
    const Tesseract = await import('tesseract.js')

    ocrProgress.value = 10
    ocrStatus.value = '正在加载中文语言包（首次约需下载 44MB）...'

    // 使用本地 traineddata 文件，完全不依赖外部 CDN
    // traineddata 位于 public/traineddata/chi_sim.traineddata
    // 构网后由 Vite 复制到 dist/traineddata/chi_sim.traineddata
    const worker = await Tesseract.createWorker('chi_sim', 1, {
      langPath: window.location.origin
        ? window.location.origin + '/traineddata/'
        : '/traineddata/',
      logger: (m) => {
        if (m.status === 'loading language traineddata') {
          ocrProgress.value = 10 + Math.round(m.progress * 20)
          ocrStatus.value = '加载语言包... ' + Math.round(m.progress * 100) + '%'
        } else if (m.status === 'initializing tesseract') {
          ocrProgress.value = 30
          ocrStatus.value = '初始化引擎...'
        } else if (m.status === 'initialized tesseract') {
          ocrProgress.value = 45
          ocrStatus.value = '引擎就绪'
        } else if (m.status === 'recognizing text') {
          ocrProgress.value = 50 + Math.round(m.progress * 45)
          ocrStatus.value = '识别文字中... ' + Math.round(m.progress * 100) + '%'
        }
      }
    })

    ocrProgress.value = 50
    _worker = worker
    return worker
  }

  async function recognizeImage(file) {
    isRecognizing.value = true
    ocrProgress.value = 0
    ocrStatus.value = '正在预处理图片...'

    try {
      // 预处理图片（缩放、增强对比度）
      const imgData = await preprocessImage(file)
      ocrProgress.value = 8
      ocrStatus.value = '图片处理完成，加载引擎...'

      // 获取 worker（首次会加载语言包）
      const worker = await getWorker()

      // 识别
      ocrStatus.value = '正在识别文字...'
      const { data } = await worker.recognize(imgData)

      ocrProgress.value = 100
      ocrStatus.value = '识别完成！'
      isRecognizing.value = false

      const text = data.text
      ocrText.value = text
      ocrHistory.value.push({
        fileName: file.name,
        text,
        timestamp: Date.now()
      })

      return text
    } catch (err) {
      isRecognizing.value = false
      console.error('[OCR] 识别失败:', err)

      const msg = err.message || String(err)

      // 判断具体错误类型
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('404')) {
        throw new Error(
          '未找到中文语言包文件。\n\n' +
          '语言包文件 (chi_sim.traineddata, 约44MB) 需要部署后可用。\n' +
          '请在 Netlify 部署后使用 OCR 功能。\n' +
          '或手动将 chi_sim.traineddata 放入 dist/traineddata/ 目录。'
        )
      }
      if (msg.includes('Cannot read properties')) {
        throw new Error('图片格式不支持，请使用 JPG/PNG 格式')
      }

      throw new Error('识别失败：' + msg)
    }
  }

  async function preprocessImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()
      reader.onload = (e) => { img.src = e.target.result }
      reader.onerror = () => reject(new Error('图片读取失败'))
      img.onerror = () => reject(new Error('图片加载失败，请检查格式'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 1600
        let w = img.width
        let h = img.height
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h)
          w = Math.round(w * ratio)
          h = Math.round(h * ratio)
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.filter = 'contrast(1.15) brightness(1.05)'
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas)
      }
      reader.readAsDataURL(file)
    })
  }

  function clearHistory() {
    ocrHistory.value = []
    ocrText.value = ''
    ocrStatus.value = ''
  }

  return {
    isRecognizing,
    ocrProgress,
    ocrStatus,
    ocrText,
    ocrHistory,
    recognizeImage,
    clearHistory
  }
}
