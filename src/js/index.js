import { Game } from './Game'
import { NOTE_WIDTH } from './Config'

function bindClick(btnId, handler) {
  document.getElementById(btnId).addEventListener('click', handler)
}

function main() {
  const container = document.getElementById('stage-container')
  const canvas = document.createElement('canvas')
  canvas.id = 'stage'
  canvas.height = window.screen.availHeight
  canvas.width = NOTE_WIDTH * 4
  container.append(canvas)

  const game = new Game()

  async function start () {
    await game.selectMap('02.2')
    game.start()
    // document.getElementById('map-text-view').value = game.mapText
  }

  function retry() {
    game.retry()
  }

  function resume() {
    game.resume()
  }

  function stop () {
    game.pause()
  }

  function increase() {
    game.increaseSpeed()
  }

  function decrease() {
    game.decreaseSpeed()
  }

  bindClick('start', start)
  bindClick('retry', retry)
  bindClick('stop', stop)
  bindClick('increase', increase)
  bindClick('decrease', decrease)
}

main()
