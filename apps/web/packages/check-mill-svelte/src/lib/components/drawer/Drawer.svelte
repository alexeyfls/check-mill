<script lang="ts">
	import { clickOutside } from "../../utils";
	import { dialogContext } from "../dialogs";
	import { slideX } from "./transitions";

	const { close } = dialogContext.read();
</script>

<div transition:slideX use:clickOutside={close} class="drawer floating">
	<slot />
</div>

<style lang="scss">
	.drawer {
		--scrollable-ctx: auto;

		position: fixed;
		top: 8px;
		right: 8px;
		display: flex;
		flex-direction: column;
		width: min(calc(100% - 16px), 420px);
		height: calc(100% - 16px);
		z-index: 20;
	}
</style>
