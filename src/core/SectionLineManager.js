import { SectionLineEffect } from './SectionLineEffect.js'
import { RenderObject } from './RenderObject.js'

export class SectionLineManager extends RenderObject {
  /**
   * @type {SectionLineEffect[]}
   */
  #sectionLines = []

  /**
   * @param map {PlayMap}
   * @param audio {AudioManager}
   * @param width {number}
   */
  init(map, audio, width) {
    const timingList = map.timingList
    const duration = audio.duration

    let currentSection = -1
    for (let i = 0; i < timingList.length; i++) {
      const currentTiming = timingList[i]
      const startOffset = currentTiming.offset
      const sectionLen = currentTiming.beatLen * 4
      const endOffset = i + 1 >= timingList.length ? duration : timingList[i + 1].offset

      for (let j = 0; j + startOffset < endOffset; j += sectionLen) {
        currentSection = startOffset + j
        this.#sectionLines.push(new SectionLineEffect(currentSection, width))
      }
    }
  }

  render(context) {
    this.#sectionLines.forEach(line => line.render(context))
  }
}
