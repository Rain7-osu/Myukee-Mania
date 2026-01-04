import { CANVAS, px } from '../Configs/Config';
import type { ScrollItem } from './ScrollItem';
import { RenderObject } from '../Core/RenderObject';
import { ActiveEffect } from '../Core/ActiveEffect';
import { MouseEventManager } from '../Managers/MouseEventManager';

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

interface ListStatus {
  isDragging: boolean;
  isInertiaScrolling: boolean;
  isWheeling: boolean;
  lastScrollTime: number;
  lastScrollY: number;
  mouseEvent: MouseEvent | null;
  mouseMoving: boolean;
  velocity: number;
  inertiaX: number;
  lastMouseY: number;
  lastDragTime: number;
  mousePositions: Array<{ y: number; time: number }>;
  hasDragged: boolean; // 记录是否发生了拖拽
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
      isDragging: false,
      lastMouseY: 0,
      lastDragTime: 0,
      mousePositions: [],
      hasDragged: false,
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

  private _reflowEffect = new ActiveEffect()

  private _isReflowing: boolean = false

  set scrollY(scrollY: number) {
    const [minScrollY, maxScrollY] = this._boundary()
    this._scrollY = Math.max(Math.min(Math.round(scrollY), maxScrollY), minScrollY)
  }

  get scrollY(): number {
    return this._scrollY
  }

  private _listConfig: ListConfig

  private _status: ListStatus

  private _maxScrollY: number | null = null

  private _minScrollY: number | null = null

  private _activeItem: T | null
  private _activeIndex: number = -1

  private _hoveredItem: T | null
  private _hoveredIndex: number = -1

  private _eventMaps = { onClick: (item: T) => {} }

  private _activeEffects: { inertia: ActiveEffect }

  private _wheelTimeout = -1
  private _hasInit = false
  private _lastScrollY = 0

  private _boundary(): [number, number] {
    if (this._minScrollY === null || this._maxScrollY === null) {
      [this._minScrollY, this._maxScrollY] = this._layoutBoundary()
    }
    return [this._minScrollY, this._maxScrollY]
  }

