import { BaseButton } from './BaseButton';
import { Skin } from '../Configs/Skin';
import { CANVAS, py } from '../Configs/Config';
import { RenderObject } from '../Core/RenderObject';

type Scene = 'main' | 'result' | 'settings'

const TRANSITION_DURATION = 100

export class BackButton extends BaseButton {
  private readonly _defaultWidth: number = 200

  private _currentBackground: string = 'rgb(238, 52, 153, 1)'

  private _iconScale: number = 1

  private _translateY: number = 0

  private _scene: Scene = 'main'

  private _mainController: any

  constructor(container: HTMLCanvasElement, mainController: any) {
    const { buttons: { back } } = Skin.config.rankingBoard
    super(container, {
      width: back.width,
      height: back.height,
      left: back.left,
      top: back.top,
      text: back.text,
      background: back.background,
      hoverBackground: back.hoverBackground,
      color: back.color,
      font: back.font,
      fontSize: back.fontSize,
      radius: 0,
      hoverWidth: back.hoverWidth,
      hoverScale: 100,
      offsetPercentX: 0,
    })
    this._mainController = mainController
    this._currentBackground = back.background
    this._defaultWidth = back.width
  }

  set scene(scene: Scene) {
    this._scene = scene
  }

  get scene(): Scene {
    return this._scene
  }

  override async hover(): Promise<void> {
    this.hovered = true
    this.cancelAnimations()
    const { hoverWidth, width, hoverBackground, background } = this.style
    this.createAnimation(width, hoverWidth!, 'spring', (value: number) => this.style.width = value)
    await this.createTransition(background!, hoverBackground!, TRANSITION_DURATION, 'easeOut', color => this._currentBackground = color)
  }

  override async hoverOut(): Promise<void> {
    this.hovered = false
    this.cancelAnimations()
    const { width, background, hoverBackground } = this.style
    this.createAnimation(width, this._defaultWidth, 'spring', (value: number) => this.style.width = value)
    await this.createTransition(hoverBackground!, background!, TRANSITION_DURATION, 'easeOut',  color => this._currentBackground = color)
  }

  async hide(): Promise<void> {
    const { buttons: { back: { top } } } = Skin.config.rankingBoard
    const target = CANVAS.HEIGHT - top
    this.cancelTransitions()
    await this.createTransition(this._translateY, target, 100, 'easeOut', (value: number) => this._translateY = value)
  }

  async show(): Promise<void> {
    this.cancelTransitions()
    await this.createTransition(this._translateY, 0, 100, 'easeOut', (value: number) => this._translateY = value)
  }

  initEvents(): void {
    this.registerEvents({
      onClick: async () => {
        if (this.scene === 'result') {
          await this._mainController.fadeOut()
          this._mainController.hideRankingBoard()
          await this._mainController.backMain()
        } else if (this._scene === 'settings') {
          await this._mainController.hideSettingsPanel()
        } else {
          await this._mainController.exit()
        }
      },
    })
  }

  rect(): [number, number, number, number] {
    const [x, y, w, h] = super.rect()
    return [x, y + this._translateY, w, h]
  }

  render(context: CanvasRenderingContext2D): void {
    const [x, y, width, height] = this.rect()

    const {
      buttons: {
        back: {
          backDelta,
          shortPosition,
          background,
          hoverBackground,
          width: baseWidth,
          color,
          text,
          font,
          fontSize,
          iconSize,
        },
      },
    } = Skin.config.rankingBoard
    const moveDelta = (width - baseWidth) / 2

    // draw background
    context.fillStyle = this._currentBackground
    context.save()
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + width, y)
    context.lineTo(x + width - backDelta, y + height)
    context.lineTo(x, y + height)
    context.closePath()
    context.fill()
    context.restore()

    // draw light text background
    context.save()
    context.fillStyle = background
    context.beginPath()
    context.moveTo(x + shortPosition + moveDelta, y)
    context.lineTo(x + width, y)
    context.lineTo(x + width - backDelta, y + height)
    context.lineTo(x + shortPosition + moveDelta - backDelta, y + height)
    context.closePath()
    context.fill()
    context.restore()

    // draw center line shadow
    context.save()
    context.shadowBlur = 15
    context.shadowColor = hoverBackground
    context.fillStyle = hoverBackground
    context.beginPath()
    context.moveTo(x + shortPosition + moveDelta, y)
    context.lineTo(x + shortPosition + moveDelta + 2, y)
    context.lineTo(x + shortPosition + moveDelta - backDelta + 2, y + height)
    context.lineTo(x + shortPosition + moveDelta - backDelta, y + height)
    context.closePath()
    context.fill()
    context.restore()

    // draw back text
    context.save()
    RenderObject.drawText({
      context,
      text,
      x: x + shortPosition + moveDelta,
      y: y + py(5), // 稍微往下一点，视觉上更对齐
      width: width - shortPosition - moveDelta,
      height,
      font: `${fontSize}px ${font}`,
      color,
      stroke: false,
    })
    context.restore()

    const iconCenter = (shortPosition + moveDelta) / 2
    // draw icon
    context.save()
    context.shadowColor = '#666'
    context.shadowBlur = 5
    context.fillStyle = color
    context.beginPath()
    context.arc(x + iconCenter, y + height / 2, iconSize / 2, 0, Math.PI * 2)
    context.closePath()
    context.fill()
    context.shadowBlur = 0
    context.beginPath()
    context.moveTo(x + iconCenter + iconSize / 10, y + height / 2 - iconSize / 4)
    context.lineTo(x + iconCenter - iconSize / 4 + iconSize / 10, y + height / 2)
    context.lineTo(x + iconCenter + iconSize / 10, y + height / 2 + iconSize / 4)
    context.lineWidth = 5
    context.lineCap = 'round'
    context.strokeStyle = this._currentBackground
    context.scale(this._iconScale, this._iconScale)
    context.stroke()
    context.restore()
  }
}
