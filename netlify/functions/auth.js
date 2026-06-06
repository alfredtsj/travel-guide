// Netlify Function: Auth
// 管理员登录验证和密码修改
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'travel2024'
const JWT_SECRET = process.env.JWT_SECRET || 'guide-poster-secret-key-2024'

// 简易 JWT 生成（生产环境建议使用 jsonwebtoken 库）
function createToken() {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 // 24小时
  }))
  const signature = btoa(JWT_SECRET + '.' + payload)
  return `${header}.${payload}.${signature}`
}

function verifyToken(token) {
  try {
    const parts = token.replace('Bearer ', '').split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(atob(parts[1]))
    return payload.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers }
  }

  // POST - 登录
  if (event.httpMethod === 'POST') {
    try {
      const { password } = JSON.parse(event.body || '{}')
      if (password === ADMIN_PASSWORD) {
        const token = createToken()
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ token, success: true })
        }
      }
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: '密码错误', success: false })
      }
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '请求格式错误' })
      }
    }
  }

  // PUT - 修改密码
  if (event.httpMethod === 'PUT') {
    const auth = event.headers.authorization || ''
    if (!verifyToken(auth)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: '未授权' })
      }
    }
    try {
      const { oldPassword, newPassword } = JSON.parse(event.body || '{}')
      if (oldPassword !== ADMIN_PASSWORD) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '旧密码错误', success: false })
        }
      }
      // Note: In serverless, we can't persist env vars.
      // In production, use a database or Netlify env vars with build hooks.
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '密码修改请求已记录。生产环境请通过 Netlify 环境变量修改 ADMIN_PASSWORD',
          hint: '请前往 Netlify Dashboard → Site settings → Environment variables → 修改 ADMIN_PASSWORD'
        })
      }
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: '请求格式错误' }) }
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
}
