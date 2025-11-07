import type { LazyComponent } from "../dialogs";

export const AppearanceLazyDialog: LazyComponent = () =>
	import("./Appearance.svelte");
