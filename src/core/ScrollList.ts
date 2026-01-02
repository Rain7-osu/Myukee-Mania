import { RenderObject } from './RenderObject'
import { ScrollItem } from './ScrollItem'
import { CANVAS, px } from './Config'
import { ActiveEffect } from './ActiveEffect'
import { MouseEventManager } from './MouseEventManager'

interface ListConfig {
  friction: number // 摩擦系数
  minVelocity: number // 最小速度
  maxVelocity: number // 最大速度
  initialScrollY: number // 初始滚动位置
  maxOffsetX: number // 最大左侧偏移量
  minDeltaScrollY: number // 最小滚动增量
  maxDeltaScrollY: number // 最大滚动增量
}

interface ScrollListStyle {
  left: number
  top: number
  bottom: number
  width: number
  height: number
}

const DURATION = 480
const SCROLL_TO_DURATION = 240
const MAX_SPEED = 75

const calcOffsetX = (left: number, offsetY: number, scrollY: number): number => {
  return left + Math.abs(offsetY - scrollY - CANVAS.HEIGHT / 2) / 6
}

export abstract class ScrollList<T extends ScrollItem> extends RenderObject {
  protected constructor(container: HTMLElement, listConfig: Partial<ListConfig>, style: ScrollListStyle) {
    super()
    this._container = container
    this._style = style
    this._listConfig = {
      friction: 0.95, // 摩擦系数
      minVelocity: 1, // 最小速度阈值
      maxVelocity: MAX_SPEED, // 最大速度限制
      initialScrollY: 0,
      minDeltaScrollY: CANVAS.HEIGHT / 3, // 允许scrollY 额外减少的值，第一个元素的 offsetY 减去这个值 > 0 时，将会渲染
      maxDeltaScrollY: CANVAS.HEIGHT / 3, // 允许 scrollY 额外增加的值，最后一个元素的 offsetY 加上这个值 < CANVAS.HEIGHT 时，将会渲染
      maxOffsetX: 0,
      ...listConfig,
    }
    this._scrollY = this._listConfig.initialScrollY
    this._status = {
      isInertiaScrolling: false,
      lastScrollTime: 0,
      lastScrollY: this._listConfig.initialScrollY,
      mouseEvent: null,
      velocity: 0,
      inertiaX: 0,
      isWheeling: false,
      mouseMoving: false,
    }
    this._activeEffects = {
      inertia: new ActiveEffect(),
    }
    this._mouseEventHandler = new MouseEventManager(container, 'ScrollListContainer')
  }

  private _mouseEventHandler: MouseEventManager

  private _container: HTMLElement
  private readonly _style: ScrollListStyle

  private _autoScrolling: boolean = false

  private _scrollY: number = 0

  set scrollY(scrollY: number) {
    this._scrollY = Math.round(scrollY)
  }

  get scrollY(): number {
    return this._scrollY
  }

  private _listConfig: ListConfig

  private _status: {
    isInertiaScrolling: boolean;
    isWheeling: boolean;
    lastScrollTime: number;
    lastScrollY: number;
    mouseEvent: MouseEvent | null;
    mouseMoving: boolean;
    velocity: number;
    inertiaX: number;
  }

  private _maxScrollY: number

  private _minScrollY: number

  private _activeItem: ScrollItem | null
  private _activeIndex: number = -1

  private _hoveredItem: ScrollItem | null
  private _hoveredIndex: number = -1

  private _eventMaps = { onClick: (item: ScrollItem) => {} }

  private _activeEffects: { inertia: ActiveEffect }

  private _wheelTimeout = -1
  private _hasInit = false
  private _lastScrollY = 0

  private _calcScrollYConfig(): {maxScrollY: number, minScrollY: number} {
    const listItems = this.scrollItems()
    if (typeof this._maxScrollY === 'undefined') {
      // 临时先用列表项 + gap 直接计算出来
      // 后续要考虑 hover 的情况
      this._maxScrollY = listItems.reduce((prev, current) => {
        const style = current.style
        return prev + style.marginTop + style.height + style.marginBottom
      }, 0) - CANVAS.HEIGHT + this._listConfig.maxDeltaScrollY
    }

    if (typeof this._minScrollY === 'undefined') {
      this._minScrollY = -this._listConfig.minDeltaScrollY
    }

    return {
      maxScrollY: this._maxScrollY,
      minScrollY: this._minScrollY,
    }
  }

  private _checkEventCapture(e: MouseEvent): boolean {
    const x = e.offsetX
    const y = e.offsetY
    const { left: listLeft, top: listTop, height: listHeight, width: listWidth, bottom: listBottom } = this._style
    return x >= listLeft &&
      y >= listTop &&
      x <= listLeft + listWidth &&
      y <= listTop + listHeight &&
      y <= CANVAS.HEIGHT - listBottom
  }

