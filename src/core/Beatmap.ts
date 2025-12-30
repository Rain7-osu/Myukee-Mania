import { FileManager } from './FileManager'

export class Beatmap {
  #artist: string
  #title: string
  #version: string
  #audioFilename: string
  #previewTime: number
  #beatmapId: string
  #creator: string
  #bg: string
  #filename: string
  #starRating: number
  #length: number
  #image: HTMLImageElement
  #od: number
  #keys: number
  #hp: number
  #circles: number
  #sliders: number

  get id (): string {
    return this.#beatmapId
  }

  get bgImage () {
    if (!this.#image) {
      this.#image = FileManager.loadImage(`./beatmaps/${this.bgName}`)
    }
    return this.#image
  }

  get title () {
    return `${this.#artist} - ${this.#title} [${this.#version}]`
  }

  get creator () {
    return this.#creator
  }

  get songName (): string {
    return this.#title
  }

  get description () {
    return `${this.#artist} // ${this.#creator}`
  }

  get difficulty () {
    return `${this.#version} (${this.#keys}K)`
  }

  get star () {
    return this.#starRating
  }

  get bgName () {
    return this.#bg
  }

  get filename () {
    return `./beatmaps/${this.#filename}`
  }

  get audioFile () {
    return `./beatmaps/${this.#audioFilename}`
  }

  get length () {
    return this.#length
  }

  get previewTime (): number {
    return this.#previewTime
  }

  get bpm () {
    return 180
  }

  get objectCount () {
    return this.#circles + this.#sliders
  }

  get keys () {
    return this.#keys
  }

  get sliders () {
    return this.#sliders
  }

  get circles () {
    return this.#circles
  }

  get hp () {
    return this.#hp
  }

  get od () {
    return this.#od
  }

  constructor ({
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
    this.#artist = artist
    this.#title = title
    this.#version = version
    this.#audioFilename = audioFilename
    this.#previewTime = previewTime
    this.#beatmapId = beatmapId
    this.#creator = creator
    this.#bg = bg
    this.#filename = filename
    this.#starRating = starRating
    this.#length = length
    this.#od = od
    this.#keys = keys
    this.#hp = hp
    this.#circles = circles
    this.#sliders = sliders
  }

  static fromConfig (config: any): Beatmap | null {
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
