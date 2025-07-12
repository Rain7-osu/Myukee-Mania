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
}

export class OffsetShape {
  /** @type {number} */
  #offset

  /** @type {number} */
  #end

  get offset() {
    return this.#offset
  }

  get end() {
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
   * @param context {CanvasRenderingContext2D}
   * @param offsetY {number}
   * @param [endY] {number}
   * @return void
   */
  render (context, offsetY, endY) {
    throw new Error('Please implements the render method')
  }
}
