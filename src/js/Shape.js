/**
 * @abstract
 */
export class Shape {

  /**
   * @public
   * @abstract
   * @param context {CanvasRenderingContext2D}
   * @return void
   */
  render (context) {
    throw new Error('Please implements the render method')
  }

  /**
   * @param context {CanvasRenderingContext2D}
   * @param text {string}
   * @param x {number}
   * @param y {number}
   * @param maxWidth {number}
   * @param lineHeight {number}
   * @param row {number}
   */
  wrapText ({
    context,
    text,
    x,
    y,
    maxWidth,
    lineHeight,
    row = 2,
  }) {
    const words = text.split(' ')
    let line = ''
    let testLine = ''
    let lineCount = 0

    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + ' '
      const metrics = context.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && n > 0) {
        if (lineCount < row) {
          context.fillText(line, x, y)
          line = words[n] + ' '
          y += lineHeight
          lineCount++
        } else {
          line = line.trim() + '...'
          if (context.measureText(line).width > maxWidth) {
            // 如果加上省略号还是超长，需要进一步处理
            while (context.measureText(line + '...').width > maxWidth && line.length > 0) {
              line = line.substring(0, line.length - 1)
            }
            line += '...'
          }
          context.fillText(line, x, y)
          return
        }
      } else {
        line = testLine
      }
    }

    if (lineCount < 2) {
      context.fillText(line, x, y)
    }
  }

  /**
   * @param context {CanvasRenderingContext2D}
   * @param x {number}
   * @param y {number}
   * @param width {number}
   * @param height {number}
   * @param radius {number | object}
   * @param fill {string}
   * @param stroke {boolean}
   */
  roundRect ({
    context: ctx,
    x,
    y,
    width,
    height,
    radius,
    fill,
    stroke,
  }) {
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

    ctx.beginPath()
    ctx.moveTo(x + radius.tl, y)
    ctx.lineTo(x + width - radius.tr, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
    ctx.lineTo(x + width, y + height - radius.br)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
    ctx.lineTo(x + radius.bl, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
    ctx.lineTo(x, y + radius.tl)
    ctx.quadraticCurveTo(x, y, x + radius.tl, y)
    ctx.closePath()

    if (fill) {
      ctx.fill()
    }
    if (stroke) {
      ctx.stroke()
    }
  }
}

export class OffsetShape {
  /** @type {number} */
  #offset

  /** @type {number} */
  #end

  get offset () {
    return this.#offset
  }

  get end () {
    return this.#end
  }

  /**
   * @param offset {number}
   * @param [end] {number}
   */
  constructor (offset, end) {
    this.#offset = offset
    this.#end = end
  }

  /**
   * @public
   * @abstract
   * @override
   * @param context {CanvasRenderingContext2D}
   * @param offsetY {number}
   * @param [endY] {number}
   * @return void
   */
  render (context, offsetY, endY) {
    throw new Error('Please implements the render method')
  }
}
