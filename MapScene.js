import {Scene} from "phaser";
import {DATA, SPRITES_SHEETS, TILE_SETS} from "./configs/assets";
import {
  DIRECTIONS,
  IDLE_ANIMATION_KEY_PREFIX,
  IDLE_DIRECTION_ORDER,
  RUN_ANIMATION_KEY_PREFIX,
  RUN_DIRECTIONS_ORDER
} from "./configs/animation";


class MapScene extends Scene {
  constructor() {
    super({
      key: 'MyScene',
      physics: {
        default: 'arcade',
        arcade: {
          debug: true,
          gravity: {x: 0, y: 0, z: 0}
        }
      }
    })
  }

  preload() {

    for (const [_, tiles] of Object.entries(TILE_SETS)) {
      this.load.image(tiles.KEY, tiles.PATH);
    }
    this.load.tilemapTiledJSON(DATA.MAP.KEY, DATA.MAP.PATH);

    this.load.spritesheet(SPRITES_SHEETS.PLAYER.KEY, SPRITES_SHEETS.PLAYER.PATH, SPRITES_SHEETS.PLAYER.FRAME_CONFIG);

  }

  create() {

    const map = this.add.tilemap('map');
    const groundTiles = map.addTilesetImage('Isometirc-Template', TILE_SETS.TILES.KEY);

    const layer1 = map.createLayer('Bottom', [groundTiles]);
    const layer2 = map.createLayer('Top', [groundTiles]);
    //build player
    this.player = this.createPlayer()
    //setup camera

    this.cameras.main.setZoom(2);
    this.cameras.main.startFollow(this.player)
    //move characters by click
    this.target = new Phaser.Math.Vector2();
    this.lastDirection = ""
    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      const {worldX, worldY} = pointer
      this.target.x = worldX;
      this.target.y = worldY;
      this.physics.moveToObject(this.player, this.target, 150);
      //calculate angle between move vector and Oy
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);
      const cosAngle = (this.target.y - this.player.y) / distance
      let degree = this.fromRadianToDegree(Math.acos(cosAngle))
      if (this.target.x < this.player.x) {
        degree = 360 - degree
      }
      const direction = this.detectDirection(degree)

      if (this.lastDirection !== direction || this.lastDirection.startsWith("IDLE")) this.player.anims.play(`${RUN_ANIMATION_KEY_PREFIX}-${direction}`)
      this.lastDirection = direction
    })

    // remember to clean up on Scene shutdown
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_UP)
    })
  }

  update(time, delta) {
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);

    if (this.player.body.speed > 0 && distance < 4) {
      this.player.body.reset(this.target.x, this.target.y);
      this.player.anims.play(`IDLE-${this.lastDirection}`)
      //reset last direction
      this.lastDirection = ""
    }
  }

  fromRadianToDegree(radian) {
    return radian * 180 / Math.PI
  }

  detectDirection(degree) {
    let targetDirection = null;
    for (const [direction, degreeRangesObj] of Object.entries(DIRECTIONS)) {
      const degreeRanges = degreeRangesObj.degreeRanges
      for (let i = 0; i < degreeRanges.length; i++) {
        if (this.isNumberBelongsToRange(degree, degreeRanges[i])) {
          targetDirection = direction
          break;
        }
      }
      if (targetDirection) {
        break
      }
    }
    return targetDirection;
  }

  isNumberBelongsToRange(number, range) {
    if (range.length < 2) {
      throw new Error("isNumberBelongsToRange: range must be an array with 2 elements")
    }
    if (range[0] > range[1]) {
      throw new Error("isNumberBelongsToRange: invalid range start must larger than end")
    }
    return number > range[0] && number < range [1];
  }

  createPlayer() {
    const player = this.physics.add.sprite(0, 200, SPRITES_SHEETS.PLAYER.KEY);
    player.setScale(0.3)
    //create animations
    RUN_DIRECTIONS_ORDER.map((item, index) => {
      const start = index * 5 + index
      const end = start + 5
      this.anims.create({
        key: `${RUN_ANIMATION_KEY_PREFIX}-${item}`,
        frames: this.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start, end}),
        repeat: -1,
        frameRate: 6
      });
    })
    IDLE_DIRECTION_ORDER.map((item, index) => {
      //idle in sprite sheets start from 240
      const frameNumber = 240 + index
      this.anims.create({
        key: `${IDLE_ANIMATION_KEY_PREFIX}-${item}`,
        frames: this.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {frames: [frameNumber]}),
        repeat: 1
      });
    })
    return player
  }
}

export default MapScene;