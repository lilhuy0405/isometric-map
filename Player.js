import * as Phaser from "phaser";
import {cartesianToIsometric, fromRadianToDegree, isNumberBelongsToRange, listToMatrix} from "./utils";

import {borderOffset, DATA, SPRITES_SHEETS} from "./configs/assets";
import {
  DIRECTIONS,
  IDLE_ANIMATION_KEY_PREFIX,
  IDLE_DIRECTION_ORDER,
  RUN_ANIMATION_KEY_PREFIX,
  RUN_DIRECTIONS_ORDER
} from "./configs/animation";
import * as EasyStar from "easystarjs";

export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    const cartePoint = new Phaser.Math.Vector2(x * DATA.MAP.TILE_HEIGHT, y * DATA.MAP.TILE_HEIGHT);
    const isoPoint = cartesianToIsometric(cartePoint);
    const position = isoPoint.add(borderOffset);
    super(scene, position.x, position.y, SPRITES_SHEETS.PLAYER.KEY);
    this.setOrigin(0, 0.5)
    this.setScale(0.3)
    this.scene.physics.add.existing(this);
    this.createAnimations();
    //some custom properties
    this.target = new Phaser.Math.Vector2();
    this.lastDirection = ""
    //load easystar
    this.easystar = new EasyStar.js();
    this.paths = []
  }

  detectDirection(degree) {
    let targetDirection = null;
    for (const [direction, degreeRangesObj] of Object.entries(DIRECTIONS)) {
      const degreeRanges = degreeRangesObj.degreeRanges
      for (let i = 0; i < degreeRanges.length; i++) {
        if (isNumberBelongsToRange(degree, degreeRanges[i])) {
          targetDirection = direction
          break;
        }
      }
      if (targetDirection) {
        break
      }
    }
    if (targetDirection == null) {
      if (degree === 0) {
        targetDirection = "S"
      }
    }
    return targetDirection;
  }


  moveOnPath(startTile, endTile, mapData, acceptableTiles) {
    const level = listToMatrix(mapData, 16);
    let currentTileX = startTile.x;
    let currentTileY = startTile.y;
    const timeStep = 200;

    this.easystar.setGrid(level);
    this.easystar.setAcceptableTiles(acceptableTiles);
    this.easystar.enableDiagonals();
    this.easystar.enableCornerCutting();
    const x = setInterval(() => {
      try {
        this.easystar.findPath(currentTileX, currentTileY, endTile.x, endTile.y, (path) => {
          if (path === null || path.length === 0) {
            // this.playerPostionTxt.setText("Path movement ends or The path to the destination point was not found.");
            console.log("Path movement ends or The path to the destination point was not found.");
            clearInterval(x)
          } else if (path) {
            currentTileX = path[1].x;
            currentTileY = path[1].y;
            this.moveToTile(new Phaser.Math.Vector2(currentTileX, currentTileY))
          }
        });
        this.easystar.calculate();
      } catch (err) {
        this.playerPostionTxt.setText(err.message)
        clearInterval(x)
      }
    }, timeStep);
  }

  moveToTile(tileCoordinates) {
    const cartePoint = new Phaser.Math.Vector2(tileCoordinates.x * 16, tileCoordinates.y * 16);
    const isoPoint = cartesianToIsometric(cartePoint);
    this.target = isoPoint.add(borderOffset);

    this.scene.physics.moveToObject(this, this.target, 100, 400);
    //calculate angle between move vector and Oy
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    const cosAngle = (this.target.y - this.y) / distance
    let degree = fromRadianToDegree(Math.acos(cosAngle))
    if (this.target.x < this.x) {
      degree = 360 - degree
    }
    const direction = this.detectDirection(degree)

    if (this.lastDirection !== direction || this.lastDirection.startsWith("IDLE")) this.anims.play(`${RUN_ANIMATION_KEY_PREFIX}-${direction}`)
    this.lastDirection = direction
  }
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.body.speed > 0) {

      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
      console.log(distance)
      if (distance < 5) {
        this.body.reset(this.target.x, this.target.y);
        this.anims.play(`IDLE-${this.lastDirection}`)
        // reset last direction
        this.lastDirection = ""
      }
    }
  }

  //TODO: consider to create a specific scene for load all sprite
  createAnimations() {
    RUN_DIRECTIONS_ORDER.map((item, index) => {
      const start = index * 5 + index
      const end = start + 5
      this.scene.anims.create({
        key: `${RUN_ANIMATION_KEY_PREFIX}-${item}`,
        frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start, end}),
        repeat: -1,
        frameRate: 6
      });
    })

    IDLE_DIRECTION_ORDER.map((item, index) => {
      //idle in sprite sheets start from 240
      const frameNumber = 240 + index
      this.scene.anims.create({
        key: `${IDLE_ANIMATION_KEY_PREFIX}-${item}`,
        frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {frames: [frameNumber]}),
        repeat: 1
      });
    })
  }


}

// export default Player;