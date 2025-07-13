/**
 * @readonly
 * @enum {number}
 */
export const NoteCol = {
  FIRST: 0,
  SECOND: 1,
  THIRD: 2,
  FORTH: 3
}

/**
 * @readonly
 * @enum {string}
 */
export const NoteType = {
  HOLD: 'HOLD',
  TAP: 'TAP',
}

/**
 * @param num {string | number}
 * @return {number}
 */
export function convertNumberToNodeCol(num) {
  const map = {
    64: 0,
    192: 1,
    320: 2,
    448: 3,
  }

  const value = +num
  return map[value] || 0
}
