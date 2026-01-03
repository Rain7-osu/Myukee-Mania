import { SectionLineEffect } from '../Effects/SectionLineEffect';

export class SectionLineManager {
  private _sectionLines: SectionLineEffect[] = []

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
        this._sectionLines.push(new SectionLineEffect(currentSection, width))
      }
    }
  }

  get effects(): SectionLineEffect[] {
    return this._sectionLines
  }
}
