<template>
  <div class="space-y-5">
    <h2 class="text-lg font-bold text-[#333] flex items-center gap-2">
      <span>✨</span> 样式自定义
    </h2>

    <!-- 预设配色套餐 -->
    <div class="card">
      <h3 class="font-bold text-sm text-[#555] mb-3">🎨 配色套餐</h3>
      <div class="grid grid-cols-4 gap-2">
        <button v-for="preset in editor.colorPresets" :key="preset.name"
          class="p-2 rounded-xl text-center transition-all hover:scale-105 border-2"
          :class="isPresetActive(preset) ? 'border-[#e8734a]' : 'border-transparent'"
          @click="editor.applyColorPreset(preset)">
          <div class="flex gap-1 mb-1 justify-center">
            <div class="w-4 h-4 rounded-full" :style="{ background: preset.primary }"></div>
            <div class="w-4 h-4 rounded-full" :style="{ background: preset.accent }"></div>
          </div>
          <span class="text-[10px] text-[#888]">{{ preset.name }}</span>
        </button>
      </div>
    </div>

    <!-- 独立颜色调节 -->
    <div class="card">
      <h3 class="font-bold text-sm text-[#555] mb-3">🎯 独立配色</h3>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-sm text-[#666]">主题色</label>
          <div class="flex items-center gap-2">
            <input type="color" :value="editor.customStyle.primaryColor" @input="editor.customStyle.primaryColor = $event.target.value" class="w-8 h-8 rounded cursor-pointer border-0" />
            <span class="text-xs text-[#999] font-mono">{{ editor.customStyle.primaryColor }}</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm text-[#666]">标题色</label>
          <div class="flex items-center gap-2">
            <input type="color" :value="editor.customStyle.titleColor" @input="editor.customStyle.titleColor = $event.target.value" class="w-8 h-8 rounded cursor-pointer border-0" />
            <span class="text-xs text-[#999] font-mono">{{ editor.customStyle.titleColor }}</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm text-[#666]">文字色</label>
          <div class="flex items-center gap-2">
            <input type="color" :value="editor.customStyle.textColor" @input="editor.customStyle.textColor = $event.target.value" class="w-8 h-8 rounded cursor-pointer border-0" />
            <span class="text-xs text-[#999] font-mono">{{ editor.customStyle.textColor }}</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm text-[#666]">背景色</label>
          <div class="flex items-center gap-2">
            <input type="color" :value="editor.customStyle.bgColor" @input="editor.customStyle.bgColor = $event.target.value" class="w-8 h-8 rounded cursor-pointer border-0" />
            <span class="text-xs text-[#999] font-mono">{{ editor.customStyle.bgColor }}</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm text-[#666]">装饰色</label>
          <div class="flex items-center gap-2">
            <input type="color" :value="editor.customStyle.accentColor" @input="editor.customStyle.accentColor = $event.target.value" class="w-8 h-8 rounded cursor-pointer border-0" />
            <span class="text-xs text-[#999] font-mono">{{ editor.customStyle.accentColor }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 风格选择 -->
    <div class="card">
      <h3 class="font-bold text-sm text-[#555] mb-3">🖼️ 整体风格</h3>
      <div class="grid grid-cols-3 gap-2">
        <button v-for="s in visualStyles" :key="s.value"
          class="px-3 py-2 rounded-lg text-xs text-center transition-all border"
          :class="editor.customStyle.visualStyle === s.value
            ? 'border-[#e8734a] bg-[#e8734a]/10 text-[#e8734a] font-bold'
            : 'border-[#eae5df] text-[#888] hover:border-[#e8734a]/30'"
          @click="editor.customStyle.visualStyle = s.value">
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- 字体样式 -->
    <div class="card">
      <h3 class="font-bold text-sm text-[#555] mb-3">✍️ 字体</h3>
      <div class="grid grid-cols-2 gap-2">
        <button v-for="f in fontStyles" :key="f.value"
          class="px-3 py-3 rounded-lg text-center transition-all border"
          :class="editor.customStyle.fontStyle === f.value
            ? 'border-[#e8734a] bg-[#e8734a]/10 text-[#e8734a] font-bold'
            : 'border-[#eae5df] text-[#888] hover:border-[#e8734a]/30'"
          :style="{ fontFamily: f.fontFamily }"
          @click="editor.customStyle.fontStyle = f.value">
          <div class="text-base mb-0.5">{{ f.preview }}</div>
          <div class="text-[10px] opacity-60">{{ f.label }}</div>
        </button>
      </div>
    </div>

    <!-- 版式 -->
    <div class="card">
      <h3 class="font-bold text-sm text-[#555] mb-3">📐 版式松紧</h3>
      <div class="flex gap-2">
        <button v-for="d in densityOptions" :key="d.value"
          class="flex-1 py-2 rounded-lg text-xs transition-all border"
          :class="editor.customStyle.layoutDensity === d.value
            ? 'border-[#e8734a] bg-[#e8734a]/10 text-[#e8734a] font-bold'
            : 'border-[#eae5df] text-[#888] hover:border-[#e8734a]/30'"
          @click="editor.customStyle.layoutDensity = d.value">
          {{ d.label }}
        </button>
      </div>
    </div>

    <!-- 卡片风格 -->
    <div class="card">
      <h3 class="font-bold text-sm text-[#555] mb-3">🃏 卡片风格</h3>
      <div class="grid grid-cols-3 gap-2">
        <button v-for="c in cardStyles" :key="c.value"
          class="py-2.5 rounded-lg text-xs text-center transition-all border"
          :class="editor.customStyle.cardStyle === c.value
            ? 'border-[#e8734a] bg-[#e8734a]/10 text-[#e8734a] font-bold'
            : 'border-[#eae5df] text-[#888] hover:border-[#e8734a]/30'"
          @click="editor.customStyle.cardStyle = c.value">
          <div class="text-lg mb-0.5">{{ c.icon }}</div>
          <div>{{ c.label }}</div>
        </button>
      </div>
    </div>

    <!-- 细节自定义 -->
    <div class="card">
      <h3 class="font-bold text-sm text-[#555] mb-3">🔧 细节设置</h3>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-sm text-[#666]">文字大小</label>
          <div class="flex gap-1">
            <button v-for="s in fontSizes" :key="s.value"
              class="px-3 py-1 rounded text-xs transition-all"
              :class="editor.customStyle.fontSize === s.value
                ? 'bg-[#e8734a] text-white'
                : 'bg-[#f0ebe3] text-[#888]'"
              @click="editor.customStyle.fontSize = s.value">
              {{ s.label }}
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm text-[#666]">行间距</label>
          <div class="flex gap-1">
            <button v-for="s in lineSpacingOptions" :key="s.value"
              class="px-3 py-1 rounded text-xs transition-all"
              :class="editor.customStyle.lineSpacing === s.value
                ? 'bg-[#e8734a] text-white'
                : 'bg-[#f0ebe3] text-[#888]'"
              @click="editor.customStyle.lineSpacing = s.value">
              {{ s.label }}
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm text-[#666]">背景透明度</label>
          <input type="range" min="60" max="100" v-model.number="editor.customStyle.bgOpacity"
            class="w-24 accent-[#e8734a]" />
          <span class="text-xs text-[#999] w-8">{{ editor.customStyle.bgOpacity }}%</span>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-[#eae5df]">
          <label class="text-sm text-[#666]">装饰元素</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-1 text-xs text-[#888] cursor-pointer">
              <input type="checkbox" v-model="editor.customStyle.showDecor" class="accent-[#e8734a]" /> 装饰
            </label>
            <label class="flex items-center gap-1 text-xs text-[#888] cursor-pointer">
              <input type="checkbox" v-model="editor.customStyle.showStickers" class="accent-[#e8734a]" /> 贴纸
            </label>
            <label class="flex items-center gap-1 text-xs text-[#888] cursor-pointer">
              <input type="checkbox" v-model="editor.customStyle.showIcons" class="accent-[#e8734a]" /> 图标
            </label>
          </div>
        </div>

        <div>
          <label class="text-sm text-[#666] mb-1 block">自定义标签</label>
          <input class="input text-sm" v-model="editor.customStyle.customLabel" placeholder="如：@小雨的旅行日记" />
        </div>

        <div class="flex items-center justify-between">
          <label class="text-sm text-[#666]">图片水印</label>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="editor.customStyle.watermark" class="sr-only peer" />
            <div class="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#e8734a] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- 重置按钮 -->
    <button class="btn-ghost w-full text-sm py-2" @click="editor.resetStyle()">
      🔄 重置为模板默认样式
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'

const editor = useEditorStore()

const visualStyles = [
  { value: 'flat', label: '扁平简约' },
  { value: 'sketchy', label: '手绘质感' },
  { value: 'gradient', label: '磨砂渐变' },
  { value: 'film', label: '复古胶片' },
  { value: 'fresh', label: '清新通透' },
  { value: 'elegant', label: '优雅暗调' }
]

const fontStyles = [
  { value: 'sans', label: '极简无衬线', fontFamily: 'sans-serif', preview: '旅行攻略' },
  { value: 'cute', label: '圆润可爱', fontFamily: "'ZCOOL KuaiLe'", preview: '旅行攻略' },
  { value: 'serif', label: '文艺楷体', fontFamily: "'Noto Serif SC'", preview: '旅行攻略' },
  { value: 'bold', label: '粗体标题', fontFamily: 'sans-serif', preview: '旅行攻略' }
]

const fontSizes = [
  { value: 'small', label: '小' },
  { value: 'normal', label: '中' },
  { value: 'large', label: '大' }
]

const lineSpacingOptions = [
  { value: 'tight', label: '紧凑' },
  { value: 'normal', label: '正常' },
  { value: 'wide', label: '宽松' }
]

const densityOptions = [
  { value: 'compact', label: '紧凑' },
  { value: 'normal', label: '适中' },
  { value: 'loose', label: '宽松' }
]

const cardStyles = [
  { value: 'rounded', label: '圆角白卡', icon: '📇' },
  { value: 'shadow', label: '投影卡片', icon: '🪪' },
  { value: 'bordered', label: '线框卡片', icon: '📋' },
  { value: 'flat', label: '扁平素卡', icon: '📄' },
  { value: 'elevated', label: '悬浮卡片', icon: '✨' }
]

function isPresetActive(preset) {
  return (
    editor.customStyle.primaryColor === preset.primary &&
    editor.customStyle.titleColor === preset.title &&
    editor.customStyle.textColor === preset.text &&
    editor.customStyle.bgColor === preset.bg &&
    editor.customStyle.accentColor === preset.accent
  )
}
</script>
