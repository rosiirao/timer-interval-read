import {LineFormula, QuadraticFormula} from './shape-formula';

export function getLineSolved(
  {A: a, B: b, C: c}: LineFormula,
  x: number
): number {
  return -(a * x + c) / b;
}

export function getQuadraticSolved({
  A: a,
  B: b,
  C: c,
}: QuadraticFormula): [number, number] {
  const deltaSqrt = Math.sqrt(Math.pow(b, 2) - 4 * a * c);
  const doubleOfA = 2 * a;
  return [(-deltaSqrt - b) / doubleOfA, (deltaSqrt - b) / doubleOfA];
}
