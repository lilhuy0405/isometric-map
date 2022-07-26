import * as  Phaser from "phaser";
import {borderOffset, DATA, MAP_OBJECT_TYPES, SPRITES_SHEETS, TILE_SETS} from "./configs/assets";
import {
  cartesianToIsometric,
  getTileCoordinates,
  isometricToCartesian,
  listToMatrix
} from "./utils";
import Player from "./Player";
import {IDLE_ANIMATION_KEY_PREFIX} from "./configs/animation";
import MapPortal from "./MapPortal";


class MapScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'MapScene',
      backgroundColor: '#fff',
    })
    this.mapData = null;
    this.tileHeight = 0;

    this.mapWidth = 0;
    this.mapHeight = 0;
    this.heroSpawnPlaces = [];
    this.portals = [];
    this.heroSpawnPosition = ''
    this.cameraZoom = 1;
  }

  preload() {

    this.load.spritesheet(SPRITES_SHEETS.PLAYER.KEY, SPRITES_SHEETS.PLAYER.PATHS[7], SPRITES_SHEETS.PLAYER.FRAME_CONFIG);

    this.load.spritesheet(TILE_SETS.TILES.KEY, TILE_SETS.TILES.PATH, {
      frameWidth: TILE_SETS.TILES.WIDTH,
      frameHeight: TILE_SETS.TILES.HEIGHT
    });
    //portal
    this.load.spritesheet(SPRITES_SHEETS.PORTAL.KEY, SPRITES_SHEETS.PORTAL.PATH, SPRITES_SHEETS.PORTAL.FRAME_CONFIG);
    //monsters
    for (const [key, value] of Object.entries(SPRITES_SHEETS.MONSTERS)) {
      this.load.spritesheet(value.KEY, value.PATH, value.FRAME_CONFIG);
    }

    // this.load.spritesheet(SPRITES_SHEETS.MONSTERS.RAT.KEY, SPRITES_SHEETS.MONSTERS.RAT.PATH, SPRITES_SHEETS.MONSTERS.RAT.FRAME_CONFIG);
    // this.load.json(DATA.MAP.KEY, DATA.MAP.PATH);
    // this.load.json(DATA.MAP2.KEY, DATA.MAP2.PATH);

    for (const [key, value] of Object.entries(DATA)) {
      console.log(`${key}: ${value}`);
      this.load.json(value.KEY, value.PATH);
    }

    this.load.image('monster', 'assets/goblin.png');
  }

  create() {
    //Build Map automatically from json filed or add to graphics groups
    this.buildTileMap(0, TILE_SETS.TILES.KEY, DATA.MAP.KEY);

    this.playerPostionTxt = this.add.text(borderOffset.x - 100, borderOffset.y - 20, "click on map to move player", {
      font: 'pixelFont',
      color: '#ffffff',
      fontSize: '16px'
    });
    //setup camera;
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(this.cameraZoom)

    //move characters by click

    this.target = new Phaser.Math.Vector2();
    this.lastDirection = ""

    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      // if (this.player.isMoving) {
      //   console.log("player is moving")
      //   return
      // }
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

      this.player.findPathAndMove(targetTile, [1, 2, 3, 4], 0);

    })

    // remember to clean up on Scene shutdown
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_UP)
    })
  }

  update(time, delta) {
    this.portals.forEach(portal => {
      const distancePlayerToThisPortal = Phaser.Math.Distance.Between(this.player.x, this.player.y, portal.x, portal.y);

      if (distancePlayerToThisPortal < this.tileHeight * 2) {
        this.cameras.main.fadeOut(0, 0, 0, 0, (camera, progress) => {
          if (progress === 1) {
            this.heroSpawnPosition = portal.spawnPosition;
            console.log("hero spwan position", this.heroSpawnPosition)
            this.buildTileMap(0, TILE_SETS.TILES.KEY, portal.to)

            this.cameras.main.fadeIn(2000, 0, 0, 0, (camera, progress) => {
              if (progress === 1) {
                this.player.isMoving = false;
              }
            })
          }
        })
      }
    })
  }

  //create a group of graphics
  //destroy old map if exist
  //build old map base on json file
  buildTileMap(layerId = 0, tileSetKey, mapKey) {
    if (this.player) {
      this.player.destroy(true);
    }
    if (this.monsterGroup) {
      this.monsterGroup.destroy(true, true);
    }

    if (this.mapGroup) {
      this.mapGroup.destroy(true, true);
    }
    if (this.heroSpawnPlaces.length > 0) {
      this.heroSpawnPlaces = [];
    }
    if (this.portals.length > 0) {
      console.log('reset portals')
      this.portals.forEach(portal => {
        portal.destroy(true)
      })
      this.portals = [];
    }
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

    this.monsterGroup = this.add.group();
    const objectsLayer = this.mapData.layers.find(layer => layer.name === "Objects");
    if (!objectsLayer) return;
    objectsLayer.objects.forEach(mapObject => {
      switch (mapObject.type) {
        case MAP_OBJECT_TYPES.MONSTER:
          const monsterKey = mapObject.properties.find(property => property.name === "monsterKey").value;
          const monsterMapCartesianPosition = new Phaser.Math.Vector2(mapObject.x, mapObject.y).add({
            x: mapObject.width,
            y: mapObject.height
          });
          const monsterTileCoordinate = getTileCoordinates(monsterMapCartesianPosition, this.tileHeight);
          const monster = this.createMonster(monsterTileCoordinate.x, monsterTileCoordinate.y, monsterKey);
          this.monsterGroup.add(monster);
          break;
        case MAP_OBJECT_TYPES.PORTAL:
          const portalCartesianPosition = new Phaser.Math.Vector2(mapObject.x, mapObject.y)
          const portalTileCoordinate = getTileCoordinates(portalCartesianPosition, this.tileHeight);
          const from = mapObject.properties.find(property => property.name === "from")?.value || "";
          const to = mapObject.properties.find(property => property.name === "to")?.value || "";
          const spawnPosition = mapObject.properties.find(property => property.name === "spawnPosition")?.value || "";
          this.portals.push(this.add.existing(new MapPortal(this, portalTileCoordinate.x, portalTileCoordinate.y, {
            from,
            to,
            spawnPosition
          })));
          console.log("build portal res: ", this.portals)
          break;
        case MAP_OBJECT_TYPES.HERO_SPAWN:
          const heroDirection = mapObject.properties.find(property => property.name === "heroDirection").value;
          const position = mapObject.properties.find(property => property.name === "position").value;
          const spawnCartesianPosition = new Phaser.Math.Vector2(mapObject.x, mapObject.y)
          const spawnTileCoordinate = getTileCoordinates(spawnCartesianPosition, this.tileHeight);
          this.heroSpawnPlaces.push({heroDirection, position, x: spawnTileCoordinate.x, y: spawnTileCoordinate.y});
          console.log("heroswawn: ", this.heroSpawnPlaces)
          break;
      }
    })

    //build player
    //detect spawn place
    console.log("hero spawn places", this.heroSpawnPlaces.length)
    if (this.heroSpawnPlaces.length <= 0) return;
    let spawnPlace = this.heroSpawnPlaces[0];
    if (!this.heroSpawnPosition) {
      this.player = this.add.existing(new Player(this, spawnPlace.x, spawnPlace.y));
      this.player.anims.play(`${IDLE_ANIMATION_KEY_PREFIX}-${spawnPlace.heroDirection}`)
      this.cameras.main.startFollow(this.player);
      return;
    }
    spawnPlace = this.heroSpawnPlaces.find(place => place.position === this.heroSpawnPosition) || this.heroSpawnPlaces[0];
    this.player = this.add.existing(new Player(this, spawnPlace.x, spawnPlace.y));
    this.player.anims.play(`${IDLE_ANIMATION_KEY_PREFIX}-${spawnPlace.heroDirection}`)
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(this.cameraZoom)
  }

  createMonster(x, y, monsterKey) {
    //TODO: Move these 3 line of code to a function
    const cartePoint = new Phaser.Math.Vector2(x * this.tileHeight, y * this.tileHeight);
    const isoPoint = cartesianToIsometric(cartePoint);
    const position = isoPoint.add(borderOffset);
    const monster = this.add.sprite(position.x, position.y, monsterKey);
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

}

export default MapScene;