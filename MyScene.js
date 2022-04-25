import * as Phaser from "phaser";

class MyScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'MyScene',
      physics: {
        default: 'matter',
        matter: {
          gravity: {x: 0, y: 0},
          debug: false
        }
      },
    })


  }

  preload() {
    //load tileset images
    this.load.image("ground-tileset", "assets/ground.png");
    this.load.image("bridges-tileset", "assets/bridges.png");
    this.load.image("trees-tileset", "assets/trees.png");
    this.load.image("houses-tileset", "assets/houses.png");
    this.load.image("houses1-tileset", "assets/houses1.png");
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    //load character sprite sheet
    this.load.spritesheet('dude',
      'assets/dude.png',
      {frameWidth: 32, frameHeight: 48}
    );

  }

  create() {
    // console.log(this.cache.tilemap.get('map').data);
    const map = this.make.tilemap({key: 'map'});
    console.log(map);

    //add tileset to map addTilesetImage(key-from-map.json, image-key-from-preload)
    const groundTileSet = map.addTilesetImage('grounds', 'ground-tileset');
    const bridgesTileSet = map.addTilesetImage('bridges', 'bridges-tileset');
    const treesTileSet = map.addTilesetImage('tree', 'trees-tileset');
    const housesTileset = map.addTilesetImage('houses', 'houses-tileset');
    const houses1TileSet = map.addTilesetImage('houses1', 'houses1-tileset');

    //add layer to map createLayer(key-from-map.json, [tileset list])
    const groundLayer = map.createLayer('Grounds', [groundTileSet]);
    const propsLayer = map.createLayer('Props', [bridgesTileSet, treesTileSet, housesTileset, houses1TileSet]);
    const collisionLayer = map.createLayer('Collisions', [groundTileSet]);
    this.player = this.matter.add.sprite(100, 450, 'dude');
    //create anims for character
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
      frameRate: 20,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{key: 'dude', frame: 4}],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
      frameRate: 20,
      repeat: -1
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.matter.world.createDebugGraphic();

    //this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(0.5);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    //collision detection
    // property "collides" is set on certain tiles within Tiled
    collisionLayer.setCollisionByProperty({ collides: true })
    this.matter.world.convertTilemapLayer(collisionLayer)

    // const controlConfig = {
    //   camera: this.cameras.main,
    //   left: cursors.left,
    //   right: cursors.right,
    //   up: cursors.up,
    //   down: cursors.down,
    //   acceleration: 0.04,
    //   drag: 0.0005,
    //   maxSpeed: 0.7
    // };
    //
    // this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

  }

  update(time, delta) {
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-5);

    } else if (this.cursors.right.isDown) {
      this.player.setAngle(0).setVelocityX(5);

    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-5);

    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(5);

    }

  }
}

export default MyScene;
