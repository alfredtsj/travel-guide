import { ref } from 'vue'
import html2canvas from 'html2canvas'

// 分辨率配置
const resolutions = {
  '1080p': { width: 1080, height: 1526, label: '1080P 高清', scale: 2 },
  '2k': { width: 1440, height: 2034, label: '2K 超清', scale: 2.5 },
  '4k': { width: 2160, height: 3052, label: '4K 极清', scale: 4 }
}

export function useExport() {
  const isExporting = ref(false)
  const exportProgress = ref(0)

  async function exportImage(posterEl, options = {}) {
    const { resolution = '1080p', format = 'png' } = options
    const config = resolutions[resolution] || resolutions['1080p']

    isExporting.value = true
    exportProgress.value = 0

    try {
      const canvas = await html2canvas(posterEl, {
        scale: config.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          exportProgress.value = 30
        }
      })

      exportProgress.value = 70

      // 裁剪到目标分辨率
      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = config.width
      finalCanvas.height = config.height
      const ctx = finalCanvas.getContext('2d')
      ctx.drawImage(canvas, 0, 0, config.width, config.height)

      exportProgress.value = 90

      const mimeType = format === 'jpg' ? 'image/jpeg'
        : format === 'webp' ? 'image/webp'
        : 'image/png'

      const blob = await new Promise(resolve => {
        finalCanvas.toBlob(resolve, mimeType, 0.95)
      })

      exportProgress.value = 100
      isExporting.value = false

      return { blob, canvas: finalCanvas, dataUrl: finalCanvas.toDataURL(mimeType, 0.95) }
    } catch (err) {
      isExporting.value = false
      throw err
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function copyImage(canvas) {
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      return true
    } catch {
      return false
    }
  }

  return {
    isExporting,
    exportProgress,
    resolutions,
    exportImage,
    downloadBlob,
    copyImage
  }
}
