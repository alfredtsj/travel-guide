<template>
  <div
    class="poster-wrapper relative"
    :style="posterWrapperStyle"
    ref="posterEl"
  >
    <!-- 顶部装饰带 -->
    <div v-if="editor.customStyle.showDecor && currentLayout.headerStyle === 'ribbon'"
      class="absolute top-0 left-0 right-0 h-2"
      :style="{ background: `linear-gradient(90deg, ${editor.customStyle.primaryColor}, ${editor.customStyle.accentColor}, ${editor.customStyle.primaryColor})` }">
    </div>

    <div v-if="editor.customStyle.showDecor && currentLayout.headerStyle === 'bordered'"
      class="absolute top-4 left-4 right-4 h-[2px]"
      :style="{ background: editor.customStyle.primaryColor }">
    </div>

    <!-- 海报主体内容 -->
    <div class="poster-content" :style="posterContentStyle">
      <!-- 头部标题区 -->
      <div class="poster-header" :style="headerStyle">
        <div class="flex items-center justify-between mb-1" v-if="currentLayout.headerStyle !== 'centered'">
          <div v-if="currentLayout.headerStyle === 'framed'" class="w-12 h-[2px]" :style="{ background: editor.customStyle.primaryColor }"></div>
          <div class="tag-badge px-3 py-1 rounded-full text-xs font-medium"
            :style="{ background: editor.customStyle.accentColor + '30', color: editor.customStyle.primaryColor }"
            v-if="editor.guideData.theme">
            {{ editor.guideData.theme }}
          </div>
        </div>

        <h1 class="poster-title" :style="titleStyle">
          {{ editor.guideData.destination || '我的旅行攻略' }}
        </h1>

        <p class="poster-subtitle" :style="subtitleStyle" v-if="editor.guideData.days || editor.guideData.people">
          {{ [editor.guideData.days, editor.guideData.people, editor.guideData.date].filter(Boolean).join(' · ') }}
        </p>

        <div class="tag-badge mx-auto px-3 py-1 rounded-full text-xs font-medium mb-3"
          :style="{ background: editor.customStyle.accentColor + '30', color: editor.customStyle.primaryColor }"
          v-if="currentLayout.headerStyle === 'centered' && editor.guideData.theme">
          {{ editor.guideData.theme }}
        </div>
      </div>

      <!-- 两栏布局内容 -->
      <div :class="currentLayout.columns === 2 ? 'grid grid-cols-2 gap-x-6 gap-y-4' : 'space-y-4'">

        <!-- 交通攻略 -->
        <div v-if="editor.sectionVisibility.transport && hasContent(['transport', 'localTransport', 'transportTips', 'transportCost'])" class="poster-section">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">🚗</span>
            <h3 class="section-heading" :style="sectionTitleStyle">交通攻略</h3>
          </div>
          <div v-if="editor.guideData.transport" class="poster-item">
            <span class="item-label">往返：</span>{{ editor.guideData.transport }}
          </div>
          <div v-if="editor.guideData.localTransport" class="poster-item">
            <span class="item-label">当地：</span>{{ editor.guideData.localTransport }}
          </div>
          <div v-if="editor.guideData.transportTips" class="poster-item text-sm opacity-80 italic">
            💡 {{ editor.guideData.transportTips }}
          </div>
          <div v-if="editor.guideData.transportCost" class="poster-item">
            <span class="item-label">费用：</span>{{ editor.guideData.transportCost }}
          </div>
        </div>

        <!-- 住宿攻略 -->
        <div v-if="editor.sectionVisibility.accommodation && hasContent(['accommodation', 'hotelName', 'hotelPrice', 'hotelExp', 'hotelTips'])" class="poster-section">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">🏨</span>
            <h3 class="section-heading" :style="sectionTitleStyle">住宿攻略</h3>
          </div>
          <div v-if="editor.guideData.accommodation" class="poster-item">
            <span class="item-label">区域：</span>{{ editor.guideData.accommodation }}
          </div>
          <div v-if="editor.guideData.hotelName" class="poster-item">
            <span class="item-label">推荐：</span>{{ editor.guideData.hotelName }}
          </div>
          <div v-if="editor.guideData.hotelPrice" class="poster-item">
            <span class="item-label">价格：</span>{{ editor.guideData.hotelPrice }}
          </div>
          <div v-if="editor.guideData.hotelExp" class="poster-item text-sm opacity-80 italic">
            ✨ {{ editor.guideData.hotelExp }}
          </div>
          <div v-if="editor.guideData.hotelTips" class="poster-item text-sm opacity-70">
            💡 {{ editor.guideData.hotelTips }}
          </div>
        </div>

        <!-- 行前准备 -->
        <div v-if="editor.sectionVisibility.preparation && hasContent(['essentials', 'documents', 'clothing', 'weatherPrep', 'medicine', 'network'])" class="poster-section">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">🎒</span>
            <h3 class="section-heading" :style="sectionTitleStyle">行前准备</h3>
          </div>
          <div class="grid grid-cols-2 gap-x-3 gap-y-1">
            <div v-if="editor.guideData.essentials" class="poster-item text-sm">
              <span class="item-label">必备：</span>{{ editor.guideData.essentials }}
            </div>
            <div v-if="editor.guideData.documents" class="poster-item text-sm">
              <span class="item-label">证件：</span>{{ editor.guideData.documents }}
            </div>
            <div v-if="editor.guideData.clothing" class="poster-item text-sm">
              <span class="item-label">穿搭：</span>{{ editor.guideData.clothing }}
            </div>
            <div v-if="editor.guideData.weatherPrep" class="poster-item text-sm">
              <span class="item-label">防护：</span>{{ editor.guideData.weatherPrep }}
            </div>
            <div v-if="editor.guideData.medicine" class="poster-item text-sm">
              <span class="item-label">药品：</span>{{ editor.guideData.medicine }}
            </div>
            <div v-if="editor.guideData.network" class="poster-item text-sm">
              <span class="item-label">网络：</span>{{ editor.guideData.network }}
            </div>
          </div>
        </div>

        <!-- 每日行程 -->
        <div v-if="editor.sectionVisibility.itinerary && editor.guideData.itinerary.length > 0" class="poster-section col-span-full">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">📅</span>
            <h3 class="section-heading" :style="sectionTitleStyle">行程安排</h3>
          </div>
          <div :class="editor.guideData.itinerary.length > 3 ? 'grid grid-cols-2 gap-3' : 'space-y-3'">
            <div v-for="(day, idx) in editor.guideData.itinerary" :key="idx"
              class="p-3 rounded-xl"
              :style="{ background: editor.customStyle.primaryColor + '08', border: '1px solid ' + editor.customStyle.primaryColor + '15' }">
              <div class="text-sm font-bold mb-1" :style="{ color: editor.customStyle.primaryColor }">Day {{ idx + 1 }}</div>
              <div v-if="day.spots" class="poster-item text-sm">{{ day.spots }}</div>
              <div class="flex gap-3 text-xs mt-1" :style="{ color: editor.customStyle.textColor, opacity: 0.7 }">
                <span v-if="day.duration">⏰ {{ day.duration }}</span>
                <span v-if="day.route">🗺️ {{ day.route }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 美食攻略 -->
        <div v-if="editor.sectionVisibility.food && hasContent(['food', 'foodShops', 'foodPrice', 'foodReview', 'foodAvoid'])" class="poster-section">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">🍜</span>
            <h3 class="section-heading" :style="sectionTitleStyle">美食攻略</h3>
          </div>
          <div v-if="editor.guideData.food" class="poster-item">
            <span class="item-label">必吃：</span>{{ editor.guideData.food }}
          </div>
          <div v-if="editor.guideData.foodShops" class="poster-item">
            <span class="item-label">探店：</span>{{ editor.guideData.foodShops }}
          </div>
          <div v-if="editor.guideData.foodPrice" class="poster-item">
            <span class="item-label">消费：</span>{{ editor.guideData.foodPrice }}
          </div>
          <div v-if="editor.guideData.foodReview" class="poster-item text-sm opacity-80 italic">
            😋 {{ editor.guideData.foodReview }}
          </div>
          <div v-if="editor.guideData.foodAvoid" class="poster-item text-sm opacity-70">
            ⚠️ 避雷：{{ editor.guideData.foodAvoid }}
          </div>
        </div>

        <!-- 避坑指南 -->
        <div v-if="editor.sectionVisibility.tips && hasContent(['tipsScenic', 'tipsConsume', 'tipsBooking', 'tipsHours'])" class="poster-section">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">⚠️</span>
            <h3 class="section-heading" :style="sectionTitleStyle">避坑指南</h3>
          </div>
          <div v-if="editor.guideData.tipsScenic" class="poster-item text-sm">
            🏞️ {{ editor.guideData.tipsScenic }}
          </div>
          <div v-if="editor.guideData.tipsConsume" class="poster-item text-sm">
            💰 {{ editor.guideData.tipsConsume }}
          </div>
          <div v-if="editor.guideData.tipsBooking" class="poster-item text-sm">
            📋 {{ editor.guideData.tipsBooking }}
          </div>
          <div v-if="editor.guideData.tipsHours" class="poster-item text-sm">
            🕐 {{ editor.guideData.tipsHours }}
          </div>
        </div>

        <!-- 自定义备注 -->
        <div v-if="editor.guideData.customNotes" class="poster-section col-span-full">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">💬</span>
            <h3 class="section-heading" :style="sectionTitleStyle">补充笔记</h3>
          </div>
          <div class="poster-item text-sm whitespace-pre-wrap">{{ editor.guideData.customNotes }}</div>
        </div>
      </div>

      <!-- 底部装饰 -->
      <div v-if="editor.customStyle.showDecor" class="mt-6 pt-4 flex items-center justify-center gap-3"
        :style="{ borderTop: '1px solid ' + editor.customStyle.primaryColor + '20' }">
        <div class="h-[2px] w-12 rounded" :style="{ background: editor.customStyle.primaryColor }"></div>
        <span class="text-xs" :style="{ color: editor.customStyle.primaryColor, opacity: 0.6 }">✦ 旅 行 愉 快 ✦</span>
        <div class="h-[2px] w-12 rounded" :style="{ background: editor.customStyle.primaryColor }"></div>
      </div>

      <!-- 水印 -->
      <div v-if="editor.customStyle.watermark && editor.customStyle.customLabel"
        class="absolute bottom-4 right-6 text-[10px] opacity-30"
        :style="{ color: editor.customStyle.textColor, fontFamily: getFontFamily() }">
        {{ editor.customStyle.customLabel }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'

const editor = useEditorStore()
const posterEl = ref(null)

const currentLayout = computed(() => editor.currentTemplate?.layout || {})

// 样式计算
const fontFamilyMap = {
  sans: "'Noto Sans SC', sans-serif",
  cute: "'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif",
  serif: "'Noto Serif SC', serif",
  bold: "'Noto Sans SC', sans-serif"
}

function getFontFamily() {
  return fontFamilyMap[editor.customStyle.fontStyle] || fontFamilyMap.sans
}

const fontSizeMap = { small: 0.85, normal: 1, large: 1.15 }
const lineHeightMap = { tight: 1.4, normal: 1.7, wide: 2.1 }
const letterSpacingMap = { tight: '-0.02em', normal: '0', wide: '0.04em' }
const densityMap = { compact: '16px', normal: '24px', loose: '36px' }

const posterWrapperStyle = computed(() => ({
  width: '420px',
  minHeight: '600px',
  background: editor.customStyle.bgColor,
  borderRadius: '16px',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
  opacity: editor.customStyle.bgOpacity / 100
}))

const posterContentStyle = computed(() => ({
  padding: `${densityMap[editor.customStyle.layoutDensity]}`,
  fontFamily: getFontFamily(),
  fontSize: `${fontSizeMap[editor.customStyle.fontSize]}rem`,
  lineHeight: lineHeightMap[editor.customStyle.lineSpacing],
  letterSpacing: letterSpacingMap[editor.customStyle.letterSpacing],
  color: editor.customStyle.textColor
}))

const headerStyle = computed(() => ({
  textAlign: currentLayout.value.headerStyle === 'centered' ? 'center' : 'left',
  marginBottom: densityMap[editor.customStyle.layoutDensity],
  paddingBottom: densityMap[editor.customStyle.layoutDensity],
  borderBottom: currentLayout.value.headerStyle === 'line'
    ? `2px solid ${editor.customStyle.primaryColor}20`
    : currentLayout.value.headerStyle === 'framed'
    ? `3px double ${editor.customStyle.primaryColor}30`
    : 'none'
}))

const titleStyle = computed(() => ({
  fontFamily: getFontFamily(),
  fontSize: '1.8em',
  fontWeight: editor.customStyle.fontStyle === 'bold' ? '900' : '700',
  color: editor.customStyle.titleColor,
  margin: '0 0 0.25em 0',
  letterSpacing: '0.02em'
}))

const subtitleStyle = computed(() => ({
  fontSize: '0.9em',
  color: editor.customStyle.textColor,
  opacity: 0.7,
  margin: '0 0 0.5em 0'
}))

const sectionTitleStyle = computed(() => ({
  fontFamily: getFontFamily(),
  fontSize: '1.1em',
  fontWeight: '700',
  color: editor.customStyle.titleColor,
  margin: 0
}))

// 检查板块是否有内容
function hasContent(fields) {
  return fields.some(f => {
    const val = editor.guideData[f]
    return val && (typeof val === 'string' ? val.trim() : val.length > 0)
  })
}

defineExpose({ posterEl })
</script>

<style scoped>
.poster-wrapper {
  transition: all 0.3s ease;
}

.poster-section {
  break-inside: avoid;
}

.poster-item {
  margin-bottom: 0.35em;
  line-height: 1.6;
}

.item-label {
  font-weight: 600;
  opacity: 0.8;
}

.section-heading {
  margin: 0;
}
</style>
