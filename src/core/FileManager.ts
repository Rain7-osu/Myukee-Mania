export class FileManager {
  #file: File | null = null

  #fileReader: FileReader = new FileReader()

  /**
   * use file in maps folder
   */
  static async loadMapFile(name: string): Promise<string> {
    const res = await fetch(name)
    return await res.text()
  }

  static loadImage(src: string): HTMLImageElement {
    const img = new Image()
    img.src = src
    return img
  }

  exportText(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.#file) {
        reject('please selected osu file first!')
        return
      }

      this.#fileReader.readAsText(this.#file)

      const _this = this
      this.#fileReader.addEventListener('load', function (e) {
        if (e.type === 'load') {
          resolve(_this.#fileReader.result as string)
        }
      })
    })
  }

  get file(): File | null {
    return this.#file
  }
}
