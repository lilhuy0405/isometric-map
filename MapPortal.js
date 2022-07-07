import Phaser from "phaser";
import {cartesianToIsometric} from "./utils";
import {borderOffset, DATA, SPRITES_SHEETS, TILE_SETS} from "./configs/assets";

export default class MapPortal extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y, data) {
    super(scene)
    this.from = data.from
    this.to = data.to
    this.spawnPosition = data.spawnPosition
    this.setTexture(SPRITES_SHEETS.PORTAL.KEY);
    const cartePoint = new Phaser.Math.Vector2(x * this.scene.tileHeight, y * this.scene.tileHeight);
    const isoPoint = cartesianToIsometric(cartePoint);
    const position = isoPoint.add(borderOffset);
    this.setPosition(position.x, position.y);
    this.setOrigin(0, 0.5);
    this.setScale(0.5, 0.4);
    this.createAnimation();
  }

  // preUpdate(time, delta) {
  //
  //
  // }


  createAnimation() {
    //create animation
    const config = {
      key: 'portalAnimation',
      frames: this.scene.anims.generateFrameNumbers(SPRITES_SHEETS.PORTAL.KEY, {start: 0, end: 3}),
      frameRate: 4,
      repeat: -1
    };

    this.scene.anims.create(config);
    this.play('portalAnimation');
  }
}