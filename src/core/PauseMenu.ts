import { RenderObject } from './RenderObject'
import { KeyboardEventManager } from './KeyboardEventManager'
import { BaseButton } from './BaseButton'
import { CANVAS, py } from './Config'
import { KeyCode } from './KeyCode'
import { Skin } from './Skin'
import { MainController } from './MainController'

export class PauseMenu extends RenderObject {
  private _keyboardEventManager = new KeyboardEventManager()
  private _resumeButton: BaseButton
  private _retryButton: BaseButton
  private _backButton: BaseButton

  private _alpha = 0

  private _backgroundColor = 'rgba(0, 0, 0, .85)'

  private _showRetry = true

  private _mainController: MainController

  private _currentSelect: null | 'Resume' | 'Retry' | 'Back' = null

  private _currentSelectIndex: number | null = null

  private readonly _currentMenus: Array<'Resume' | 'Retry' | 'Back'>

  private _failed = false

  set showRetry (show: boolean) {
    this._showRetry = show
  }

  private _showResume = true
  set showResume (show: boolean) {
    this._showResume = show
  }

  private _showBack = true
  set showBack (show: boolean) {
    this._showBack = show
  }

  constructor (container: HTMLElement, mainController: MainController) {
    super()
    this._mainController = mainController
    this._currentMenus = [
      'Resume',
      'Retry',
      'Back',
    ]

    const {
      base: { width, height, font, left, gap, fontSize, radius, color, top },
      resume,
      retry,
      back,
    } = Skin.config.pauseMenu.buttons

    let offsetY = top
    this._resumeButton = new BaseButton(container, {
      left,
      top: offsetY,
      width,
      height,
      font,
      fontSize,
      radius,
      color,
      background: resume.background,
      text: resume.text,
      hoverScale: 105,
    })
    offsetY += gap + height
    this._retryButton = new BaseButton(container, {
      left,
      top: offsetY,
      width,
      height,
      font,
      fontSize,
      radius,
      color,
      background: retry.background,
      text: retry.text,
      hoverScale: 105,
    })
    offsetY += gap + height
    this._backButton = new BaseButton(container, {
      left,
      top: offsetY,
      width,
      height,
      font,
      fontSize,
      radius,
      color,
      background: back.background,
      text: back.text,
      hoverScale: 105,
    })
  }

  changeOption (arrow: 'up' | 'down'): void {
    const menus = this._currentMenus

    if (!this._currentSelect) {
      if (arrow === 'up') {
        this._currentSelectIndex = menus.length - 1
      } else {
        this._currentSelectIndex = 0
      }
      this._currentSelect = menus[this._currentSelectIndex]
    } else {
      const delta = arrow === 'up' ? -1 : 1
      const index = (this._currentSelectIndex + delta) % menus.length
      this._currentSelectIndex = index < 0 ? index + menus.length : index
      this._currentSelect = menus[this._currentSelectIndex]
    }

    if (this._currentSelect === 'Resume' && !this._showResume) {
      this.changeOption(arrow)
    } else if (this._currentSelect === 'Retry' && !this._showRetry) {
      this.changeOption(arrow)
    } else if (this._currentSelect === 'Back' && !this._showBack) {
      this.changeOption(arrow)
    }
  }

  registerEvents (): void {
    const eventsMap = {
      onResume: async () => {
        await this._mainController.resume()
      },
      onRetry: async () => {
        await this._mainController.retry()
      },
      onBack: async () => {
        await this._mainController.backMain()
      },
    }
    const {
      onBack,
      onRetry,
      onResume,
    } = eventsMap
    this._showResume && this._resumeButton.registerEvents({ onClick: onResume })
    this._showRetry && this._retryButton.registerEvents({ onClick: onRetry })
    this._showBack && this._backButton.registerEvents({ onClick: onBack })

    this._keyboardEventManager.registerEvents({
      keydownEventList: {
        [KeyCode.ENTER]: () => {
          if (!this._currentSelect) {
            onResume?.()
          } else {
            eventsMap[`on${this._currentSelect}`]?.()
          }
        },
        [KeyCode.ARROW_UP]: () => {
          this.changeOption('up')
        },
        [KeyCode.ARROW_DOWN]: () => {
          this.changeOption('down')
        },
      },
    })
  }

  async show (failed: boolean = false): Promise<void> {
    this._failed = failed
    this._currentSelect = null
    this._currentSelectIndex = null
    await this.createTransition(0, 100, 800, 'easeOut', value => {
      this._alpha = value / 100
    })
  }

  async hide (): Promise<void> {
    this._failed = false
    this._currentSelect = null
    this._currentSelectIndex = null
    await this.createTransition(100, 0, 600, 'easeOut', value => {
      this._alpha = value / 100
    })
  }

  removeEvents (): void {
    this._keyboardEventManager.removeEvents()
    this._retryButton.removeEvents()
    this._backButton.removeEvents()
    this._resumeButton.removeEvents()
    // this._fullscreenButton.removeEvents()
  }

  updateTransition (time: number): void {
    super.updateTransition(time)
    this._resumeButton.updateTransition(time)
    this._retryButton.updateTransition(time)
    this._backButton.updateTransition(time)
  }

  render (context: CanvasRenderingContext2D): void {
    context.globalAlpha = this._alpha

    context.fillStyle = this._backgroundColor
    context.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
    this._showResume && this._resumeButton.render(context)
    this._showRetry && this._retryButton.render(context)
    this._showBack && this._backButton.render(context)

    context.globalAlpha = 1

    if (this._currentSelect) {
      this.renderArrow(context)
    }

    if (this._failed) {
      this.renderFailed(context)
    }
  }

  renderFailed (context: CanvasRenderingContext2D): void {
    context.save()
    RenderObject.drawText({
      context,
      x: 0,
      width: CANVAS.WIDTH,
      y: 0,
      height: py(600),
      text: 'Failed',
      font: `bold ${py(240)}px 微软雅黑`,
      color: 'rgba(60, 0, 0, 0.6)',
      textAlign: 'center',
      stroke: false,
      textBaseline: 'middle',
    })
    context.restore()
  }

  renderArrow (context: CanvasRenderingContext2D): void {
    const {
      buttons: {
        base: { height, gap, top },
      },
      arrow: { left, right, size, color },
    } = Skin.config.pauseMenu

    let offsetY = top
    offsetY += (gap + height) * this._currentSelectIndex

    context.save()
    RenderObject.drawArrow({
      size,
      context,
      color,
      x: left,
      y: offsetY,
      direction: 'right',
      stroke: false,
    })
    RenderObject.drawArrow({
      size,
      context,
      color,
      x: CANVAS.WIDTH - right,
      y: offsetY,
      direction: 'left',
      stroke: false,
    })
    context.restore()
  }
}
