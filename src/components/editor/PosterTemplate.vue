<template>
  <div class="poster-wrapper" :style="wrapperStyle" ref="posterEl">
    <!-- 顶部装饰条 -->
    <div v-if="editor.customStyle.showDecor" class="top-decor-bar"
      :style="{ background: `linear-gradient(90deg, ${editor.customStyle.primaryColor}, ${editor.customStyle.accentColor}, ${editor.customStyle.primaryColor})` }">
    </div>

    <!-- 海报主体 -->
    <div class="poster-body" :style="bodyStyle">
      <!-- 头部标题区 -->
      <div class="poster-header" :style="headerStyle">
        <div v-if="editor.guideData.theme" class="theme-tag"
          :style="{ background: editor.customStyle.primaryColor + '18', color: editor.customStyle.primaryColor, border: '1px solid ' + editor.customStyle.primaryColor + '25' }">
          ✦ {{ editor.guideData.theme }}
        </div>
        <h1 class="poster-title" :style="titleStyle">
          {{ editor.guideData.destination || '我的旅行攻略' }}
        </h1>
        <div v-if="editor.guideData.days || editor.guideData.people || editor.guideData.date"
          class="poster-meta" :style="{ color: editor.customStyle.textColor, opacity: 0.6 }">
          <span v-if="editor.guideData.days">📅 {{ editor.guideData.days }}</span>
          <span v-if="editor.guideData.days && editor.guideData.people" class="dot">·</span>
          <span v-if="editor.guideData.people">👥 {{ editor.guideData.people }}</span>
          <span v-if="editor.guideData.date && (editor.guideData.days || editor.guideData.people)" class="dot">·</span>
          <span v-if="editor.guideData.date">📆 {{ editor.guideData.date }}</span>
        </div>
      </div>

      <!-- === 交通攻略 卡片 === -->
      <div v-if="editor.sectionVisibility.transport && hasContent(['transport','localTransport','transportTips','transportCost'])"
        class="section-card" :style="cardStyle">
        <div class="card-header" :style="cardHeaderStyle">
          <span class="card-icon">🚗</span>
          <span class="card-title">交通攻略</span>
        </div>
        <div class="card-body" :style="cardBodyStyle">
          <div v-if="editor.guideData.transport" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>往返</b> {{ editor.guideData.transport }}</span>
          </div>
          <div v-if="editor.guideData.localTransport" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>当地</b> {{ editor.guideData.localTransport }}</span>
          </div>
          <div v-if="editor.guideData.transportCost" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>费用</b> {{ editor.guideData.transportCost }}</span>
          </div>
          <div v-if="editor.guideData.transportTips" class="card-tip"
            :style="{ background: editor.customStyle.primaryColor + '08' }">
            💡 {{ editor.guideData.transportTips }}
          </div>
        </div>
      </div>

      <!-- === 住宿攻略 卡片 === -->
      <div v-if="editor.sectionVisibility.accommodation && hasContent(['accommodation','hotelName','hotelPrice','hotelExp','hotelTips'])"
        class="section-card" :style="cardStyle">
        <div class="card-header" :style="cardHeaderStyle">
          <span class="card-icon">🏨</span>
          <span class="card-title">住宿攻略</span>
        </div>
        <div class="card-body" :style="cardBodyStyle">
          <div v-if="editor.guideData.accommodation" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>区域</b> {{ editor.guideData.accommodation }}</span>
          </div>
          <div v-if="editor.guideData.hotelName" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>推荐</b> {{ editor.guideData.hotelName }}</span>
          </div>
          <div v-if="editor.guideData.hotelPrice" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>价格</b> {{ editor.guideData.hotelPrice }}</span>
          </div>
          <div v-if="editor.guideData.hotelExp" class="card-tip"
            :style="{ background: editor.customStyle.accentColor + '12' }">
            ✨ {{ editor.guideData.hotelExp }}
          </div>
          <div v-if="editor.guideData.hotelTips" class="card-tip"
            :style="{ background: editor.customStyle.primaryColor + '08' }">
            💡 {{ editor.guideData.hotelTips }}
          </div>
        </div>
      </div>

      <!-- === 行前准备 卡片 === -->
      <div v-if="editor.sectionVisibility.preparation && hasContent(['essentials','documents','clothing','weatherPrep','medicine','network'])"
        class="section-card" :style="cardStyle">
        <div class="card-header" :style="cardHeaderStyle">
          <span class="card-icon">🎒</span>
          <span class="card-title">行前准备</span>
        </div>
        <div class="card-body" :style="cardBodyStyle">
          <div v-if="editor.guideData.essentials" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>必备</b> {{ editor.guideData.essentials }}</span>
          </div>
          <div v-if="editor.guideData.documents" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>证件</b> {{ editor.guideData.documents }}</span>
          </div>
          <div v-if="editor.guideData.clothing" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>穿搭</b> {{ editor.guideData.clothing }}</span>
          </div>
          <div v-if="editor.guideData.weatherPrep" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>防护</b> {{ editor.guideData.weatherPrep }}</span>
          </div>
          <div v-if="editor.guideData.medicine" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>药品</b> {{ editor.guideData.medicine }}</span>
          </div>
          <div v-if="editor.guideData.network" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>网络</b> {{ editor.guideData.network }}</span>
          </div>
        </div>
      </div>

      <!-- === 行程安排 卡片 === -->
      <div v-if="editor.sectionVisibility.itinerary && editor.guideData.itinerary.length > 0 && hasContentItinerary()"
        class="section-card" :style="cardStyle">
        <div class="card-header" :style="cardHeaderStyle">
          <span class="card-icon">📅</span>
          <span class="card-title">行程安排</span>
        </div>
        <div class="card-body" :style="cardBodyStyle">
          <div v-for="(day, idx) in editor.guideData.itinerary" :key="idx"
            class="itinerary-day"
            :style="{ borderLeft: '3px solid ' + editor.customStyle.primaryColor + '30', paddingLeft: '12px' }">
            <div class="day-badge"
              :style="{ background: editor.customStyle.primaryColor, color: '#fff' }">
              Day {{ idx + 1 }}
            </div>
            <span v-if="day.duration" class="day-time">⏰ {{ day.duration }}</span>
            <div v-if="day.spots" class="card-text mt-1">{{ day.spots }}</div>
            <div v-if="day.route" class="day-route">🗺️ {{ day.route }}</div>
          </div>
        </div>
      </div>

      <!-- === 美食攻略 卡片 === -->
      <div v-if="editor.sectionVisibility.food && hasContent(['food','foodShops','foodPrice','foodReview','foodAvoid'])"
        class="section-card" :style="cardStyle">
        <div class="card-header" :style="cardHeaderStyle">
          <span class="card-icon">🍜</span>
          <span class="card-title">美食攻略</span>
        </div>
        <div class="card-body" :style="cardBodyStyle">
          <div v-if="editor.guideData.food" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>必吃</b> {{ editor.guideData.food }}</span>
          </div>
          <div v-if="editor.guideData.foodShops" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>探店</b> {{ editor.guideData.foodShops }}</span>
          </div>
          <div v-if="editor.guideData.foodPrice" class="card-row">
            <span class="card-dot" :style="{ color: editor.customStyle.primaryColor }">▸</span>
            <span class="card-text"><b>消费</b> {{ editor.guideData.foodPrice }}</span>
          </div>
          <div v-if="editor.guideData.foodReview" class="card-tip"
            :style="{ background: editor.customStyle.accentColor + '12' }">
            😋 {{ editor.guideData.foodReview }}
          </div>
          <div v-if="editor.guideData.foodAvoid" class="card-tip card-tip-danger">
            ⚠️ 避雷：{{ editor.guideData.foodAvoid }}
          </div>
        </div>
      </div>

      <!-- === 避坑指南 卡片 === -->
      <div v-if="editor.sectionVisibility.tips && hasContent(['tipsScenic','tipsConsume','tipsBooking','tipsHours'])"
        class="section-card" :style="cardStyle">
        <div class="card-header" :style="cardHeaderStyle">
          <span class="card-icon">⚠️</span>
          <span class="card-title">避坑指南</span>
        </div>
        <div class="card-body" :style="cardBodyStyle">
          <div v-if="editor.guideData.tipsScenic" class="card-row tips-row">
            <span>🏞️ <b>景区</b></span>
            <span class="card-text">{{ editor.guideData.tipsScenic }}</span>
          </div>
          <div v-if="editor.guideData.tipsConsume" class="card-row tips-row">
            <span>💰 <b>消费</b></span>
            <span class="card-text">{{ editor.guideData.tipsConsume }}</span>
          </div>
          <div v-if="editor.guideData.tipsBooking" class="card-row tips-row">
            <span>📋 <b>预约</b></span>
            <span class="card-text">{{ editor.guideData.tipsBooking }}</span>
          </div>
          <div v-if="editor.guideData.tipsHours" class="card-row tips-row">
            <span>🕐 <b>时间</b></span>
            <span class="card-text">{{ editor.guideData.tipsHours }}</span>
          </div>
        </div>
      </div>

      <!-- === 补充笔记 卡片 === -->
      <div v-if="editor.guideData.customNotes" class="section-card" :style="cardStyle">
        <div class="card-header" :style="cardHeaderStyle">
          <span class="card-icon">📝</span>
          <span class="card-title">补充笔记</span>
        </div>
        <div class="card-body" :style="cardBodyStyle">
          <div class="card-text dashed-box"
            :style="{ borderColor: editor.customStyle.primaryColor + '20' }">
            {{ editor.guideData.customNotes }}
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div v-if="editor.customStyle.showDecor" class="poster-footer"
        :style="{ borderTop: '1px solid ' + editor.customStyle.primaryColor + '12' }">
        <span class="footer-dot" :style="{ background: editor.customStyle.primaryColor + '30' }"></span>
        <span class="footer-text" :style="{ color: editor.customStyle.primaryColor + '80' }">✦ 旅行愉快 ✦</span>
        <span class="footer-dot" :style="{ background: editor.customStyle.primaryColor + '30' }"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'

