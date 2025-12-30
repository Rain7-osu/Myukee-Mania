import { convertNumberToNodeCol, NoteType } from './NoteType'
import { Note } from './Note'
import { PlayMap } from './PlayMap'
import { uniqNotes } from './utils'

const LINE_WRAP_CHAR = '\n'
const GROUP_NAME_MATCH = /\[(\w+)]/

export interface DifficultyResult {
  OverallDifficulty: number
  HPDrainRate: number
  CircleSize: number
}

export interface TimingPoint {
  offset: number
  beatLen: number
}

export interface HitObjectResult {
  type: NoteType
  col: number
  offset: number
  end: number
}

export class MapResolver {
  private _text: string

  private readonly _groups: Record<string, string[]>

  private _lines: string[]

  constructor(text: string) {
    this._text = text
    this._groups = {}
    this._lines = []
  }

  static loadFromOsuManiaMap(text: string): PlayMap {
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

  splitLine(): void {
    // filter empty line
    this._lines = this._text.split(LINE_WRAP_CHAR).filter(v => !!v)
  }

  /**
   * split by [GroupName], set groups by split result
   */
  splitByGroup(): void {
    let currentGroup = ''

    for (let i = 0; i < this._lines.length; i++) {
      const currentLine = this._lines[i]
      const matchArray = currentLine.match(GROUP_NAME_MATCH)

      if (matchArray && matchArray[1]) {
        currentGroup = matchArray[1]
        this._groups[currentGroup] = []
      } else {
        if (currentGroup) {
          this._groups[currentGroup].push(currentLine)
        }
      }
    }
  }

  resolveDifficulty(): DifficultyResult {
    const difficultyGroup = this._groups.Difficulty

    const result: Record<string, number> = {}

    difficultyGroup.forEach((line) => {
      const [name, value] = line.split(':')
      result[name] = +value
    })

    return result as DifficultyResult
  }

  resolveNotes(circleSize: number): Note[] {
    const notes: Note[] = []
    const hitObjects = this._groups.HitObjects
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

  resolveTiming(): TimingPoint[] {
    const timingPoints = this._groups.TimingPoints
    if (!timingPoints) {
      return []
    }

    const timingList: TimingPoint[] = []

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

  resolveHitObject(hitObjectStr: string, circleSize: number): HitObjectResult | null {
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
