import * as  Phaser from "phaser";
import {borderOffset, DATA, SPRITES_SHEETS, TILE_SETS} from "./configs/assets";
import {
  cartesianToIsometric,
  getTileCoordinates,
  isometricToCartesian,
  listToMatrix
} from "./utils";
import Player from "./Player";


class MapScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'MapScene',
    })
    this.mapData = null;
    this.tileHeight = 0;

    this.mapWidth = 0;
    this.mapHeight = 0;
  }

  preload() {

    this.load.spritesheet(SPRITES_SHEETS.PLAYER.KEY, SPRITES_SHEETS.PLAYER.PATHS[7], SPRITES_SHEETS.PLAYER.FRAME_CONFIG);
    //TODO: Don't hard code the frame config
    this.load.spritesheet(TILE_SETS.TILES.KEY, TILE_SETS.TILES.PATH, {
      frameWidth: TILE_SETS.TILES.WIDTH,
      frameHeight: TILE_SETS.TILES.HEIGHT
    });

    this.load.spritesheet(SPRITES_SHEETS.PORTAL.KEY, SPRITES_SHEETS.PORTAL.PATH, SPRITES_SHEETS.PORTAL.FRAME_CONFIG);
    for (const [key, value] of Object.entries(SPRITES_SHEETS.MONSTERS)) {
      this.load.spritesheet(value.KEY, value.PATH, value.FRAME_CONFIG);
    }

    // this.load.spritesheet(SPRITES_SHEETS.MONSTERS.RAT.KEY, SPRITES_SHEETS.MONSTERS.RAT.PATH, SPRITES_SHEETS.MONSTERS.RAT.FRAME_CONFIG);
    this.load.json(DATA.MAP.KEY, DATA.MAP.PATH);
    this.load.json(DATA.MAP2.KEY, DATA.MAP2.PATH);

    this.load.image('monster', 'assets/goblin.png');
  }

  create() {
    //Build Map automatically from json filed or add to graphics groups
    this.buildTileMap(0, TILE_SETS.TILES.KEY, DATA.MAP.KEY);
    // this.buildTileMap(1, TILE_SETS.TILES.KEY)
    //IMPORTANT: The order of the layer is important
    this.portal = this.createPortal(12, 0)
    let i = 8;
    for (const [key, value] of Object.entries(SPRITES_SHEETS.MONSTERS)) {
      console.log(key, value.KEY)
      this.createMonster(i, 5, value.KEY);
      i += 3;
    }


    //build player
    this.player = this.add.existing(new Player(this, 16, 28));

    this.playerPostionTxt = this.add.text(borderOffset.x - 100, borderOffset.y - 20, "click on map to move player", {
      font: 'pixelFont',
      color: '#ffffff',
      fontSize: '16px'
    });
    //setup camera;
    this.cameras.main.setZoom(1);
    this.cameras.main.startFollow(this.player);

    //move characters by click

    this.target = new Phaser.Math.Vector2();
    this.lastDirection = ""

    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      if (this.player.isMoving) {
        console.log("player is moving")
        return
      }
      const {worldX, worldY} = pointer

      const playerIsoPoint = new Phaser.Math.Vector2(this.player.x, this.player.y).subtract(borderOffset);
      const playerCartePt = isometricToCartesian(playerIsoPoint);
      let startTile = getTileCoordinates(playerCartePt, this.tileHeight);

      const isoPoint = new Phaser.Math.Vector2(worldX, worldY).subtract(borderOffset);
      const cartePt = isometricToCartesian(isoPoint);
      let targetTile = getTileCoordinates(cartePt, this.tileHeight);
      //round on border when click outside the map
      if (targetTile.x > this.mapWidth - 1) targetTile.x = this.mapWidth - 1;
      if (targetTile.y > this.mapHeight - 1) targetTile.y = this.mapHeight - 1;
      if (targetTile.x < 0) targetTile.x = 0;
      if (targetTile.y < 0) targetTile.y = 0;

      this.playerPostionTxt.setText(`move from: [${startTile.x},${startTile.y}] to: [${targetTile.x},${targetTile.y}]`)
      // this.player.moveOnPath(targetTile, [0])

      this.player.findPathAndMove(targetTile, [1], 0);

    })

    // remember to clean up on Scene shutdown
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_UP)
    })
  }

  update(time, delta) {
    const distanceToMonster = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.portal.x, this.portal.y);
    if (distanceToMonster < this.tileHeight * 2) {

      this.cameras.main.fadeOut(250, 0, 0, 0, (camera, progress) => {
        this.player.isMoving = true;
        this.mapGroup.destroy(true, true);
        this.player.resetPosition({x: 16, y: 29})
        this.player.anims.play('IDLE-NE')
        this.buildTileMap(0, TILE_SETS.TILES.KEY, DATA.MAP2.KEY);
        if (progress === 1) {
          this.cameras.main.fadeIn(500, 0, 0, 0, (camera, progress) => {
            if (progress === 1) {
              this.player.isMoving = false;
            }
          })
        }
      })


    }
  }

  //create a group of graphics
  buildTileMap(layerId = 0, tileSetKey, mapKey) {
    this.mapData = this.cache.json.get(mapKey);
    this.tileHeight = this.mapData.tileheight;

    this.mapWidth = this.mapData.width;
    this.mapHeight = this.mapData.height;
    this.mapGroup = this.add.group();
    const levelData = listToMatrix(this.mapData.layers[layerId].data, this.mapWidth);
    for (let i = 0; i < this.mapWidth; i++) {
      for (let j = 0; j < this.mapHeight; j++) {
        //calculate cartesian coordinates
        const x = j * this.tileHeight;
        const y = i * this.tileHeight;
        const tileType = levelData[i][j];
        //convert cartesian coordinates to isometric coordinates
        const cartePoint = new Phaser.Math.Vector2(x, y)
        const isoPoint = cartesianToIsometric(cartePoint);
        //place tile
        let tile;
        if (tileType > 0) {
          tile = this.add.image(
            isoPoint.x + borderOffset.x,
            isoPoint.y + borderOffset.y,
            tileSetKey, tileType - 1);
          tile.setOrigin(0, 0)
          tile.setDepth(-1)
          this.mapGroup.add(tile);
        }
      }
    }
  }

  createMonster(x, y, monsterKey) {
    //TODO: Move these 3 line of code to a function
    const cartePoint = new Phaser.Math.Vector2(x * this.tileHeight, y * this.tileHeight);
    const isoPoint = cartesianToIsometric(cartePoint);
    const position = isoPoint.add(borderOffset);
    const monster = this.add.sprite(position.x, position.y,monsterKey);
    monster.setOrigin(0, 0.5);
    monster.setScale(1);
    //create animation
    const config = {
      key: monsterKey,
      frames: this.anims.generateFrameNumbers(monsterKey, {start: 0, end: 3}),
      frameRate: 4,
      repeat: -1
    };

    this.anims.create(config);
    monster.play(monsterKey);
    return monster;

  }

  //TODO: move portal to unique class
  createPortal(x, y) {
    //TODO: Move these 3 line of code to a function
    const cartePoint = new Phaser.Math.Vector2(x * this.tileHeight, y * this.tileHeight);
    const isoPoint = cartesianToIsometric(cartePoint);
    const position = isoPoint.add(borderOffset);
    const portal = this.add.sprite(position.x, position.y, SPRITES_SHEETS.PORTAL.KEY);
    portal.setOrigin(0, 0.5);
    portal.setScale(0.5, 0.4);

    //create animation
    const config = {
      key: 'portalAnimation',
      frames: this.anims.generateFrameNumbers(SPRITES_SHEETS.PORTAL.KEY, {start: 0, end: 3}),
      frameRate: 4,
      repeat: -1
    };

    this.anims.create(config);
    portal.play('portalAnimation');

    return portal;

  }
}

export default MapScene;