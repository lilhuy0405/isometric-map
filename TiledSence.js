import Phaser, {Game, Scene} from 'phaser';


class TiledScene extends Scene {
  constructor() {
    super({
      key: 'MyScene',
      physics: {
        default: 'arcade',
        arcade: {
          debug: true,
          gravity: {y: 0}
        }
      }
    })
  }

  preload() {
    this.load.image('tiles', 'assets/tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/demo.json');

    this.load.json("map-json", "assets/demo.json");
    this.load.spritesheet("tiles-sprites", "assets/tileset.png", {frameWidth: 32, frameHeight: 32});
    // this.load.json("map", "assets/demo.json");
    // this.load.spritesheet("tiles", "assets/tileset.png", {frameWidth: 32, frameHeight: 32});

    //   this.load.image("tiles", "assets/tileset.png");
    this.load.image("singleTile", "assets/tile2.png");
    this.load.image("cube", "assets/cube.png");
    this.load.spritesheet("player", "assets/css_sprites.png", {
      frameWidth: 299,
      frameHeight: 240
    });

    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48
    });

  }

  create() {

    this.map = this.add.tilemap('map');

    const tiles = this.map.addTilesetImage('Isometirc-Template', 'tiles');
    const layer = this.map.createLayer('Bottom', [tiles]);
    const layer2 = this.map.createLayer('Top', [tiles]);
    this.collisionGroup = this.physics.add.staticGroup();
    this.buildCollisions();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.setZoom(2);

    this.player = this.physics.add.sprite(100, 100, 'dude');
    this.player.depth = 10000;
 //   this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.collisionGroup);
    this.physics.add.collider(this.player, layer);

    this.cameras.main.setBounds(0, 0);
    this.cameras.main.startFollow(this.player);


  }

  update(time, delta) {
    this.player.setVelocity(0, 0)
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
    }


  }


  buildCollisions() {
    const data = this.cache.json.get("map-json");

    const tilewidth = data.tilewidth;
    const tileheight = data.tileheight;

    const tileWidthHalf = tilewidth / 2;
    const tileHeightHalf = tileheight / 2;

    const layer = data.layers[1].data;

    const mapwidth = data.layers[1].width;
    const mapheight = data.layers[1].height;

    const centerX = mapwidth * tileWidthHalf;
    const centerY = mapheight * tileWidthHalf;

    let i = 0;

    for (let y = 0; y < mapheight; y++) {
      for (let x = 0; x < mapwidth; x++) {
        const id = layer[i] - 1;
        if (id > 0) {
          const tx = (x - y) * tileWidthHalf;
          const ty = (x + y) * tileHeightHalf;

          // const tile = this.add.image(centerX + tx, centerY + ty, "tiles", id);
          // tile.depth = centerY + ty;
          this.collisionGroup.create(centerX + tx, centerY + ty, "tiles-sprites", id);
        }


        i++;
      }
    }
  }
}

export default TiledScene;