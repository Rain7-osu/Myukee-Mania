import { Shape } from './Shape'
import { KeyCode } from './KeyCode'
import { HitEffect } from './HitEffect'

export class HitEffectManager extends Shape {
  /**
   * @type {HitEffect[]}
   */
  #effectList = []

  /**
   * @type {Record<KeyCode, HitEffect | null>}
   */
  #activeEffectList = {
    [KeyCode.D]: null,
    [KeyCode.F]: null,
    [KeyCode.J]: null,
    [KeyCode.K]: null,
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  render (context) {
    for (let i = 0; i < this.#effectList.length; i++) {
      const effect = this.#effectList[i]
      const isAlive = effect.update()

      if (isAlive) {
        effect.render(context)
      } else {
        this.#effectList.splice(i, 1)
        const keys = Object.keys(this.#activeEffectList)
        keys.forEach((key) => {
          if (this.#activeEffectList[key] === effect) {
            this.#activeEffectList[key] = null
          }
        })
      }
    }
  }

  /**
   * @param effect {HitEffect}
   */
  push (effect) {
    this.#effectList.push(effect)
  }

  /**
   * @param key {string}
   * @return {boolean}
   */
  isValidKey(key) {
    return Object.values(KeyCode).includes(key.toLowerCase())
  }

  /**
   * @param key {KeyCode}
   * @return void
   */
  pressKey(key) {
    if (!this.isValidKey(key)) {
      return;
    }
    if (this.#activeEffectList[key]) {
      this.#activeEffectList[key].press()
    } else {
      const effect = new HitEffect(key)
      this.#activeEffectList[key] = effect
      this.#effectList.push(effect)
    }
  }

  /**
   * @param key {KeyCode}
   * @return void
   */
  releaseKey(key) {
    if (!this.isValidKey(key)) {
      return;
    }
    if (this.#activeEffectList[key]) {
      this.#activeEffectList[key].release()
    }
  }
}
