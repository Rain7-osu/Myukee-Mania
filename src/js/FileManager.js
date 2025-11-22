export class FileManager {
  /**
   * @type {File | null}
   */
  #file = null

  #fileReader = new FileReader()

  /**
   * use file in maps folder
   * @param name file name
   * @return Promise<string>
   */
  static async loadMapFile(name) {
    const res = await fetch(name)
    return await res.text()
  }

  /**
   * @param src {string}
   * @return {HTMLImageElement}
   */
  static loadImage(src) {
    const img = new Image()
    img.src = src
    return img
  }

  /**
   * @return Promise<string>
   */
  exportText() {
    return new Promise((resolve, reject) => {
      if (!this.#file) {
        reject('please selected osu file first!')
        return
      }

      this.#fileReader.readAsText(this.#file)

      const _this = this
      this.#fileReader.addEventListener('load', function (e) {
        if (e.type === 'load') {
          resolve(_this.#fileReader.result)
        }
      })
    })
  }

  get file() {
    return this.#file
  }
}
