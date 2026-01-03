import { HitEffect } from '../Effects/HitEffect';
import { Skin } from '../Configs/Skin';

export class HitEffectManager {
  private _activeEffectList: HitEffect[] = []

  get effects(): HitEffect[] { return this._activeEffectList }

  private _keys = 4

  reset() {
    this._activeEffectList.forEach(effect => effect.reset())
  }

  set keys(keys: number) {
    this._keys = keys
    for (let i = 0; i < keys; i++) {
      this._activeEffectList[i] = new HitEffect(i, this.getEffectColor(i), this.getEffectStyle(i))
    }
  }

  getEffectColor(col: number): 'yellow' | 'red' | 'blue' {
    const effectSkin = Skin.config.stage.keys[`keys${this._keys}`].hitEffect
    return effectSkin[col]
  }

  getEffectStyle(col: number): { x: number; width: number } {
    const { width } = Skin.config.stage.keys[`keys${this._keys}`].note
    const center = Skin.config.stage.columnCenter
    const x = Math.floor(center - width * this._keys / 2) + col * width
    return { x, width }
  }

  update(time: number): void {
    this._activeEffectList.forEach(effect => effect.updateTransition(time))
  }

  pressKey(col: number): void {
    this._activeEffectList[col].push()
  }

  releaseKey(col: number): void {
    this._activeEffectList[col].shift()
  }
}
