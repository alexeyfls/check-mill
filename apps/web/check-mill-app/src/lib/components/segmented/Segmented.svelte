<script lang="ts">
	import { fly } from "svelte/transition";
	import type { SegmentedProps } from "./types";
	import { onMount } from "svelte";

	let {
		id,
		data = [],
		children,
		value,
		defaultValue,
		onChange,
	}: SegmentedProps = $props();

	let internalValue = $state(value ?? defaultValue ?? data[0]?.value ?? "");
	let indicatorStyle = $state("");

	let parentEl: HTMLElement;
	let refs: Record<string, HTMLLabelElement> = {};

	onMount(updateIndicator);
	$effect(updateIndicator);

	function handleChange(value: string): void {
		internalValue = value;
		onChange?.(value);
	}

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

<fieldset bind:this={parentEl} role="radiogroup" class="segmented">
	<div
		class="indicator"
		style={indicatorStyle}
		transition:fly={{ duration: 300 }}
	></div>

	{#each data as item (item.value)}
		<label bind:this={refs[item.value]} class="segmented-control">
			<input
				id={item.value}
				type="radio"
				name={id + "-segmented"}
				value={item.value}
				checked={internalValue === item.value}
				onchange={() => handleChange(item.value)}
				hidden
			/>
			<div class="segmented-control__content">
				{@render children(item)}
			</div>
		</label>
	{/each}
</fieldset>

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
		cursor: pointer;

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
		transition: all 0.3s;
	}
</style>
