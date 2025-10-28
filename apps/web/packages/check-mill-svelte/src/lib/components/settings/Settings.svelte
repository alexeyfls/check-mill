<script lang="ts">
	import { DialogSwitcher } from "../dialog-switcher";
	import { dialogContext } from "../dialogs";
	import { Segmented } from "../segmented";

	let { close } = dialogContext.read();
</script>

<DialogSwitcher>
	<div class="settings">
		<div class="settings__header">
			<h3 class="settings__title">Appearance</h3>

			<button
				type="button"
				onclick={close}
				class="settings__close action-btn"
				aria-label="Close"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					width="18"
					height="18"
					stroke-width="2"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6 18 18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<div class="settings__body">
			<section class="flex flex-column gap-075">
				<div class="flex items-center justify-between gap-100">
					<h4 class="h4">Checkbox Variant</h4>
					{@render multiViewSegments()}
				</div>
				<div class="scroller">
					{#each Array(8) as _, i}
						<label class="radio-box">
							<input type="radio" name="variant" class="radio-box__input" />
							<div class="radio-box__media">
								<div class="preview">#{i + 1}</div>
							</div>
						</label>
					{/each}
				</div>
			</section>

			<section class="flex flex-column gap-075">
				<div class="flex items-center justify-between gap-100">
					<h4 class="h4">Background patterns</h4>
					{@render multiViewSegments()}
				</div>
				<div class="scroller">
					{#each Array(8) as _, i}
						<label class="radio-box">
							<input type="radio" name="variant" class="radio-box__input" />
							<div class="radio-box__media">
								<div class="preview">#{i + 1}</div>
							</div>
						</label>
					{/each}
				</div>
			</section>
		</div>
	</div>

	{#snippet multiViewSegments()}
		<Segmented data={[{ value: "scroller" }, { value: "grid" }]}>
			{#snippet children(item)}
				{#if item.value === "grid"}
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

				{#if item.value === "scroller"}
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
	{/snippet}
</DialogSwitcher>

<style lang="scss">
	.settings {
		--padding-inline: 20px;

		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		color: #273f4f;
		overflow: hidden;

		&__header {
			flex: none;
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 72px;
			padding-inline: var(--padding-inline);
			border-bottom: 1px solid rgba(230, 230, 230, 0.7);
		}

		&__title {
			font-size: 1.25rem;
			font-weight: 500;
			color: #222;
		}

		&__body {
			flex-grow: 1;
			padding: 24px var(--padding-inline);
			display: flex;
			flex-direction: column;
			gap: 32px;
			overflow: hidden;
		}
	}

	.radio-box {
		position: relative;
		width: 100px;
		flex: none;
		aspect-ratio: 1;
		border-radius: 12px;
		background-color: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(220, 220, 220, 0.7);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
		cursor: pointer;
		transition: all 0.2s ease;

		display: flex;
		align-items: center;
		justify-content: center;

		&:hover {
			box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
			transform: translateY(-2px);
		}

		&:has(input:checked) {
			border-color: #1a73e8;
			box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.3);
		}

		&__input {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border: 0;
		}

		&__media {
			width: 100%;
			height: 100%;
			border-radius: inherit;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #f9fafb;
			transition: background 0.2s ease;

			.preview {
				font-weight: 500;
				color: #555;
			}
		}
	}

	.scroller {
		--scroller-mx: var(--padding-inline);
		--scroller-my: 12px;
	}
</style>
