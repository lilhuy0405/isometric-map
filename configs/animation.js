//thứ tự của direction này là giống với file sprite sheet
export const RUN_DIRECTIONS_ORDER = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'SE', 'S']
export const IDLE_DIRECTION_ORDER = ['E', 'NE', 'N', 'NW', 'W', 'SE', 'SW', 'S']

export const RUN_ANIMATION_KEY_PREFIX = 'RUN'
export const IDLE_ANIMATION_KEY_PREFIX = 'IDLE'

export const DIRECTIONS = {
  S: {
    degreeRanges: [[350, 360], [0, 10]]
  },
  SE: {
    degreeRanges: [[10, 80]]
  },
  E: {
    degreeRanges: [[80, 110]]
  },
  NE: {
    degreeRanges: [[110, 170]]
  },
  N: {
    degreeRanges: [[170, 190]]
  },
  NW: {
    degreeRanges: [[190, 260]]
  },
  W: {
    degreeRanges: [[260, 280]]
  },
  SW: {
    degreeRanges: [[280, 350]]
  }

}

