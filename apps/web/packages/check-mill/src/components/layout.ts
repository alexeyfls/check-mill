/**
 * Generic size interface to avoid dependency on DOMRect.
 */
export type Size = {
  width: number;
  height: number;
};

export type Padding = {
  vertical: number;
  horizontal: number;
};

export type LayoutConfig = {
  checkboxSize: number;
  gridSpacing: number;
  slideSpacing: number;

  viewportSize: Size;
  containerPadding: Padding;
  slidePadding: Padding;

  slideMaxWidth: number;
  slideMinHeight: number;
  slideMaxHeightRatio: number; // 0.0 to 1.0 (relative to viewport)

  targetDivisor: number;
  minGridDimension: number;
  maxGridDimension: number;

  loopBufferSizeRatio: number;
};

export type ComputedLayout = {
  slide: Size;
  grid: {
    rows: number;
    columns: number;
  };
  slideCount: {
    visible: number;
    buffer: number;
    total: number;
  };
  contentArea: Size;
  pagination: {
    itemsPerSlide: number;
    totalItems: number;
    totalPages: number;
  };
};

export type LayoutProperties = LayoutConfig & ComputedLayout;

export function createLayout(initialConfig: LayoutConfig): Readonly<LayoutProperties> {
  const metrics = computeLayout(initialConfig);
  return Object.freeze({ ...initialConfig, ...metrics });
}

export function updateLayout(
  currentProps: LayoutProperties,
  updates: Partial<LayoutConfig>
): Readonly<LayoutProperties> {
  const newConfig: LayoutConfig = {
    ...currentProps,
    ...updates,
  };
  const newMetrics = computeLayout(newConfig);
  return Object.freeze({ ...newConfig, ...newMetrics });
}

export function computeLayout(config: LayoutConfig): ComputedLayout {
  const maxAllowedHeight = config.viewportSize.height * config.slideMaxHeightRatio;
  const slideHeight = Math.max(config.slideMinHeight, maxAllowedHeight);
  const verticalPadding = config.slidePadding.vertical * 2;
  const availableGridHeight = Math.max(0, slideHeight - verticalPadding);

  const containerWidth = config.viewportSize.width - config.containerPadding.horizontal;
  const slideWidth = Math.min(config.slideMaxWidth, containerWidth);
  const horizontalPadding = config.slidePadding.horizontal * 2;
  const availableGridWidth = Math.max(0, slideWidth - horizontalPadding);

  const itemFootprint = config.checkboxSize + config.gridSpacing;

  if (itemFootprint <= 0) {
    throw new Error("Invalid Config: Checkbox size + spacing must be greater than 0");
  }

  const physicalMaxRows = Math.floor((availableGridHeight + config.gridSpacing) / itemFootprint);
  const physicalMaxCols = Math.floor((availableGridWidth + config.gridSpacing) / itemFootprint);

  const { rows, cols } = findOptimalGrid({
    maxRows: physicalMaxRows,
    maxCols: physicalMaxCols,
    minDim: config.minGridDimension,
    maxDim: config.maxGridDimension,
    targetDivisor: config.targetDivisor,
  });

  const finalSlideHeight =
    calculateLengthWithGaps(rows, config.checkboxSize, config.gridSpacing) + verticalPadding;
  const finalSlideWidth =
    calculateLengthWithGaps(cols, config.checkboxSize, config.gridSpacing) + horizontalPadding;

  const safeSlideHeight = Math.max(1, finalSlideHeight);
  const visibleSlides = Math.ceil(config.viewportSize.height / safeSlideHeight);
  const bufferSlides = Math.ceil(visibleSlides * config.loopBufferSizeRatio);
  const totalSlides = visibleSlides + bufferSlides;

  const totalContentHeight =
    calculateLengthWithGaps(totalSlides, finalSlideHeight, config.slideSpacing) +
    config.containerPadding.vertical * 2;

  return {
    slide: { width: finalSlideWidth, height: finalSlideHeight },
    grid: { rows, columns: cols },
    slideCount: {
      visible: visibleSlides,
      buffer: bufferSlides,
      total: totalSlides,
    },
    contentArea: {
      width: finalSlideWidth,
      height: totalContentHeight,
    },
    pagination: {
      itemsPerSlide: rows * cols,
      totalItems: config.targetDivisor,
      totalPages: config.targetDivisor / (rows * cols),
    },
  };
}

/**
 * Calculates the total length of N items with gaps in between.
 */
function calculateLengthWithGaps(count: number, itemSize: number, gapSize: number): number {
  if (count <= 0) return 0;
  return count * itemSize + Math.max(0, count - 1) * gapSize;
}

/**
 * Finds the largest grid (Rows x Cols) that:
 * 1. Fits within the physical max limits.
 * 2. Is between minDim and maxDim.
 * 3. Resulting cell count (Rows * Cols) is a factor of targetDivisor.
 */
function findOptimalGrid(params: {
  maxRows: number;
  maxCols: number;
  minDim: number;
  maxDim: number;
  targetDivisor: number;
}): { rows: number; cols: number } {
  const { maxRows, maxCols, minDim, maxDim, targetDivisor } = params;

  const limitCols = Math.min(maxDim, Math.max(minDim, maxCols));
  const limitRows = Math.min(maxDim, Math.max(minDim, maxRows));

  const startDim = minDim % 2 === 0 ? minDim : minDim + 1;

  let bestCols = startDim;
  let bestRows = startDim;
  let maxValidCells = 0;

  for (let c = startDim; c <= limitCols; c++) {
    for (let r = startDim; r <= limitRows; r++) {
      const currentCells = c * r;

      const isDivisorMatch = targetDivisor % currentCells === 0;
      const isLargestSoFar = currentCells > maxValidCells;

      if (isDivisorMatch && isLargestSoFar) {
        maxValidCells = currentCells;
        bestCols = c;
        bestRows = r;
      }
    }
  }

  return { rows: bestRows, cols: bestCols };
}
