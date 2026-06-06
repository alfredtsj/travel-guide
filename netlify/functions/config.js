// Netlify Function: Config
// 网站配置管理
const fs = require('fs')
const path = require('path')

const CONFIG_FILE = path.join('/tmp', 'config.json')
const JWT_SECRET = process.env.JWT_SECRET || 'guide-poster-secret-key-2024'

const defaultConfig = {
  title: '旅行攻略海报生成器',
  subtitle: '手动编辑 + 模板美化 + 一键出图',
  logo: '',
  footer: '© Travel Guide Poster',
  announcement: '',
  defaultResolution: '1080p',
  defaultStyle: 'flat'
}

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

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return { ...defaultConfig, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) }
    }
  } catch {}
  return { ...defaultConfig }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers }
  }

  // GET - 公开获取（无需认证）
  if (event.httpMethod === 'GET') {
    const config = loadConfig()
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(config)
    }
  }

  // PUT - 需认证
  if (!verifyToken(event)) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: '未授权访问' })
    }
  }

  if (event.httpMethod === 'PUT') {
    try {
      const data = JSON.parse(event.body || '{}')
      const config = loadConfig()
      Object.assign(config, data)
      saveConfig(config)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, config })
      }
    } catch (err) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: err.message })
      }
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
}
