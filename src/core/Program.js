import { CANVAS, setCanvasSize, SUPPORTED_RATIO } from './Config'
import { Skin } from './Skin'
import { $, bindClick } from './dom'
import { MainController } from './MainController'
import { FrameSnapshot } from './FrameSnapshot.js'

export class Program {
  /**
   * @type {HTMLCanvasElement}
   */
  #canvas

  /**
   * @private
   */
  _resize () {
    const clientWidth = document.documentElement.clientWidth
    const clientHeight = document.documentElement.clientHeight

    // 找到最大的支持尺寸，该尺寸的宽高都小于等于客户端宽高
    let selectedWidth = 960 // 默认最小尺寸
    let selectedHeight = 540

    // 遍历支持的分辨率列表（从大到小）
    for (const [width, height] of SUPPORTED_RATIO) {
      if (width <= clientWidth && height <= clientHeight) {
        selectedWidth = width
        selectedHeight = height
        break // 找到第一个合适的最大尺寸
      }
    }

    // 设置画布尺寸
    setCanvasSize({
      WIDTH: selectedWidth,
      HEIGHT: selectedHeight,
      CLIENT_X: (clientWidth - selectedWidth) / 2,
      CLIENT_Y: (clientHeight - selectedHeight) / 2,
    })

    this.#canvas.width = CANVAS.WIDTH
    this.#canvas.height = CANVAS.HEIGHT
  }

  /**
   * @private
   */
  _init () {
    const canvas = document.getElementById('stage')
    canvas.style.display = 'none'
    this.#canvas = canvas
    this._resize()
  }

  /**
   * @private
   */
  async _run () {
    this._init()
    Skin.loadConfig()
    FrameSnapshot.init(CANVAS.WIDTH, CANVAS.HEIGHT)

    const container = $('stage-container')
    container.append(this.#canvas)
    const entry = $('enter')
    const main = new MainController(this.#canvas, entry)
    window.__MAIN__ = main
    await main.start()
  }

  /**
   * @private
   */
  _listen () {
    // 跟踪鼠标移动
    document.addEventListener('mousemove', e => {
      if (
        e.clientX >= CANVAS.CLIENT_X && e.clientX <= CANVAS.WIDTH + CANVAS.CLIENT_X
        && e.clientY >= CANVAS.CLIENT_Y && e.clientY <= CANVAS.CLIENT_Y + CANVAS.HEIGHT
      ) {
        const cursor = $('custom-cursor')
        cursor.style.left = e.clientX + 'px'
        cursor.style.top = e.clientY + 'px'
      }
    })
  }

  main () {
    bindClick('enter', this._run.bind(this))
    this._listen()
  }
}
