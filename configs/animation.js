//thứ tự của direction này là giống với file sprite sheet
export const RUN_DIRECTIONS_ORDER = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'SE', 'S']
export const IDLE_DIRECTION_ORDER = ['E', 'NE', 'N', 'NW', 'W', 'SE', 'SW', 'S']

export const RUN_ANIMATION_KEY_PREFIX = 'RUN'
export const IDLE_ANIMATION_KEY_PREFIX = 'IDLE'

export const DIRECTIONS = {
  S: {
    degreeRanges: [[350, 360], [0, 9]]
  },
  SE: {
    degreeRanges: [[10, 79]]
  },
  E: {
    degreeRanges: [[80, 109]]
  },
  NE: {
    degreeRanges: [[110, 169]]
  },
  N: {
    degreeRanges: [[170, 189]]
  },
  NW: {
    degreeRanges: [[190, 259]]
  },
  W: {
    degreeRanges: [[260, 279]]
  },
  SW: {
    degreeRanges: [[280, 349]]
  }

}