  private _onWheel(e: WheelEvent) {
    if (this._autoScrolling) {
      this._cancelTransitionManager.cancelScrollTo()
      this._autoScrolling = false
    }
    const wheelDirection = e.deltaY > 0 ? 1 : -1
    const wheelSpeed = 5

    if (this._status.velocity * wheelDirection < 0) {
      // 方向不同，直接减速到 0
      this._status.velocity = 0
      // 切换方向，横向惯性也减到 0
      this._status.inertiaX = 0
    }
    this._status.velocity += wheelDirection * wheelSpeed
    this._status.velocity = Math.max(-this._listConfig.maxVelocity, Math.min(this._listConfig.maxVelocity, this._status.velocity))
  }

  private _mouseMoveTimer = -1

  private _findCurrentHoverItem(x: number, y: number): [ScrollItem | null, number] {
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

  private _onMouseMove(e: MouseEvent): void {
    e.preventDefault()
    this._status.mouseEvent = e
    this._status.mouseMoving = true

    clearTimeout(this._mouseMoveTimer)
    this._mouseMoveTimer = setTimeout(() => {
      // this._status.wheelEvent && this.handleMouseMove(this._status.wheelEvent)
      this._status.mouseMoving = false
    }, 100)

    this._refreshHoverStatus(e)
  }

  private _refreshHoverStatus(e: MouseEvent): void {
    const x = e.offsetX
    const y = e.offsetY
    const items = this.scrollItems()
    /** @type {ScrollItem | null} */
    const hoveredItem = this._hoveredItem

    const [newHoverItem, index] = this._findCurrentHoverItem(x, y)
    if (newHoverItem) {
      if (!hoveredItem) {
        newHoverItem.hoverIn()
        this._hoveredItem = newHoverItem
        this._hoveredIndex = index
        this.hoverInRefreshScrollItems()
      } else if (hoveredItem !== newHoverItem) {
        this._hoveredItem?.hoverOut()
        newHoverItem.hoverIn()
        // 先处理数据，然后再存值
        this._hoveredItem = newHoverItem
        this._hoveredIndex = index
        this.hoverInRefreshScrollItems()
      } else {
        // this._hoverItem === items[i] don`t need process
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
      this._hoveredItem = null
      this._hoveredIndex = -1
    }
  }

  private _onClick(e: MouseEvent): void {
    if (!this._checkEventCapture(e)) {
      return
    }

    e.preventDefault()
    this._status.mouseEvent = e
    clearTimeout(this._mouseMoveTimer)

    const [clickItem, index] = this._findCurrentHoverItem(e.offsetX, e.offsetY)
    if (!clickItem) {
      return
    }

    if (this._activeItem === clickItem) {
      this._eventMaps.onClick(clickItem)
    } else {
      this._activeItem = clickItem
      this._activeIndex = index
      this._selectRefreshItems(clickItem)
      this._eventMaps.onClick(clickItem)
    }
  }

  registerEvents(eventMaps: { onClick: (item: ScrollItem) => void }): void {
    this._eventMaps = eventMaps
    const listenWheelEnd = () => {
      clearTimeout(this._wheelTimeout)
      this._status.isWheeling = true
      this._wheelTimeout = setTimeout(() => {
        this._status.isWheeling = false
      }, 30)
    }

    this._mouseEventHandler.registerEvents({
      wheelEvents: [this._onWheel.bind(this)],
      mousemoveEvents: [this._onMouseMove.bind(this), listenWheelEnd],
      clickEvents: [this._onClick.bind(this)],
    })
  }

  removeEvents(): void {
    clearTimeout(this._wheelTimeout)
    this._mouseEventHandler.removeEvents()
  }

  disableEvents(): void {
    clearTimeout(this._wheelTimeout)
    this._mouseEventHandler.disableEvents()
  }

  enableEvents(): void {
    this._mouseEventHandler.enableEvents()
  }

  abstract scrollItems(): T[];

  private _cancelTransitionManager = {
    cancelHover: () => {},
    cancelSelect: () => {},
    cancelScrollTo: () => {},
  }

  private _processItemTranslate(targetItem: ScrollItem, prevDistance: number, nextDistance: number): Array<(value: number) => void> {
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
    if (!this._hoveredItem || this._hoveredIndex < 0) {
      return
    }

    this._cancelTransitionManager.cancelHover()
    const transformers = this._processItemTranslate(this._hoveredItem, 0, 0)
    this._cancelTransitionManager.cancelHover = () => this.cancelTransitions(transformers)
  }

  hoverInRefreshScrollItems () {
    if (!this._hoveredItem || this._hoveredIndex < 0) {
      return
    }

    this._cancelTransitionManager.cancelHover()
    const transformers = this._processItemTranslate(this._hoveredItem, -this._hoveredItem.hoverStyle.marginTop, this._hoveredItem.hoverStyle.marginBottom)
    this._cancelTransitionManager.cancelHover = () => this.cancelTransitions(transformers)
  }

  private _selectRefreshItems(targetItem: ScrollItem): void {
    const endMarginTop = targetItem.activeStyle.marginTop
    const endMarginBottom = targetItem.activeStyle.marginBottom

    this._cancelTransitionManager.cancelSelect()
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

    this._cancelTransitionManager.cancelSelect = () => this.cancelTransitions(transformers)
  }

  private async _scrollSetOffsetX(item: ScrollItem): Promise<void> {
    const targetX = calcOffsetX(item.style.left, item.offsetY, item.scrollY)
    item.offsetX = Math.min(this._listConfig.maxOffsetX, targetX)
  }

  initScrollItems(centeredItem: T): void {
    this._hasInit = true
    if (this._hoveredItem) {
      this._hoveredItem.hovered = false
      this._hoveredItem = null
      this._hoveredIndex = -1
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
    this.scrollY = Math.max(Math.min(this._scrollY, maxScrollY), minScrollY)

    for (let i = 0; i < scrollItems.length; i++) {
      const scrollItem = scrollItems[i]
      scrollItem.scrollY = this.scrollY
      this._scrollSetOffsetX(scrollItem)
    }
  }

  _refreshHoverWhenScroll () {
    if (this._status.mouseEvent && this._status.velocity < 3) {
      this._refreshHoverStatus(this._status.mouseEvent)
    }
  }

  private _updateScroll(): void {
    if (Math.abs(this._status.velocity) > 0) {
      this._scrollY += this._status.velocity
      const { maxScrollY, minScrollY } = this._calcScrollYConfig()
      this.scrollY = Math.max(Math.min(this._scrollY, maxScrollY), minScrollY)
      this._status.velocity *= this._listConfig.friction

      if (Math.abs(this._status.velocity) < 0.1) {
        this._status.velocity = 0
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

  private _calcScrollX(item: ScrollItem): void {
    if (Math.abs(this._status.velocity) > 1) {
      const direction = this._status.velocity > 0 ? 1 : -1
      const vx = Math.sqrt(Math.abs(this._status.velocity * 16)) * 8
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

  private _refreshItemsScrollX(): void {
    const items = this.scrollItems()
    items.forEach(item => this._calcScrollX(item))
  }

  updateTransition(now: number): void {
    if (this._status.velocity !== 0) {
      this._updateScroll()
    }
    super.updateTransition(now)
    this._activeEffects.inertia.updateTransition(now)
    if (this._scrollY !== this._lastScrollY && !this._autoScrolling) {
      this._refreshItemsScrollY()
      this._lastScrollY = this._scrollY
    } else if (this._autoScrolling) {
      this._refreshItemsScrollY()
    }
    // 不能调顺序
    this._refreshItemsScrollX()
    const scrollItems = this.scrollItems()
    scrollItems.forEach(item => item.updateEffect(now))
  }

  render(context: CanvasRenderingContext2D): void {
    const scrollItems = this.scrollItems()
    scrollItems.forEach(item => item.render(context))
    this._renderScrollBar(context)
  }

  private _renderScrollBar(context: CanvasRenderingContext2D): void {
    const { left: listLeft, top: listTop, height: listHeight, width: listWidth } = this._style
    const BAR_WIDTH = px(8)
    context.fillStyle = 'rgba(0, 0, 0, 0.2)'
    context.fillRect(listLeft + listWidth, listTop, -BAR_WIDTH, listHeight)
    context.fillStyle = 'rgba(255, 255, 255, 1)'
    const items = this.scrollItems()
    const itemHeight = items[0].style.height
    const scrollHeight = itemHeight * items.length + this._listConfig.maxDeltaScrollY + this._listConfig.minDeltaScrollY
    const top = (this._scrollY + this._listConfig.maxDeltaScrollY) / scrollHeight * listHeight + listTop
    const height = listHeight / scrollHeight * listHeight
    context.fillRect(listLeft + listWidth, top, -BAR_WIDTH, height)
  }

  scrollTo(scrollY: number | ((prev: number) => number)): void {
    this._status.velocity = 0
    this._status.isWheeling = false
    this._status.inertiaX = 0
    this._status.mouseMoving = false
    let targetScrollY = typeof scrollY === 'function' ? scrollY(this._scrollY) : scrollY
    const { minScrollY, maxScrollY } = this._calcScrollYConfig()
    targetScrollY = Math.min(Math.max(minScrollY, targetScrollY), maxScrollY)
    this._cancelTransitionManager.cancelScrollTo()
    this._autoScrolling = true
    this._cancelTransitionManager.cancelScrollTo = this.createTransitionSync(this.scrollY, targetScrollY, SCROLL_TO_DURATION, 'easeOut',
      value => this.scrollY = value,
      () => {
        this._refreshHoverWhenScroll()
        this._autoScrolling = false
        this._lastScrollY = this.scrollY
      },
    )
  }

  select(item: T): void {
    this._activeItem = item
    this._activeIndex = this.scrollItems().findIndex(item => item === item)
  }
}
