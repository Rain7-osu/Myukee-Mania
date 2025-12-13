import { CANVAS, setCanvasSize } from './Config'
import { MainController } from './MainController'
import { $, bindClick, enterFullscreen } from './dom'
import { Skin } from './Skin'

function createStageCanvas (id = 'stage') {
  const canvas = document.createElement('canvas')
  canvas.id = id
  canvas.width = CANVAS.WIDTH
  canvas.height = CANVAS.HEIGHT
  return canvas
}

async function run () {
  setCanvasSize({
    WIDTH: window.screen.width,
    HEIGHT: window.screen.height,
  })
  Skin.loadConfig()
  const canvas = createStageCanvas('stage')
  const container = $('stage-container')
  container.append(canvas)
  await enterFullscreen()
  const entry = $('enter')
  const main = new MainController(canvas, entry)
  await main.start()
}

bindClick('enter', run)

// 跟踪鼠标移动
document.addEventListener('mousemove', (e) => {
  const cursor = $('custom-cursor')
  cursor.style.left = e.clientX + 'px'
  cursor.style.top = e.clientY + 'px'
})
