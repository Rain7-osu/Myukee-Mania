import { Beatmap } from './Beatmap.js'
import { StageController } from './StageController.js'
import { FileManager } from './FileManager.js'
import { MapResolver } from './MapResolver.js'
import { AudioManager } from './AudioManager.js'

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
   * @type {StageController}
   */
  controller

  /**
   * @param afterQuit {() => void}
   */
  init(afterQuit) {
    this.controller = new StageController('stage')
    this.controller.afterQuit = afterQuit
  }

  /**
   * @param beatmap {Beatmap}
   * @return {Promise<void>}
   */
  async selectMap(beatmap) {
    const mapFile = await FileManager.loadMapFile(beatmap.filename)
    const currentMap = MapResolver.loadFromOsuManiaMap(mapFile)
    const audio = AudioManager.getInstance()
    await audio.load(beatmap.audioFile)
    this.controller.init(currentMap, audio)
  }

  start() {
    this.controller.loopFrame()
    this.controller.start()
  }

  quit() {
    this.controller.quit()
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