const editor = useEditorStore()
const posterEl = ref(null)

const fontFamilyMap = {
  sans: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
  cute: "'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif",
  serif: "'Noto Serif SC', Georgia, serif",
  bold: "'Noto Sans SC', -apple-system, sans-serif"
}
const fontSizeMap = { small: 0.85, normal: 1, large: 1.15 }
const lineHeightMap = { tight: 1.5, normal: 1.7, wide: 2.0 }
const letterSpacingMap = { tight: '-0.01em', normal: '0', wide: '0.03em' }
const densityMap = { compact: '14px', normal: '20px', loose: '30px' }

const ff = () => fontFamilyMap[editor.customStyle.fontStyle] || fontFamilyMap.sans

// ===== 卡片风格映射 =====
const cardStyleMap = {
  rounded: { borderRadius: '16px', background: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: 'none' },
  shadow: { borderRadius: '12px', background: '#ffffff', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: 'none' },
  bordered: { borderRadius: '12px', background: '#ffffff', boxShadow: 'none', border: '2px solid #e8e3dc' },
  flat: { borderRadius: '8px', background: '#faf8f4', boxShadow: 'none', border: 'none' },
  elevated: { borderRadius: '20px', background: '#ffffff', boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)', border: 'none' }
}

const cardType = computed(() => editor.customStyle.cardStyle || 'rounded')
const selectedCard = computed(() => cardStyleMap[cardType.value] || cardStyleMap.rounded)

