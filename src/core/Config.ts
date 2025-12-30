declare global {
  interface Window {
    __canvas_config: {
      WIDTH: number
      HEIGHT: number
      CLIENT_X: number
      CLIENT_Y: number
    }
  }
}

window.__canvas_config = {
  WIDTH: window.screen.width,
  HEIGHT: window.screen.height,
  CLIENT_X: 0,
  CLIENT_Y: 0,
}

export const CANVAS = {
  get WIDTH(): number { return window.__canvas_config.WIDTH },
  get HEIGHT(): number { return window.__canvas_config.HEIGHT },
  get CLIENT_X(): number { return window.__canvas_config.CLIENT_X },
  get CLIENT_Y(): number { return window.__canvas_config.CLIENT_Y },
}

export const setCanvasSize = ({
  WIDTH,
  HEIGHT,
  CLIENT_X,
  CLIENT_Y,
}: {
  WIDTH?: number
  HEIGHT?: number
  CLIENT_X?: number
  CLIENT_Y?: number
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

export const vw = (v: number): number => Math.round(v * CANVAS.WIDTH)
export const vh = (v: number): number => Math.round(v * CANVAS.HEIGHT)
export const py = (v: number): number => v > 64 ? vh(v / 1440) : Math.round(vh(v / 140) / 10)
export const px = (v: number): number => v > 64 ? vw(v / 2560) : Math.round(vw(v / 256) / 10)
