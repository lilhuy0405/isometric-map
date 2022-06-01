import {Scene} from "phaser";
import {DATA, SPRITES_SHEETS, TILE_SETS} from "./configs/assets";
import {
  DIRECTIONS,
  IDLE_ANIMATION_KEY_PREFIX,
  IDLE_DIRECTION_ORDER,
  RUN_ANIMATION_KEY_PREFIX,
  RUN_DIRECTIONS_ORDER
} from "./configs/animation";
import * as EasyStar from "easystarjs";

const borderOffset = new Phaser.Math.Vector2(300, 150); //to centralise the isometric level display
const wallGraphicHeight = 98;
const floorGraphicWidth = 103;
const floorGraphicHeight = 53;
const heroGraphicWidth = 41;
const heroGraphicHeight = 62;
const wallHeight = wallGraphicHeight - floorGraphicHeight;

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
    this.easystar = new EasyStar.js();
    this.paths = []
  }

  preload() {

    for (const [_, tiles] of Object.entries(TILE_SETS)) {
      this.load.image(tiles.KEY, tiles.PATH);
    }
    this.load.tilemapTiledJSON(DATA.MAP.KEY, DATA.MAP.PATH);

    this.load.spritesheet(SPRITES_SHEETS.PLAYER.KEY, SPRITES_SHEETS.PLAYER.PATH, SPRITES_SHEETS.PLAYER.FRAME_CONFIG);
    this.load.spritesheet('32x32Tile', TILE_SETS.TILES.PATH, {frameWidth: 32, frameHeight: 32});
    this.load.json('mapjson', 'assets/demo.json');
    this.load.bitmapFont("pixelFont", "assets/fonts/font.png", "assets/fonts/font.xml");
  }

  create() {

    // this.map = this.add.tilemap(DATA.MAP.KEY);
    // const groundTiles = this.map.addTilesetImage('Isometirc-Template', TILE_SETS.TILES.KEY);
    //
    // this.groundlayer = this.map.createLayer('Bottom', [groundTiles]);
    // this.topLayer = this.map.createLayer('Top', [groundTiles]);
    this.buildTileMap(0)
    this.buildTileMap(1)
    //build player
    this.player = this.createPlayer()

    this.playerPostionTxt = this.add.text(borderOffset.x - 100, borderOffset.y - 20, "click on map to move player", {
      font: 'pixelFont',
      color: '#ffffff',
      fontSize: '16px'
    });
    //setup camera
    // this.player.body.collideWorldBounds = true;
    this.cameras.main.setZoom(2);
    this.cameras.main.startFollow(this.player);
    // this.moveToTile(new Phaser.Math.Vector2(7, 7))
    //move characters by click
    this.target = new Phaser.Math.Vector2();
    this.lastDirection = ""

    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      const {worldX, worldY} = pointer

      const playerIsoPoint = new Phaser.Math.Vector2(this.player.x, this.player.y).subtract(borderOffset);
      const playerCartePt = this.isometricToCartesian(playerIsoPoint);
      let startTile = this.getTileCoordinates(playerCartePt, 16);

      ``
      const isoPoint = new Phaser.Math.Vector2(worldX, worldY).subtract(borderOffset);
      const cartePt = this.isometricToCartesian(isoPoint);
      let targetTile = this.getTileCoordinates(cartePt, 16);
      console.log("start at: " + startTile.x + "," + startTile.y + " end at: " + targetTile.x + "," + targetTile.y);
      this.playerPostionTxt.setText(`move from: [${startTile.x},${startTile.y}] to: [${targetTile.x},${targetTile.y}]`)
      this.moveOnPath(startTile, targetTile)

      // let isoPoint = this.cartesianToIsometric(pointer);
      // console.log(isoPoint)
      // const tile = this.map.getTilesWithinWorldXY(worldX, worldY, 10, 10);
      this.target.x = worldX;
      this.target.y = worldY;
      // this.physics.moveToObject(this.player, this.target, 100);
      // this.easystar.calculate()
    })

    // remember to clean up on Scene shutdown
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_UP)
    })

    this.cursors = this.input.keyboard.createCursorKeys();

  }

  update(time, delta) {

    if (this.player.body.speed > 0) {

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);
      if (distance < 4) {
        this.player.body.reset(this.target.x, this.target.y);
        this.player.anims.play(`IDLE-${this.lastDirection}`)
        // reset last direction
        this.lastDirection = ""
      }
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
    if (targetDirection == null) {
      if (degree === 0) {
        targetDirection = "S"
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


  moveOnPath(startTile, endTile) {
    console.log(startTile)
    const data = this.cache.json.get('mapjson');
    const level = this.listToMatrix(data.layers[1].data, 16);
    let currentTileX = startTile.x;
    let currentTileY = startTile.y;
    const timeStep = 200;

    this.easystar.setGrid(level);
    this.easystar.setAcceptableTiles([0]);
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
    const isoPoint = this.cartesianToIsometric(cartePoint);
    this.target = isoPoint.add(borderOffset);

    this.physics.moveToObject(this.player, this.target, 60, 350);
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
  }

  createPlayer() {
    //start at 0, 7
    const x = 0 * 16
    const y = 7 * 16
    const cartePoint = new Phaser.Math.Vector2(x, y)
    const isoPoint = this.cartesianToIsometric(cartePoint);
    const player = this.physics.add.sprite(isoPoint.x + borderOffset.x, isoPoint.y + borderOffset.y, SPRITES_SHEETS.PLAYER.KEY);
    player.setOrigin(0, 0.5)
    player.setScale(0.3)
    // player.setSize(100, 100)
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


  buildTileMap(layerId = 0) {
    // this.cache.load.json
    const data = this.cache.json.get('mapjson');
    const mapWidth = data.layers[layerId].width;
    const mapHeight = data.layers[layerId].height;
    const tileWidth = data.tilewidth;
    const tileHeight = data.tileheight;
    const levelData = this.listToMatrix(data.layers[layerId].data, mapWidth);
    for (let i = 0; i < mapWidth; i++) {
      for (let j = 0; j < mapHeight; j++) {
        const x = j * tileHeight;
        const y = i * tileHeight
        const tileType = levelData[i][j];
        const cartePoint = new Phaser.Math.Vector2(x, y)
        const isoPoint = this.cartesianToIsometric(cartePoint);
        //place tile
        let tile;
        if (tileType > 0) {
          tile = this.add.image(
            isoPoint.x + borderOffset.x,
            isoPoint.y + borderOffset.y,
            '32x32Tile', tileType - 1);
          // tile.depth = 2 * layerId;
          tile.setOrigin(0, 0)
        }
      }
    }
  }

  cartesianToIsometric(cartPoint) {
    const tempPt = new Phaser.Math.Vector2();
    tempPt.x = cartPoint.x - cartPoint.y;
    tempPt.y = (cartPoint.x + cartPoint.y) / 2;
    return (tempPt);
  }

  isometricToCartesian(isoPt) {
    const tempPt = new Phaser.Math.Vector2();
    tempPt.x = (2 * isoPt.y + isoPt.x) / 2;
    tempPt.y = (2 * isoPt.y - isoPt.x) / 2;
    return (tempPt);
  }

  listToMatrix(list, elementsPerSubArray) {
    let matrix = [], i, k;

    for (i = 0, k = -1; i < list.length; i++) {
      if (i % elementsPerSubArray === 0) {
        k++;
        matrix[k] = [];
      }

      matrix[k].push(list[i]);
    }

    return matrix;
  }

  getTileCoordinates(cartPt, tileHeight) {
    const tempPt = new Phaser.Math.Vector2();
    tempPt.x = Math.floor(cartPt.x / tileHeight);
    tempPt.y = Math.floor(cartPt.y / tileHeight);
    return (tempPt);
  }
}

export default MapScene;