const wrapperStyle = computed(() => ({
  width: '420px',
  minHeight: '560px',
  background: editor.customStyle.bgColor,
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
  opacity: editor.customStyle.bgOpacity / 100
}))

const bodyStyle = computed(() => ({
  padding: densityMap[editor.customStyle.layoutDensity] || '20px',
  fontFamily: ff(),
  fontSize: `${fontSizeMap[editor.customStyle.fontSize]}rem`,
  lineHeight: lineHeightMap[editor.customStyle.lineSpacing],
  letterSpacing: letterSpacingMap[editor.customStyle.letterSpacing],
  color: editor.customStyle.textColor
}))

const headerStyle = computed(() => ({
  marginBottom: '16px', paddingBottom: '10px'
}))

const titleStyle = computed(() => ({
  fontFamily: ff(),
  fontSize: '1.85em', fontWeight: '800',
  color: editor.customStyle.titleColor,
  margin: '0.12em 0', lineHeight: 1.25
}))

// ===== 卡片动态样式 =====
const cardStyle = computed(() => ({
  background: selectedCard.value.background,
  borderRadius: selectedCard.value.borderRadius,
  boxShadow: selectedCard.value.boxShadow,
  border: selectedCard.value.border,
  padding: '14px',
  marginBottom: '14px'
}))

