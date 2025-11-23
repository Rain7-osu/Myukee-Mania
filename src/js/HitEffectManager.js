import { Shape } from './Shape'
import { KeyCode } from './KeyCode'
import { HitEffect } from './HitEffect'
import { Skin } from './Skin'

export class HitEffectManager extends Shape {
  /**
   * @type {HitEffect[]}
   */
  #activeEffectList = []

  #keys = 4

  /**
   * @param keys {number}
   */
  set keys (keys) {
    this.#keys = keys
    for (let i = 0; i < keys; i++) {
      this.#activeEffectList[i] = new HitEffect(i, this.getEffectColor(i), this.getEffectStyle(i))
    }
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  render (context) {
    this.#activeEffectList.forEach(effect => effect.render(context))
  }

  getEffectColor (col) {
    const effectSkin = Skin.config.stage.keys[`keys${this.#keys}`].hitEffect
    return effectSkin[col]
  }

  getEffectStyle (col) {
    const { width } = Skin.config.stage.keys[`keys${this.#keys}`].note
    const center = Skin.config.stage.columnCenter
    const x = Math.floor(center - width * this.#keys / 2) + col * width
    return { x, width }
  }

  updateTransition (time) {
    super.updateTransition(time)
    this.#activeEffectList.forEach(effect => effect.updateTransition(time))
  }

  /**
   * @param col {number}
   * @return void
   */
  pressKey (col) {
    this.#activeEffectList[col].push()
  }

  /**
   * @param col {number}
   * @return void
   */
  releaseKey (col) {
    this.#activeEffectList[col].shift()
  }
}
