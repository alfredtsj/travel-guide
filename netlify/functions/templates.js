// Netlify Function: Templates
// 模板 CRUD 管理
const JWT_SECRET = process.env.JWT_SECRET || 'guide-poster-secret-key-2024'
const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join('/tmp', 'templates.json')

function verifyToken(event) {
  try {
    const auth = event.headers.authorization || ''
    const token = auth.replace('Bearer ', '')
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    return payload.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

function getDefaultTemplates() {
  return [
    {
      id: 'template-xiaohongshu',
      name: '小红书风',
      style: 'social',
      tag: '流行',
      scene: ['短途游', '单人旅行', '亲子游'],
      status: 'active',
      sort: 1,
      colors: { primary: '#ff5a5f', title: '#333333', text: '#555555', bg: '#fffdf9', accent: '#ffb3b6' },
      layout: { headerStyle: 'ribbon', photoArea: true, columns: 1 }
    },
    {
      id: 'template-minimal',
      name: '极简清新',
      style: 'minimal',
      tag: '文艺',
      scene: ['短途游', '单人旅行'],
      status: 'active',
      sort: 2,
      colors: { primary: '#6b9080', title: '#2d3a2d', text: '#5a6a5a', bg: '#f8faf5', accent: '#a3b899' },
      layout: { headerStyle: 'centered', photoArea: true, columns: 1 }
    },
    {
      id: 'template-japanese',
      name: '日系治愈',
      style: 'japanese',
      tag: '清新',
      scene: ['短途游', '单人旅行', '长途游'],
      status: 'active',
      sort: 3,
      colors: { primary: '#7eb8c9', title: '#3a4a52', text: '#5a6a72', bg: '#f5f9fb', accent: '#b8dce6' },
      layout: { headerStyle: 'bordered', photoArea: true, columns: 2 }
    },
    {
      id: 'template-guochao',
      name: '国潮古风',
      style: 'chinese',
      tag: '特色',
      scene: ['长途游', '亲子游'],
      status: 'active',
      sort: 4,
      colors: { primary: '#c41e3a', title: '#2c1810', text: '#5c3a2e', bg: '#fdf5ed', accent: '#e8c5a0' },
      layout: { headerStyle: 'framed', photoArea: true, columns: 1 }
    },
    {
      id: 'template-literary',
      name: '简约文艺',
      style: 'literary',
      tag: '质感',
      scene: ['短途游', '单人旅行'],
      status: 'active',
      sort: 5,
      colors: { primary: '#9b8c7c', title: '#3a3028', text: '#6a5a4a', bg: '#faf7f2', accent: '#c4b8a8' },
      layout: { headerStyle: 'minimal', photoArea: true, columns: 1 }
    },
    {
      id: 'template-business',
      name: '商务出行',
      style: 'business',
      tag: '专业',
      scene: ['短途游', '单人旅行'],
      status: 'active',
      sort: 6,
      colors: { primary: '#2c5282', title: '#1a2a3a', text: '#4a5a6a', bg: '#f7f9fb', accent: '#90b4d4' },
      layout: { headerStyle: 'line', photoArea: false, columns: 1 }
    }
  ]
}

function loadTemplates() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    }
  } catch {}
  return getDefaultTemplates()
}

function saveTemplates(templates) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(templates, null, 2))
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers }
  }

  if (!verifyToken(event)) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: '未授权访问' })
    }
  }

  try {
    // GET - 获取模板列表
    if (event.httpMethod === 'GET') {
      const templates = loadTemplates()
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(templates.sort((a, b) => (a.sort || 0) - (b.sort || 0)))
      }
    }

    // POST - 新建模板
    if (event.httpMethod === 'POST') {
      const contentType = event.headers['content-type'] || ''

      // 处理 multipart/form-data（含文件上传）
      if (contentType.includes('multipart/form-data')) {
        // Netlify 自动解析 multipart，fields 包含普通字段
        const body = event.body || '{}'
        let data
        try {
          data = JSON.parse(body)
        } catch {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: '模板已创建（文件上传功能需要额外配置 Cloudinary 等图床服务）',
              hint: '目前模板以配色方案形式创建，缩略图上传需要配置外部存储'
            })
          }
        }
      }

      // JSON 格式
      const data = JSON.parse(event.body || '{}')
      const templates = loadTemplates()

      const newTemplate = {
        id: 'template-' + Date.now(),
        name: data.name || '新模板',
        style: data.style || 'custom',
        tag: data.tag || '自定义',
        scene: data.scene ? data.scene.split(',').map(s => s.trim()) : ['短途游'],
        status: 'active',
        sort: templates.length + 1,
        colors: {
          primary: data.primary || '#e8734a',
          title: data.titleColor || '#333333',
          text: data.textColor || '#555555',
          bg: data.bgColor || '#fffdf9',
          accent: data.accent || '#f5a88a'
        },
        layout: {
          headerStyle: data.headerStyle || 'ribbon',
          photoArea: true,
          columns: data.columns || 1
        }
      }

      templates.push(newTemplate)
      saveTemplates(templates)

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, template: newTemplate })
      }
    }

    // PUT - 更新模板
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body || '{}')
      const templates = loadTemplates()
      const idx = templates.findIndex(t => t.id === data.id)

      if (idx === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: '模板不存在' })
        }
      }

      Object.assign(templates[idx], data)
      saveTemplates(templates)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, template: templates[idx] })
      }
    }

    // DELETE - 删除模板
    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '缺少模板ID' })
        }
      }

      let templates = loadTemplates()
      templates = templates.filter(t => t.id !== id)
      saveTemplates(templates)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    }
  }
}
