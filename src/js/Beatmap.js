import { FileManager } from './FileManager.js'

export class Beatmap {
  /** @private */
  #artist
  /** @private */
  #title
  /** @private */
  #version
  /** @private */
  #audioFilename
  /** @private */
  #previewTime
  /** @private */
  #beatmapId
  /** @private */
  #creator
  /** @private */
  #bg
  /** @private */
  #filename
  /** @private */
  #starRating

  /**
   * @type {HTMLImageElement}
   */
  #image

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

  get songName () {
    return this.#title
  }

  get description () {
    return this.#artist + ' // ' + this.#creator
  }

  get difficulty () {
    return this.#version
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

  /**
   * @return {number}
   */
  get previewTime () {
    return this.#previewTime
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
      starRating: config.StarRating,
    })
  }
}
