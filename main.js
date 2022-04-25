import * as Phaser from "phaser";
import MyScene from "./MyScene";


export default class MyGame extends Phaser.Game {
  constructor() {
    const config = {
      type: Phaser.WEBGL,
      width: 800,
      height: 600,
      backgroundColor: '#2d2d2d',
      pixelArt: true,
      scene: [
        MyScene
      ],
      physics: {
        default: 'matter',
        matter: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
    };
    super(config);
  }
}
new MyGame();

