const fs = require('fs')
const { promisify } = require('util')
const path = require('path')

const readFile = promisify(fs.readFile)
const exist = promisify(fs.exists)
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const writeFile = promisify(fs.writeFile)

const checkOsuFile = (filename) => {
  return typeof filename === 'string' && filename.endsWith('.osu')
}

/**
 * read beatmaps directory and output beatmaps general and meta to beatmaps.json
 * @return {Promise<void>}
 */
const main = async () => {
  try {
    const songsPath = path.resolve(__dirname, '../beatmaps')
    const pathExist = await exist(songsPath)
    if (!pathExist) {
      console.error('The beatmaps directory is not exist, please ensure the directory existed')
      return
    }

    const items = await readdir(songsPath)

    const beatmaps = []

    for (const item of items) {
      const itemPath = path.join(songsPath, item)
      const itemStat = await stat(itemPath)

      // 如果是文件夹，则读取下面所有的文件
      if (itemStat.isDirectory()) {
        const itemDirs = await readdir(itemPath)

        for (let subItem of itemDirs) {
          if (checkOsuFile(subItem)) {
            try {
              const subItemPath = path.join(itemPath, subItem)
              const fileContent = await readFile(subItemPath, 'utf-8')
              const config = resolveConfig(fileContent)
              config.Path = {
                Directory: path.basename(itemPath),
                BgName: config.Events.BgName,
                Filename: path.basename(subItemPath)
              }
              config && beatmaps.push(config)
            } catch (err) {
              console.error(`An error occurred when process ${subItem} because of`, err)
            }
          }
        }
      }
    }

    const targetPath = path.resolve(__dirname, '../beatmaps.json')
    await writeFile(targetPath, JSON.stringify(beatmaps))
  } catch (err) {
    console.error('An error occurred because:', err)
  }
}

const LINE_WRAP_CHAR = '\r\n'
const GROUP_NAME_MATCH = /\[(\w+)]/

/**
 * @param fileContent {string}
 * @return {{
 *   General: object;
 *   Metadata: object;
 * } | null}
 */
const resolveConfig = (fileContent) => {
  if (typeof fileContent !== 'string') {
    throw new Error('Expected string type fileContent')
  }

  const strings = fileContent.split(LINE_WRAP_CHAR)

  const res = {}
  let currentGroup = ''
  let hasMetadata = false
  for (let i = 0; i < strings.length; i++) {
    const currentLine = strings[i]
    const matchArray = currentLine.match(GROUP_NAME_MATCH)

    if (matchArray && typeof matchArray[1] === 'string') {
      currentGroup = matchArray[1]
      continue
    }
    if (['General', 'Metadata', 'Events'].includes(currentGroup)) {
      if (!res[currentGroup]) {
        res[currentGroup] = {}
      }
      if (currentGroup === 'Events') {
        const match = currentLine.match(/0,0,"(.+?)",0,0/)
        if (match && match[1]) {
          res[currentGroup].BgName = match[1]
        }
      } else {
        if (currentGroup === 'Metadata') {
          hasMetadata = true
        }

        const [key, value] = currentLine.split(':').map(v => v.trim())
        res[currentGroup][key] = value
      }
    }
  }

  if (!hasMetadata) {
    return null
  }

  return res
}

main().then(() => {
  console.info('Finished !')
})
