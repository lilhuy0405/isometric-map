import * as Phaser from "phaser";

export const DATA = Object.freeze({
  MAP: {
    KEY: 'map',
    PATH: 'assets/grass.json',
  },
  MAP2: {
    KEY: 'map2',
    PATH: 'assets/grass-2.json',
  }
});
export const borderOffset = new Phaser.Math.Vector2(100, 100);
export const TILE_SETS = Object.freeze({
  TILES: {
    KEY: 'tiles',
    PATH: 'assets/grass-tile.png',
    WIDTH: 64,
    HEIGHT: 64,
  }
})

export const SPRITES_SHEETS = Object.freeze({
  PLAYER: {
    KEY: 'player',
    PATHS: [
      'assets/BarbarianM.png',
      'assets/BarbarianF.png',
      'assets/AssassinF.png',
      'assets/AssassinM.png',
      'assets/SorcererF.png',
      'assets/SorcererM.png',
      'assets/TemplarF.png',
      'assets/TemplarM.png',
    ],
    FRAME_CONFIG: {
      frameWidth: 80,
      frameHeight: 80
    }
  },
  PORTAL: {
    KEY: 'portal',
    PATH: 'assets/portal.png',
    FRAME_CONFIG: {
      frameWidth: 649 / 4,
      frameHeight: 384
    }
  },
  MONSTERS: {
    RAT: {
      KEY: 'rat',
      PATH: 'assets/Rat_Swarm_MAP.png',
      FRAME_CONFIG: {
        frameWidth: 100,
        frameHeight: 48
      }
    }
  }
})