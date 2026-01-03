import { ATIcon, DTIcon, EZIcon, FLIcon, RDIcon } from '../app/Icons'
import { FrameSnapshot } from '../app/Core/FrameSnapshot';

function main () {
  FrameSnapshot.init(window.screen.width, window.screen.height)

  const canvas = document.getElementById('icons') as HTMLCanvasElement
  canvas.width = document.documentElement.clientWidth
  canvas.height = document.documentElement.clientHeight
  const ctx = canvas.getContext('2d')

  const list = [
    ATIcon(),
    DTIcon(),
    EZIcon(),
    FLIcon(),
    RDIcon(),
  ]

  const SIZE = 128
  let x = 10, y = 10
  for (let i = 0; i < list.length; i++) {
    ctx.drawImage(list[i], x, y, SIZE, SIZE)
    x += SIZE + 10
    if (x + SIZE > window.screen.width) {
      x = 10
      y += SIZE + 10
    }
  }
}

main()
