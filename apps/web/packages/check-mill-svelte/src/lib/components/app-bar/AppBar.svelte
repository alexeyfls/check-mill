<script lang="ts">
	import { dialogStore } from "../dialogs";
	import { SettingsLazyDialog } from "../settings";

	const openSettingsDialogAction = () => dialogStore.open(SettingsLazyDialog);
</script>

<div class="bar">
	<div class="logo">
		<svg
			width="32"
			height="32"
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="checkbox-svg"
		>
			<path
				d="M0 8C0 3.5817 3.5817 0 8 0H24C28.4183 0 32 3.5817 32 8V24C32 28.4183 28.4183 32 24 32H8C3.5817 32 0 28.4183 0 24V8Z"
				fill="#3B73FD"
			/>
			<path
				d="M22.0064 9.2627C22.7466 8.5225 23.9468 8.52245 24.687 9.2627L24.7559 9.33155C25.496 10.0718 25.496 11.272 24.7559 12.0122L14.6743 22.0932C13.934 22.8334 12.7338 22.8335 11.9936 22.0933L6.7832 16.883C6.04295 16.1427 6.043 14.9426 6.7832 14.2023C7.52345 13.4621 8.7236 13.4621 9.46385 14.2023L12.8745 17.6129L22.0064 9.2627Z"
				fill="#FFFEFE"
			/>
		</svg>
		<svg
			width="64"
			height="64"
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="confetti-svg"
		>
			<!-- simplified confetti left unchanged -->
			<circle cx="32" cy="10" r="2" fill="#2B75FC" />
			<circle cx="10" cy="32" r="1.5" fill="#3B73FD" />
			<circle cx="38" cy="52" r="1" fill="#EA3A3D" />
			<circle cx="24" cy="57" r="2" fill="#FAB95A" />
		</svg>
	</div>

	<form class="navigator">
		<label class="form-control">
			<input
				type="text"
				inputmode="numeric"
				placeholder="Checkbox index"
				class="form-control__input"
				aria-label="Navigate to index"
			/>
		</label>

		<button type="submit" class="action-btn" aria-label="Jump">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
				/>
			</svg>
		</button>
	</form>

	<div class="actions">
		<button
			type="button"
			class="action-btn"
			aria-label="Customization"
			on:click={openSettingsDialogAction}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
				/>
			</svg>
		</button>
	</div>
</div>

<style lang="scss">
	.bar {
		position: fixed;
		left: 50%;
		bottom: 16px;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 10px 16px;
		max-width: 420px;
		width: calc(100% - 32px);

		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(220, 220, 220, 0.7);
		border-radius: 24px;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
		transition: all 0.2s ease;
		z-index: 10;
	}

	.logo {
		position: relative;
		width: 48px;
		height: 48px;
		border-radius: 12px;
		flex-shrink: 0;
	}

	.checkbox-svg,
	.confetti-svg {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.confetti-svg {
		opacity: 0.7;
		pointer-events: none;
	}

	.navigator {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		gap: 8px;
		padding: 4px;
		background: rgba(245, 247, 250, 0.9);
		border: 1px solid rgba(230, 230, 230, 0.7);
		border-radius: 12px;
	}

	.form-control {
		display: flex;

		&__input {
			flex: 1;
			font-size: 1rem;
			height: 36px;
			width: 100%;
			padding-inline: 8px;
			border: none;
			background: transparent;
			color: #333;
			border-radius: 8px;
			outline: none;
			transition: all 0.2s ease;

			&::placeholder {
				color: #aaa;
			}

			&:focus {
				background: #fff;
				box-shadow: inset 0 0 0 1.5px #1a73e8;
			}
		}
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px;
		background: rgba(245, 247, 250, 0.9);
		border: 1px solid rgba(230, 230, 230, 0.7);
		border-radius: 12px;
	}
</style>
