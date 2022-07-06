import * as Phaser from "phaser";
import {
  cartesianToIsometric,
  fromRadianToDegree,
  getTileCoordinates,
  isNumberBelongsToRange,
  isometricToCartesian,
  listToMatrix
} from "./utils";

import {borderOffset, DATA, SPRITES_SHEETS} from "./configs/assets";
import {
  DIRECTIONS, IDLE_ANIMATION_KEY_PREFIX, IDLE_DIRECTION_ORDER, RUN_ANIMATION_KEY_PREFIX, RUN_DIRECTIONS_ORDER
} from "./configs/animation";
import * as EasyStar from "easystarjs";

export default class Player extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y) {

    super(scene);
    this.setTexture(SPRITES_SHEETS.PLAYER.KEY);
    console.log(this.scene.tileHeight)
    const cartePoint = new Phaser.Math.Vector2(x * this.scene.tileHeight, y * this.scene.tileHeight);
    const isoPoint = cartesianToIsometric(cartePoint);
    const position = isoPoint.add(borderOffset);
    this.setPosition(position.x, position.y);

    this.setOrigin(0, 0.5)
    this.setScale(1)
    this.scene.physics.add.existing(this);
    this.createAnimations();
    //some custom properties
    this.target = new Phaser.Math.Vector2();
    this.lastDirection = ""
    //load easystar
    this.easystar = new EasyStar.js();
    this.isMoving = false;
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
    console.log(targetDirection)
    return targetDirection;
  }


  moveOnPath(endTile, acceptableTiles) {
    const playerIsoPoint = new Phaser.Math.Vector2(this.x, this.y).subtract(borderOffset);
    const playerCartePt = isometricToCartesian(playerIsoPoint);
    let startTile = getTileCoordinates(playerCartePt, this.scene.tileHeight);
    const mapData = this.scene.mapData.layers[1].data

    const level = listToMatrix(mapData, this.scene.mapWidth)
    let currentTileX = startTile.x;
    let currentTileY = startTile.y;
    const timeStep = 200;

    this.easystar.setGrid(level);
    this.easystar.setAcceptableTiles(acceptableTiles);
    this.easystar.enableDiagonals();
    this.easystar.enableCornerCutting();
    this.easystar.avoidAdditionalPoint(7, 0);
    const x = setInterval(() => {
      try {
        this.easystar.findPath(currentTileX, currentTileY, endTile.x, endTile.y, (path) => {
          if (path === null || path.length === 0) {
            // this.playerPostionTxt.setText("Path movement ends or The path to the destination point was not found.");

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
    const cartePoint = new Phaser.Math.Vector2(tileCoordinates.x * this.scene.tileHeight, tileCoordinates.y * this.scene.tileHeight);
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

  findPathAndMove(endTile, acceptableTiles, collisionLayerIndex) {
    const playerIsoPoint = new Phaser.Math.Vector2(this.x, this.y).subtract(borderOffset);
    const playerCartePt = isometricToCartesian(playerIsoPoint);
    let startTile = getTileCoordinates(playerCartePt, this.scene.tileHeight);
    const mapData = this.scene.mapData.layers[collisionLayerIndex].data
    const level = listToMatrix(mapData, this.scene.mapWidth)
    this.easystar.setGrid(level);
    this.easystar.setAcceptableTiles(acceptableTiles);
    this.easystar.enableDiagonals();
    this.easystar.enableCornerCutting();
    // this.easystar.avoidAdditionalPoint(7, 0);
    // this.easystar.avoidAdditionalPoint(6, 0);
    // this.easystar.avoidAdditionalPoint(8, 0);
    // this.easystar.avoidAdditionalPoint(9, 0);
    //
    // this.easystar.avoidAdditionalPoint(7, 1);
    // this.easystar.avoidAdditionalPoint(6, 1);
    // this.easystar.avoidAdditionalPoint(8, 1);
    // this.easystar.avoidAdditionalPoint(9, 1);


    this.easystar.findPath(startTile.x, startTile.y, endTile.x, endTile.y, (path) => {
      if (path === null) {
        const newTarget = endTile;
        if (startTile.x < endTile.x) {
          newTarget.x = endTile.x - 1
        } else {
          newTarget.x = endTile.x + 1
        }

        if (startTile.y < endTile.y) {
          newTarget.y = endTile.y - 1
        } else {
          newTarget.y = endTile.y + 1
        }
        if (newTarget.x < 0) newTarget.x = 0
        if (newTarget.y < 0) newTarget.y = 0
        this.findPathAndMove(newTarget, acceptableTiles, collisionLayerIndex)
      } else {
        this.isMoving = true;
        this.moveCharacter(path);
      }
    });
    this.easystar.calculate();
  }

  moveCharacter(path) {
    // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
    const timeStep = 200;

    const x = setInterval(() => {
      try {
        // this.isMoving = true;
        if (path.length === 0) {
          clearInterval(x)
          this.isMoving = false;
        } else {
          const tile = path.shift()
          this.moveToTile(tile)
        }
      } catch (err) {
        console.log(err)
        clearInterval(x)
        this.isMoving = false
      }
    }, timeStep);
    // this.anims.play('RUN-S')
    // const timeLine = this.scene.tweens.timeline({
    //   tweens: tweens
    // });


    // timeLine.play();
  };

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.body.speed > 0) {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
      // console.log(distance)
      if (distance < 5) {
        this.body.reset(this.target.x, this.target.y);
        this.anims.play(`IDLE-${this.lastDirection}`)
        // reset last direction
        this.lastDirection = ""
      }
    }
  }

  resetPosition(tileCoordinates) {
    const cartePoint = new Phaser.Math.Vector2(tileCoordinates.x * this.scene.tileHeight, tileCoordinates.y * this.scene.tileHeight);
    const isoPoint = cartesianToIsometric(cartePoint);
    const position = isoPoint.add(borderOffset);
    this.body.reset(position.x, position.y);
  }


  createAnimations() {
    // RUN_DIRECTIONS_ORDER.map((item, index) => {
    //   const start = index * 5 + index
    //   const end = start + 5
    //   console.log(start, end)
    //   this.scene.anims.create({
    //     key: `${RUN_ANIMATION_KEY_PREFIX}-${item}`,
    //     frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start, end}),
    //     repeat: -1,
    //     frameRate: 6
    //   });
    // })
    //
    // IDLE_DIRECTION_ORDER.map((item, index) => {
    //   //idle in sprite sheets start from 240
    //   const frameNumber = 240 + index
    //   this.scene.anims.create({
    //     key: `${IDLE_ANIMATION_KEY_PREFIX}-${item}`,
    //     frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {frames: [frameNumber]}),
    //     repeat: 1
    //   });
    // })
    //TODO: GET RISK OF REPEAT ANIMATION
    //SE + S
    this.scene.anims.create({
      key: `${IDLE_ANIMATION_KEY_PREFIX}-SE`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 0, end: 3}),
      repeat: -1,
      frameRate: 4
    })
    this.scene.anims.create({
      key: `${IDLE_ANIMATION_KEY_PREFIX}-S`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 0, end: 3}),
      repeat: -1,
      frameRate: 4
    })

    this.scene.anims.create({
      key: `${RUN_ANIMATION_KEY_PREFIX}-SE`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 4, end: 7}),
      repeat: -1,
      frameRate: 4
    })
    this.scene.anims.create({
      key: `${RUN_ANIMATION_KEY_PREFIX}-S`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 4, end: 7}),
      repeat: -1,
      frameRate: 4
    })

    //NE + E
    this.scene.anims.create({
      key: `${IDLE_ANIMATION_KEY_PREFIX}-NE`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 8, end: 11}),
      repeat: -1,
      frameRate: 4
    })
    this.scene.anims.create({
      key: `${IDLE_ANIMATION_KEY_PREFIX}-E`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 8, end: 11}),
      repeat: -1,
      frameRate: 4
    })

    this.scene.anims.create({
      key: `${RUN_ANIMATION_KEY_PREFIX}-NE`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 12, end: 15}),
      repeat: -1,
      frameRate: 4
    })
    this.scene.anims.create({
      key: `${RUN_ANIMATION_KEY_PREFIX}-E`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 12, end: 15}),
      repeat: -1,
      frameRate: 4
    })

    //SW + W
    this.scene.anims.create({
      key: `${IDLE_ANIMATION_KEY_PREFIX}-SW`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 16, end: 19}),
      repeat: -1,
      frameRate: 4
    })
    this.scene.anims.create({
      key: `${IDLE_ANIMATION_KEY_PREFIX}-W`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 16, end: 19}),
      repeat: -1,
      frameRate: 4
    })

    this.scene.anims.create({
      key: `${RUN_ANIMATION_KEY_PREFIX}-SW`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 20, end: 23}),
      repeat: -1,
      frameRate: 4
    })
    this.scene.anims.create({
      key: `${RUN_ANIMATION_KEY_PREFIX}-W`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 20, end: 23}),
      repeat: -1,
      frameRate: 4
    })

    //NW + N
    this.scene.anims.create({
      key: `${IDLE_ANIMATION_KEY_PREFIX}-NW`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 24, end: 27}),
      repeat: -1,
      frameRate: 4
    })
    this.scene.anims.create({
      key: `${IDLE_ANIMATION_KEY_PREFIX}-N`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 24, end: 27}),
      repeat: -1,
      frameRate: 4
    })

    this.scene.anims.create({
      key: `${RUN_ANIMATION_KEY_PREFIX}-NW`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 28, end: 31}),
      repeat: -1,
      frameRate: 4
    })
    this.scene.anims.create({
      key: `${RUN_ANIMATION_KEY_PREFIX}-N`,
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {start: 28, end: 31}),
      repeat: -1,
      frameRate: 4
    })


    // this.scene.anims.create({
    //   key: `${IDLE_ANIMATION_KEY_PREFIX}-W`,
    //   frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PLAYER.KEY, {frames: [28]}),
    //   repeat: 1
    // })

  }


}

// export default Player;