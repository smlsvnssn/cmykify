<script>
	import Mixin from './Mixin.svelte';

	import Slider from './parts/Slider.svelte';
	import { css, clickOutsideSpecifiedElements } from './actions';
	import { slide } from 'svelte/transition';
	import { introVisible, isSmallScreen } from './stores';

	export let settings = { c: 20, m: 40, y: 100, k: 10, raster: 3, saturation: 1 };

	let props,
		active = false,
		settingsEl,
		cmykoutEl,
		headerEl,
		outsideListener;

	$: if (settingsEl && cmykoutEl) {
		outsideListener?.destroy();
		outsideListener = clickOutsideSpecifiedElements(null, {
			nodelist: [settingsEl, cmykoutEl, headerEl],
			cb: () => (active = false),
		});
	}

	$: if (active) $introVisible = false;

	$: props = {
		'background-image': `
			url(/cmyk/c${settings.c}.png),
			url(/cmyk/m${settings.m}.png),
			url(/cmyk/y${settings.y}.png),
			url(/cmyk/k${settings.k}.png)`,
		'background-size': `${settings.raster * 45}px, ${settings.raster * 45}px, ${settings.raster * 45}px, ${settings.raster * 45}px`,
		filter: `saturate(${settings.saturation})`,
	};
</script>

<div class="cmykificator">
	<div class="cmyk" use:css={props} />
	<div class="cmykIt">
		<div class="header" bind:this={headerEl} on:click={() => (active = !active)} on:mouseenter={() => (!$isSmallScreen ? (active = true) : 0)}>
			<span class="c">C</span><span class="m">M</span><span class="y">Y</span>Kificator®
		</div>
		<br />
		{#if active}
			<div class="settings" bind:this={settingsEl} transition:slide>
				<form>
					<Slider title="C" min="0" max="100" bind:value={settings.c} step="10" />
					<Slider title="M" min="0" max="100" bind:value={settings.m} step="10" />
					<Slider title="Y" min="0" max="100" bind:value={settings.y} step="10" />
					<Slider title="K" min="0" max="100" bind:value={settings.k} step="10" />
					<Slider title="Dot size" min="1" max="10" bind:value={settings.raster} step=".1" />
					<Slider title="Saturation" min="0" max="2" bind:value={settings.saturation} step=".01" />
				</form>
			</div>
			<div class="cmykOut" bind:this={cmykoutEl} transition:slide={{ delay: 100 }}>
				<Mixin {settings} />
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	@import './mixins';

	.cmykificator {
		background: url(/cmyk/grain.png) repeat;
		background-size: 256px;
		position: relative;
		height: 100%;
		width: 100%;
		.cmyk {
			background-repeat: repeat;
			background-blend-mode: multiply, multiply, multiply, multiply;
			height: 100%;
			width: 100%;
			mix-blend-mode: multiply;
		}
		.cmykOut {
			position: absolute;
			bottom: 0;
			color: #fff;

			padding: 0.8rem 1.5rem;
			background: #000c;
			overflow: auto;
			width: 100%;
			transition: background 0.3s;

			&:active {
				background: #ec008c;
			}
		}
		.cmykIt {
			position: absolute;
			top: 0;
			height: 100%;
			width: 100%;
			color: #fff;

			.header {
				display: inline-block;
				font-size: 0.9rem;
				padding: 1.5rem;
				background: #000c;
				font-family: 'DM Serif Text';
				cursor: pointer;
				.c {
					color: #00aeef;
				}
				.m {
					color: #ec008c;
				}
				.y {
					color: #fff200;
				}
				.k {
					color: #231f20;
				}
			}
			.settings {
				display: inline-block;
				opacity: 0.95;
				margin-bottom: 0;
				form {
					padding: 1.5rem;
					//@include cmykify();
				}
			}
		}
	}
</style>
