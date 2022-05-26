import * as Phaser from "phaser";
import MapScene from "./MapScene";


export default class MyGame extends Phaser.Game {
  constructor() {
    const config = {
      type: Phaser.WEBGL,
      width: 1000,
      height: 700,
      backgroundColor: '#2d2d2d',
      pixelArt: true,
      scene: [
        MapScene
      ]
    };
    super(config);
  }
}
new MyGame();


