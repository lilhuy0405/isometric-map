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
    this.load.json(DATA.MAP.KEY, DATA.MAP.PATH);

    this.load.image('monster', 'assets/goblin.png');
  }

  create() {
    this.mapData = this.cache.json.get(DATA.MAP.KEY);
    this.tileHeight = this.mapData.tileheight;

    this.mapWidth = this.mapData.width;
    this.mapHeight = this.mapData.height;

    //Build Map automatically from json filed or add to graphics groups
    this.buildTileMap(0, TILE_SETS.TILES.KEY)
    // this.buildTileMap(1, TILE_SETS.TILES.KEY)
    //IMPORTANT: The order of the layer is important
    this.monster = this.createMonster(13, 3)
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

  }

  //create a group of graphics
  buildTileMap(layerId = 0, tileSetKey) {
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
        }
      }
    }
  }

  createMonster(x, y) {
    //TODO: Move these 3 line of code to a function
    const cartePoint = new Phaser.Math.Vector2(x * this.tileHeight, y * this.tileHeight);
    const isoPoint = cartesianToIsometric(cartePoint);
    const position = isoPoint.add(borderOffset);
    const monster = this.add.image(position.x, position.y, 'monster');
    monster.setOrigin(0, 0.5);
    monster.setScale(0.2);

    return monster;

  }
}

export default MapScene;