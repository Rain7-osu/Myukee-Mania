window.__canvas_config = {
  WIDTH: window.screen.width,
  HEIGHT: window.screen.height,
  CLIENT_X: 0,
  CLIENT_Y: 0,
}

export const CANVAS = {
  /**
   * @return {number}
   */
  get WIDTH () { return __canvas_config.WIDTH },
  /**
   * @return {number}
   */
  get HEIGHT () { return __canvas_config.HEIGHT },
  /**
   * @return {number}
   */
  get CLIENT_X () { return __canvas_config.CLIENT_X },
  /**
   * @return {number}
   */
  get CLIENT_Y () { return __canvas_config.CLIENT_Y },
}

/**
 * @param WIDTH {number?}
 * @param HEIGHT {number?}
 * @param CLIENT_X {number?}
 * @param CLIENT_Y {number?}
 */
export const setCanvasSize = ({
  WIDTH,
  HEIGHT,
  CLIENT_X,
  CLIENT_Y,
}) => {
  window.__canvas_config = {
    ...window.__canvas_config,
    WIDTH,
    HEIGHT,
    CLIENT_X,
    CLIENT_Y,
  }
}

export const SUPPORTED_RATIO = [
  [3840, 2160],
  [2560, 1440],
  [2240, 1260],
  [1920, 1080],
  [1600, 900],
  [1366, 768],
  [1280, 720],
  [960, 540],
]

export const DEFAULT_DELAY_TIME = 1200
export const MAX_SPEED = 40
export const MIN_SPEED = 1

// Canvas尺寸限制
export const MIN_CANVAS_WIDTH = 960
export const MIN_CANVAS_HEIGHT = 540

// 宽高比限制
export const MIN_ASPECT_RATIO = 4 / 3  // 4:3
export const MAX_ASPECT_RATIO = 16 / 7 // 16:7

/**
 * @param v {number}
 * @return {number}
 */
export const vw = v => Math.round(v * CANVAS.WIDTH)
/**
 * @param v {number}
 * @return {number}
 */
export const vh = v => Math.round(v * CANVAS.HEIGHT)
/**
 * @param v {number}
 * @return {number}
 */
export const py = v => v > 64 ? vh(v / 1440) : Math.round(vh(v  / 140) / 10)

/**
 * @param v {number}
 * @return {number}
 */
export const px = v => v > 64 ? vw(v / 2560) : Math.round(vw(v / 256) / 10)
