
import * as Phaser from "phaser";
import MyScene from "./MyScene";
import TiledSence from "./TiledSence";
import UsePlugin from "./UsePlugin";

export default class MyGame extends Phaser.Game {
  constructor() {
    const config = {
      type: Phaser.WEBGL,
      width: 1000,
      height: 700,
      backgroundColor: '#2d2d2d',
      pixelArt: true,
      scene: [
        MyScene
      ]
    };
    super(config);
  }
}
new MyGame();


