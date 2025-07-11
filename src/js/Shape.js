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
    throw new Error('Please implements this method')
  }
}
