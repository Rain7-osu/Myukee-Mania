window.__canvas_config = {
  WIDTH: document.documentElement.clientWidth,
  HEIGHT: document.documentElement.clientHeight,
}

export const CANVAS = {
  get WIDTH () { return __canvas_config.WIDTH },
  get HEIGHT () { return __canvas_config.HEIGHT },
}

/**
 * @param {number} val
 */
export const setCanvasSize = ({
  WIDTH,
  HEIGHT
}) => {
  window.__canvas_config = {
    WIDTH,
    HEIGHT
  }
}

export const DEFAULT_DELAY_TIME = 1200
export const DEFAULT_SPEED = 34
export const MAX_SPEED = 40
export const MIN_SPEED = 5
