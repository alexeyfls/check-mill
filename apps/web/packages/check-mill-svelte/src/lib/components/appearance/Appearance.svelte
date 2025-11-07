<script lang="ts">
	import { autoheight } from "../../utils/actions";

	import { DialogSwitcher } from "../dialog-switcher";
	import { dialogContext } from "../dialogs";
	import { Segmented } from "../segmented";
	import { MultiViewSection } from "../multi-view-section";

	let { close } = dialogContext.read();
</script>

<DialogSwitcher>
	<div class="appearance">
		<div class="appearance__header">
			<h3 class="appearance__title">Appearance</h3>

			<button
				type="button"
				onclick={close}
				class="appearance__close action-btn"
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

		<div class="appearance__body">
			<MultiViewSection title="Checkbox Variant">
				{#each Array(8) as _, i}
					<label class="radio-box">
						<input type="radio" name="variant" class="radio-box__input" />
						<div class="radio-box__media">
							<div class="preview">#{i + 1}</div>
						</div>
					</label>
				{/each}
			</MultiViewSection>

			<MultiViewSection title="Background patterns">
				{#each Array(8) as _, i}
					<label class="radio-box">
						<input type="radio" name="variant" class="radio-box__input" />
						<div class="radio-box__media">
							<div class="preview">#{i + 1}</div>
						</div>
					</label>
				{/each}
			</MultiViewSection>
		</div>
	</div>
</DialogSwitcher>

<style lang="scss">
	.appearance {
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
			overflow: var(--scrollable-ctx);
		}
	}

	.radio-box {
		position: relative;
		width: 100%;
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
</style>
