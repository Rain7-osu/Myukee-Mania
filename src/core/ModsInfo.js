import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'
import { Mod } from './ModsPanel'
import { px, py } from './Config'

/**
 * @type {Record<Mod, string>}
 */
export const ModNameMap = {
  [Mod.DT]: 'DoubleTime',
  [Mod.RD]: 'Random',
  [Mod.SD]: 'SuddenDeath',
  [Mod.NF]: 'NoFail',
  [Mod.EZ]: 'Easy',
  [Mod.HT]: 'HalfTime',
  [Mod.NC]: 'Nightcore',
  [Mod.FL]: 'Flashlight',
  [Mod.AT]: 'Auto',
  [Mod.HD]: 'Hidden',
  [Mod.HR]: 'HardRock',
  [Mod.MR]: 'Mirror',
  [Mod.PF]: 'Perfect',
  [Mod.FD]: 'FadeIn',
}

export class ModsInfoEffect extends RenderObject {
  /**
   * @type {Mod[]}
   */
  #mods

  /**
   * @param mods {Mod[]}
   */
  constructor (mods) {
    super()
    this.#mods = mods
  }

  render (context) {
    const TOP = CANVAS.HEIGHT - py(162)
    const LEFT = px(160)
    const text = this.#mods.map(mod => ModNameMap[mod]).join(',')
    context.save()
    context.font = `${py(64)}px 微软雅黑`
    context.fillStyle = 'rgba(255, 255, 255, 0.4)'
    context.textBaseline = 'bottom'
    context.fillText(text, LEFT, TOP)
    context.restore()
  }
}
