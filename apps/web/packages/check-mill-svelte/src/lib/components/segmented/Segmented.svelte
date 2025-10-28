<script lang="ts">
	import { fly } from "svelte/transition";
	import type { SegmentedProps } from "./types";
	import { onMount } from "svelte";

	let { data = [], children, value, defaultValue }: SegmentedProps = $props();

	let internalValue = $state(value ?? defaultValue ?? data[0]?.value ?? "");
	let indicatorStyle = $state("");

	let parentEl: HTMLDivElement;
	let refs: Record<string, HTMLLabelElement> = {};

	onMount(updateIndicator);
	$effect(updateIndicator);

	function updateIndicator(): void {
		const el = refs[internalValue];
		if (!el || !parentEl) return;

		const rect = el.getBoundingClientRect();
		const parentRect = parentEl.getBoundingClientRect();

		indicatorStyle = `
            width: ${rect.width}px;
            height: ${rect.height}px;
            transform: translate(${rect.left - parentRect.left}px, ${rect.top - parentRect.top}px);
        `;
	}
</script>

<div bind:this={parentEl} role="radiogroup" class="segmented">
	<div
		class="indicator"
		style={indicatorStyle}
		transition:fly={{ duration: 300 }}
	></div>

	{#each data as item (item.value)}
		<label
			bind:this={refs[item.value]}
			for={item.value}
			class="segmented-control"
		>
			<input
				id={item.value}
				type="radio"
				name="segmented"
				value={item.value}
				hidden
			/>
			<div class="segmented-control__content">
				{@render children(item)}
			</div>
		</label>
	{/each}
</div>

<style lang="scss">
	.segmented {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		max-width: max-content;
		padding: 4px;
		background: rgba(245, 247, 250, 0.9);
		border: 1px solid rgba(230, 230, 230, 0.7);
		border-radius: 12px;
		overflow: hidden;
	}

	.segmented-control {
		position: relative;
		padding: 4px;

		&__content {
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.indicator {
		position: absolute;
		top: -1px;
		left: -1px;
		border-radius: 8px;
		background-color: #fff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}
</style>
