
/**
 * @readonly
 * @enum {string}
 */
export const NoteType = {
  HOLD: 'HOLD',
  TAP: 'TAP',
}

const KEYS_MAP = {
  4: {
    64: 0,
    192: 1,
    320: 2,
    448: 3,
  },
  5: {
    51: 0,
    153: 1,
    256: 2,
    358: 3,
    460: 4,
  },
  6: {
    42: 0,
    64: 0,
    128: 1,
    192: 2,
    213: 2,
    298: 3,
    320: 4,
    384: 4,
    448: 4,
    469: 5,
  },
  7: {
    36: 0,
    109: 1,
    182: 2,
    256: 3,
    329: 4,
    402: 5,
    475: 6,
  },
}

/**
 * @param num {string | number}
 * @param circleSize {number}
 * @return {number}
 */
export function convertNumberToNodeCol (num, circleSize = 4) {
  const value = +num
  return KEYS_MAP[circleSize][value] ?? -1
}
