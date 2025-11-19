import { Shape } from './Shape'
import { ScrollItem } from './ScrollItem'
import { CANVAS } from './Config'
import { createLimitLog, warn } from './dev'
import { Skin } from './Skin'

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
      minDeltaScrollY: CANVAS.HEIGHT / 3 - Skin.config.main.beatmap.item.base.height / 2, // 允许scrollY 额外减少的值，第一个元素的 offsetY 减去这个值 > 0 时，将会渲染
      maxDeltaScrollY: CANVAS.HEIGHT / 3, // 允许 scrollY 额外增加的值，最后一个元素的 offsetY 加上这个值 < CANVAS.HEIGHT 时，将会渲染
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

  /**
   * @param scrollY {number}
   */
  set scrollY (scrollY) {
    this.#scrollY = scrollY
  }

  #scrollSpeed = 0

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
   * @type {ScrollItem | null}
   */
  #activeItem
  #activeIndex = -1

  /**
   * @type {ScrollItem | null}
   */
  #hoveredItem
  #hoveredIndex = -1

  /**
   * @type {{
   *   onClick: (item: T) => void;
   * }}
   */
  #eventMaps = { onClick: () => {} }

  /**
   * @type {() => void}
   */
  #removeEventsHandler = () => {}
  #hasRegistered = false
  #wheelTimeout = -1
  #isWheeling = false
  #hasInit = false
  #lastScrollY = 0
  #pendingHoverInRender = false

  /**
   * @private
   * @return {{maxScrollY: number, minScrollY: number}}
   */
  calcScrollYConfig () {
    const listItems = this.scrollItems()
    if (typeof this.#maxScrollY === 'undefined') {
      // 临时先用列表项 + gap 直接计算出来
      // 后续要考虑 hover 的情况
      this.#maxScrollY = listItems.reduce((prev, current) => {
        const style = current.currentStyle
        return prev + style.marginTop + style.height + style.marginBottom
      }, 0) - CANVAS.HEIGHT + this.#listConfig.maxDeltaScrollY
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
  }

  /**
   * @private
   * @param e {HTMLElementEventMap['canvas']}
   * @return void
   */
  handleMouseMove (e) {
    e.preventDefault()

    const now = performance.now()

    const x = e.clientX
    const y = e.clientY

    const items = this.scrollItems()
    /** @type {ScrollItem | null} */
    const hoveredItem = this.#hoveredItem
    for (let i = 0; i < items.length; i++) {
      const { left, top, width, height } = items[i].renderInfo()
      const hovered = x > left && x < left + width && y > top && y < top + height

      if (hovered) {
        if (!this.#hoveredItem) {
          items[i].hoverIn()
          this.#hoveredItem = items[i]
          this.#hoveredIndex = i
          this.hoverInRefreshScrollItems()
        } else if (this.#hoveredItem !== items[i]) {
          this.#hoveredItem.hoverOut()
          items[i].hoverIn()
          // 先处理数据，然后再存值
          this.hoverSwitchRefreshScrollItems(items[i], i)
          this.#hoveredItem = items[i]
          this.#hoveredIndex = i
        } else {
          // this.#hoveredItem === items[i] => skip
        }
        return
      }
    }

    if (hoveredItem) {
      this.hoverOutRefreshScrollItems()
      hoveredItem.hoverOut()
      this.#hoveredItem = null
      this.#hoveredIndex = -1
    }
    this.#status.wheelEvent = e
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

    this.#activeIndex = this.#hoveredIndex
    this.#activeItem = this.#hoveredItem
    this.#eventMaps.onClick(this.#hoveredItem)
    this.#status.wheelEvent = e
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
      if (Math.abs(scrollSpeed) < 1 && wheelEvent) {
        this.handleMouseMove(wheelEvent)
      }

      this.#status.isInertiaScrolling = true
      this.#scrollY += scrollSpeed
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
   * @param canvas {HTMLCanvasElement}
   * @param eventMaps {{
   *   onClick: (item: T) => void;
   * }}
   */
  registerEvents (canvas, eventMaps) {
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

    const listenWheelEnd = (e) => {
      clearTimeout(this.#wheelTimeout)
      this.#isWheeling = true
      this.#wheelTimeout = setTimeout(() => {
        this.#isWheeling = false
        // this.#status.wheelEvent && this.handleMouseMove(e)
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
  scrollItems () {
    throw new Error('please implements the listItems method')
  }

  /**
   * @protected
   * @param scrollSpeed {number}
   * @param offsetY {number}
   * @return {number}
   */
  getOffsetX (scrollSpeed, offsetY) {
    return 0
  }

  /**
   * @param newHoverItem {ScrollItem}
   * @param newHoverIndex {number}
   */
  hoverSwitchRefreshScrollItems (newHoverItem, newHoverIndex) {
    // 类型缩减
    if (!this.#hoveredItem) {
      return
    }

    const oldHoverItem = this.#hoveredItem
    const oldHoverIndex = this.#hoveredIndex

    if (newHoverIndex === oldHoverIndex || newHoverItem === oldHoverItem) {
      return
    }
    const delta = newHoverItem.hoverStyle.marginBottom

    if (newHoverIndex > oldHoverIndex) {
      // hover switch 在下面, 那么 old hoverItem 往上不需要协调处理，new hoverItem 往下不需要处理
      let nextItem = oldHoverItem
      while (nextItem && nextItem !== newHoverItem) {
        nextItem.translateY = -delta
        nextItem = nextItem.next
      }
    } else if (newHoverIndex < oldHoverIndex) {
      // hover switch 在上面，那么 old hoverItem 往下不需要协调处理, new hoverItem 往上不需要处理
      let lastItem = oldHoverItem
      while (lastItem && lastItem !== newHoverItem) {
        lastItem.translateY = delta
        lastItem = lastItem.last
      }
    }
    newHoverItem.translateY = 0
  }

  hoverOutRefreshScrollItems () {
    /** @type {ScrollItem | null} */
    const hoverItem = this.#hoveredItem
    if (!hoverItem || this.#hoveredIndex < 0) {
      return
    }

    let lastItem = hoverItem.last
    while (lastItem) {
      lastItem.translateY = 0
      lastItem = lastItem.last
    }
    let nextItem = hoverItem.next
    while (nextItem) {
      nextItem.translateY = 0
      nextItem = nextItem.next
    }
  }

  hoverInRefreshScrollItems () {
    /** @type {ScrollItem | null} */
    const hoverItem = this.#hoveredItem
    if (!hoverItem || this.#hoveredIndex < 0) {
      return
    }

    const delta = hoverItem.hoverStyle.marginBottom
    let lastItem = hoverItem.last
    while (lastItem) {
      lastItem.translateY = -delta
      lastItem = lastItem.last
    }

    let nextItem = hoverItem.next
    while (nextItem) {
      nextItem.translateY = +delta
      nextItem = nextItem.next
    }
  }

  initScrollItems () {
    /** @type {ScrollItem[]} */
    const scrollItems = this.scrollItems()
    let offsetY = 0

    for (let i = 0; i < scrollItems.length; i++) {
      const scrollItem = scrollItems[i]
      const { marginTop, marginBottom, height } = scrollItem.currentStyle

      if (i > 0) {
        offsetY += marginTop
      }
      scrollItem.offsetY = offsetY
      scrollItem.scrollY = this.#scrollY
      offsetY += height + marginBottom
    }
  }

  scrollRefreshItems () {
    /** @type {ScrollItem[]} */
    const scrollItems = this.scrollItems()
    for (const scrollItem of scrollItems) {
      scrollItem.scrollY = this.#scrollY
      scrollItem.offsetX = this.getOffsetX(this.#scrollSpeed, scrollItem.offsetY - this.#scrollY)
    }
  }

  render (context) {
    if (!this.#isWheeling) {
      this.inertiaScroll()
    }
    // this.update()

    if (!this.#hasInit) {
      this.initScrollItems()
      this.#hasInit = true
    }

    if (this.#lastScrollY !== this.#scrollY) {
      this.scrollRefreshItems()
      this.#lastScrollY = this.#scrollY
    }

    this.scrollItems().forEach((item, index) => item.render(context))
  }

  #cancelUpdate = () => {}

  /**
   * @param scrollY {number | ((prev: number) => number)}
   */
  scrollTo (scrollY) {
    const targetScrollY = typeof scrollY === 'function' ? scrollY(this.#scrollY) : scrollY
    this.#cancelUpdate()
    this.#cancelUpdate = this.createUpdate(this.#scrollY, targetScrollY, 160, (delta) => {
      this.#scrollY += delta
    })
  }
}
