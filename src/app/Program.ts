import { MainController } from './Controllers/MainController';
import {
  CANVAS,
  MAX_ASPECT_RATIO,
  MIN_ASPECT_RATIO,
  MIN_CANVAS_HEIGHT,
  MIN_CANVAS_WIDTH,
  setCanvasSize,
} from './Configs/Config';
import { Skin } from './Configs/Skin';
import { FrameSnapshot } from './Core/FrameSnapshot';
import { $, bindClick } from './_common/dom';

declare global {
  interface Window {
    __MAIN__: MainController
  }
}

export class Program {
  private _canvas: HTMLCanvasElement

  private _resize (): void {
    const clientWidth = document.documentElement.clientWidth
    const clientHeight = document.documentElement.clientHeight
    let selectedWidth = clientWidth
    let selectedHeight = clientHeight

    // 当屏幕高度小于最小高度或者屏幕宽度小于最小宽度时，CANVAS 大小设置为最小尺寸
    if (clientHeight < MIN_CANVAS_HEIGHT || clientWidth < MIN_CANVAS_WIDTH) {
      selectedWidth = MIN_CANVAS_WIDTH
      selectedHeight = MIN_CANVAS_HEIGHT
    } else {
      // 计算当前宽高比
      const aspectRatio = selectedWidth / selectedHeight

      // 宽高比最小为 4:3，即当宽高比小于 4:3 时，以宽为基准计算高度
      if (aspectRatio < MIN_ASPECT_RATIO) {
        selectedHeight = selectedWidth * (3 / 4)
      }
      // 宽高比最大为 16:7，即当宽高比大于 16:7 时，以高为基准计算宽度
      else if (aspectRatio > MAX_ASPECT_RATIO) {
        selectedWidth = selectedHeight * (16 / 7)
      }
      // 默认情况下，宽高为视口的宽高（已设置）
    }

    // 设置画布尺寸
    setCanvasSize({
      WIDTH: selectedWidth,
      HEIGHT: selectedHeight,
      CLIENT_X: (clientWidth - selectedWidth) / 2,
      CLIENT_Y: (clientHeight - selectedHeight) / 2,
    })

    this._canvas.width = CANVAS.WIDTH
    this._canvas.height = CANVAS.HEIGHT
  }

  /**
   * @private
   */
  _init () {
    const canvas = document.getElementById('stage') as HTMLCanvasElement
    canvas.style.display = 'none'
    this._canvas = canvas
    this._resize()
  }

  /**
   * @private
   */
  async _run () {
    this._init()
    Skin.loadConfig()
    FrameSnapshot.init(CANVAS.WIDTH, CANVAS.HEIGHT)

    const container = $('stage-container')!
    container.append(this._canvas)
    const entry = $('enter')!
    const main = new MainController(this._canvas, entry)
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
        const cursor = $('custom-cursor')!
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
