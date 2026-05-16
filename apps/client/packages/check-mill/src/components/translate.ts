export type TranslateType = {
  to: (element: HTMLElement, target: number) => void;
  clear: (element: HTMLElement) => void;
};

export function createTranslationController(): TranslateType {
  function translate(n: number): string {
    return `translate3d(0px, ${n}px, 0px)`;
  }

  function to(element: HTMLElement, target: number): void {
    const roundedTarget = Math.round(target * 100) / 100;
    element.style.transform = translate(roundedTarget);
  }

  function clear(element: HTMLElement): void {
    element.style.transform = "";

    if (!Boolean(element.getAttribute("style"))) {
      element.removeAttribute("style");
    }
  }

  return {
    to,
    clear,
  };
}
