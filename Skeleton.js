import Phaser, { GameObjects } from 'phaser';
import {SPRITES} from "./assets";


export default class Skeleton extends GameObjects.Image {
    scene = null;

    static DIRECTIONS = {
        WEST: 'west',
        NORTH_WEST: 'northWest',
        NORTH: 'north',
        NORTH_EAST: 'northEast',
        EAST: 'east',
        SOUTH_EAST: 'southEast',
        SOUTH: 'south',
        SOUTH_WEST: 'southWest'
    };

    static ANIMATIONS = {
        IDLE: 'idle',
        WALK: 'walk',
        ATTACK: 'attack',
        DIE: 'die',
        SHOOT: 'shoot'
    };

    directions = {
        [Skeleton.DIRECTIONS.WEST]: { offset: 0, x: -2, y: 0, opposite: Skeleton.DIRECTIONS.EAST },
        [Skeleton.DIRECTIONS.NORTH_WEST]: {
            offset: 32,
            x: -2,
            y: -1,
            opposite: Skeleton.DIRECTIONS.SOUTH_EAST
        },
        [Skeleton.DIRECTIONS.NORTH]: { offset: 64, x: 0, y: -2, opposite: Skeleton.DIRECTIONS.SOUTH },
        [Skeleton.DIRECTIONS.NORTH_EAST]: {
            offset: 96,
            x: 2,
            y: -1,
            opposite: Skeleton.DIRECTIONS.SOUTH_WEST
        },
        [Skeleton.DIRECTIONS.EAST]: { offset: 128, x: 2, y: 0, opposite: Skeleton.DIRECTIONS.WEST },
        [Skeleton.DIRECTIONS.SOUTH_EAST]: {
            offset: 160,
            x: 2,
            y: 1,
            opposite: Skeleton.DIRECTIONS.NORTH_WEST
        },
        [Skeleton.DIRECTIONS.SOUTH]: { offset: 192, x: 0, y: 2, opposite: Skeleton.DIRECTIONS.NORTH },
        [Skeleton.DIRECTIONS.SOUTH_WEST]: {
            offset: 224,
            x: -2,
            y: 1,
            opposite: Skeleton.DIRECTIONS.NORTH_EAST
        }
    };

    anims = {
        [Skeleton.ANIMATIONS.IDLE]: {
            startFrame: 0,
            endFrame: 4,
            speed: 0.2
        },
        [Skeleton.ANIMATIONS.WALK]: {
            startFrame: 4,
            endFrame: 12,
            speed: 0.15
        },
        [Skeleton.ANIMATIONS.ATTACK]: {
            startFrame: 12,
            endFrame: 20,
            speed: 0.11
        },
        [Skeleton.ANIMATIONS.DIE]: {
            startFrame: 20,
            endFrame: 28,
            speed: 0.2
        },
        [Skeleton.ANIMATIONS.SHOOT]: {
            startFrame: 28,
            endFrame: 32,
            speed: 0.1
        }
    };

    constructor(scene, { x, y, motion, direction, distance }) {
        super(scene, x, y, SPRITES.SKELETON.KEY);
        this.scene = scene;
        this.startX = x;
        this.startY = y;
        this.distance = distance;

        this.motion = motion;
        this.anim = this.anims[motion];
        this.direction = this.directions[direction];
        this.speed = 0.15;
        this.f = this.anim.startFrame;

        this.depth = y + 64;

        this.scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
    }

    changeFrame() {
        this.f++;
        let delay = this.anim.speed;
        if (this.f === this.anim.endFrame) {
            switch (this.motion) {
                case Skeleton.ANIMATIONS.WALK:
                    this.f = this.anim.startFrame;
                    this.frame = this.texture.get(this.direction.offset + this.f);
                    this.scene.time.delayedCall(delay * 1000, this.changeFrame, [], this);
                    break;
                case Skeleton.ANIMATIONS.ATTACK:
                    delay = Math.random() * 2;
                    this.scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;
                case Skeleton.ANIMATIONS.IDLE:
                    delay = 0.5 + Math.random();
                    this.scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;
                case Skeleton.ANIMATIONS.DIE:
                    delay = 6 + Math.random() * 6;
                    this.scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;
                default:
                    break;
            }
        } else {
            this.frame = this.texture.get(this.direction.offset + this.f);
            this.scene.time.delayedCall(delay * 1000, this.changeFrame, [], this);
        }
    }

    resetAnimation() {
        this.f = this.anim.startFrame;
        this.frame = this.texture.get(this.direction.offset + this.f);
        this.scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
    }

    update() {
        if (this.motion === Skeleton.ANIMATIONS.WALK) {
            this.x += this.direction.x * this.speed;

            if (this.direction.y !== 0) {
                this.y += this.direction.y * this.speed;
                this.depth = this.y + 64;
            }

            //  Walked far enough?
            if (Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y) >= this.distance) {
                this.direction = this.directions[this.direction.opposite];
                this.f = this.anim.startFrame;
                this.frame = this.texture.get(this.direction.offset + this.f);
                this.startX = this.x;
                this.startY = this.y;
            }
        }
    }
}
