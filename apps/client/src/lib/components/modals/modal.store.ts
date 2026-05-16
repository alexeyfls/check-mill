import type { SvelteComponent } from "svelte";
import { writable } from "svelte/store";

import type { LazyComponent } from "./types";

type Modal = {
	id: number;
	component: new (...args: unknown[]) => SvelteComponent;
	props?: Record<string, unknown>;
};

function createModalStore() {
	const { subscribe, update } = writable<Modal[]>([]);
	let idCounter = 0;

	async function open(
		loader: LazyComponent,
		props?: Record<string, unknown>
	): Promise<number> {
		const modal: Modal = {
			id: idCounter++,
			component: (await loader()).default,
			props,
		};

		update((modals) => [...modals, modal]);
		return modal.id;
	}

	function close(id: number): void {
		update((modals) => modals.filter((d) => d.id !== id));
	}

	return {
		subscribe,
		open,
		close,
	};
}

export const modalStore = createModalStore();