const cardHeaderStyle = computed(() => ({
  display: 'flex', alignItems: 'center', gap: '8px',
  marginBottom: '10px',
  paddingBottom: '8px',
  borderBottom: `1px solid ${editor.customStyle.primaryColor}15`
}))

const cardBodyStyle = computed(() => ({
  display: 'flex', flexDirection: 'column', gap: '6px'
}))

function hasContent(fields) {
  return fields.some(f => {
    const val = editor.guideData[f]
    if (!val) return false
    if (typeof val === 'string') return val.trim().length > 0
    return val.length > 0
  })
}

function hasContentItinerary() {
  return editor.guideData.itinerary.some(d =>
    (d.spots && d.spots.trim()) || (d.duration && d.duration.trim()) || (d.route && d.route.trim())
  )
}

defineExpose({ posterEl })
</script>

<style scoped>
.poster-wrapper { transition: all 0.3s ease; }

.top-decor-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 0; }

.theme-tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 12px; border-radius: 20px; font-size: 0.7em; font-weight: 600; margin-bottom: 6px; }

.poster-meta { font-size: 0.78em; display: flex; align-items: center; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
.dot { opacity: 0.4; }

/* 卡片通用 */
.card-header { font-weight: 700; }
.card-icon { font-size: 1.1em; flex-shrink: 0; }
.card-title { font-size: 0.95em; color: v-bind("editor.customStyle.titleColor"); }

.card-body { line-height: 1.65; }

.card-row { display: flex; gap: 6px; align-items: flex-start; font-size: 0.85em; }
.card-dot { flex-shrink: 0; margin-top: 1px; font-size: 0.75em; }
.card-text { flex: 1; white-space: pre-wrap; word-break: break-word; }

.card-tip { padding: 8px 10px; border-radius: 10px; font-size: 0.78em; line-height: 1.55; white-space: pre-wrap; }
.card-tip-danger { background: #fff0f0; border: 1px solid #ffcccc; color: #d04040; }

/* 行程 */
.itinerary-day { margin-bottom: 8px; }
.itinerary-day:last-child { margin-bottom: 0; }
.day-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.72em; font-weight: 700; }
.day-time { font-size: 0.72em; opacity: 0.65; margin-left: 6px; }
.day-route { font-size: 0.72em; opacity: 0.55; margin-top: 3px; }

/* 避坑 */
.tips-row { padding: 6px 8px; border-radius: 8px; background: #fdf8f5; }

/* 补充笔记 */
.dashed-box { padding: 10px; border-radius: 10px; border: 1px dashed; font-size: 0.85em; }

/* 底部 */
.poster-footer { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; padding-top: 12px; }
.footer-dot { width: 24px; height: 1px; border-radius: 1px; }
.footer-text { font-size: 0.72em; }
</style>
