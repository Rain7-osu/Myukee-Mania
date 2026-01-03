import { FileManager } from '../Managers/FileManager'

export class Beatmap {
  private readonly _artist: string
  private readonly _title: string
  private readonly _version: string
  private readonly _audioFilename: string
  private readonly _previewTime: number
  private readonly _beatmapId: string
  private readonly _creator: string
  private readonly _bg: string
  private readonly _filename: string
  private readonly _starRating: number
  private readonly _length: number
  private _image: HTMLImageElement
  private readonly _od: number
  private readonly _keys: number
  private readonly _hp: number
  private readonly _circles: number
  private readonly _sliders: number

  get id(): string {
    return this._beatmapId
  }

  get bgImage() {
    if (!this._image) {
      this._image = FileManager.loadImage(`./beatmaps/${this.bgName}`)
    }
    return this._image
  }

  get title() {
    return `${this._artist} - ${this._title} [${this._version}]`
  }

  get creator() {
    return this._creator
  }

  get songName(): string {
    return this._title
  }

  get description() {
    return `${this._artist} // ${this._creator}`
  }

  get difficulty() {
    return `${this._version} (${this._keys}K)`
  }

  get star() {
    return this._starRating
  }

  get bgName() {
    return this._bg
  }

  get filename() {
    return `./beatmaps/${this._filename}`
  }

  get audioFile() {
    return `./beatmaps/${this._audioFilename}`
  }

  get length() {
    return this._length
  }

  get previewTime(): number {
    return this._previewTime
  }

  get bpm() {
    return 180
  }

  get objectCount() {
    return this._circles + this._sliders
  }

  get keys() {
    return this._keys
  }

  get sliders() {
    return this._sliders
  }

  get circles() {
    return this._circles
  }

  get hp() {
    return this._hp
  }

  get od() {
    return this._od
  }

  private constructor({
    artist,
    title,
    version,
    audioFilename,
    previewTime,
    beatmapId,
    creator,
    bg,
    filename,
    starRating,
    length,
    hp,
    keys,
    od,
    circles,
    sliders,
  }: {
    artist: string
    title: string
    version: string
    audioFilename: string
    previewTime: number
    beatmapId: string
    creator: string
    bg: string
    filename: string
    starRating: number
    length: number
    hp: number
    keys: number
    od: number
    circles: number
    sliders: number
  }) {
    this._artist = artist
    this._title = title
    this._version = version
    this._audioFilename = audioFilename
    this._previewTime = previewTime
    this._beatmapId = beatmapId
    this._creator = creator
    this._bg = bg
    this._filename = filename
    this._starRating = starRating
    this._length = length
    this._od = od
    this._keys = keys
    this._hp = hp
    this._circles = circles
    this._sliders = sliders
  }

  static fromConfig(config: Record<string, Record<string, any>>): Beatmap | null {
    if (!config.Metadata) {
      return null
    }
    return new Beatmap({
      artist: config.Metadata.Artist,
      title: config.Metadata.Title,
      version: config.Metadata.Version,
      audioFilename: config.Path.Directory + '/' + config.General.AudioFilename,
      previewTime: config.General.PreviewTime,
      beatmapId: config.Metadata.BeatmapID,
      creator: config.Metadata.Creator,
      bg: config.Path.Directory + '/' + config.Path.BgName,
      filename: config.Path.Directory + '/' + config.Path.Filename,
      starRating: config.Difficulty.StarRating,
      length: config.Difficulty.Length,
      hp: config.Difficulty.HPDrainRate,
      keys: config.Difficulty.CircleSize,
      od: config.Difficulty.OverallDifficulty,
      circles: config.HitObjects.Circles,
      sliders: config.HitObjects.Sliders,
    })
  }
}
