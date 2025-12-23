import { RenderObject } from './RenderObject'
import { ScrollItem } from './ScrollItem'
import { CANVAS, px } from './Config'
import { ActiveEffect } from './ActiveEffect'
import { MouseEventManager } from './MouseEventManager'

/**
 * @typedef {Object} ListConfig
 * @property {number} friction - 摩擦系数
 * @property {number} minVelocity - 最小速度
 * @property {number} maxVelocity - 最大速度
 * @property {number} initialScrollY - 初始滚动位置
 * @property {number} speedPerFrame - 每帧速度
 * @property {number} minDeltaScrollY - 最小滚动增量
 * @property {number} maxDeltaScrollY - 最大滚动增量
 * @property {number} maxOffsetX - 最大左侧偏移量
 */

/**
 * @typedef {Object} ScrollListStyle
 * @property {number} left
 * @property {number} top
 * @property {number} bottom
 * @property {number} width
 * @property {number} height
 */

const DURATION = 480
const DISTANCE_FOR_DURATION = 200
const SCROLL_TO_DURATION = 240
const MAX_SPEED = 75

/**
 * @param left {number}
 * @param offsetY {number}
 * @param scrollY {number}
 */
const calcOffsetX = (left, offsetY, scrollY) => {
  return left + Math.abs(offsetY - scrollY - CANVAS.HEIGHT / 2) / 6
}

/**
 * @template {ScrollItem} T
 * @abstract
 */
