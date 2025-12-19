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

async function run () {
  setCanvasSize({
    WIDTH: document.body.clientWidth,
    HEIGHT: document.body.clientHeight,
  })
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
document.addEventListener('mousemove', (e) => {
  const cursor = $('custom-cursor')
  cursor.style.left = e.clientX + 'px'
  cursor.style.top = e.clientY + 'px'
})
