import { FileManager } from './FileManager'

export class Beatmap {
  /** @private */
  artist
  /** @private */
  title
  /** @private */
  version
  /** @private */
  audioFilename
  /** @private */
  previewTime
  /** @private */
  beatmapId
  /** @private */
  creator
  /** @private */
  bg
  /** @private */
  filename

  /**
   * @type {HTMLImageElement}
   */
  image

  get bgImage () {
    if (!this.image) {
      this.image = FileManager.loadImage(`./beatmaps/${this.bgName}`)
    }
    return this.image
  }

  get songName () {
    return this.title
  }

  get description () {
    return this.artist + ' // ' + this.creator
  }

  get difficulty () {
    return this.version + '(4K)'
  }

  get bgName () {
    return this.bg
  }

  get filename () {
    return this.filename
  }

  get audioFile () {
    return this.audioFilename
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
  }) {
    this.artist = artist
    this.title = title
    this.version = version
    this.audioFilename = audioFilename
    this.previewTime = previewTime
    this.beatmapId = beatmapId
    this.creator = creator
    this.bg = bg
    this.filename = filename
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
    })
  }
}
