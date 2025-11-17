import { CANVAS, setCanvasSize } from './Config'
import { MainManager } from './MainManager'

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
  canvas.width = CANVAS.WIDTH
  canvas.height = CANVAS.HEIGHT
  return canvas
}

function fullscreen () {
  setCanvasSize({
    WIDTH: window.screen.width,
    HEIGHT: window.screen.height,
  })

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
  // main.init()
}

bindClick('enter', run)
