export type AxisOptionType = "x" | "y";

export interface Axis {
  readonly isVertical: boolean;
  readonly scroll: AxisOptionType;
  readonly sign: number;
  direction(n: number): number;
}

export function createAxis(axis: AxisOptionType): Axis {
  const isVertical = axis === "y";

  const scroll = axis;

  const sign = isVertical ? 1 : -1;

  function direction(n: number): number {
    return n * sign;
  }

  return { isVertical, scroll, sign, direction };
}
