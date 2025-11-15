import { convertNumberToNodeCol, NoteType } from './NoteType.js'
import { Note } from './Note.js'
import { PlayMap } from './PlayMap.js'

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
   * @return {PlayMap}
   */
  static loadFromOsuManiaMap (text) {
    const resolver = new MapResolver(text)
    resolver.splitLine()
    resolver.splitByGroup()
    const notes = resolver.resolveNotes()
    const timingList = resolver.resolveTiming()
    const { overallDifficulty, hpDrainRate } = resolver.resolveDifficulty()

    return new PlayMap({
      notes,
      timingList,
      overallDifficulty,
      hpDrainRate,
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
      if (name === 'OverallDifficulty') {
        result.overallDifficulty = Number(value)
      } else if (name === 'HPDrainRate') {
        result.hpDrainRate = Number(value)
      }
    })

    return result
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
          offset: Number(offset),
          beatLen: Number(beatLen),
        })
      }
    }

    return timingList
  }

  /**
   * @param hitObjectStr
   * @return {{ col: NoteCol, offset: number, end: number, type: NoteType }}
   */
  resolveHitObject (hitObjectStr) {
    const hitObject = hitObjectStr.split(',')
    const [col, ___, offset, _, __, endStr] = hitObject
    const [end] = endStr.split(':')
    const endValue = +end

    let type = NoteType.TAP
    if (endValue > 20) {
      type = NoteType.HOLD
    }

    return {
      type,
      col: convertNumberToNodeCol(col),
      offset: +offset,
      end: +endValue,
    }
  }

  resolveGeneral () {
    const generals = this.#groups.General

    return generals.reduce((prev, current) => {
      const [key, value] = current.split(':').map((v) => v.trim())
      return {
        ...prev,
        key: value,
      };
    }, {});
  }
}
