import * as Phaser from "phaser";

export const DATA = Object.freeze({
  MAP: {
    KEY: 'map1',
    PATH: 'assets/map1.json',
  },
  MAP2: {
    KEY: 'map2',
    PATH: 'assets/map2.json',
  },
  MAP3: {
    KEY: 'map3',
    PATH: 'assets/map3.json',
  },
  MAP4: {
    KEY: 'map4',
    PATH: 'assets/map4.json',
  },
  MAP5: {
    KEY: 'map5',
    PATH: 'assets/map5.json',
  },
  MAP6: {
    KEY: 'map6',
    PATH: 'assets/map6.json',
  }
});
export const MAP_OBJECT_TYPES = Object.freeze({
  MONSTER: 'monsters',
  PORTAL: 'portals',
  HERO_SPAWN: 'heroSpawns',

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
    },
    GOBLIN: {
      KEY: 'goblin',
      PATH: 'assets/Goblin_MAP.png',
      FRAME_CONFIG: {
        frameWidth: 100,
        frameHeight: 97
      }
    },
    GOBLIN_RAT_KEEPER: {
      KEY: 'goblin-rat-keeper',
      PATH: 'assets/Goblin_Rat_Keeper_MAP.png',
      FRAME_CONFIG: {
        frameWidth: 100,
        frameHeight: 97
      }
    },
    GOBLIN_WITCH: {
      KEY: 'goblin-witch',
      PATH: 'assets/Goblin_Witch_MAP.png',
      FRAME_CONFIG: {
        frameWidth: 100,
        frameHeight: 97
      }
    },
    GOBLIN_WIZARD: {
      KEY: 'goblin-wizard',
      PATH: 'assets/Goblin_Wizard_MAP.png',
      FRAME_CONFIG: {
        frameWidth: 100,
        frameHeight: 97
      }
    },
    TROLL: {
      KEY: 'troll',
      PATH: 'assets/Troll_MAP.png',
      FRAME_CONFIG: {
        frameWidth: 100,
        frameHeight: 97
      }
    }
  }
})