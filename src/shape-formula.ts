import './util/polyfill';
import {Point, CircleShape, EllipseShape} from './shapes';

/**
 * 直接方程式 Ax +  By + C = 0
 */
export type LineFormula = {
  A: number;
  B: number;
  C: number;
};

/**
 * 圆方程 x² + y² + Dx + Ey + F = 0
 */
export type CircleFormula = {
  D: number;
  E: number;
  F: number;
};

/**
 * 椭圆方程 Ax² + By² + Dx + Ey + F = 0
 */
export type EllipseFormula = {
  A: number;
  B: number;
} & CircleFormula;

/**
 * 一元二次方程 Ax² + Bx + C = 0
 */
export type QuadraticFormula = {
  A: number;
  B: number;
  C: number;
};

/**
 * y-y1=(y2-y1)/(x2-x1)×(x-x1)
 * (y-y1)x(x2-x1)=(y2-y1)*(x-x1)
 */
export function getLineFormula(
  {x: x1, y: y1}: Point,
  {x: x2, y: y2}: Point
): LineFormula {
  return {
    A: y2 - y1,
    B: x1 - x2,
    C: x2 * y1 - x1 * y2,
  };
}

/**
 *  圆心为 O(a, b)
 *  (x-a)² + (y-b)² = r² => x² + y² + Dx + Ey + F = 0
 */
export function getCircleFormula({
  center: {x, y},
  dimension: {r},
}: CircleShape): CircleFormula {
  return {
    D: -2 * x,
    E: -2 * y,
    F: Math.pow(x, 2) + Math.pow(y, 2) - Math.pow(r, 2),
  };
}

export function getEllipseFormula({
  center: {x, y},
  dimension: {rx, ry},
}: EllipseShape): EllipseFormula {
  const expOfRx = Math.pow(rx, 2);
  const expOfRy = Math.pow(ry, 2);
  return {
    A: expOfRy,
    B: expOfRx,
    D: -2 * x * expOfRx,
    E: -2 * y * expOfRy,
    F: expOfRy * Math.pow(x, 2) + expOfRx * Math.pow(y, 2) - expOfRx * expOfRy,
  };
}
