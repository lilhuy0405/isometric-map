import Phaser, {Game, Scene} from 'phaser';
import IsoPlugin, {IsoPhysics} from 'phaser3-plugin-isometric';

const MAP_WIDTH = 1024;
const MAP_HEIGHT = 1024;

class UsePlugin extends Scene {
  constructor() {
    super({
      key: 'UsePlugin',
      mapAdd: {isoPlugin: 'iso', isoPhysics: 'isoPhysics', debug: true}
    })
  }

  preload() {
    this.load.image('cube', 'assets/cube.png');
    this.load.image("grass", "assets/grass1.png");
    this.load.image("floor", "assets/ground_tile.png");
    this.load.image("tile", "assets/tile2.png");
    this.load.image("cube", "assets/tile2.png");
    this.load.image("house", "assets/house.png");
    this.load.scenePlugin({
      key: 'IsoPlugin',
      url: IsoPlugin,
      sceneKey: 'iso'
    });

    this.load.scenePlugin({
      key: 'IsoPhysics',
      url: IsoPhysics,
      sceneKey: 'isoPhysics'
    });

    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48
    });


  }

  create() {

    // create groups for different tiles
    this.floorGroup = this.add.group();

    // itemGroup = game.add.group();
    // grassGroup = game.add.group();
    this.obstacleGroup = this.add.group();

    // set the gravity in our game
    this.isoPhysics.world.gravity.setTo(0, 0, 0);

    this.iso.projector.origin.setTo(0.5, 0.15);

    //this.isoPhysics.world.setBounds(0, 0, 1024, 2048);
    // create the floor
    this.spawnTiles("tile", this.floorGroup);
    //create some obj
    this.placeHouse("house", this.obstacleGroup);
    // this.spawnCubes()
    // create player
    this.player = this.add.isoSprite(0, 0, 100, 'dude', this.obstacleGroup);
    this.isoPhysics.world.enable(this.player);
     // this.player.body.collideWorldBounds = true;


    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.setZoom(1);
    // this.cameras.main.setBounds(2048, 1024);
    this.cameras.main.startFollow(this.player);


  }

  update(time, delta) {
    console.log(this.player.body.x, this.player.body.y);
    //Collide cubes against each other
    if (this.player.body.z < 0) {
      this.player.body.z = 0;
    }
    this.isoPhysics.world.collide(this.obstacleGroup);

    this.player.body.velocity.setTo(0, 0, 0);

    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -200;
    } else if (this.cursors.right.isDown) {

      this.player.body.velocity.x = 160;
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.velocity.y = -160;
    } else if (this.cursors.down.isDown) {
      this.player.body.velocity.y = 160;
    }
  }

  spawnTiles(tileKey, group, startX = 0, startY = 0) {
    let tile;
    // let tile2;

    for (let x = 0; x < 800; x += 40) {
      for (let y = 0; y < 800; y += 40) {
        tile = this.add.isoSprite(x + startX, y + startY, 0, tileKey, group);
      }
    }
  }

  spawnCubes() {
    let cube;
    for (let xx = 256; xx > 0; xx -= 64) {
      for (let yy = 256; yy > 0; yy -= 64) {
        // Add a cube which is way above the ground
        cube = this.add.isoSprite(xx, yy, 600, 'cube', this.obstacleGroup);

        // Enable the physics body on this cube
        this.isoPhysics.world.enable(cube);

        // Collide with the world bounds so it doesn't go falling forever or fly off the screen!
        cube.body.collideWorldBounds = true;

        // Add a full bounce on the x and y axes, and a bit on the z axis.
        // cube.body.bounce.set(1, 1, 0.2);

        // Send the cubes off in random x and y directions! Wheee!
        const randomX = Math.trunc((Math.random() * 100 - 50));
        const randomY = Math.trunc((Math.random() * 100 - 50));
        cube.body.velocity.setTo(randomX, randomY, 0);
      }
    }

  }

  placeHouse(tileKey, isoGroup) {
    let house = this.add.isoSprite(500, 500, 100, tileKey, isoGroup);
    this.isoPhysics.world.enable(house);
    house.body.collideWorldBounds = true;
    house.body.immovable = true
  }
}

export default UsePlugin;