  private _layoutBoundary(): [number, number] {
    const listItems = this.scrollItems()

    // 临时先用列表项 + gap 直接计算出来
    // 后续要考虑 hover 的情况
    this._maxScrollY = listItems.reduce((prev, current) => {
      const style = current.style
      return prev + style.marginTop + style.height + style.marginBottom
    }, 0) - CANVAS.HEIGHT + this._listConfig.maxDeltaScrollY

    this._minScrollY = -this._listConfig.minDeltaScrollY
    return this._boundary()
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
    if (e.shiftKey || e.ctrlKey || e.altKey) {
      return
    }

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

  /**
   * @deprecated TODO 后续使用统一的 timer 管理器
   */
  private _mouseMoveTimer = -1

  private _findCurrentHoverItem(x: number, y: number): [T | null, number] {
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
    this._mouseMoveTimer = window.setTimeout(() => {
      this._status.mouseMoving = false
    }, 100)

    if (this._status.isDragging) {
      this._dragging(e)
    } else {
      this._refreshHoverStatus(e)
    }
  }

  private _updateMousePositions(currentTime: number) {
    // 只保留最近0ms内的鼠标位置，用于计算速度
    const timeThreshold = currentTime - 50
    while (this._status.mousePositions.length > 0 && this._status.mousePositions[0].time < timeThreshold) {
      this._status.mousePositions.shift()
    }
  }

  private _dragging(e: MouseEvent): void {
    // 设置拖拽标志位
    this._status.hasDragged = true

    // 计算鼠标移动量
    const currentY = e.clientY
    const deltaY = currentY - this._status.lastMouseY
    const currentTime = performance.now()

    // 记录当前鼠标位置和时间
    this._status.mousePositions.push({ y: currentY, time: currentTime })
    this._updateMousePositions(currentTime)
    // 更新滚动位置，取反deltaY使拖拽方向与滚动方向一致
    this.scrollY -= deltaY

    // 更新最后鼠标位置和时间
    this._status.lastMouseY = currentY
    this._status.lastDragTime = currentTime
  }

  private _refreshHoverStatus(e: MouseEvent): void {
    const x = e.offsetX
    const y = e.offsetY
    const items = this.scrollItems()
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

    // 如果发生了拖拽，则不触发 onClick 事件
    if (this._status.hasDragged) {
      return
    }

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

  private _onMouseUp(e: MouseEvent): void {
    e.preventDefault()
    this._status.mouseEvent = e
    this._status.isDragging = false

    this._updateMousePositions(performance.now())
    // 计算惯性滚动速度
    if (this._status.mousePositions.length >= 2) {
      const firstPosition = this._status.mousePositions[0]
      const lastPosition = this._status.mousePositions[this._status.mousePositions.length - 1]
      const timeDiff = lastPosition.time - firstPosition.time
      const distanceDiff = lastPosition.y - firstPosition.y

      // 计算速度 (像素/毫秒)，并转换为适合的速度单位
        if (timeDiff > 0) {
          let velocity = (distanceDiff / timeDiff) * 16 // 调整速度系数

          // 取反velocity使惯性滚动方向与拖拽方向一致
          velocity = -velocity

          // 限制速度在配置范围内
          velocity = Math.max(-this._listConfig.maxVelocity, Math.min(this._listConfig.maxVelocity, velocity))

          // 设置惯性滚动速度
          this._status.velocity = velocity
        }
    }

    // 清空鼠标位置记录
    this._status.mousePositions = []
  }

  private _onMouseDown(e: MouseEvent): void {
    e.preventDefault()
    this._status.mouseEvent = e
    this._status.isDragging = true
    // 重置拖拽标志位
    this._status.hasDragged = false
    this._status.lastMouseY = e.clientY
    this._status.lastDragTime = performance.now()
    this._status.mousePositions = [{ y: e.clientY, time: this._status.lastDragTime }]
  }

  registerEvents(eventMaps: { onClick: (item: ScrollItem) => void }): void {
    this._eventMaps = eventMaps
    const listenWheelEnd = () => {
      clearTimeout(this._wheelTimeout)
      this._status.isWheeling = true
      this._wheelTimeout = window.setTimeout(() => {
        this._status.isWheeling = false
      }, 30)
    }

    this._mouseEventHandler.registerEvents({
      wheelEvents: [this._onWheel.bind(this)],
      mousemoveEvents: [this._onMouseMove.bind(this), listenWheelEnd],
      mouseupEvents: [this._onMouseUp.bind(this)],
      mousedownEvents: [this._onMouseDown.bind(this)],
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

  hoverOutRefreshScrollItems() {
    if (!this._hoveredItem || this._hoveredIndex < 0) {
      return
    }

    this._cancelTransitionManager.cancelHover()
    const transformers = this._processItemTranslate(this._hoveredItem, 0, 0)
    this._cancelTransitionManager.cancelHover = () => this.cancelTransitions(transformers)
  }

  hoverInRefreshScrollItems() {
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

  async reflow(centeredItem: T): Promise<void> {
    if (this._hoveredItem) {
      this._hoveredItem.hovered = false
      this._hoveredItem = null
      this._hoveredIndex = -1
    }

    this._layoutBoundary()

    if (this._isReflowing) {
      this._reflowEffect.cancelTransitions()
    }

    const scrollItems = this.scrollItems()
    let offsetY = 0

    const targetOffsetYMap = new Map<T, number>()
    const startOffsetYMap = new Map<T, number>()


    for (const scrollItem of scrollItems) {
      const { marginTop, marginBottom, height } = scrollItem.currentStyle
      // 需要注意这里是否需要改回 i > 0 时在 + marginTop
      offsetY += marginTop
      scrollItem.translateX = scrollItem.currentStyle.left - scrollItem.style.left
      targetOffsetYMap.set(scrollItem, offsetY)
      startOffsetYMap.set(scrollItem, scrollItem.offsetY)
      offsetY += height + marginBottom
    }

    const startScrollY = this.scrollY
    const targetScrollY = targetOffsetYMap.get(centeredItem) - CANVAS.HEIGHT / 2

    this._isReflowing = true
    await this._reflowEffect.createTransition<number>(0, 100, 800, 'easeOut', (value: number) => {
      const scrollY = startScrollY + (targetScrollY - startScrollY) * value / 100;
      this.scrollY = targetScrollY
      for (const scrollItem of scrollItems) {
        const start = startOffsetYMap.get(scrollItem)
        const target = targetOffsetYMap.get(scrollItem)
        const distance = target - start;
        const delta = distance * value / 100
        scrollItem.offsetY = start + delta
        scrollItem.scrollY = scrollY
        this._scrollSetOffsetX(scrollItem)
      }
    })
    this._isReflowing = false
  }

  layout(centeredItem: T): void {
    this._hasInit = true
    if (this._hoveredItem) {
      this._hoveredItem.hovered = false
      this._hoveredItem = null
      this._hoveredIndex = -1
    }

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

    for (let i = 0; i < scrollItems.length; i++) {
      const scrollItem = scrollItems[i]
      scrollItem.scrollY = this.scrollY
      this._scrollSetOffsetX(scrollItem)
    }
  }

  _refreshHoverWhenScroll() {
    if (this._status.mouseEvent && this._status.velocity < 3) {
      this._refreshHoverStatus(this._status.mouseEvent)
    }
  }

  private _updateScroll(): void {
    if (Math.abs(this._status.velocity) > 0) {
      this.scrollY += this._status.velocity
      this._status.velocity *= this._listConfig.friction

      if (Math.abs(this._status.velocity) < 0.1) {
        this._status.velocity = 0
      }
      this._refreshHoverWhenScroll()
    }
  }

  _refreshItemsScrollY() {
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
    if (this.scrollItems().length) {
      if (this._isReflowing) {
        this._reflowEffect.updateTransition(now)
        return
      }

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
  }

  render(context: CanvasRenderingContext2D): void {
    const scrollItems = this.scrollItems()
    if (scrollItems.length > 0) {
      scrollItems.forEach(item => item.render(context))
      this._renderScrollBar(context)
    }
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
    const [minScrollY, maxScrollY] = this._boundary()
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
