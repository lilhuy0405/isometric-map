import * as Phaser from "phaser";

export const DATA = Object.freeze({
  MAP: {
    KEY: 'map',
    PATH: 'assets/demo.json',
    TILE_HEIGHT: 16,
  },
});
export const borderOffset = new Phaser.Math.Vector2(100, 100);
export const TILE_SETS = Object.freeze({
  TILES: {
    KEY: 'tiles',
    PATH: 'assets/tileset.png'
  }
})

export const SPRITES_SHEETS = Object.freeze({
  PLAYER: {
    KEY: 'player',
    PATH: 'assets/run.png',
    FRAME_CONFIG: {
      frameWidth: 2048 / 24,
      frameHeight: 2048 / 12
    }
  }
})