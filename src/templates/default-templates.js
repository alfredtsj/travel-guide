/**
 * 内置默认海报模板定义
 * 每个模板定义其配色、字体、版式等基础视觉参数
 */
export const defaultTemplates = [
  {
    id: 'template-xiaohongshu',
    name: '小红书风',
    style: 'social',
    tag: '流行',
    scene: ['短途游', '单人旅行', '亲子游'],
    thumbnail: '',
    colors: { primary: '#ff5a5f', title: '#333333', text: '#555555', bg: '#fffdf9', accent: '#ffb3b6' },
    layout: { headerStyle: 'ribbon', photoArea: true, columns: 1 }
  },
  {
    id: 'template-minimal',
    name: '极简清新',
    style: 'minimal',
    tag: '文艺',
    scene: ['短途游', '单人旅行'],
    thumbnail: '',
    colors: { primary: '#6b9080', title: '#2d3a2d', text: '#5a6a5a', bg: '#f8faf5', accent: '#a3b899' },
    layout: { headerStyle: 'centered', photoArea: true, columns: 1 }
  },
  {
    id: 'template-japanese',
    name: '日系治愈',
    style: 'japanese',
    tag: '清新',
    scene: ['短途游', '单人旅行', '长途游'],
    thumbnail: '',
    colors: { primary: '#7eb8c9', title: '#3a4a52', text: '#5a6a72', bg: '#f5f9fb', accent: '#b8dce6' },
    layout: { headerStyle: 'bordered', photoArea: true, columns: 2 }
  },
  {
    id: 'template-guochao',
    name: '国潮古风',
    style: 'chinese',
    tag: '特色',
    scene: ['长途游', '亲子游'],
    thumbnail: '',
    colors: { primary: '#c41e3a', title: '#2c1810', text: '#5c3a2e', bg: '#fdf5ed', accent: '#e8c5a0' },
    layout: { headerStyle: 'framed', photoArea: true, columns: 1 }
  },
  {
    id: 'template-literary',
    name: '简约文艺',
    style: 'literary',
    tag: '质感',
    scene: ['短途游', '单人旅行'],
    thumbnail: '',
    colors: { primary: '#9b8c7c', title: '#3a3028', text: '#6a5a4a', bg: '#faf7f2', accent: '#c4b8a8' },
    layout: { headerStyle: 'minimal', photoArea: true, columns: 1 }
  },
  {
    id: 'template-business',
    name: '商务出行',
    style: 'business',
    tag: '专业',
    scene: ['短途游', '单人旅行'],
    thumbnail: '',
    colors: { primary: '#2c5282', title: '#1a2a3a', text: '#4a5a6a', bg: '#f7f9fb', accent: '#90b4d4' },
    layout: { headerStyle: 'line', photoArea: false, columns: 1 }
  }
]
