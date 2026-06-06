import { defineConfig, presetUno, presetAttributify, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify()
  ],
  transformers: [transformerDirectives()],
  shortcuts: {
    'btn': 'px-6 py-3 rounded-xl font-medium cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 select-none',
    'btn-primary': 'btn bg-[#e8734a] text-white hover:bg-[#d4623a] shadow-lg shadow-[#e8734a]/30',
    'btn-secondary': 'btn bg-white text-[#555] border border-[#ddd] hover:border-[#e8734a] hover:text-[#e8734a]',
    'btn-ghost': 'btn bg-transparent text-[#888] hover:text-[#e8734a] hover:bg-[#e8734a]/5',
    'card': 'bg-white rounded-2xl shadow-sm border border-[#eae5df] p-6',
    'input': 'w-full px-4 py-3 border border-[#ddd] rounded-xl bg-[#fafaf8] focus:outline-none focus:border-[#e8734a] focus:ring-2 focus:ring-[#e8734a]/10 transition-all',
    'textarea': 'input resize-y min-h-[80px]',
    'label': 'text-sm font-medium text-[#666] mb-2 block',
    'section-title': 'text-lg font-bold text-[#333] mb-4 flex items-center gap-2'
  },
  theme: {
    colors: {
      primary: '#e8734a',
      primaryLight: '#f08c6a',
      bg: '#f5f0eb',
      surface: '#fffdf9',
      text: '#333333',
      textLight: '#777777',
      border: '#eae5df'
    }
  }
})
