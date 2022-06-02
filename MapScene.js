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

  }

  preload() {

    this.load.spritesheet(SPRITES_SHEETS.PLAYER.KEY, SPRITES_SHEETS.PLAYER.PATH, SPRITES_SHEETS.PLAYER.FRAME_CONFIG);
    //TODO: Don't hard code the frame config
    this.load.spritesheet(TILE_SETS.TILES.KEY, TILE_SETS.TILES.PATH, {frameWidth: 32, frameHeight: 32});
    this.load.json(DATA.MAP.KEY, DATA.MAP.PATH);
  }

  create() {
    this.mapData = this.cache.json.get(DATA.MAP.KEY);
    this.tileWidth = this.mapData.tilewidth;
    this.tileHeight = this.mapData.tileheight;

    //Build Map automatically from json filed or add to graphics groups
    this.buildTileMap(0)
    this.buildTileMap(1)
    //build player
    this.player = this.add.existing(new Player(this, 0, 7));

    this.playerPostionTxt = this.add.text(borderOffset.x - 100, borderOffset.y - 20, "click on map to move player", {
      font: 'pixelFont',
      color: '#ffffff',
      fontSize: '16px'
    });
    //setup camera;
    this.cameras.main.setZoom(2);
    this.cameras.main.startFollow(this.player);
    //move characters by click

    this.target = new Phaser.Math.Vector2();
    this.lastDirection = ""

    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      const {worldX, worldY} = pointer

      const playerIsoPoint = new Phaser.Math.Vector2(this.player.x, this.player.y).subtract(borderOffset);
      const playerCartePt = isometricToCartesian(playerIsoPoint);
      let startTile = getTileCoordinates(playerCartePt, DATA.MAP.TILE_HEIGHT);

      const isoPoint = new Phaser.Math.Vector2(worldX, worldY).subtract(borderOffset);
      const cartePt = isometricToCartesian(isoPoint);
      let targetTile = getTileCoordinates(cartePt, DATA.MAP.TILE_HEIGHT);
      //round on border when click outside the map
      if (targetTile.x > DATA.MAP.TILE_HEIGHT - 1) targetTile.x = DATA.MAP.TILE_HEIGHT - 1;
      if (targetTile.y > DATA.MAP.TILE_HEIGHT - 1) targetTile.y = DATA.MAP.TILE_HEIGHT - 1;
      if (targetTile.x < 0) targetTile.x = 0;
      if (targetTile.y < 0) targetTile.y = 0;

      this.playerPostionTxt.setText(`move from: [${startTile.x},${startTile.y}] to: [${targetTile.x},${targetTile.y}]`)
      this.player.moveOnPath(startTile, targetTile, this.mapData.layers[1].data, [0])

    })

    // remember to clean up on Scene shutdown
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_UP)
    })
  }

  update(time, delta) {

  }

  //create a group of graphics
  buildTileMap(layerId = 0) {
    // this.cache.load.json
    const data = this.cache.json.get(DATA.MAP.KEY);
    const mapWidth = data.layers[layerId].width;
    const mapHeight = data.layers[layerId].height;
    const tileWidth = data.tilewidth;
    const tileHeight = data.tileheight;
    const levelData = listToMatrix(data.layers[layerId].data, mapWidth);
    for (let i = 0; i < mapWidth; i++) {
      for (let j = 0; j < mapHeight; j++) {
        //calculate cartesian coordinates
        const x = j * tileHeight;
        const y = i * tileHeight
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
            TILE_SETS.TILES.KEY, tileType - 1);
          tile.setOrigin(0, 0)
        }
      }
    }
  }


}

export default MapScene;