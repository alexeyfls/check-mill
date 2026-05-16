<script lang="ts">
	import { CheckMillRenderer } from "@check-mill/svelte";

	import { Dialogs } from "./lib/components/modals";
	import { AppBar } from "./lib/components/app-bar";
</script>

<div class="content">
	<CheckMillRenderer />
	<AppBar />
</div>
<Dialogs />

<style lang="scss">
	.content {
		position: relative;
		isolation: isolate;
		width: 100%;
		height: 100%;
	}
</style>
