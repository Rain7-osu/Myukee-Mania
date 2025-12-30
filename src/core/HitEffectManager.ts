import { RenderObject } from './RenderObject'
import { HitEffect } from './HitEffect'
import { Skin } from './Skin'

export class HitEffectManager {
  #activeEffectList: HitEffect[] = []
  get effects (): HitEffect[] { return this.#activeEffectList }
  #keys = 4

  reset () {
    this.#activeEffectList.forEach(effect => effect.reset())
  }

  set keys (keys: number) {
    this.#keys = keys
    for (let i = 0; i < keys; i++) {
      this.#activeEffectList[i] = new HitEffect(i, this.getEffectColor(i), this.getEffectStyle(i))
    }
  }

  getEffectColor (col: number): 'yellow' | 'red' | 'blue' {
    const effectSkin = Skin.config.stage.keys[`keys${this.#keys}`].hitEffect
    return effectSkin[col]
  }

  getEffectStyle (col: number): { x: number; width: number } {
    const { width } = Skin.config.stage.keys[`keys${this.#keys}`].note
    const center = Skin.config.stage.columnCenter
    const x = Math.floor(center - width * this.#keys / 2) + col * width
    return { x, width }
  }

  update (time: number): void {
    this.#activeEffectList.forEach(effect => effect.updateTransition(time))
  }

  pressKey (col: number): void {
    this.#activeEffectList[col].push()
  }

  releaseKey (col: number): void {
    this.#activeEffectList[col].shift()
  }
}
