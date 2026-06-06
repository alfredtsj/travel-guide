import { ref, reactive } from 'vue'

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

// 智能匹配：将OCR文本按关键词匹配到对应攻略板块
function matchToModules(ocrText) {
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
          if (!results[module].includes(cleanLine)) {
            results[module].push(cleanLine)
          }
          matched = true
          break
        }
      }
      if (matched) break
    }

    // 未匹配文本存入 customNotes
    if (!matched) {
      if (!results.customNotes) results.customNotes = []
      if (!results.customNotes.includes(cleanLine)) {
        results.customNotes.push(cleanLine)
      }
    }
  }

  // 转为拼接文本
  const formatted = {}
  for (const [key, lines] of Object.entries(results)) {
    formatted[key] = lines.join('\n')
  }

  return formatted
}

// 多图去重合并
function mergeOcrResults(ocrTexts) {
  const allLines = new Set()
  for (const text of ocrTexts) {
    text.split(/[\n\r]+/).filter(l => l.trim()).forEach(l => allLines.add(l.trim()))
  }
  return [...allLines].sort().join('\n')
}

export function useOCR() {
  const isRecognizing = ref(false)
  const ocrProgress = ref(0)
  const ocrText = ref('')
  const ocrHistory = ref([]) // 多图识别记录

  async function recognizeImage(file) {
    isRecognizing.value = true
    ocrProgress.value = 10

    try {
      // 先做图片预处理：调整大小、灰度化以提升识别率
      const preprocessed = await preprocessImage(file)
      ocrProgress.value = 30

      // 使用 Tesseract.js 进行 OCR（动态加载）
      const Tesseract = await import('tesseract.js')
      ocrProgress.value = 40

      const result = await Tesseract.recognize(preprocessed, 'chi_sim+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            ocrProgress.value = 40 + Math.round(m.progress * 50)
          }
        }
      })

      const text = result.data.text
      ocrText.value = text
      ocrProgress.value = 100

      // 存入识别历史
      ocrHistory.value.push({
        fileName: file.name,
        text,
        timestamp: Date.now()
      })

      isRecognizing.value = false
      return text
    } catch (err) {
      isRecognizing.value = false
      console.error('OCR 识别失败:', err)
      throw err
    }
  }

  async function preprocessImage(file) {
    return new Promise((resolve) => {
      const img = new Image()
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target.result
      }
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 2000
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
        // 灰度化提升对比度
        ctx.filter = 'contrast(1.2) brightness(1.05)'
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(blob => resolve(blob), 'image/png')
      }
      reader.readAsDataURL(file)
    })
  }

  function clearHistory() {
    ocrHistory.value = []
    ocrText.value = ''
  }

  return {
    isRecognizing,
    ocrProgress,
    ocrText,
    ocrHistory,
    recognizeImage,
    matchToModules,
    mergeOcrResults,
    clearHistory
  }
}
