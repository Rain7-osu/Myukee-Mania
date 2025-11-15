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
                Filename: path.basename(subItemPath),
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
 * @typedef {{
 * col: number;
 * offset: number;
 * end: number;
 * type: (1|2);
 * IndividualStrain?: number;
 * OverallStrain?: number
 * }} HitObject
 */

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
  /** @type {HitObject[]} */
  const hitObjects = []

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
        key && (res[currentGroup][key] = value)
      }
    }

    // 解析 starRating
    if (currentGroup === 'HitObjects') {
      if (!currentLine) {
        continue
      }
      const hitObject = resolveHitObject(currentLine)
      hitObjects.push(hitObject)
    }
  }

  res.StarRating = resolveStarRating(hitObjects)

  if (!hasMetadata) {
    return null
  }

  return res
}

/**
 * @param currentLine {string}
 * @return {HitObject}
 */
const resolveHitObject = (currentLine) => {
  const hitObject = currentLine.split(',')
  const [col, ___, offset, _, __, endStr] = hitObject
  const [end] = endStr.split(':')
  let endValue = +end

  /**  @type {1 | 2} 1 tap, 2 hold */
  let type = 1
  if (endValue > 20) {
    type = 2
  } else {
    endValue = offset
  }

  return {
    type,
    col: convertNumberToNodeCol(col),
    offset: +offset,
    end: +endValue,
  }
}

/**
 * @see https://page.27345861.xyz/docs/mania_number/sr.html
 * @param hitObjects {HitObject[]}
 * @return number
 */
