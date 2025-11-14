import { Beatmap } from './Beatmap'
import { Controller } from './Controller'
import { FileManager } from './FileManager'
import { MapResolver } from './MapResolver'
import { AudioManager } from './AudioManager'

export class Game {
  /** @type Game */
  static #singleInstance

  static create() {
    if (!Game.#singleInstance) {
      Game.#singleInstance = new Game()
    }
    return Game.#singleInstance
  }

  /**
   * @type {Controller}
   */
  controller

  init() {
    this.controller = new Controller('stage')
  }

  /**
   * @param beatmap {Beatmap}
   * @return {Promise<void>}
   */
  async selectMap(beatmap) {
    const mapFile = await FileManager.loadMapFile(`./beatmaps/${beatmap.filename}`)
    const currentMap = MapResolver.loadFromOsuManiaMap(mapFile)
    const audio = new AudioManager()
    await audio.load(`./beatmaps/${beatmap.audioFilename}`)
    this.controller.init(currentMap, audio)
  }

  start() {
    this.controller.loopFrame()
    this.controller.start()
  }

  retry() {
    this.controller.retry()
  }

  pause() {
    this.controller.pause()
  }

  resume() {
    this.controller.resume()
  }

  increaseSpeed() {
    this.controller.increaseSpeed()
  }

  decreaseSpeed() {
    this.controller.decreaseSpeed()
  }

  goTiming(timing) {
    this.controller.renderFrame(timing)
  }

  get map() {
    return this.controller.playingMap
  }

  get bgm() {
    return this.controller.audio
  }
}
