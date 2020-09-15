import {getCircleFormula, QuadraticFormula} from './shape-formula';
import {CircleShape, Point} from './shapes';
import {getQuadraticSolved} from './formula-resolver';

/**
 *
 * @param circle 圆心
 * @param degree 圆心角
 */
export function circleEdgePoint(circle: CircleShape, degree: number): Point {
  if (degree < 0 || degree > Math.PI * 2) {
    throw new Error('圆心角参数需要大于 0 且小于 2π ');
  }

  const {
    center: {x, y},
    dimension: {r},
  } = circle;
  const {D, E, F} = getCircleFormula(circle);
  const edgeX = x - Math.cos(degree) * r;
  const quadratic: QuadraticFormula = {
    A: 1,
    B: E,
    C: Math.pow(degree, 2) + D * edgeX * F,
  };
  const [y1, y2] = getQuadraticSolved(quadratic);
  return degree < Math.PI
    ? {x: edgeX, y: y1}
    : degree > Math.PI
    ? {x: edgeX, y: y2}
    : {
        x: edgeX,
        y,
      };
}

/**
 *
 * @param circle_degree
 */
export function* circleEdges(
  circle_degree: () => [circle: CircleShape, degree: number][]
): Generator<Point, void, unknown> {
  for (const [circle, degree] of circle_degree()) {
    yield circleEdgePoint(circle, degree);
  }
}
