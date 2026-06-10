<template>
  <div class="editor-layout flex h-screen overflow-hidden">
    <!-- 左侧编辑区 -->
    <div class="edit-panel w-[420px] min-w-[380px] h-full overflow-y-auto bg-white border-r border-[#eae5df] shadow-sm z-10">
      <div class="sticky top-0 bg-white/95 backdrop-blur-sm z-20 px-5 py-4 border-b border-[#eae5df]">
        <div class="flex items-center justify-between mb-3">
          <h1 class="text-xl font-bold text-[#333] flex items-center gap-2">
            <span class="text-2xl">🗺️</span> 攻略编辑器
          </h1>
          <div class="flex gap-1">
            <button class="btn-ghost text-sm px-2 py-1" @click="editor.undo()" :disabled="!editor.canUndo" title="撤销">
              ↩
            </button>
            <button class="btn-ghost text-sm px-2 py-1" @click="editor.redo()" :disabled="!editor.canRedo" title="重做">
              ↪
            </button>
          </div>
        </div>
        <!-- Tab 导航 -->
        <div class="flex gap-1 border-b border-[#eae5df] -mb-[17px]">
          <button v-for="tab in tabs" :key="tab.id"
            class="px-3 py-2 text-sm font-medium transition-all border-b-2 -mb-[2px]"
            :class="activeTab === tab.id
              ? 'text-[#e8734a] border-[#e8734a]'
              : 'text-[#999] border-transparent hover:text-[#666]'"
            @click="activeTab = tab.id">
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="p-5 pt-0">
        <!-- 内容编辑 -->
        <EditPanel v-if="activeTab === 'content'" ref="editPanelRef" />

        <!-- 模板选择 -->
        <TemplatePicker v-if="activeTab === 'template'" />

        <!-- 样式自定义 -->
        <StylePanel v-if="activeTab === 'style'" />

        <!-- OCR 识别 -->
        <OcrUpload v-if="activeTab === 'ocr'" />
      </div>

      <!-- 底部操作栏 -->
      <div class="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-[#eae5df] px-5 py-3 flex gap-2 z-20">
        <button class="btn-ghost text-sm flex-1" @click="handleClear">
          🗑️ 清空
        </button>
        <button class="btn-secondary text-sm flex-1" @click="showExport = true">
          📥 导出
        </button>
      </div>
    </div>

    <!-- 右侧预览区 -->
    <div class="preview-panel flex-1 h-full overflow-y-auto bg-[#f0ebe3] flex items-start justify-center p-8">
      <div class="preview-container" ref="previewContainer">
        <PosterTemplate ref="posterRef" />
      </div>
    </div>

    <!-- 导出弹窗 -->
    <Teleport to="body">
      <div v-if="showExport" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" @click.self="showExport = false">
        <ExportPanel @close="showExport = false" />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '@/stores/editor'
import EditPanel from '@/components/editor/EditPanel.vue'
import TemplatePicker from '@/components/editor/TemplatePicker.vue'
import StylePanel from '@/components/editor/StylePanel.vue'
import OcrUpload from '@/components/editor/OcrUpload.vue'
import PosterTemplate from '@/components/editor/PosterTemplate.vue'
import ExportPanel from '@/components/editor/ExportPanel.vue'

const editor = useEditorStore()

const activeTab = ref('content')
const showExport = ref(false)
const posterRef = ref(null)
const editPanelRef = ref(null)

const tabs = [
  { id: 'content', label: '📝 内容' },
  { id: 'template', label: '🎨 模板' },
  { id: 'style', label: '✨ 样式' },
  { id: 'ocr', label: '📷 OCR' }
]

function handleClear() {
  if (confirm('确定要清空所有编辑内容吗？此操作不可撤销。')) {
    editor.clearAll()
  }
}

// 自动保存草稿
let autoSaveTimer = null
watch(() => editor.guideData, () => {
  clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => editor.saveDraft(), 1000)
}, { deep: true })

// 键盘快捷键
function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    if (e.shiftKey) { e.preventDefault(); editor.redo() }
    else { e.preventDefault(); editor.undo() }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    editor.saveDraft()
  }
}

onMounted(() => {
  editor.loadDraft()
  document.addEventListener('keydown', handleKeydown)

  // 统计访问
  fetch('/.netlify/functions/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'view' })
  }).catch(() => {})
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  editor.saveDraft()
})
</script>
