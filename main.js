import * as Phaser from "phaser";
import MapScene from "./MapScene";


export default class MyGame extends Phaser.Game {
  constructor() {
    const config = {
      type: Phaser.WEBGL,
      width: 1000,
      height: 700,
      backgroundColor: '#182830',
      pixelArt: true,
      parent: 'MapScene',
      scene: [
        MapScene
      ],
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
          gravity: {x: 0, y: 0, z: 0}
        }
      }
    };
    super(config);
  }
}
new MyGame();


