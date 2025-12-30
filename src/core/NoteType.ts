
export enum NoteType {
  HOLD = 'HOLD',
  TAP = 'TAP',
}

interface KeysMap {
  [keys: number]: {
    [value: number]: number
  }
}

const KEYS_MAP: KeysMap = {
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

export function convertNumberToNodeCol (num: string | number, circleSize: number = 4): number {
  const value = +num
  return KEYS_MAP[circleSize]?.[value] ?? -1
}
