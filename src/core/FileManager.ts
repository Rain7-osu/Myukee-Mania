export class FileManager {
  private _file: File | null = null

  private _fileReader: FileReader = new FileReader()

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
      if (!this._file) {
        reject('please selected osu file first!')
        return
      }

      this._fileReader.readAsText(this._file)

      const _this = this
      this._fileReader.addEventListener('load', function (e) {
        if (e.type === 'load') {
          resolve(_this._fileReader.result as string)
        }
      })
    })
  }

  get file(): File | null {
    return this._file
  }
}
