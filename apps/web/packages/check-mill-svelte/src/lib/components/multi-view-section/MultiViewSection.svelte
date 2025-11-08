<script lang="ts">
	import { Segmented } from "../segmented";
	import { Views, type MultiViewSectionProps } from "./types";

	let {
		id,
		title,
		children,
		defaultView = Views.Scroller,
	}: MultiViewSectionProps = $props();

	let view = $state(defaultView);

	function setView(value: Views): void {
		view = value;
	}
</script>

<section class="flex flex-column gap-075">
	<div class="flex items-center justify-between gap-100">
		<h4 class="h4">{title}</h4>
		<Segmented
			{id}
			data={[{ value: Views.Scroller }, { value: Views.Grid }]}
			defaultValue={view}
			onChange={setView}
		>
			{#snippet children(item)}
				{#if item.value === Views.Grid}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
						/>
					</svg>
				{/if}
				{#if item.value === Views.Scroller}
					<svg
						width="16"
						height="16"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z"
						/>
					</svg>
				{/if}
			{/snippet}
		</Segmented>
	</div>

	<div
		class={[
			view === Views.Grid && "grid grid-c3 grid-g8",
			view === Views.Scroller && "scroller",
		]}
	>
		{@render children()}
	</div>
</section>

<style lang="scss">
	.scroller {
		--scroller-mx: var(--padding-inline);
		--scroller-my: 12px;
		--scroller-columns: 3;
	}
</style>
