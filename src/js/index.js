import { CANVAS_HEIGHT, CANVAS_WIDTH, setCanvasHeight, setCanvasWidth } from './Config.js'
import { MainManager } from './MainManager.js'

/**
 * @param id {string}
 */
function $ (id) {
  return document.getElementById(id)
}

function bindClick (btnId, handler) {
  $(btnId).addEventListener('click', handler)
}

function createStageCanvas (id = 'stage') {
  const canvas = document.createElement('canvas')
  canvas.id = id
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  return canvas
}

function fullscreen () {
  setCanvasHeight(window.screen.height)
  setCanvasWidth(window.screen.width)

  $('root').requestFullscreen({
    navigationUI: 'hide',
  })
}

async function run () {
  fullscreen()
  const canvas = createStageCanvas('stage')
  const container = $('stage-container')
  container.append(canvas)
  const main = new MainManager(canvas)
  await main.start()
  main.init()
  main.loopFrame()
}

bindClick('enter', run)
