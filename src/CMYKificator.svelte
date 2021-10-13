<script>
	import Slider from './parts/Slider.svelte';
	import { css, clickOutside } from './actions';
	import { slide } from 'svelte/transition';
	import { times } from 'ouml';

	export let settings = { c: 20, m: 40, y: 100, k: 10, raster: 128, saturation: 1 };

	let grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.25' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='.6 .6 .6  0  0 .6 .6 .6  0 0 .6 .6 .6  0 0 0 0 0 1 0' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
		props,
		active = false;

	$: props = {
		'background-image': `
			url(../cmyk/c${settings.c}.png),
			url(../cmyk/m${settings.m}.png),
			url(../cmyk/y${settings.y}.png),
			url(../cmyk/k${settings.k}.png),
			${grain}			
		`,
		'background-size': `${settings.raster}px, ${settings.raster}px, ${settings.raster}px, ${settings.raster}px, 512px`,
		filter: `saturate(${settings.saturation})`,
	};
</script>

<div class="cmyk" use:css={props}>
	<div class="cmykIt" use:clickOutside={() => (active = false)}>
		<div class="header" on:click={() => (active = !active)} on:mouseenter={() => (active = true)}>
			<span class="c">C</span><span class="m">M</span><span class="y">Y</span>Kificator®
		</div>
		{#if active}
			<div class="settings" transition:slide>
				<form>
					<Slider title="C" min="0" max="100" bind:value={settings.c} step="10" />
					<Slider title="M" min="0" max="100" bind:value={settings.m} step="10" />
					<Slider title="Y" min="0" max="100" bind:value={settings.y} step="10" />
					<Slider title="K" min="0" max="100" bind:value={settings.k} step="10" />
					<Slider title="Raster" min="32" max="512" bind:value={settings.raster} step="1" />
					<Slider title="Saturation" min="0" max="2" bind:value={settings.saturation} step=".01" />
				</form>
			</div>
		{/if}
		<!-- 		<h2 use:css={props}>CMYK</h2>
 -->
	</div>
</div>

<style lang="scss">
	.cmyk {
		/* background: url(../cmyk/c50.png) repeat 128px; */
		// background-size: 256px;
		background-repeat: repeat;
		background-blend-mode: multiply, multiply, multiply, multiply, normal;
		height: 100vh;
		width: 100vw;
		transition: none;
		.cmykIt {
			display: inline-block;
			color: #fff;

			.header {
				display: inline-block;
				font-size: 0.8rem;
				padding: 1.5rem;
				background: #000c;
				cursor: pointer;
				transition: all 0.3s;
				.c {
					color: #00aeef;
				}
				.m {
					color: #ec008c;
				}
				.y {
					color: #fff200;
				}
			}
			/* 	h2 {
				margin-top: 6rem;
				background-repeat: repeat;
				background-blend-mode: multiply, multiply, multiply, multiply, normal;
				-webkit-text-fill-color: transparent;
				-webkit-background-clip: text;
			} */
			.settings {
				width: 100%;
				opacity: 0.9;
				margin-bottom: 0;
				form {
					padding: 1.5rem;
				}
			}
		}
	}
</style>
