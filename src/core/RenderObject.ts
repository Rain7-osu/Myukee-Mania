import { ActiveEffect } from './ActiveEffect'

export abstract class RenderObject extends ActiveEffect {
  private _display: boolean = true

  /**
   * x, y, w, h
   */
  protected clickArea: [number, number, number, number]

  get hotArea (): [number, number, number, number] {
    return this.clickArea
  }

  set display (value: boolean) { this._display = value }

  get display (): boolean { return this._display }

  public abstract render (context: CanvasRenderingContext2D): void

  updateEffect (now: number): void {
    if (this.display) {
      super.updateEffect(now)
    }
  }

  public static drawText ({
    context,
    text,
    x,
    y,
    width,
    height,
    font,
    color,
    textAlign = 'center',
    stroke,
    textBaseline = 'middle',
  }: {
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    font: string,
    color: string,
    textAlign?: 'center' | 'left' | 'right' | 'start' | 'end',
    stroke?: boolean,
    textBaseline?: 'alphabetic' | 'bottom' | 'hanging' | 'ideographic' | 'middle' | 'top',
  }): void {
    // 设置字体和颜色
    context.font = font
    context.fillStyle = color

    // 设置文本对齐方式为居中
    context.textAlign = textAlign
    context.textBaseline = textBaseline

    // 计算矩形中心点
    let left = x
    let top = y

    if (textAlign === 'center') {
      // 计算矩形中心点
      left = x + width / 2
      top = y + height / 2
    }

    // 绘制文本
    context.fillText(text, left, top)
    if (stroke) {
      context.strokeText(text, left, top)
    }
  }

  public static roundRect ({
    context,
    x,
    y,
    width,
    height,
    radius,
    fill,
    stroke,
  }: {
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number | { tl: number, tr: number, br: number, bl: number },
    fill: boolean,
    stroke: boolean,
  }): void {
    if (typeof radius === 'undefined') {
      radius = 5
    }
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius }
    } else {
      const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 }
      for (let side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side]
      }
    }

    context.beginPath()
    context.moveTo(x + radius.tl, y)
    context.lineTo(x + width - radius.tr, y)
    context.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
    context.lineTo(x + width, y + height - radius.br)
    context.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
    context.lineTo(x + radius.bl, y + height)
    context.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
    context.lineTo(x, y + radius.tl)
    context.quadraticCurveTo(x, y, x + radius.tl, y)
    context.closePath()

    if (fill) {
      context.fill()
    }
    if (stroke) {
      context.stroke()
    }
  }

  drawStar ({
    context: ctx,
    cx,
    cy,
    outerRadius,
    innerRadius,
    rotation,
    fillColor,
    strokeColor,
    strokeWidth,
  }: {
    context: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    outerRadius: number,
    innerRadius: number,
    rotation: number,
    fillColor: string,
    strokeColor: string,
    strokeWidth: number,
  }): void {
    // 开始绘制路径
    ctx.beginPath()

    // 计算五角星的10个顶点（5个外顶点和5个内顶点）
    for (let i = 0; i < 10; i++) {
      // 计算当前角度（弧度）
      const angle = rotation * Math.PI / 180 + i * Math.PI / 5
      // 交替使用外半径和内半径
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      // 计算顶点坐标
      const x = cx + radius * Math.cos(angle)
      const y = cy + radius * Math.sin(angle)

      // 如果是第一个点，移动到该点，否则画线到该点
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    // 闭合路径
    ctx.closePath()

    // 设置填充样式并填充
    ctx.fillStyle = fillColor
    ctx.fill()

    // 设置描边样式并描边
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = strokeColor
    ctx.stroke()
  }

  public static drawArrow ({
    size,
    context,
    color,
    strokeColor,
    stroke = true,
    x,
    y,
    direction,
    shadowColor,
  }: {
    size: number,
    context: CanvasRenderingContext2D,
    color: string,
    strokeColor?: string,
    stroke?: boolean,
    x: number,
    y: number,
    direction: 'right' | 'left',
    shadowColor?: string,
  }): void {
    context.beginPath()
    const quadSize = size / 4
    const halfSize = size / 2

    if (direction === 'left') {
      context.moveTo(x, y + quadSize)
      context.lineTo(x - halfSize, y + quadSize)
      context.lineTo(x - halfSize, y)
      context.lineTo(x - size, y + halfSize)
      context.lineTo(x - halfSize, y + size)
      context.lineTo(x - halfSize, y + quadSize * 3)
      context.lineTo(x, y + quadSize * 3)
      context.lineTo(x, y + quadSize)
      context.closePath()
    } else {
      context.moveTo(x, y + quadSize)
      context.lineTo(x + halfSize, y + quadSize)
      context.lineTo(x + halfSize, y)
      context.lineTo(x + size, y + halfSize)
      context.lineTo(x + halfSize, y + size)
      context.lineTo(x + halfSize, y + quadSize * 3)
      context.lineTo(x, y + quadSize * 3)
      context.lineTo(x, y + quadSize)
      context.closePath()
    }

    context.fillStyle = color
    context.strokeStyle = strokeColor

    if (shadowColor) {
      context.shadowBlur = 15
      context.shadowColor = shadowColor
    }

    context.fill()
    stroke && context.stroke()
  }
}

/**
 * @deprecated
 */
export abstract class OffsetRenderObject {
  private _offset: number
  private _end: number

  get offset (): number {
    return this._offset
  }

  set offset (value: number) {
    this._offset = value
  }

  get end (): number {
    return this._end
  }

  set end (value: number) {
    this._end = value
  }

  protected constructor (offset: number, end?: number) {
    this._offset = offset
    this._end = end ?? offset
  }

  public abstract render (context: CanvasRenderingContext2D, offsetY: number, endY?: number): void
}
