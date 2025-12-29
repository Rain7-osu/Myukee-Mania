import { RenderObject } from './RenderObject'
import { HitEffect } from './HitEffect'
import { Skin } from './Skin'

export class HitEffectManager {
  /**
   * @type {HitEffect[]}
   */
  #activeEffectList = []

  /**
   * @return {HitEffect[]}
   */
  get effects () { return this.#activeEffectList }

  #keys = 4

  reset () {
    this.#activeEffectList.forEach(effect => effect.reset())
  }

  /**
   * @param keys {number}
   */
  set keys (keys) {
    this.#keys = keys
    for (let i = 0; i < keys; i++) {
      this.#activeEffectList[i] = new HitEffect(i, this.getEffectColor(i), this.getEffectStyle(i))
    }
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

  update (time) {
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
