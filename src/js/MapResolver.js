import { convertNumberToNodeCol, NoteType } from './NoteType'

const LINE_WRAP_CHAR = '\r\n'
const GROUP_NAME_MATCH = /\[(\w+)]/

export class MapResolver {
  /**
   * @type {string}
   */
  #text

  /**
   * @type {Record<string, string[]>}
   */
  #groups

  /**
   * @type {string[]}
   */
  #lines

  constructor (text) {
    this.#text = text
    this.#groups = {}
    this.#lines = []
  }

  /**
   * @param text {string}
   * @return {Map}
   */
  static loadFromOsuManiaMap (text) {
    const resolver = new MapResolver(text)
    resolver.splitLine()
    resolver.splitByGroup()
    const notes = resolver.resolveNotes()
    const { offset, sectionLen } = resolver.resolveTiming()
    return new Map(notes, offset, sectionLen)
  }

  splitLine () {
    // filter empty line
    this.#lines = this.#text.split(LINE_WRAP_CHAR).filter(v => !!v)
  }

  /**
   * split by [GroupName], set groups by split result
   */
  splitByGroup () {
    let currentGroup = ''

    for (let i = 0; i < this.#lines.length; i++) {
      const currentLine = this.#lines[i]
      const matchArray = currentLine.match(GROUP_NAME_MATCH)

      if (matchArray && matchArray[1]) {
        currentGroup = matchArray[1]
        this.#groups[currentGroup] = []
      } else {
        if (currentGroup) {
          this.#groups[currentGroup].push(currentLine)
        }
      }
    }
  }

  /**
   * @return {Note[]}
   */
  resolveNotes () {
    /**
     * @type {Note[]}
     */
    const notes = []
    const hitObjects = this.#groups.HitObjects
    if (!hitObjects) {
      return notes
    }

    for (let i = 0; i < hitObjects.length; i++) {
      const {
        type,
        col,
        offset,
        end,
      } = this.resolveHitObject(hitObjects[i])
      const note = new Note(col, type, offset, end)
      notes.push(note)
    }
    return notes
  }

  resolveTiming() {
    const timingPoints = this.#groups.TimingPoints
    if (!timingPoints) {
      return 0
    }

    const [offset, sectionLen] = timingPoints[0].split(',')
    return {
      offset: +offset,
      // 4 beat == 1 section
      sectionLen: +sectionLen * 4
    }
  }

  /**
   * @param hitObjectStr
   * @return {{ col: NoteCol, offset: number, end: number, type: NoteType }}
   */
  resolveHitObject(hitObjectStr) {
    const hitObject = hitObjectStr.split(',')
    const [col, ___, offset, _, __, endStr] = hitObject
    const [end] = endStr.split(':')
    const endValue = +end

    let type = NoteType.Rice
    if (endValue > 1) {
      type = NoteType.LN
    }

    return {
      type,
      col: convertNumberToNodeCol(col),
      offset: +offset,
      end: +endValue,
    }
  }
}
