import * as Phaser from "phaser";
import {DIRECTIONS} from "../configs/animation";

export const cartesianToIsometric = (cartPoint) => {
  const tempPt = new Phaser.Math.Vector2();
  tempPt.x = cartPoint.x - cartPoint.y;
  tempPt.y = (cartPoint.x + cartPoint.y) / 2;
  return (tempPt);
}

export const isometricToCartesian = (isoPt) => {
  const tempPt = new Phaser.Math.Vector2();
  tempPt.x = (2 * isoPt.y + isoPt.x) / 2;
  tempPt.y = (2 * isoPt.y - isoPt.x) / 2;
  return (tempPt);
}

export const listToMatrix = (list, elementsPerSubArray) => {
  let matrix = [], i, k;

  for (i = 0, k = -1; i < list.length; i++) {
    if (i % elementsPerSubArray === 0) {
      k++;
      matrix[k] = [];
    }

    matrix[k].push(list[i]);
  }

  return matrix;
}

export const getTileCoordinates = (cartPt, tileHeight) => {
  const tempPt = new Phaser.Math.Vector2();
  tempPt.x = Math.floor(cartPt.x / tileHeight);
  tempPt.y = Math.floor(cartPt.y / tileHeight);
  return (tempPt);
}

export const isNumberBelongsToRange = (number, range) => {
  if (range.length < 2) {
    throw new Error("isNumberBelongsToRange: range must be an array with 2 elements")
  }
  if (range[0] > range[1]) {
    throw new Error("isNumberBelongsToRange: invalid range start must larger than end")
  }
  return number >= range[0] && number <= range [1];
}

export const fromRadianToDegree = (radian) => {
  return radian * 180 / Math.PI
}