let CANVAS_WIDTH = window.screen.width
// TODO in renderEngine
let CANVAS_HEIGHT = window.screen.height

export { CANVAS_HEIGHT, CANVAS_WIDTH }

/**
 * @param {number} val
 */
export const setCanvasHeight = (val) => {
  CANVAS_HEIGHT = val
}

export const setCanvasWidth = (val) => {
  CANVAS_WIDTH = val
}


export const BLUE_NOTE_COLOR = '#00dbff'
export const WHITE_NOTE_COLOR = '#ffffff'
export const DEFAULT_DELAY_TIME = 1200
export const SECTION_LINE_COLOR = '#0f0'
export const SECTION_LINE_HEIGHT = 1
export const NOTE_WIDTH = 150
export const NOTE_HEIGHT = 50
export const NOTE_GAP = 2
export const DEFAULT_SPEED = 34
export const MAX_SPEED = 40
export const MIN_SPEED = 5

// per frame 25px
export const HIT_EFFECT_RISE_SPEED = 25
// per frame 10px
export const HIT_EFFECT_FALL_SPEED = 10
export const HIT_EFFECT_HEIGHT = Math.min(CANVAS_HEIGHT / 2, 540)

export const JUDGEMENT_Y = CANVAS_HEIGHT / 2
export const JUDGEMENT_WIDTH = 3 * NOTE_WIDTH
