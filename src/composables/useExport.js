import { ref } from 'vue'

// 分辨率配置
const resolutions = {
  '1080p': { width: 1080, height: 1526, label: '1080P 高清', scale: 2 },
  '2k': { width: 1440, height: 2034, label: '2K 超清', scale: 2.5 },
  '4k': { width: 2160, height: 3052, label: '4K 极清', scale: 4 }
}

export function useExport() {
  const isExporting = ref(false)
  const exportProgress = ref(0)

  /**
   * 导出海报为图片
   * @param {HTMLElement} sourceEl - 海报 DOM 元素
   * @param {Object} options - { resolution, format }
   */
  async function exportImage(sourceEl, options = {}) {
    const { resolution = '1080p', format = 'png' } = options
    const config = resolutions[resolution] || resolutions['1080p']

    isExporting.value = true
    exportProgress.value = 0

    console.log('[Export] 开始导出，分辨率:', resolution, '格式:', format)
    console.log('[Export] 源元素:', sourceEl?.tagName, sourceEl?.className)

    try {
      // Step 1: 验证元素
      exportProgress.value = 5
      if (!sourceEl) {
        throw new Error('未找到海报元素')
      }

      const rect = sourceEl.getBoundingClientRect()
      console.log('[Export] 元素尺寸:', rect.width, 'x', rect.height)
      if (rect.width === 0 || rect.height === 0) {
        throw new Error('海报元素尺寸为0，请确保预览区已加载')
      }

      exportProgress.value = 15

      // Step 2: 动态导入 html2canvas
      console.log('[Export] 加载 html2canvas...')
      const { default: html2canvas } = await import('html2canvas')
      console.log('[Export] html2canvas 加载完成')

      exportProgress.value = 25

      // Step 3: 渲染为 canvas
      console.log('[Export] 开始渲染 canvas, scale:', config.scale)
      const canvas = await html2canvas(sourceEl, {
        scale: config.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: true,  // 开启日志便于调试
        windowWidth: sourceEl.scrollWidth || 420,
        windowHeight: sourceEl.scrollHeight || 800
      })

      console.log('[Export] Canvas 渲染完成:', canvas.width, 'x', canvas.height)
      exportProgress.value = 70

      // Step 4: 裁剪到目标分辨率
      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = config.width
      finalCanvas.height = Math.min(config.height, canvas.height)
      const ctx = finalCanvas.getContext('2d')
      ctx.drawImage(canvas, 0, 0, config.width, finalCanvas.height)

      exportProgress.value = 90

      // Step 5: 生成 blob
      const mimeType = format === 'jpg' ? 'image/jpeg'
        : format === 'webp' ? 'image/webp'
        : 'image/png'

      const blob = await new Promise((resolve, reject) => {
        finalCanvas.toBlob((b) => {
          if (b) resolve(b)
          else reject(new Error('Blob 生成失败'))
        }, mimeType, 0.95)
      })

      console.log('[Export] Blob 生成完成, 大小:', (blob.size / 1024).toFixed(1), 'KB')
      exportProgress.value = 100
      isExporting.value = false

      return {
        blob,
        canvas: finalCanvas,
        dataUrl: finalCanvas.toDataURL(mimeType, 0.95)
      }
    } catch (err) {
      console.error('[Export] 导出异常:', err)
      isExporting.value = false
      throw err
    }
  }

  /**
   * 下载 blob 为文件
   */
  function downloadBlob(blob, filename) {
    console.log('[Export] 触发下载:', filename, '大小:', blob.size)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)

    // 直接点击触发
    a.click()

    // 延迟清理
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 200)
  }

  /**
   * 复制图片到剪贴板
   */
  async function copyImage(canvas) {
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      return true
    } catch (err) {
      console.error('[Export] 复制失败:', err)
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
