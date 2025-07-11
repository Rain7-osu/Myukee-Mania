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
  LN: 'LN',
  Rice: 'Rice',
}

/**
 * @param num {string | number}
 * @return {NoteCol}
 */
export function convertNumberToNodeCol(num) {
  const map = {
    64: NoteCol.FIRST,
    192: NoteCol.SECOND,
    320: NoteCol.THIRD,
    448: NoteCol.FORTH,
  }

  const value = +num
  return map[value] || NoteCol.FIRST
}
