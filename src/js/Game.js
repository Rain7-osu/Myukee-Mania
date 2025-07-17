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

  #stage

  init() {
    this.#stage = new Controller('stage')
    this.#stage.loopFrame()
  }

  async selectMap(mapName) {
    const mapFile = await FileManager.loadMapFile(`${mapName}.osu`)
    const currentMap = MapResolver.loadFromOsuManiaMap(mapFile)
    const audio = new AudioManager()
    await audio.load(`${mapName}.mp3`)
    this.#stage.init(currentMap, audio)
  }

  start() {
    this.#stage.start()
  }

  retry() {
    this.#stage.retry()
  }

  pause() {
    this.#stage.pause()
  }

  resume() {
    this.#stage.resume()
  }

  increaseSpeed() {
    this.#stage.increaseSpeed()
  }

  decreaseSpeed() {
    this.#stage.decreaseSpeed()
  }

  goTiming(timing) {
    this.#stage.renderFrame(timing)
  }

  get map() {
    return this.#stage.playingMap
  }

  get bgm() {
    return this.#stage.audio
  }

  testRender() {
    this.#stage.testRender()
  }
}
