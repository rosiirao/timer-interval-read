import {getLineSolved, getQuadraticSolved} from './formula-resolver';
import {
  CircleFormula,
  EllipseFormula,
  getCircleFormula,
  getEllipseFormula,
  getLineFormula,
  LineFormula,
  QuadraticFormula,
} from './shape-formula';
import {
  Point,
  Shape,
  ShapeKind,
  CircleShape,
  RectShape,
  EllipseShape,
} from './shapes';

function getLineCircleIntersection(line: LineFormula, Circle: CircleFormula) {
  return getLineEllipseIntersection(line, Object.assign({A: 1, B: 1}, Circle));
}

function getLineEllipseIntersection(
  line: LineFormula,
  {A: a2, B: b2, D: d, E: e, F: f}: EllipseFormula
): [Point, Point] {
  const {A: a, B: b, C: c} = line;

  const exponentOfB = Math.pow(b, 2);
  const quadratic: QuadraticFormula = {
    A: a2 * Math.pow(a, 2) + b2 * exponentOfB,
    B: exponentOfB * d + 2 * a * c * b2 - a * b * e,
    C: exponentOfB * f + b2 * Math.pow(c, 2) - b * e * c,
  };
  const [x1, x2] = getQuadraticSolved(quadratic);
  let y1: number, y2: number;
  if (b === 0 && isFinite(x1)) {
    // 垂直相交时通过 圆 方程式转换成一元二次方程时取圆方程式 y 值
    // Ax² + By² + Dx + Ey + F = 0 -> Ax² + By² + C = 0
    const quadraticForCircle = {
      A: b2,
      B: e,
      C: a2 * Math.pow(x1, 2) + d * x1 + f,
    };
    [y1, y2] = getQuadraticSolved(quadraticForCircle);
  } else {
    [y1, y2] = [getLineSolved(line, x1), getLineSolved(line, x2)];
  }
  return [
    {
      x: x1,
      y: y1,
    },
    {
      x: x2,
      y: y2,
    },
  ];
}

// function getLineIntersection({A: a1, B:b1, C:c1}: LineFormula, {A: a2, B:b2, C:c2}: LineFormula): Position{

// }

function getNearestPoint({x, y}: Point, points: [Point, Point]) {
  const [{x: x1, y: y1}, {x: x2, y: y2}] = points;
  let leftPoint, rightPoint, topPoint, bottomPoint;
  if (x1 < x2) {
    [leftPoint, rightPoint] = points;
  } else {
    [rightPoint, leftPoint] = points;
  }
  if (y1 < y2) {
    [topPoint, bottomPoint] = points;
  } else {
    [bottomPoint, topPoint] = points;
  }

  return x < leftPoint.x
    ? leftPoint
    : x > rightPoint.x
    ? rightPoint
    : y < topPoint.y
    ? topPoint
    : y > bottomPoint.y
    ? bottomPoint
    : {
        x: NaN,
        y: NaN,
      };
}

/**
 * 计算某点到某个形状之间的连线与该形状的交点
 * @param from
 * @param to
 */
export function getCrossPoint(from: Shape, to: Shape): Point {
  const point = from.center;
  switch (to.kind) {
    case ShapeKind.Circle:
      return getCrossPointWithCircle(point, to as CircleShape);
    case ShapeKind.Rectangle:
      return getCrossPointWithRect(point, to as RectShape);
    default:
      return {
        x: Infinity,
        y: Infinity,
      };
  }
}

function getCrossPointWithCircle(from: Point, to: CircleShape): Point {
  const line = getLineFormula(from, to.center);
  const circle = getCircleFormula(to);
  const intersection = getLineCircleIntersection(line, circle);
  return getNearestPoint(from, intersection);
}

function getCrossPointWithRect(from: Point, to: RectShape) {
  const {x: tx, y: ty} = to.center;
  const {w, h, r} = to.dimension;
  const {x: fx, y: fy} = from;

  // 判断是与圆角相交， 或与边框相交
  /**
   * 使用椭圆算法计算圆
   */
  const [rx, ry] = [r, r];
  /**
   * half width and half height
   */
  const [hw, hh] = [w / 2, h / 2];

  const ratio =
    fx === tx // 0/0 will get NaN
      ? Infinity
      : Math.abs((fy - ty) / (fx - tx));
  switch (ratio) {
    case 0:
      return {
        x: tx + Math.imul(fx > tx ? 1 : -1, hw),
        y: ty,
      };
    case Infinity:
      return {
        x: tx,
        y: ty + Math.imul(fy > ty ? 1 : -1, hh),
      };
    default: {
      // 判断与椭圆边角相交， 或与直线边框相交
      if (ratio > (hh - ry) / hw && ratio < hh / (hw - rx)) {
        // 4 ellipse center
        const leftTop = {x: tx - hw + rx, y: ty - hh + ry};
        const rightTop = {x: tx + hw - rx, y: leftTop.y};
        const leftBottom = {x: leftTop.x, y: ty + hh - ry};
        const rightBottom = {x: rightTop.x, y: leftBottom.y};

        /**
         * 相交椭圆边角的中心
         */
        let intersectionEllipseCenter: Point | undefined = undefined;
        if (fx < leftTop.x) {
          intersectionEllipseCenter = fy < leftTop.y ? leftTop : leftBottom;
        }
        if (fx > rightTop.x) {
          intersectionEllipseCenter = fy < leftTop.y ? rightTop : rightBottom;
        }
        if (intersectionEllipseCenter !== undefined) {
          const ellipseShape: EllipseShape = {
            center: intersectionEllipseCenter,
            dimension: {rx, ry},
            kind: ShapeKind.Ellipse,
          };
          // const { A: ae, B: be, D: d, E: e, F: f } = getEllipseFormula(ellipseShape);

          const line = getLineFormula(from, to.center);
          const intersection = getLineEllipseIntersection(
            line,
            getEllipseFormula(ellipseShape)
          );
          return getNearestPoint(from, intersection);
        }
        // 不相交， 没有交点
        return {
          x: NaN,
          y: NaN,
        };
      }
      return ratio > h / w
        ? {
            x: tx + Math.imul(fx > tx ? 1 : -1, hh) / ratio,
            y: ty + Math.imul(fy > ty ? 1 : -1, hh),
          }
        : {
            x: tx + Math.imul(fx > tx ? 1 : -1, hw),
            y: ty + Math.imul(fy > ty ? 1 : -1, hw) * ratio,
          };
    }
  }
}

// function getDistance({ x: fx, y: fy }: Position, { x: tx, y: ty }: Position) {
//   return Math.sqrt((fx - tx) ** 2 + (fy - ty) ** 2);
// }

export function isOverlap(from: Point, to: SVGGeometryElement): boolean {
  const crossPoint = global.DOMPointReadOnly.fromPoint(from);
  return !to.isPointInStroke(crossPoint) && !to.isPointInFill(crossPoint);
}
