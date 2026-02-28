import type { SvelteComponent } from "svelte";

export interface Modal<T = unknown, Props = Record<string, unknown>> {
	component: LazyComponent;
	props?: Props;
	close: (result: T) => void;
}

export interface ModalProps {
	close: VoidFunction;
}

export type LazyComponent = () => Promise<{
	default: new (...args: any) => SvelteComponent;
}>;
