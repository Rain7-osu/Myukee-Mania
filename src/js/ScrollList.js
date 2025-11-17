import { Shape } from './Shape'
import { ScrollItem } from './ScrollItem'
import { CANVAS } from './Config'
import { warn } from './dev'

/**
 * @typedef {{
 *   friction: number;
 *   minVelocity: number;
 *   maxVelocity: number;
 *   initialScrollY: number;
 *   speedPerFrame: number;
 *   minDeltaScrollY: number;
 *   maxDeltaScrollY: number;
 * }} ListConfig
 */

/**
 * @template {ScrollItem} T
 * @abstract
 */
export class ScrollList extends Shape {
  /**
   * @param listConfig {Partial<ListConfig>}
   */
  constructor (listConfig) {
    super()
    this.#listConfig = {
      friction: 0.95, // 摩擦系数
      minVelocity: 0.1, // 最小速度阈值
      maxVelocity: 75, // 最大速度限制
      initialScrollY: 0,
      minDeltaScrollY: CANVAS.HEIGHT / 2, // 允许scrollY 额外减少的值，第一个元素的 offsetY 减去这个值 > 0 时，将会渲染
      maxDeltaScrollY: CANVAS.HEIGHT / 2, // 允许 scrollY 额外增加的值，最后一个元素的 offsetY 加上这个值 < CANVAS.HEIGHT 时，将会渲染
      ...listConfig,
    }
    this.#scrollY = this.#listConfig.initialScrollY
    this.#status = {
      isInertiaScrolling: false,
      lastScrollTime: 0,
      lastScrollY: this.#listConfig.initialScrollY,
      wheelEvent: null,
    }
  }

  /**
   * @description scrollY：
   *         - 当前列表的纵向滚动值，当为 0 的时候，第一个列表项的 offsetY 将是 0
   *         - 当为 -400 的时候，第一个列表项的 offsetY 是 400
   *         - 当为 400 的时候，第一个列表项的 offsetY 是 -400
   *         - 每次滚轮滚动时，scrollY += wheelEvent.deltaY
   *         - 轮向下滚动时，e.deltaY 为正值，scrollY + 正值，列表向下滚动，列表项向上运动
   *         - 滚动向上滚动时，e.deltaY 为负值，scrollY + 负值，列表向上滚动，列表项向下运动
   * @type {number}
   */
  #scrollY = 0

  #scrollSpeed = 0

  /**
   * @param scrollY {number}
   */
  set scrollY (scrollY) {
    console.log('set y', scrollY)
    this.#scrollY = scrollY
  }

  /**
   * @param speed {number}
   */
  set scrollSpeed (speed) {
    this.#scrollSpeed = speed
  }

  /**
   * @type {ListConfig}
   */
  #listConfig

  /**
   * @type {{
   *   isInertiaScrolling: boolean;
   *   lastScrollTime: number;
   *   lastScrollY: number;
   *   wheelEvent: HTMLElementEventMap['canvas'] | null;
   * }}
   */
  #status

  /**
   * @type number
   */
  #maxScrollY

  /**
   * @type number
   */
  #minScrollY

  /**
   * @type {T | null}
   */
  #hoveredItem

  /**
   * @type {{
   *   onClick: (item: T) => void;
   * }}
   */
  #eventMaps = { onClick: () => {} }

  /**
   * @private
   * @return {{maxScrollY: number, minScrollY: number}}
   */
  calcScrollYConfig () {
    const listItems = this.listItems()
    if (typeof this.#maxScrollY === 'undefined') {
      // 临时先用列表项 + gap 直接计算出来
      // 后续要考虑 hover 的情况
      this.#maxScrollY = listItems.reduce((prev, current) => {
        const style = current.currentStyle
        return prev + style.marginTop + style.height + style.marginBottom
      }, 0) - this.#listConfig.maxDeltaScrollY
    }

    if (typeof this.#minScrollY === 'undefined') {
      this.#minScrollY = -this.#listConfig.minDeltaScrollY
    }

    return {
      maxScrollY: this.#maxScrollY,
      minScrollY: this.#minScrollY,
    }
  }

  /**
   * @private
   * @param e {HTMLElementEventMap['canvas']}
   * @return void
   */
  handleMouseWheel (e) {
    e.preventDefault()
    const currentScrollY = this.#scrollY
    const { maxScrollY, minScrollY } = this.calcScrollYConfig()
    const { maxVelocity } = this.#listConfig
    const { lastScrollY, lastScrollTime } = this.#status
    const currentTime = performance.now()

    if (lastScrollTime > 0) {
      const timeDiff = currentTime - lastScrollTime
      const scrollDiff = currentScrollY - lastScrollY
      // 计算每帧速度
      this.#scrollSpeed = (scrollDiff / timeDiff) * 16.7

      if (Math.abs(this.#scrollSpeed) > maxVelocity) {
        this.#scrollSpeed = this.#scrollSpeed > 0 ? maxVelocity : -maxVelocity
        this.#status.wheelEvent = e
      }
    }

    this.#status.lastScrollTime = currentTime
    this.#status.lastScrollY = this.#scrollY
    this.#scrollY += e.deltaY * 0.5
    this.#scrollY = Math.max(Math.min(this.#scrollY, maxScrollY), minScrollY)
    this.handleMouseMove(e)
  }

  /**
   * @private
   * @param e {HTMLElementEventMap['canvas']}
   * @return void
   */
  handleMouseMove (e) {
    e.preventDefault()

    const x = e.clientX
    const y = e.clientY
    const items = this.listItems()
    for (let i = 0; i < items.length; i++) {
      const { left, top, width, height } = items[i].rect()
      const hovered = x > left && x < left + width && y > top && y < top + height
      items[i].hovered = hovered
      if (hovered) {
        if (this.#hoveredItem !== items[i]) {
          this.#hoveredItem && (this.#hoveredItem.hovered = false)
          this.#hoveredItem = items[i]
        }
        return
      }
    }
    this.#hoveredItem && (this.#hoveredItem.hovered = false)
    this.#hoveredItem = null
  }

  /**
   * @param e {HTMLElementEventMap['canvas']}
   * @return void
   */
  handleClick (e) {
    e.preventDefault()
    if (!this.#hoveredItem) {
      return
    }

    this.#eventMaps.onClick(this.#hoveredItem)
  }

  /**
   * @return void
   */
  inertiaScroll () {
    if (this.#isWheeling) {
      return
    }
    const { minVelocity, friction } = this.#listConfig
    const { wheelEvent } = this.#status
    const { maxScrollY, minScrollY } = this.calcScrollYConfig()
    const scrollSpeed = this.#scrollSpeed
    const scrollY = this.#scrollY

    if (Math.abs(scrollSpeed) > minVelocity) {
      this.#status.isInertiaScrolling = true
      this.#scrollY += scrollSpeed
      wheelEvent && this.handleMouseMove(wheelEvent)
      this.#scrollSpeed *= friction

      if (scrollY < minScrollY) {
        this.#scrollY = minScrollY
        this.#scrollSpeed = 0
      } else if (scrollY > maxScrollY) {
        this.#scrollY = maxScrollY
        this.#scrollSpeed = 0
      }
    } else {
      this.#status.isInertiaScrolling = false
      this.#scrollSpeed = 0
    }
  }

  /**
   * @type {() => void}
   */
  #removeEventsHandler = () => {}

  #hasRegistered = false

  #wheelTimeout = -1

  #isWheeling = false

  /**
   * @param canvas {HTMLCanvasElement}
   * @param eventMaps {{
   *   onClick: (item: ScrollItem) => void;
   * }}
   */
  listenEvents (canvas, eventMaps) {
    if (this.#hasRegistered) {
      return this.#removeEventsHandler
    }

    this.#eventMaps = eventMaps

    const handleMouseWheel = this.handleMouseWheel.bind(this)
    const handleMouseMove = this.handleMouseMove.bind(this)
    const handleClick = this.handleClick.bind(this)
    canvas.addEventListener('wheel', handleMouseWheel)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)

    const listenWheelEnd = () => {
      clearTimeout(this.#wheelTimeout)
      this.#isWheeling = true
      this.#wheelTimeout = setTimeout(() => {
        this.#isWheeling = false
      }, 100)
    }

    canvas.addEventListener('wheel', listenWheelEnd)

    this.#hasRegistered = true
    this.#removeEventsHandler = () => {
      canvas.removeEventListener('wheel', handleMouseWheel)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('wheel', listenWheelEnd)
      clearTimeout(this.#wheelTimeout)
    }
  }

  removeEvents () {
    if (this.#hasRegistered) {
      this.#hasRegistered = false
      this.#removeEventsHandler()
    } else {
      warn('Please listenEvents firstly')
    }
  }

  /**
   * @abstract
   * @return {T[]}
   */
  listItems () {
    throw new Error('please implements the listItems method')
  }

  /**
   * @protected
   * @param scrollSpeed
   * @return {number}
   */
  getOffsetX (scrollSpeed) {
    return 0
  }

  render (context) {
    if (!this.#isWheeling) {
      this.inertiaScroll()
    }
    const scrollItems = this.listItems()
    let offsetY = -this.#scrollY
    const offsetX = this.getOffsetX(this.#scrollSpeed)
    let lastMarginBottom = 0
    let lastHovered = false
    let lastActivated = false

    for (let i = 0; i < scrollItems.length; i++) {
      const scrollItem = scrollItems[i]
      const { marginTop, height, marginBottom } = scrollItem.currentStyle
      scrollItem.offsetY = offsetY
      scrollItem.offsetX = offsetX
      offsetY += height + marginBottom
      !lastHovered && !lastActivated && (offsetY += marginTop)
      lastMarginBottom = marginBottom
      lastHovered = scrollItem.hovered
      lastActivated = scrollItem.active
      scrollItem.render(context)
    }
  }
}