export class ScrollList extends RenderObject {
  /**
   * @param container {HTMLElement}
   * @param listConfig {Partial<ListConfig>}
   * @param style {ScrollListStyle}
   */
  constructor (container, listConfig, style) {
    super()
    this.#container = container
    this.#style = style
    this.#listConfig = {
      friction: 0.95, // 摩擦系数
      minVelocity: 1, // 最小速度阈值
      maxVelocity: MAX_SPEED, // 最大速度限制
      initialScrollY: 0,
      minDeltaScrollY: CANVAS.HEIGHT / 3, // 允许scrollY 额外减少的值，第一个元素的 offsetY 减去这个值 > 0 时，将会渲染
      maxDeltaScrollY: CANVAS.HEIGHT / 3, // 允许 scrollY 额外增加的值，最后一个元素的 offsetY 加上这个值 < CANVAS.HEIGHT 时，将会渲染
      ...listConfig,
    }
    this.#scrollY = this.#listConfig.initialScrollY
    this.#status = {
      isInertiaScrolling: false,
      lastScrollTime: 0,
      lastScrollY: this.#listConfig.initialScrollY,
      mouseEvent: null,
      velocity: 0,
      inertiaX: 0,
      isWheeling: false,
      mouseMoving: false,
    }
    this.#activeEffects = {
      inertia: new ActiveEffect(),
    }
    this.#mouseEventHandler = new MouseEventManager(container, 'ScrollListcontainer')
  }

  /**
   * @type {MouseEventManager}
   */
  #mouseEventHandler

  /**
   * @type {HTMLElement}
   */
  #container
  /**
   * @type {ScrollListStyle}
   */
  #style

  #autoScrolling = false

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
    this.#scrollY = Math.round(scrollY)
  }

  /**
   * @return {number}
   */
  get scrollY () {
    return this.#scrollY
  }

  /**
   * @type {ListConfig}
   */
  #listConfig

  /**
   * @type {{
   *   isInertiaScrolling: boolean;
   *   isWheeling: boolean;
   *   lastScrollTime: number;
   *   lastScrollY: number;
   *   mouseEvent: HTMLElementEventMap['canvas'] | null;
   *   mouseMoving: boolean;
   *   velocity: number;
   *   inertiaX: number;
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
   *   onClick: (item: ScrollItem) => void;
   * }}
   */
  #eventMaps = { onClick: () => {} }

  /**
   * @type {{ inertia: ActiveEffect }}
   */
  #activeEffects

  /**
   * @type {() => void}
   */
  #removeEventsHandler = () => {}
  #hasRegistered = false
  #wheelTimeout = -1
  #hasInit = false
  #lastScrollY = 0

  /**
   * @private
   * @return {{maxScrollY: number, minScrollY: number}}
   */
  _calcScrollYConfig () {
    const listItems = this.scrollItems()
    if (typeof this.#maxScrollY === 'undefined') {
      // 临时先用列表项 + gap 直接计算出来
      // 后续要考虑 hover 的情况
      this.#maxScrollY = listItems.reduce((prev, current) => {
        const style = current.style
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
   * 检查是否补获事件
   * @private
   * @param e {HTMLElementEventMap['canvas']}
   */
  _checkEventCapture (e) {
    const x = e.clientX
    const y = e.clientY
    const { left: listLeft, top: listTop, height: listHeight, width: listWidth, bottom: listBottom } = this.#style
    return x >= listLeft &&
      y >= listTop &&
      x <= listLeft + listWidth &&
      y <= listTop + listHeight &&
      y <= CANVAS.HEIGHT - listBottom
  }

  /**
   * @private
   * @param e {WheelEvent}
   * @return void
   */
  async _onWheel (e) {
    if (this.#autoScrolling) {
      this.#cancelTransitionManager.cancelScrollTo()
      this.#autoScrolling = false
    }
    const wheelDirection = e.deltaY > 0 ? 1 : -1
    const wheelSpeed = 5

    if (this.#status.velocity * wheelDirection < 0) {
      // 方向不同，直接减速到 0
      this.#status.velocity = 0
      // 切换方向，横向惯性也减到 0
      this.#status.inertiaX = 0
    }
    this.#status.velocity += wheelDirection * wheelSpeed
    this.#status.velocity = Math.max(-this.#listConfig.maxVelocity, Math.min(this.#listConfig.maxVelocity, this.#status.velocity))
  }

  #mouseMoveTimer = -1

  /**
   * @param x {number}
   * @param y {number}
   * @return {[T|null, number]}
   * @private
   */
  _findCurrentHoverItem (x, y) {
    const items = this.scrollItems()
    for (let i = 0; i < items.length; i++) {
      let item = items[i]
      const [left, top, width, height] = item.rect()
      const isInArea = x > left && x < left + width && y > top && y < top + height

      if (isInArea) {
        return [item, i]
      }
    }
    return [null, -1]
  }

  /**
   * @private
   * @param e {HTMLElementEventMap['canvas']}
   * @return void
   */
  _onMouseMove (e) {
    e.preventDefault()
    this.#status.mouseEvent = e
    this.#status.mouseMoving = true

    clearTimeout(this.#mouseMoveTimer)
    this.#mouseMoveTimer = setTimeout(() => {
      // this.#status.wheelEvent && this.handleMouseMove(this.#status.wheelEvent)
      this.#status.mouseMoving = false
    }, 100)

    this._refreshHoverStatus(e)
  }

  /**
   * @private
   * @param e {HTMLElementEventMap['canvas']}
   * @return void
   */
  _refreshHoverStatus (e) {
    const x = e.clientX
    const y = e.clientY
    const items = this.scrollItems()
    /** @type {ScrollItem | null} */
    const hoveredItem = this.#hoveredItem

    const [newHoverItem, index] = this._findCurrentHoverItem(x, y)
    if (newHoverItem) {
      if (!hoveredItem) {
        newHoverItem.hoverIn()
        this.#hoveredItem = newHoverItem
        this.#hoveredIndex = index
        this.hoverInRefreshScrollItems()
      } else if (hoveredItem !== newHoverItem) {
        this.#hoveredItem.hoverOut()
        newHoverItem.hoverIn()
        // 先处理数据，然后再存值
        this.#hoveredItem = newHoverItem
        this.#hoveredIndex = index
        this.hoverInRefreshScrollItems()
      } else {
        // this.#hoverItem === items[i] don`t need process
      }
    }

    for (let i = items.length - 1; i >= 0; i--) {
      const [left, top, width, height] = items[i].rect()
      const hovered = x > left && x < left + width && y > top && y < top + height

      if (hovered) {
        return
      }
    }

    if (hoveredItem) {
      hoveredItem.hoverOut()
      this.hoverOutRefreshScrollItems()
      this.#hoveredItem = null
      this.#hoveredIndex = -1
    }
  }

  /**
   * @private
   * @param e {HTMLElementEventMap['canvas']}
   * @return void
   */
  _onClick (e) {
    if (!this._checkEventCapture(e)) {
      return
    }

    e.preventDefault()
    this.#status.mouseEvent = e
    clearTimeout(this.#mouseMoveTimer)

    const [clickItem, index] = this._findCurrentHoverItem(e.clientX, e.clientY)
    if (!clickItem) {
      return
    }

    if (this.#activeItem === clickItem) {
      this.#eventMaps.onClick(clickItem)
    } else {
      this.#activeItem = clickItem
      this.#activeIndex = index
      this._selectRefreshItems(clickItem)
      this.#eventMaps.onClick(clickItem)
    }
  }

  /**
   * @public
   * @param eventMaps {{
   *   onClick: (item: ScrollItem) => void;
   * }}
   */
  registerEvents (eventMaps) {
    this.#eventMaps = eventMaps
    const listenWheelEnd = () => {
      clearTimeout(this.#wheelTimeout)
      this.#status.isWheeling = true
      this.#wheelTimeout = setTimeout(() => {
        this.#status.isWheeling = false
      }, 30)
    }

    this.#mouseEventHandler.registerEvents({
      wheelEvents: [this._onWheel.bind(this)],
      mousemoveEvents: [this._onMouseMove.bind(this), listenWheelEnd],
      clickEvents: [this._onClick.bind(this)],
    })
  }

  removeEvents () {
    clearTimeout(this.#wheelTimeout)
    this.#mouseEventHandler.removeEvents()
  }

  disableEvents () {
    clearTimeout(this.#wheelTimeout)
    this.#mouseEventHandler.disableEvents()
  }

  enableEvents () {
    this.#mouseEventHandler.enableEvents()
  }

  /**
   * @abstract
   * @return {ScrollItem[]}
   */
  scrollItems () {
    throw new Error('please implements the listItems method')
  }

  #cancelTransitionManager = {
    cancelHover: () => {},
    cancelSelect: () => {},
    cancelScrollTo: () => {},
  }

  /**
   * @param targetItem {ScrollItem}
   * @param prevDistance {number}
   * @param nextDistance {number}
   * @private
   */
  _processItemTranslate (targetItem, prevDistance, nextDistance) {
    /** @type {Array<(value: number) => void>} */
    const transformers = []

    let lastItem = targetItem.last
    while (lastItem) {
      const currentItem = lastItem
      const update = value => currentItem.translateY = value
      this.createTransitionSync(currentItem.translateY, prevDistance, DURATION, 'easeOut', update)
      transformers.push(update)
      lastItem = lastItem.last
    }

    let nextItem = targetItem.next
    while (nextItem) {
      const currentItem = nextItem
      const update = value => currentItem.translateY = value
      this.createTransitionSync(currentItem.translateY, nextDistance, DURATION, 'easeOut', update)
      transformers.push(update)
      nextItem = nextItem.next
    }

    const update = value => targetItem.translateY = value
    this.createTransitionSync(targetItem.translateY, 0, DURATION, 'easeOut', update)
    transformers.push(update)
    return transformers
  }

  hoverOutRefreshScrollItems () {
    if (!this.#hoveredItem || this.#hoveredIndex < 0) {
      return
    }

    this.#cancelTransitionManager.cancelHover()
    const transformers = this._processItemTranslate(this.#hoveredItem, 0, 0)
    this.#cancelTransitionManager.cancelHover = () => this.cancelTransitions(transformers)
  }

  hoverInRefreshScrollItems () {
    if (!this.#hoveredItem || this.#hoveredIndex < 0) {
      return
    }

    this.#cancelTransitionManager.cancelHover()
    const transformers = this._processItemTranslate(this.#hoveredItem, -this.#hoveredItem.hoverStyle.marginTop, this.#hoveredItem.hoverStyle.marginBottom)
    this.#cancelTransitionManager.cancelHover = () => this.cancelTransitions(transformers)
  }

  /**
   * @param targetItem {ScrollItem}
   * @private
   */
  _selectRefreshItems (targetItem) {
    const endMarginTop = targetItem.activeStyle.marginTop
    const endMarginBottom = targetItem.activeStyle.marginBottom

    this.#cancelTransitionManager.cancelSelect()
    /** @type {Array<(value: number) => void>} */
    const transformers = []

    let offsetY = 0
    const targetStyle = {
      marginTop: endMarginTop,
      marginBottom: endMarginBottom,
      height: targetItem.currentStyle.height,
    }

    const scrollItems = this.scrollItems()
    for (let i = 0; i < scrollItems.length; i++) {
      const scrollItem = scrollItems[i]
      const { marginTop, marginBottom, height } = scrollItem === targetItem ? targetStyle : scrollItem.style

      offsetY += marginTop
      transformers.push(this.createTransitionSync(
        scrollItem.offsetY, offsetY,
        DURATION, 'easeOut',
        value => {
          scrollItem.offsetY = value
        },
      ))
      offsetY += height + marginBottom
    }

    this.#cancelTransitionManager.cancelSelect = () => this.cancelTransitions(transformers)
  }

  /**
   * @param item {ScrollItem}
   * @private
   */
  async _scrollSetOffsetX (item) {
    const targetX = calcOffsetX(item.style.left, item.offsetY, item.scrollY)
    item.offsetX = Math.min(this.#listConfig.maxOffsetX, targetX)
  }

  /**
   * @param centeredItem {ScrollItem}
   */
  initScrollItems (centeredItem) {
    this.#hasInit = true
    if (this.#hoveredItem) {
      this.#hoveredItem.hovered = false
      this.#hoveredItem = null
      this.#hoveredIndex = -1
    }

    /** @type {ScrollItem[]} */
    const scrollItems = this.scrollItems()
    let offsetY = 0

    for (let i = 0; i < scrollItems.length; i++) {
      const scrollItem = scrollItems[i]
      const { marginTop, marginBottom, height } = scrollItem.currentStyle

      // 需要注意这里是否需要改回 i > 0 时在 + marginTop
      offsetY += marginTop
      scrollItem.translateX = scrollItem.currentStyle.left - scrollItem.style.left
      scrollItem.offsetY = offsetY
      offsetY += height + marginBottom
    }

    this.scrollY = centeredItem.offsetY - CANVAS.HEIGHT / 2
    const { maxScrollY, minScrollY } = this._calcScrollYConfig()
    this.scrollY = Math.max(Math.min(this.#scrollY, maxScrollY), minScrollY)

    for (let i = 0; i < scrollItems.length; i++) {
      const scrollItem = scrollItems[i]
      scrollItem.scrollY = this.scrollY
      this._scrollSetOffsetX(scrollItem)
    }
  }

  _refreshHoverWhenScroll () {
    if (this.#status.mouseEvent && this.#status.velocity < 3) {
      this._refreshHoverStatus(this.#status.mouseEvent)
    }
  }

  /**
   * @private
   */
  _updateScroll () {
    if (Math.abs(this.#status.velocity) > 0) {
      this.#scrollY += this.#status.velocity
      const { maxScrollY, minScrollY } = this._calcScrollYConfig()
      this.scrollY = Math.max(Math.min(this.#scrollY, maxScrollY), minScrollY)
      this.#status.velocity *= this.#listConfig.friction

      if (Math.abs(this.#status.velocity) < 0.1) {
        this.#status.velocity = 0
      }
      this._refreshHoverWhenScroll()
    }
  }

  _refreshItemsScrollY () {
    /** @type {ScrollItem[]} */
    const items = this.scrollItems()
    for (const item of items) {
      item.scrollY = this.scrollY
      this._scrollSetOffsetX(item)
    }
    this._refreshHoverWhenScroll()
  }

  /**
   * @param item {ScrollItem}
   * @private
   */
  _calcScrollX (item) {
    if (Math.abs(this.#status.velocity) > 1) {
      const direction = this.#status.velocity > 0 ? 1 : -1
      const vx = Math.sqrt(Math.abs(this.#status.velocity * 16)) * 8
      const delta = direction < 0 ? (CANVAS.HEIGHT - item.y) / 10 : item.y / 10

      // 因为 y 坐标默认 offset 的量，要在这里抵消掉
      // scroll 值会被 offset 值减去，因此如果向右位移，需要 scrollX 是负数
      const offsetXExtra = Math.abs(item.y - CANVAS.HEIGHT / 2) / 6
      const targetScrollX = offsetXExtra - vx - delta
      const MAX_DELTA = 10
      if (targetScrollX < 0) {
        if (Math.abs(targetScrollX) - Math.abs(item.scrollX) > MAX_DELTA) {
          if (item.scrollX > targetScrollX) {
            item.scrollX -= MAX_DELTA
          } else {
            item.scrollX += MAX_DELTA
          }
        } else {
          item.scrollX = targetScrollX
        }
      }
    } else {
      if (item.scrollX < 0) {
        item.scrollX += 0.5
        item.scrollX = Math.min(0, item.scrollX)
      }
    }
  }

  /**
   * @private
   */
  _refreshItemsScrollX () {
    const items = this.scrollItems()
    items.forEach(item => this._calcScrollX(item))
  }

  /**
   * @param now {number}
   */
  updateTransition (now) {
    if (this.#status.velocity !== 0) {
      this._updateScroll()
    }
    super.updateTransition(now)
    this.#activeEffects.inertia.updateTransition(now)
    if (this.#scrollY !== this.#lastScrollY && !this.#autoScrolling) {
      this._refreshItemsScrollY()
      this.#lastScrollY = this.#scrollY
    } else if (this.#autoScrolling) {
      this._refreshItemsScrollY()
    }
    // 不能调顺序
    this._refreshItemsScrollX()
    const scrollItems = this.scrollItems()
    scrollItems.forEach(item => item.updateEffect(now))
  }

  render (context) {
    const scrollItems = this.scrollItems()
    scrollItems.forEach((item, index) => item.render(context))
    this._renderScrollBar(context)
  }

  /**
   * @param context {CanvasRenderingContext2D}
   * @private
   */
  _renderScrollBar (context) {
    const { left: listLeft, top: listTop, height: listHeight, width: listWidth } = this.#style
    const BAR_WIDTH = px(8)
    context.fillStyle = 'rgba(0, 0, 0, 0.2)'
    context.fillRect(listLeft + listWidth, listTop, -BAR_WIDTH, listHeight)
    context.fillStyle = 'rgba(255, 255, 255, 1)'
    const items = this.scrollItems()
    const itemHeight = items[0].style.height
    const scrollHeight = itemHeight * items.length + this.#listConfig.maxDeltaScrollY + this.#listConfig.minDeltaScrollY
    const top = (this.#scrollY + this.#listConfig.maxDeltaScrollY) / scrollHeight * listHeight + listTop
    const height = listHeight / scrollHeight * listHeight
    context.fillRect(listLeft + listWidth, top, -BAR_WIDTH, height)
  }

  /**
   * @param scrollY {number | ((prev: number) => number)}
   */
  scrollTo (scrollY) {
    this.#status.velocity = 0
    this.#status.isWheeling = false
    this.#status.inertiaX = 0
    this.#status.mouseMoving = false
    let targetScrollY = typeof scrollY === 'function' ? scrollY(this.#scrollY) : scrollY
    const { minScrollY, maxScrollY } = this._calcScrollYConfig()
    targetScrollY = Math.min(Math.max(minScrollY, targetScrollY), maxScrollY)
    this.#cancelTransitionManager.cancelScrollTo()
    this.#autoScrolling = true
    this.#cancelTransitionManager.cancelScrollTo = this.createTransitionSync(this.scrollY, targetScrollY, SCROLL_TO_DURATION, 'easeOut',
      value => this.scrollY = value,
      () => {
        this._refreshHoverWhenScroll()
        this.#autoScrolling = false
        this.#lastScrollY = this.scrollY
      },
    )
  }

  /**
   * @param item {ScrollItem}
   */
  select (item) {
    this.#activeItem = item
    this.#activeIndex = this.scrollItems().findIndex(item => item === item)
  }
}
