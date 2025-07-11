import { Stage } from './Stage'
import { FileManager } from './FileManager'
import { MapResolver } from './MapResolver'
import { AudioManager } from './AudioManager'

export class Game {
  #stage = new Stage('stage')

  mapText

  async selectMap(mapName) {
    const mapFile = await FileManager.use(`${mapName}.osu`)
    const currentMap = MapResolver.loadFromOsuManiaMap(mapFile)
    // TODO TEST DELETE
    this.mapText = mapFile

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
}
