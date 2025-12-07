import { convertNumberToNodeCol, NoteType } from './NoteType'
import { Note } from './Note'
import { PlayMap } from './PlayMap'
import { uniqNotes } from './utils'

const LINE_WRAP_CHAR = '\n'
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
   * @return {PlayMap}
   */
  static loadFromOsuManiaMap (text) {
    const resolver = new MapResolver(text)
    resolver.splitLine()
    resolver.splitByGroup()
    const { OverallDifficulty, HPDrainRate, CircleSize } = resolver.resolveDifficulty()
    const notes = uniqNotes(resolver.resolveNotes(CircleSize))
    const timingList = resolver.resolveTiming()
    const length = notes[notes.length - 1].end

    return new PlayMap({
      notes, timingList, overallDifficulty: OverallDifficulty, hpDrainRate: HPDrainRate, length, keys: CircleSize,
    })
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

  resolveDifficulty () {
    const difficultyGroup = this.#groups.Difficulty

    /** @type {Record<string, number>} */
    const result = {}

    difficultyGroup.forEach((line) => {
      const [name, value] = line.split(':')
      result[name] = +value
    })

    return result
  }

  /**
   * @param {number} circleSize
   * @return {Note[]}
   */
  resolveNotes (circleSize) {
    /**
     * @type {Note[]}
     */
    const notes = []
    const hitObjects = this.#groups.HitObjects
    if (!hitObjects) {
      return notes
    }

    for (let i = 0; i < hitObjects.length; i++) {
      const hitObject = this.resolveHitObject(hitObjects[i], circleSize)
      if (!hitObject) {
        continue
      }
      const {
        type, col, offset, end,
      } = hitObject
      const note = new Note(col, type, offset, end, circleSize)
      notes.push(note)
    }
    return notes.sort((a, b) => a.offset - b.offset)
  }

  /**
   * @return TimingList
   */
  resolveTiming () {
    const timingPoints = this.#groups.TimingPoints
    if (!timingPoints) {
      return []
    }

    const timingList = []

    for (let i = 0; i < timingPoints.length; i++) {
      const [offset, beatLen] = timingPoints[i].split(',')

      if (beatLen > 0) {
        timingList.push({
          offset: Number(offset), beatLen: Number(beatLen),
        })
      }
    }

    return timingList
  }

  /**
   * @param hitObjectStr {string}
   * @param circleSize {number}
   * @return {{ col: number, offset: number, end: number, type: NoteType } | null}
   */
  resolveHitObject (hitObjectStr, circleSize) {
    const hitObject = hitObjectStr.split(',')
    const [col, ___, offset, _, __, endStr] = hitObject
    const [end] = endStr.split(':')
    let endValue = +end

    let type = NoteType.TAP
    if (endValue > 20) {
      type = NoteType.HOLD
    } else {
      endValue = +offset
    }

    const colV = convertNumberToNodeCol(col, circleSize)

    if (colV < 0) {
      return null
    }

    return {
      type, col: colV, offset: +offset, end: endValue,
    }
  }
}
