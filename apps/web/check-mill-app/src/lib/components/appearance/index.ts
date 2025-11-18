import type { LazyComponent } from "../modals";

export const AppearanceLazyDialog: LazyComponent = () =>
	import("./Appearance.svelte");
