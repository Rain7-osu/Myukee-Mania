import { CANVAS, setCanvasSize } from './Config'
import { MainController } from './MainController'
import { $, bindClick } from './dom'
import { Skin } from './Skin'
import { dev } from './dev'

dev.log('start...')

function createStageCanvas (id = 'stage') {
  const canvas = document.createElement('canvas')
  canvas.id = id
  canvas.width = CANVAS.WIDTH
  canvas.height = CANVAS.HEIGHT
  return canvas
}

function initCanvasSize () {
  const clientWidth = document.documentElement.clientWidth
  const clientHeight = document.documentElement.clientHeight
  const ratio = clientWidth / clientHeight
  let width = clientWidth
  let height = clientHeight
  if (ratio > 16 / 9) {
    width = clientHeight / 9 * 16
  } else if (ratio < 16 / 9) {
    height = clientWidth / 16 * 9
  }
  setCanvasSize({
    WIDTH: Math.max(1280, width),
    HEIGHT: Math.max(720, height),
    CLIENT_X: (clientWidth - width) / 2,
    CLIENT_Y: (clientHeight - height) / 2,
  })
}

async function run () {
  initCanvasSize()
  Skin.loadConfig()
  const canvas = createStageCanvas('stage')
  const container = $('stage-container')
  container.append(canvas)
  const entry = $('enter')
  const main = new MainController(canvas, entry)
  window.__MAIN__ = main
  await main.start()
}

bindClick('enter', run)

// 跟踪鼠标移动
document.addEventListener('mousemove', e => {
  const cursor = $('custom-cursor')
  cursor.style.left = e.clientX + 'px'
  cursor.style.top = e.clientY + 'px'
})

document.addEventListener('resize', e => {
  const clientWidth = document.documentElement.clientWidth
  const clientHeight = document.documentElement.clientHeight
  setCanvasSize({
    CLIENT_X: (clientWidth - CANVAS.WIDTH) / 2,
    CLIENT_Y: (clientHeight - CANVAS.HEIGHT) / 2,
  })
})