const resolveStarRating = (hitObjects) => {
  // 计算星数的主函数
  function calculateStarRating() {
    const hitObjects = parseHitObjects();
    if (!hitObjects || hitObjects.length === 0) {
      alert("请提供有效的谱面数据");
      return;
    }

    // 计算星数
    const starRating = calculateStarRatingInternal(hitObjects);

    // 显示结果
    document.getElementById('starRating').textContent = starRating.toFixed(2);

    // 更新音符列表和可视化
    updateNotesTable(hitObjects);
    updateVisualization(hitObjects);
  }

  // 解析输入的谱面数据
  function parseHitObjects() {
    const dataText = document.getElementById('hitObjectsData').value;
    const errorElement = document.getElementById('jsonError');

    try {
      const data = JSON.parse(dataText);
      if (!Array.isArray(data)) {
        throw new Error("数据必须是数组");
      }

      const hitObjects = [];
      for (const item of data) {
        if (!item.hasOwnProperty('offset') || !item.hasOwnProperty('end') ||
          !item.hasOwnProperty('type') || !item.hasOwnProperty('col')) {
          throw new Error("每个音符必须包含offset、end、type和col属性");
        }

        if (item.col < 0 || item.col > 3) {
          throw new Error("轨道编号(col)必须在0-3之间");
        }

        hitObjects.push(new HitObject(item.offset, item.end, item.type, item.col));
      }

      errorElement.textContent = "";
      return hitObjects;
    } catch (error) {
      errorElement.textContent = "JSON解析错误: " + error.message;
      return null;
    }
  }

  // 内部计算星数的函数
  function calculateStarRatingInternal(hitObjects) {
    if (hitObjects.length === 0) return 0.0;

    // 1. 按开始时间排序
    hitObjects.sort((a, b) => a.offset - b.offset);

    // 2. 计算每个note的难度
    calculateNoteStrains(hitObjects);

    // 3. 计算谱面难度
    const totalDifficulty = calculateOverallDifficulty(hitObjects);

    // 4. 转换为星数
    return totalDifficulty * 0.018;
  }

  // 计算每个note的IndividualStrain和OverallStrain
  function calculateNoteStrains(hitObjects) {
    const maxCol = 4; // 4个轨道 (0-3)

    // 初始化状态
    const heldUntil = new Array(maxCol).fill(0);
    const individualStrain = new Array(maxCol).fill(0.0);
    let overallStrain = 1.0;

    let lastTime = hitObjects[0].offset;

    // 为每个hitObject添加存储计算结果的属性
    for (let i = 0; i < hitObjects.length; i++) {
      const obj = hitObjects[i];

      // 计算时间差（转换为秒）
      const timeDiff = i > 0 ? (obj.offset - lastTime) / 1000.0 : 0;

      // 衰减之前的strain值
      for (let col = 0; col < maxCol; col++) {
        individualStrain[col] *= decayFactor(0.125, timeDiff);
      }
      overallStrain *= decayFactor(0.3, timeDiff);

      // 计算HoldFactor
      const holdFactor = calculateHoldFactor(obj, heldUntil);

      // 计算HoldAddition
      const holdAddition = calculateHoldAddition(obj, heldUntil);

      // 更新当前轨道的IndividualStrain
      individualStrain[obj.col] += 2.0 * holdFactor;

      // 更新OverallStrain
      overallStrain += (holdAddition + 1.0) * holdFactor;

      // 更新HeldUntil
      heldUntil[obj.col] = obj.end;

      // 存储计算结果到对象中
      obj.individualStrain = [...individualStrain];
      obj.overallStrain = overallStrain;
      obj.strainValue = individualStrain.reduce((sum, val) => sum + val, 0) + overallStrain;

      lastTime = obj.offset;
    }
  }

  // 计算HoldFactor
  function calculateHoldFactor(currentObj, heldUntil) {
    for (let i = 0; i < heldUntil.length; i++) {
      if (currentObj.end < heldUntil[i]) {
        return 1.25;
      }
    }
    return 1.0;
  }

  // 计算HoldAddition
  function calculateHoldAddition(currentObj, heldUntil) {
    let maxEligibleHeldUntil = 0;

    // 找到满足条件的最大heldUntil
    for (let i = 0; i < heldUntil.length; i++) {
      if (currentObj.offset < heldUntil[i] &&
        currentObj.end > heldUntil[i] &&
        heldUntil[i] > maxEligibleHeldUntil) {
        maxEligibleHeldUntil = heldUntil[i];
      }
    }

    if (maxEligibleHeldUntil === 0) {
      return 0.0;
    }

    // 时间差转换为秒
    const timeDiff = Math.abs(maxEligibleHeldUntil - currentObj.end) / 1000.0;

    // 计算HoldAddition
    try {
      return 1.0 / (1.0 + Math.exp(24.0 - timeDiff));
    } catch (e) {
      return 0.0;
    }
  }

  // 计算衰减因子
  function decayFactor(base, timeDiff) {
    return Math.pow(base, timeDiff);
  }

  // 计算谱面总体难度
  function calculateOverallDifficulty(hitObjects) {
    if (hitObjects.length === 0) return 0.0;

    // 确定时间范围
    const startTime = 0;
    const endTime = hitObjects[hitObjects.length - 1].offset;
    const intervalLength = 400; // 400ms间隔

    // 创建时间区间
    const intervals = [];
    let currentTime = startTime;
    while (currentTime <= endTime) {
      intervals.push(currentTime);
      currentTime += intervalLength;
    }

    const intervalDifficulties = [];

    // 为每个区间计算难度
    for (let i = 0; i < intervals.length; i++) {
      const intervalEnd = intervals[i] + intervalLength;

      // 找到区间开始前的最后一个note
      let lastNoteBefore = null;
      for (let j = hitObjects.length - 1; j >= 0; j--) {
        if (hitObjects[j].offset <= intervals[i]) {
          lastNoteBefore = hitObjects[j];
          break;
        }
      }

      // 计算默认难度值
      let defaultDifficulty;
      if (lastNoteBefore === null) {
        defaultDifficulty = 0.0;
      } else {
        const timeDiff = (intervalEnd - lastNoteBefore.offset) / 1000.0;

        // 计算轨道难度值
        let trackDifficulty = 0.0;
        for (let col = 0; col < 4; col++) {
          trackDifficulty += lastNoteBefore.individualStrain[col] * decayFactor(0.125, timeDiff);
        }

        // 计算总体难度值
        const overallDifficulty = lastNoteBefore.overallStrain * decayFactor(0.3, timeDiff);

        defaultDifficulty = trackDifficulty + overallDifficulty;
      }

      // 找到区间内的所有note
      const notesInInterval = hitObjects.filter(obj =>
        intervals[i] <= obj.offset && obj.offset < intervalEnd
      );

      // 计算区间最终难度值
      let intervalDifficulty;
      if (notesInInterval.length === 0) {
        intervalDifficulty = defaultDifficulty;
      } else {
        const maxNoteDifficulty = Math.max(...notesInInterval.map(obj => obj.strainValue));
        intervalDifficulty = Math.max(defaultDifficulty, maxNoteDifficulty);
      }

      intervalDifficulties.push(intervalDifficulty);
    }

    // 排序并加权求和
    intervalDifficulties.sort((a, b) => b - a);

    let totalDifficulty = 0.0;
    for (let i = 0; i < intervalDifficulties.length; i++) {
      totalDifficulty += intervalDifficulties[i] * Math.pow(0.95, i);
    }

    return totalDifficulty;
  }

  return calculateStarRatingInternal(hitObjects) / 3.2
}

function convertNumberToNodeCol (num) {
  const map = {
    64: 0,
    192: 1,
    320: 2,
    448: 3,
  }

  const value = +num
  return map[value] || 0
}

main().then(() => {
  console.info('Finished !')
})
