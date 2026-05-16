<script lang="ts">
	import { modalContext } from "./modal.context";
	import { modalStore } from "./modal.store";

	export let id: number;

	modalContext.write({ close: () => modalStore.close(id) });
</script>

<slot />
