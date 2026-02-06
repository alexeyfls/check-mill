import { px, type UintXBitSet } from "../core";
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
  layout: Readonly<LayoutProperties>
): SlidesRendererType {
  const translate = createTranslationController();
  const templatePool: SlideTemplate[] = [];
  const freeTemplates: SlideTemplate[] = [];
  const activeTemplates = new Map<HTMLElement, SlideTemplate>();

  const { itemsPerSlide } = layout.pagination;
  const slideTranslateRange = layout.contentArea.height - layout.slideSpacing;
  const stride = layout.slide.height + layout.slideSpacing;

  root.classList.add("_int_root");

  const poolSize = layout.slideCount.visible + 2;
  for (let i = 0; i < poolSize; i++) {
    templatePool.push(createSlideTemplate());
  }

  function mountContainers(slides: SlidesCollectionType): void {
    const { width: vw } = layout.viewportSize;
    const { width: sw } = layout.slide;
    const centerX = px((vw - sw) / 2);

    const stage = ownerDocument.createDocumentFragment();

    for (const { nativeElement, realIndex } of slides) {
      const style = nativeElement.style;

      style.top = px(realIndex * stride + layout.slideSpacing);
      style.left = centerX;

      stage.appendChild(nativeElement);
    }

    root.replaceChildren(stage);
  }

  function hydrate(slide: Slide, board: UintXBitSet): void {
    const { nativeElement, pageIndex } = slide;
    const container = nativeElement.firstElementChild as HTMLElement;

    let template = activeTemplates.get(container);

    if (!template) {
      // Try to get a free template that is already in the DOM elsewhere 
      // or pull from the initial pool
      template = freeTemplates.pop() || templatePool.pop();

      if (template) {
        // If it's a recycled template, ensure it's attached to THIS container
        if (template.wrapper.parentElement !== container) {
          container.appendChild(template.wrapper);
        }
        template.wrapper.style.display = "contents"; // Show it
        activeTemplates.set(container, template);
      }
    }

    if (template) {
      nativeElement.setAttribute(`data-${Dataset.SLIDE_INDEX}`, pageIndex.toString());
      syncInputs(template.inputs, pageIndex, board);
    }
  }

  function dehydrate(slide: Slide): void {
    const container = slide.nativeElement.firstElementChild as HTMLElement;
    const template = activeTemplates.get(container);

    if (template) {
      // Keep it in the DOM, but hide it and mark it as free
      template.wrapper.style.display = "none"; 
      freeTemplates.push(template);
      activeTemplates.delete(container);
    }

    slide.nativeElement.removeAttribute(`data-${Dataset.SLIDE_INDEX}`);
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
