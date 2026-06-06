<template>
  <div class="space-y-4">
    <h2 class="text-lg font-bold text-[#333] flex items-center gap-2">
      <span>🎨</span> 选择模板
    </h2>

    <!-- 筛选 -->
    <div class="flex gap-2 flex-wrap">
      <button v-for="scene in scenes" :key="scene"
        class="px-3 py-1 rounded-full text-xs transition-all"
        :class="activeFilter === scene ? 'bg-[#e8734a] text-white' : 'bg-[#f5f0eb] text-[#666] hover:bg-[#e8734a]/10'"
        @click="activeFilter = activeFilter === scene ? '' : scene">
        {{ scene }}
      </button>
    </div>

    <!-- 模板列表 -->
    <div class="grid grid-cols-1 gap-3">
      <div v-for="tpl in filteredTemplates" :key="tpl.id"
        class="relative p-4 rounded-xl cursor-pointer transition-all border-2 overflow-hidden group"
        :class="editor.currentTemplateId === tpl.id
          ? 'border-[#e8734a] bg-[#e8734a]/5 shadow-md'
          : 'border-[#eae5df] hover:border-[#e8734a]/30 hover:shadow-sm'"
        @click="editor.selectTemplate(tpl.id)"
      >
        <!-- 模板预览色块 -->
        <div class="flex gap-2 mb-3">
          <div class="w-8 h-8 rounded-lg" :style="{ background: tpl.colors.primary }"></div>
          <div class="w-8 h-8 rounded-lg" :style="{ background: tpl.colors.accent }"></div>
          <div class="w-8 h-8 rounded-lg border" :style="{ background: tpl.colors.bg }"></div>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <div class="font-bold text-sm" :style="{ color: tpl.colors.title }">{{ tpl.name }}</div>
            <div class="text-xs mt-1 flex gap-1">
              <span class="px-2 py-0.5 rounded-full text-[10px]" :style="{ background: tpl.colors.accent + '30', color: tpl.colors.primary }">{{ tpl.tag }}</span>
            </div>
          </div>
          <div v-if="editor.currentTemplateId === tpl.id"
            class="w-6 h-6 rounded-full bg-[#e8734a] flex items-center justify-center text-white text-xs">
            ✓
          </div>
        </div>

        <!-- 适用场景 -->
        <div class="flex gap-1 mt-2 flex-wrap">
          <span v-for="s in tpl.scene" :key="s" class="text-[10px] px-2 py-0.5 rounded bg-[#f0ebe3] text-[#888]">{{ s }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '@/stores/editor'

const editor = useEditorStore()
const activeFilter = ref('')

const scenes = ['短途游', '长途游', '亲子游', '单人旅行']

const filteredTemplates = computed(() => {
  if (!activeFilter.value) return editor.templates
  return editor.templates.filter(t => t.scene.includes(activeFilter.value))
})
</script>
