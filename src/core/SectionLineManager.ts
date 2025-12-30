import { SectionLineEffect } from './SectionLineEffect'
import { RenderObject } from './RenderObject'

export class SectionLineManager extends RenderObject {
  #sectionLines: SectionLineEffect[] = []

  init(map: any, audio: any, width: number): void {
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

  render(context: CanvasRenderingContext2D): void {
    this.#sectionLines.forEach(line => line.render(context))
  }
}
