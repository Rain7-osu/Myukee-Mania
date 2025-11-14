const FILE_READ_SUCCESS = 4

export class FileManager {
  /**
   * @type {File | null}
   */
  #file = null

  /**
   * @type {HTMLInputElement}
   */
  #inputEl = document.createElement('input')

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
   * @param accept {string}
   */
  constructor (accept = 'osu') {
    this.#inputEl.type = 'file'
    this.#inputEl.style.display = 'none'
    this.#inputEl.accept = accept
    this.#inputEl.multiple = false
    document.body.append(this.#inputEl)

    const _this = this
    this.#inputEl.onchange = function (e) {
      _this.#file = e.target.files[0]
    }
  }

  chooseFile() {
    this.#inputEl.click()
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

  destroy() {
    if (document.body.contains(this.#inputEl)) {
      document.body.removeChild(this.#inputEl)
    }
  }
}
