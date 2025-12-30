import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'

export class BackgroundDarker extends RenderObject {
  #value: number = 0

  async setValue(value: number, duration: number = 2000): Promise<void> {
    const target = Math.max(Math.min(value, 100), 0)
    this.cancelTransitions()
    await this.createTransition(this.#value, target, duration, 'easeOut', (v: number) => this.#value = v)
  }

  reset(): void {
    this.#value = 0
  }

  render(context: CanvasRenderingContext2D): void {
    if (this.#value <= 0) {
      return
    }
    const backgroundDark = this.#value
    context.fillStyle = `rgba(0, 0, 0, ${backgroundDark / 100})`
    context.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }
}
