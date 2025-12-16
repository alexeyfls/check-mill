import { px, type UintXBitSet } from "../core";
import { type Axis } from "./axis";
import { Dataset } from "./constants";
import { CheckboxFactory } from "./dom-factories";
import { type LayoutProperties } from "./layout";
import { MotionType } from "./scroll-motion";
import { type SlidesCollectionType, type Slide } from "./slides";
import { createTranslationController } from "./translate";

export interface SlidesRendererType {
  mountContainers(slides: SlidesCollectionType): void;
  hydrate(slide: Slide, board: UintXBitSet): void;
  dehydrate(slide: Slide): void;
  updateState(slide: Slide, board: UintXBitSet): void;
  syncPosition(slides: SlidesCollectionType, motion: MotionType): void;
}

type SlideTemplate = {
  wrapper: HTMLElement;
  inputs: HTMLInputElement[];
};

export function createSlidesRenderer(
  ownerDocument: Document,
  root: HTMLElement,
  axis: Axis,
  layout: Readonly<LayoutProperties>
): SlidesRendererType {
  const translate = createTranslationController(axis);
  const templatePool: SlideTemplate[] = [];
  const activeTemplates = new Map<HTMLElement, SlideTemplate>();

  const { itemsPerSlide } = layout.pagination;
  const slideTranslateRange = layout.contentArea.height - layout.slideSpacing;
  const stride = axis.isVertical
    ? layout.slide.height + layout.slideSpacing
    : layout.slide.width + layout.slideSpacing;

  root.classList.add("_int_root");

  const poolSize = layout.slideCount.visible + 2;
  for (let i = 0; i < poolSize; i++) {
    templatePool.push(createSlideTemplate());
  }

  function mountContainers(slides: SlidesCollectionType): void {
    const { width: vw, height: vh } = layout.viewportSize;
    const { width: sw, height: sh } = layout.slide;
    const centerX = px((vw - sw) / 2);
    const centerY = px((vh - sh) / 2);

    const stage = ownerDocument.createDocumentFragment();

    for (const { nativeElement, realIndex } of slides) {
      const staticOffset = px(realIndex * stride + layout.slideSpacing);
      const style = nativeElement.style;

      if (axis.isVertical) {
        style.top = staticOffset;
        style.left = centerX;
      } else {
        style.left = staticOffset;
        style.top = centerY;
      }

      stage.appendChild(nativeElement);
    }

    root.replaceChildren(stage);
  }

  function hydrate(slide: Slide, board: UintXBitSet): void {
    const { nativeElement, pageIndex } = slide;
    const container = nativeElement.firstElementChild as HTMLElement;

    if (activeTemplates.has(container)) return;

    const template = templatePool.pop();
    if (!template) return;

    nativeElement.setAttribute(`data-${Dataset.SLIDE_INDEX}`, pageIndex.toString());

    syncInputs(template.inputs, pageIndex, board);

    container.appendChild(template.wrapper);
    activeTemplates.set(container, template);
  }

  function dehydrate(slide: Slide): void {
    const container = slide.nativeElement.firstElementChild as HTMLElement;
    const template = activeTemplates.get(container);

    if (!template) return;

    slide.nativeElement.removeAttribute(`data-${Dataset.SLIDE_INDEX}`);

    container.removeChild(template.wrapper);
    templatePool.push(template);
    activeTemplates.delete(container);
  }

  function updateState(slide: Slide, board: UintXBitSet): void {
    const container = slide.nativeElement.firstElementChild as HTMLElement;
    const template = activeTemplates.get(container);

    if (template) {
      syncInputs(template.inputs, slide.pageIndex, board);
    }
  }

  function syncInputs(inputs: HTMLInputElement[], pageIndex: number, board: UintXBitSet): void {
    const offset = pageIndex * itemsPerSlide;
    const len = inputs.length;

    for (let i = 0; i < len; i++) {
      const val = board.has(offset + i);

      if (inputs[i].checked !== val) {
        inputs[i].checked = val;
      }
    }
  }

  function syncPosition(slides: SlidesCollectionType, motion: MotionType): void {
    const range = slideTranslateRange;
    const mOffset = motion.offset;
    const count = slides.length;

    for (let i = 0; i < count; i++) {
      const slide = slides[i];
      translate.to(slide.nativeElement, slide.viewportOffset * range + mOffset);
    }
  }

  function createSlideTemplate(): SlideTemplate {
    const wrapper = ownerDocument.createElement("div");
    wrapper.style.display = "contents";

    const inputs: HTMLInputElement[] = [];
    const factory = new CheckboxFactory(ownerDocument);
    const { rows, columns } = layout.grid;
    const cellSize = layout.checkboxSize + layout.gridSpacing;

    for (let row = 0; row < rows; row++) {
      const rowOffset = row * columns;
      const y = row * cellSize;

      for (let col = 0; col < columns; col++) {
        const x = col * cellSize;
        const element = factory.create(x, y);

        const input = (
          element.tagName === "INPUT" ? element : element.querySelector("input")
        ) as HTMLInputElement;

        input.setAttribute(`data-${Dataset.CHECKBOX_INDEX}`, (rowOffset + col).toString());
        inputs.push(input);
        wrapper.appendChild(element);
      }
    }

    return { wrapper, inputs };
  }

  return { mountContainers, hydrate, dehydrate, updateState, syncPosition };
}
