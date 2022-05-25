import {Scene} from "phaser";


class MyScene extends Scene {
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
  }

  preload() {
    this.load.image('tiles', 'assets/tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/demo.json');

    this.load.spritesheet("player", "assets/spritesheet.png", {
      frameWidth: 299,
      frameHeight: 240
    });

    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48
    });

  }

  create() {

    const map = this.add.tilemap('map');
    const groundTiles = map.addTilesetImage('Isometirc-Template', 'tiles');

    const layer1 = map.createLayer('Bottom', [groundTiles]);
    const layer2 = map.createLayer('Top', [groundTiles]);

    this.player = this.physics.add.sprite(0, 200, 'player');
    this.player.setScale(0.3)
    //create anims
    this.anims.create({
      key: 'S',
      frames: this.anims.generateFrameNumbers('player', {start: 0, end: 3}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'SE',
      frames: this.anims.generateFrameNumbers('player', {start: 4, end: 7}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'E',
      frames: this.anims.generateFrameNumbers('player', {start: 8, end: 11}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'NE',
      frames: this.anims.generateFrameNumbers('player', {start: 12, end: 15}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'N',
      frames: this.anims.generateFrameNumbers('player', {start: 16, end: 19}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'NW',
      frames: this.anims.generateFrameNumbers('player', {start: 20, end: 23}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'W',
      frames: this.anims.generateFrameNumbers('player', {start: 24, end: 27}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'SW',
      frames: this.anims.generateFrameNumbers('player', {start: 28, end: 31}),
      frameRate: 10,
      repeat: -1
    });
    //  this.player.setCollideWorldBounds(true);

    this.cameras.main.setZoom(2);
    this.cameras.main.startFollow(this.player)

    this.target = new Phaser.Math.Vector2();
    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      const {worldX, worldY} = pointer

      const startVec = layer1.worldToTileXY(this.player.x, this.player.y)
      const targetVec = layer1.worldToTileXY(worldX, worldY)

      this.target.x = worldX;
      this.target.y = worldY;
      this.physics.moveToObject(this.player, this.target, 150);
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);
      const cosAngle = (this.target.y - this.player.y) / distance
      let degree = this.fromRadianToDegree(Math.acos(cosAngle))
      if (this.target.x < this.player.x) {
        degree = 360 - degree
      }
      const direction = this.detectDirection(degree)
      switch (direction) {
        case "N":
          this.player.anims.play("N")
          break;
        case "NE":
          this.player.anims.play("NE")
          break;
        case "E":
          this.player.anims.play("E")
          break;
        case "SE":
          this.player.anims.play("SE")
          break;
        case "S":
          this.player.anims.play("S")
          break;
        case "SW":
          this.player.anims.play("SW")
          break;
        case "W":
          this.player.anims.play("W")
          break
        case "NW":
          this.player.anims.play("NW")
          break
      }
    })

    // remember to clean up on Scene shutdown
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_UP)
    })
  }

  update(time, delta) {
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);

    if (this.player.body.speed > 0 && distance < 4) {
      this.player.body.reset(this.target.x, this.target.y);
      this.player.anims.play("S")
    }
  }

  fromRadianToDegree(radian) {
    return radian * 180 / Math.PI
  }

  detectDirection(degree) {
    /*350 -> 360 ||  0 -> 10 returns S
      10 -> 50 return SE
     */
    if ((degree > 350 && degree < 360) || (degree > 0 && degree < 10)) {
      return "S"
    }
    if (degree > 10 && degree < 80) return "SE"
    if (degree > 80 && degree < 110) return "E"
    if (degree > 110 && degree < 170) return "NE"
    if (degree > 170 && degree < 190) return "N"
    if (degree > 190 && degree < 260) return "NW"
    if (degree > 260 && degree < 280) return "W"
    if (degree > 280 && degree < 350) return "SW"

  }
}

export default MyScene;