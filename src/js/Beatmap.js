import { FileManager } from './FileManager'

export class Beatmap {
  /**
   * @type {string}
   */
  #artist
  /**
   * @type {string}
   */
  #title
  /**
   * @type {string}
   */
  #version
  /**
   * @type {string}
   */
  #audioFilename
  /**
   * @type {number}
   */
  #previewTime
  /**
   * @type {string}
   */
  #beatmapId
  /**
   * @type {string}
   */
  #creator
  /**
   * @type {string}
   */
  #bg
  /**
   * @type {string}
   */
  #filename
  /**
   * @type {number}
   */
  #starRating
  /**
   * @type {number}
   */
  #length
  /**
   * @type {HTMLImageElement}
   */
  #image
  /**
   * @type {number}
   */
  #od
  /**
   * @type {number}
   */
  #keys
  /**
   * @type {number}
   */
  #hp
  /**
   * @type {number}
   */
  #circles
  /**
   * @type {number}
   */
  #sliders

  /**
   * @return {string}
   */
  get id () {
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

  /**
   * @return {string}
   */
  get songName () {
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

  /**
   * @return {number}
   */
  get previewTime () {
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

  /**
   * @param artist {string}
   * @param title {string}
   * @param version {string}
   * @param audioFilename {string}
   * @param previewTime {number}
   * @param beatmapId {string}
   * @param creator {string}
   * @param bg {string}
   * @param filename {string}
   * @param starRating {number}
   * @param length {number}
   * @param hp {number}
   * @param keys {number}
   * @param od {number}
   * @param circles {number}
   * @param sliders {number}
   */
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

  /**
   * @param config {any}
   */
  static fromConfig (config) {
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
