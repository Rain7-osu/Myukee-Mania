import { BaseButton } from './BaseButton'
import { Skin } from './Skin'
import { rgba } from './utils'

export class BackButton extends BaseButton {
  #defaultWidth = 200

  #currentBackground = 'rgb(238, 52, 153, 1)'

  #iconScale = 1

  constructor (container) {
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
    this.#currentBackground = back.background
    this.#defaultWidth = back.width
  }

  /**
   * @override
   */
  async hover () {
    this.hovered = true
    this.cancelAnimations()
    const { hoverWidth, width, hoverBackground, background } = this.style()
    const [rh, gh, bh, ah] = rgba.toValues(hoverBackground)
    const [rb] = rgba.toValues(background)
    const [r, g, b, a] = rgba.toValues(this.#currentBackground)
    const startPercent = (r - rb) / (rh - rb)
    this.createAnimation(width, hoverWidth, 'spring', (value) => this.setStyle({ width: value }))
    await this.createTransitionPromisify(startPercent * 100, 100, 300 * startPercent, 'easeOut', (value) => {
      const progress = value / 100
      this.#currentBackground = rgba.format([
        r + (rh - r) * progress,
        g + (gh - g) * progress,
        b + (bh - b) * progress,
        a + (ah - a) * progress,
      ])
    })
  }

  /**
   * @override
   */
  async hoverOut () {
    this.hovered = false
    this.cancelAnimations()
    const { width, background, hoverBackground } = this.style()
    this.createAnimation(width, this.#defaultWidth, 'spring', (value) => this.setStyle({ width: value }))
    const [rh, gh, bh, ah] = rgba.toValues(this.#currentBackground)
    const [rb] = rgba.toValues(hoverBackground)
    const [r, g, b, a] = rgba.toValues(background)
    const startPercent = (rh - r) / (rb - r)
    await this.createTransitionPromisify(startPercent * 100, 100, 300 * startPercent, 'easeOut', (value) => {
      const progress = value / 100
      this.#currentBackground = rgba.format([
        rh - (rh - r) * progress,
        gh - (gh - g) * progress,
        bh - (bh - b) * progress,
        ah - (ah - a) * progress,
      ])
    })
  }

  render (context) {
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
          iconLeft,
        },
      },
    } = Skin.config.rankingBoard
    const moveDelta = (width - baseWidth) / 2

    // draw background
    context.fillStyle = this.#currentBackground
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
    context.globalCompositeOperation = 'destination-cover'
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
    context.globalCompositeOperation = 'destination-cover'
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
    context.globalCompositeOperation = 'destination-cover'
    this.drawText({
      context,
      text,
      x: x + shortPosition + moveDelta,
      y: y + 5, // 稍微往下一点，视觉上更对齐
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
    context.globalCompositeOperation = 'destination-cover'
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
    context.strokeStyle = this.#currentBackground
    context.scale(this.#iconScale, this.#iconScale)
    context.stroke()
    context.restore()
  }
}
