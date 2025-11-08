<script lang="ts">
	import { DialogSwitcher } from "../dialog-switcher";
	import { modalContext } from "../modals";
	import { MultiViewSection } from "../multi-view-section";

	let { close } = modalContext.read();
</script>

<DialogSwitcher>
	<div class="modal-layout">
		<div class="modal-layout__header">
			<h3 class="modal-layout__title">Appearance</h3>

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

		<div class="modal-layout__body">
			<MultiViewSection id="checkbox" title="Checkbox Variant">
				{#each Array(8) as _, i}
					<label class="radio-box">
						<input type="radio" name="variant" class="radio-box__input" />
						<div class="radio-box__media">
							<div class="preview">#{i + 1}</div>
						</div>
					</label>
				{/each}
			</MultiViewSection>

			<MultiViewSection id="background" title="Background patterns">
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
	.radio-box {
		position: relative;
		width: 100%;
		flex: var(--scroller-child-flex, none);
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
