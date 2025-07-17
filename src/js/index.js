import { Game } from './Game'
import { CANVAS_HEIGHT, CANVAS_WIDTH, setCanvasHeight, setCanvasWidth } from './Config'

/**
 * @param id {string}
 */
function $(id) {
  return document.getElementById(id)
}

function bindClick (btnId, handler) {
  $(btnId).addEventListener('click', handler)
}

function main () {
  $('general-control').style.display = 'block'

  const container = $('stage-container')
  const game = Game.create()
  const canvas = document.createElement('canvas')
  canvas.id = 'stage'
  container.append(canvas)
  setCanvasWidth(document.documentElement.clientWidth)
  canvas.width = CANVAS_WIDTH
  setCanvasHeight(document.documentElement.clientHeight)
  canvas.height = CANVAS_HEIGHT


  function fullscreen () {
    setCanvasHeight(window.screen.height)
    canvas.height = CANVAS_HEIGHT
    canvas.width = CANVAS_WIDTH

    $('root').requestFullscreen({
      navigationUI: 'hide'
    })
  }

  async function start () {
    game.init()
    const selectedMap = $('map-select').value
    await game.selectMap(selectedMap)
    game.start()
  }

  function retry () {
    game.retry()
  }

  function resume () {
    game.resume()
  }

  function stop () {
    game.pause()
  }

  function increase () {
    game.increaseSpeed()
  }

  function decrease () {
    game.decreaseSpeed()
  }

  function exitFullscreen() {
    document.exitFullscreen()
  }

  function test() {
    game.init()
    game.testRender()
  }

  bindClick('start', start)
  bindClick('retry', retry)
  bindClick('stop', stop)
  bindClick('resume', resume)
  bindClick('test', test)
}

bindClick('enter', main)
