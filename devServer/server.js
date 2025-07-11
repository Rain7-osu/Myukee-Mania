const http = require('http')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const { Server: WebSocketServer } = require('ws')

const PORT = 3000
const SRC_DIR = path.join(__dirname, '../src')
const INDEX_HTML = path.join(SRC_DIR, 'index.html')

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ noServer: true })

// 日志颜色工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  // 前景色
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // 背景色
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
}

// 请求方法颜色映射
const methodColors = {
  GET: colors.green,
  POST: colors.yellow,
  PUT: colors.blue,
  DELETE: colors.red,
  PATCH: colors.magenta,
  HEAD: colors.cyan,
  OPTIONS: colors.white,
}

const server = http.createServer((req, res) => {
  // 获取请求方法对应的颜色
  const methodColor = methodColors[req.method] || colors.white

  // 记录请求日志（带颜色）
  console.log(`${colors.dim}[${new Date().toISOString()}]${colors.reset} ` + `${methodColor}${req.method.padEnd(7)}${colors.reset} ${req.url}`)

  if (req.url === '/') {
    serveFile(res, INDEX_HTML, 'text/html')
  } else {
    let realPath = path.join(SRC_DIR, req.url)
    if (path.extname(realPath) === '') {
      realPath += '.js'
    }

    // 检查文件是否存在
    fs.access(realPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.log(`  ${colors.red}→ 404 Not Found: ${realPath}${colors.reset}`)
        res.writeHead(404)
        res.end('File not found')
        return
      }

      serveFile(res, realPath, getContentType(realPath))
    })
  }
})

function serveFile (res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`  ${colors.red}!! Error reading file: ${err.message}${colors.reset}`)
      res.writeHead(500)
      return res.end('Internal server error')
    }

    // 记录服务文件日志
    const relPath = path.relative(SRC_DIR, filePath)
    console.log(`  ${colors.green}→ Serving:${colors.reset} ${relPath} ${colors.dim}(${contentType})${colors.reset}`)

    // 注入热更新脚本
    if (contentType === 'text/html') {
      data = data.toString().replace('</body>', `<script>
          const ws = new WebSocket('ws://localhost:${PORT}');
          ws.onmessage = () => {
            console.log('[DevServer] Reloading page...');
            location.reload();
          };
          console.log('[DevServer] Connected to live reload');
        </script></body>`)
    }

    let headers = { 'Content-Type': contentType }

    if (contentType === 'audio/mp3') {
      const stat = fs.statSync(filePath)
      headers['Content-Length'] = stat.size
    }

    res.writeHead(200, headers)
    res.end(data)
  })
}

function getContentType (filePath) {
  const ext = path.extname(filePath)
  const types = {
    '.html': 'text/html',
    '.htm': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.cjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.map': 'application/json',
    '.mp3': 'audio/mp3',
  }
  return types[ext] || 'text/plain'
}

// 监听文件变化
chokidar.watch(SRC_DIR, {
  ignored: /(^|[\/\\])\../, // 忽略隐藏文件
  ignoreInitial: true,
}).on('change', (filePath) => {
  const relPath = path.relative(SRC_DIR, filePath)
  console.log(`\n${colors.yellow}⚡ File changed: ${relPath}${colors.reset}`)

  // 通知所有客户端刷新
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send('reload')
    }
  })
})

// WebSocket 升级处理
server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req)
    console.log(`${colors.cyan}⚡ WebSocket client connected${colors.reset}`)
  })
})

// 启动服务器
server.listen(PORT, () => {
  console.log(`\n${colors.bgGreen.black} ======== DevServer Running ======== ${colors.reset}`)
  console.log(`${colors.green}➜ Local:   ${colors.bright}http://localhost:${PORT}/${colors.reset}`)
  console.log(`${colors.green}➜ Network: ${colors.bright}http://${getLocalIP()}:${PORT}/${colors.reset}`)
  console.log(`${colors.dim}Watching: ${SRC_DIR}${colors.reset}\n`)
})

// 获取本地IP地址
function getLocalIP () {
  const interfaces = require('os').networkInterfaces()
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address
      }
    }
  }
  return '127.0.0.1'
}

// 添加友好的退出提示
process.on('SIGINT', () => {
  console.log(`\n${colors.bgYellow.black} ======== DevServer Stopped ======== ${colors.reset}\n`)
  process.exit()
})
