// Netlify Function: Stats
// 访问统计和导出计数
const fs = require('fs')
const path = require('path')

const STATS_FILE = path.join('/tmp', 'stats.json')

function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'))
    }
  } catch {}
  return { views: 0, exports: 0, topTemplates: [], templateUsage: {} }
}

function saveStats(stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2))
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers }
  }

  try {
    // POST - 记录事件
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const stats = loadStats()

      if (body.type === 'view') {
        stats.views++
      } else if (body.type === 'export') {
        stats.exports++
        // 记录模板使用
        if (body.templateId) {
          stats.templateUsage = stats.templateUsage || {}
          stats.templateUsage[body.templateId] = (stats.templateUsage[body.templateId] || 0) + 1
        }
      }

      // 更新热门排行
      const usage = stats.templateUsage || {}
      stats.topTemplates = Object.entries(usage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, count]) => ({ id, count }))

      saveStats(stats)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      }
    }

    // GET - 获取统计数据
    if (event.httpMethod === 'GET') {
      const stats = loadStats()
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stats)
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
