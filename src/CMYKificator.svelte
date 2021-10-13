<script>
	import Slider from './parts/Slider.svelte';
	import { css } from './actions';
	import { times } from 'ouml';

	let c = 20,
		m = 40,
		y = 100,
		k = 10,
		raster = 128,
		saturation = 1,
		grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.25' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;
	props;

	$: props = {
		'background-image': `
		${grain},
			url(../cmyk/c${c}.png),
			url(../cmyk/m${m}.png),
			url(../cmyk/y${y}.png),
			url(../cmyk/k${k}.png),
			${grain}			
		`,
		'background-size': `512px, ${raster}px, ${raster}px, ${raster}px, ${raster}px, 512px`,
		filter: `saturate(${saturation})`,
	};
</script>

<div class="cmyk" use:css={props}>
	<div class="settings">
		<form action="">
			<Slider title="C" min="0" max="100" bind:value={c} step="10" />
			<Slider title="M" min="0" max="100" bind:value={m} step="10" />
			<Slider title="Y" min="0" max="100" bind:value={y} step="10" />
			<Slider title="K" min="0" max="100" bind:value={k} step="10" />
			<Slider title="Raster" min="32" max="512" bind:value={raster} step="1" />
			<Slider title="Saturation" min="0" max="3" bind:value={saturation} step=".01" />
		</form>
	</div>
</div>

<style lang="scss">
	.cmyk {
		/* background: url(../cmyk/c50.png) repeat 128px; */
		// background-size: 256px;
		background-repeat: repeat;
		background-blend-mode: overlay, multiply, multiply, multiply, multiply, normal;
		height: 100vh;
		width: 100vw;
		transition: none;
		//filter: blur(0.5px);
	}
	.settings {
		display: inline-block;
		color: #fff;
		opacity: 0.9;
	}
</style>
